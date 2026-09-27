

"""Tests for the /contact endpoint and error handlers.

Covers: valid submission, invalid email, empty fields, oversized input,
honeypot, rate limiting, SMTP failure, 404 handling, 500 handling.
"""
import json
import pytest
from unittest.mock import patch

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app import app, _rate_store


@pytest.fixture
def client():
    """Create a Flask test client."""
    app.config["TESTING"] = True
    _rate_store.clear()
    with app.test_client() as c:
        yield c


@pytest.fixture(autouse=True)
def clear_rate_store():
    """Clear rate limiter between tests."""
    _rate_store.clear()


def post_contact(client, payload):
    """Helper: POST JSON to /contact."""
    return client.post(
        "/contact",
        data=json.dumps(payload),
        content_type="application/json",
    )


# ── Valid submission ──────────────────────────────────────────
def test_valid_submission_no_mail_configured(client):
    """When mail is not configured, message is still accepted (logged)."""
    resp = post_contact(client, {
        "name": "Test User",
        "email": "test@example.com",
        "message": "Hello there!",
    })
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["success"] is True


# ── Validation: empty fields ─────────────────────────────────
def test_empty_name(client):
    resp = post_contact(client, {"name": "", "email": "a@b.com", "message": "Hi"})
    assert resp.status_code == 400
    assert "Name" in resp.get_json()["message"]


def test_empty_email(client):
    resp = post_contact(client, {"name": "X", "email": "", "message": "Hi"})
    assert resp.status_code == 400
    assert "Email" in resp.get_json()["message"]


def test_empty_message(client):
    resp = post_contact(client, {"name": "X", "email": "a@b.com", "message": ""})
    assert resp.status_code == 400
    assert "Message" in resp.get_json()["message"]


# ── Validation: invalid email ────────────────────────────────
def test_invalid_email_format(client):
    resp = post_contact(client, {"name": "X", "email": "not-an-email", "message": "Hi"})
    assert resp.status_code == 400
    assert "valid email" in resp.get_json()["message"]


# ── Validation: oversized input ──────────────────────────────
def test_name_too_long(client):
    resp = post_contact(client, {
        "name": "A" * 200,
        "email": "a@b.com",
        "message": "Hi",
    })
    assert resp.status_code == 400
    assert "100" in resp.get_json()["message"]


def test_message_too_long(client):
    resp = post_contact(client, {
        "name": "X",
        "email": "a@b.com",
        "message": "A" * 6000,
    })
    assert resp.status_code == 400
    assert "5000" in resp.get_json()["message"]


# ── Honeypot ─────────────────────────────────────────────────
def test_honeypot_triggers_fake_success(client):
    """Bot-filled honeypot should return fake success silently."""
    resp = post_contact(client, {
        "name": "Bot",
        "email": "bot@spam.com",
        "message": "Buy stuff!",
        "website": "http://spam.com",
    })
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["success"] is True


# ── Rate limiting ────────────────────────────────────────────
def test_rate_limiting(client):
    """After 5 rapid requests, the 6th should be rejected."""
    payload = {"name": "X", "email": "a@b.com", "message": "Hi"}
    for _ in range(5):
        resp = post_contact(client, payload)
        assert resp.status_code == 200

    resp = post_contact(client, payload)
    assert resp.status_code == 429
    assert "Too many" in resp.get_json()["message"]


# ── Invalid request format ───────────────────────────────────
def test_invalid_json(client):
    resp = client.post("/contact", data="not json", content_type="application/json")
    assert resp.status_code == 400


# ── Invalid request types ────────────────────────────────────
def test_invalid_json_types(client):
    resp = post_contact(client, {"name": 123, "email": "a@b.com", "message": "Hi"})
    assert resp.status_code == 400
    assert "Invalid data format" in resp.get_json()["message"]


# ── Configuration tests ──────────────────────────────────────
def test_load_config_smtp_port_fallback():
    from app import load_config
    with patch.dict(os.environ, {"SMTP_PORT": "abc"}):
        config = load_config()
        assert config["SMTP_PORT"] == 465

def test_load_config_respects_os_environ():
    from app import load_config
    with patch.dict(os.environ, {"SMTP_PORT": "587"}):
        config = load_config()
        assert config["SMTP_PORT"] == 587


# ── HTML escaping ────────────────────────────────────────────
@patch("app.smtplib.SMTP_SSL")
def test_html_injection_escaping(mock_smtp, client):
    """Ensure malicious HTML in message is safely escaped before emailing."""
    with patch.dict("app.config", {"MAIL_USER": "u", "MAIL_PASS": "p", "MAIL_TO": "t"}):
        resp = post_contact(client, {
            "name": "X",
            "email": "a@b.com",
            "message": "<img src=x onerror=alert(1)>"
        })
        assert resp.status_code == 200
        
        mock_smtp_instance = mock_smtp.return_value.__enter__.return_value
        args, _ = mock_smtp_instance.sendmail.call_args
        email_body = args[2]
        
        # Check only the HTML part of the email (plain text part will have raw text)
        html_part = email_body.split("Content-Type: text/html")[1]
        assert "&lt;img src=x onerror=alert(1)&gt;" in html_part
        assert "<img src=x" not in html_part


@patch("app.smtplib.SMTP_SSL")
def test_header_injection_newlines_stripped(mock_smtp, client):
    """Ensure newlines are stripped from name and email to prevent header injection."""
    with patch.dict("app.config", {"MAIL_USER": "u", "MAIL_PASS": "p", "MAIL_TO": "t"}):
        resp = post_contact(client, {
            "name": "Attacker\r\nBcc: evil@domain.com",
            "email": "a@b.com",
            "message": "Hi"
        })
        assert resp.status_code == 200
        
        mock_smtp_instance = mock_smtp.return_value.__enter__.return_value
        args, _ = mock_smtp_instance.sendmail.call_args
        email_body = args[2]
        
        # Newlines should be replaced with spaces
        assert "Attacker Bcc: evil@domain.com" in email_body
        assert "Attacker\r\nBcc" not in email_body


# ── SMTP failure ─────────────────────────────────────────────
@patch("app.smtplib.SMTP_SSL")
def test_smtp_failure_returns_error(mock_smtp, client):
    """When SMTP is configured but fails, response should indicate failure."""
    mock_smtp.side_effect = Exception("Connection refused")
    with patch.dict("app.config", {"MAIL_USER": "u", "MAIL_PASS": "p", "MAIL_TO": "t"}):
        resp = post_contact(client, {
            "name": "X",
            "email": "a@b.com",
            "message": "Hi",
        })
    data = resp.get_json()
    # Should report failure truthfully
    assert data["success"] is False
    assert resp.status_code == 500


# ── 404 handling ─────────────────────────────────────────────
def test_404_page(client):
    resp = client.get("/nonexistent-page")
    assert resp.status_code == 404
    assert b"Page Not Found" in resp.data


# ── Index page loads ─────────────────────────────────────────
def test_index_loads(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"Atharva" in resp.data


# ── Rate limiting: 6 rapid requests ──────────────────────────
def test_rate_limit_6th_request_returns_429(client):
    """Send 6 rapid requests from the same client; the 6th must get 429."""
    payload = {"name": "Rate Test", "email": "rate@test.com", "message": "Hi"}
    for i in range(5):
        resp = post_contact(client, payload)
        assert resp.status_code == 200, f"Request {i+1} should succeed"

    resp = post_contact(client, payload)
    assert resp.status_code == 429
    data = resp.get_json()
    assert data["success"] is False
    assert "Too many" in data["message"]


# ── Additional Tests for new requirements ─────────────────────

@patch('app.smtplib.SMTP_SSL')
def test_honeypot_does_not_send_email(mock_smtp, client):
    with patch.dict('app.config', {'MAIL_USER': 'u', 'MAIL_PASS': 'p', 'MAIL_TO': 't'}):
        resp = post_contact(client, {
            'name': 'Bot',
            'email': 'bot@spam.com',
            'message': 'Buy stuff!',
            'website': 'http://spam.com',
        })
        assert resp.status_code == 200
        mock_smtp.assert_not_called()


def test_rate_limit_retry_after(client):
    payload = {'name': 'X', 'email': 'a@b.com', 'message': 'Hi'}
    for _ in range(5):
        post_contact(client, payload)
    resp = post_contact(client, payload)
    assert resp.status_code == 429
    assert resp.headers.get('Retry-After') == '60'


@patch('app.time.time')
def test_rate_window_expiry(mock_time, client):
    mock_time.return_value = 1000.0
    payload = {'name': 'X', 'email': 'a@b.com', 'message': 'Hi'}
    for _ in range(5):
        post_contact(client, payload)
    
    assert post_contact(client, payload).status_code == 429
    
    mock_time.return_value = 1061.0
    resp = post_contact(client, payload)
    assert resp.status_code == 200


def test_413_payload_too_large(client):
    large_payload = {'name': 'X', 'email': 'a@b.com', 'message': 'A' * (16 * 1024)}
    resp = post_contact(client, large_payload)
    assert resp.status_code == 413
    assert resp.get_json()['success'] is False


def test_500_handler_renders_custom_page(client):
    from app import app, internal_error
    with app.test_request_context():
        # Wrap the returned tuple in a Flask response to allow get_data()
        resp = app.make_response(internal_error(Exception("boom")))
        body = resp.get_data(as_text=True)
    assert resp.status_code == 500
    assert "Server Error" in body
    assert "Something went wrong on our end" in body
    assert "Internal Server Error" not in body


