"""
Portfolio Backend — Flask server for Atharva Anil Meshram's portfolio.
Serves the static site and handles the contact form submission.
"""

import os
import re
import ssl
import html
import time
import smtplib
import logging
import collections
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import Flask, render_template, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
import random

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # 16 KB max request size

# Configure proxy handling so rate limiting works correctly on deployments like Vercel
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Use a secret key from env (needed for session security if ever used)
app.secret_key = os.environ.get("SECRET_KEY", "dev-change-me-in-production")

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration loading (read from environment, with robust fallbacks)
# ---------------------------------------------------------------------------
def load_config() -> dict:
    """Load configuration from environment variables and .env file."""
    try:
        from dotenv import load_dotenv
        load_dotenv()  # loads .env if it exists, without overriding OS env vars
    except ImportError:
        pass  # python-dotenv not installed, proceed with OS env vars

    # Parse SMTP_PORT robustly
    raw_port = os.environ.get("SMTP_PORT", "465")
    try:
        smtp_port = int(raw_port)
    except ValueError:
        logger.warning(f"Invalid SMTP_PORT '{raw_port}' provided. Falling back to 465.")
        smtp_port = 465

    # Normalize SITE_URL
    site_url = os.environ.get("SITE_URL", "").strip()
    if site_url:
        # Ensure it ends with exactly one slash, but handle badly formed urls safely
        site_url = site_url.rstrip("/")

    return {
        "MAIL_USER": os.environ.get("MAIL_USER"),
        "MAIL_PASS": os.environ.get("MAIL_PASS"),
        "MAIL_TO": os.environ.get("MAIL_TO"),
        "SMTP_HOST": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "SMTP_PORT": smtp_port,
        "SITE_URL": site_url,
    }

config = load_config()

# ---------------------------------------------------------------------------
# In-memory rate limiter  —  max 5 requests per 60 seconds per IP
# ---------------------------------------------------------------------------
RATE_LIMIT = 5
RATE_WINDOW = 60  # seconds
# NOTE: This in-memory rate store is per-process. When running behind Gunicorn
# with multiple workers (e.g. `gunicorn -w 4 wsgi:app`), each worker maintains
# its own copy of _rate_store, so a client can effectively multiply the allowed
# request count by the number of workers. For correct cross-worker rate limiting
# in production, replace this dict with a shared store such as Redis.
_rate_store: dict[str, list[float]] = collections.defaultdict(list)

# ---------------------------------------------------------------------------
# Field length limits
# ---------------------------------------------------------------------------
MAX_NAME_LEN = 100
MAX_EMAIL_LEN = 254
MAX_MESSAGE_LEN = 5000


def _is_rate_limited(ip: str) -> bool:
    """Return True if *ip* has exceeded RATE_LIMIT requests within RATE_WINDOW."""
    now = time.time()

    # Probabilistically clean up stale IPs to prevent unbounded memory growth
    if random.random() < 0.05:
        stale_keys = [k for k, timestamps in _rate_store.items() if not [t for t in timestamps if now - t < RATE_WINDOW]]
        for k in stale_keys:
            _rate_store.pop(k, None)

    # Prune timestamps older than the window
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < RATE_WINDOW]
    if len(_rate_store[ip]) >= RATE_LIMIT:
        return True
    _rate_store[ip].append(now)
    return False


# ---------------------------------------------------------------------------
# Email helper
# ---------------------------------------------------------------------------
def _send_email(name: str, email: str, message: str) -> bool:
    """
    Send an HTML email to the site owner.
    Returns True on success, False on failure.
    If mail credentials are not configured, returns False silently.
    User-provided values are HTML-escaped before interpolation.
    """
    MAIL_USER = config.get("MAIL_USER")
    MAIL_PASS = config.get("MAIL_PASS")
    MAIL_TO = config.get("MAIL_TO")
    SMTP_HOST = config.get("SMTP_HOST")
    SMTP_PORT = config.get("SMTP_PORT")

    if not all([MAIL_USER, MAIL_PASS, MAIL_TO]):
        logger.warning("MAIL_USER / MAIL_PASS / MAIL_TO not set — skipping email send.")
        return False

    # Escape user input to prevent HTML injection
    safe_name = html.escape(name)
    safe_email = html.escape(email)
    safe_message = html.escape(message).replace("\n", "<br>")

    subject = f"Portfolio Contact — {safe_name}"

    html_body = f"""\
<html>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; color: #cbd5e1; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.08);">
    <h2 style="margin: 0 0 8px; color: #a855f7;">New Contact Form Submission</h2>
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;">
    <p><strong style="color: #e2e8f0;">Name:</strong> {safe_name}</p>
    <p><strong style="color: #e2e8f0;">Email:</strong> <a href="mailto:{safe_email}" style="color: #06b6d4;">{safe_email}</a></p>
    <p><strong style="color: #e2e8f0;">Message:</strong></p>
    <p style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 8px; line-height: 1.7;">{safe_message}</p>
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0 12px;">
    <p style="font-size: 0.8rem; color: #64748b;">Sent from your portfolio contact form.</p>
  </div>
</body>
</html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = MAIL_USER
    msg["To"] = MAIL_TO
    msg["Reply-To"] = email  # so the owner can reply directly

    # Plain-text fallback
    plain_body = f"Name: {name}\nEmail: {email}\nMessage:\n{message}"
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context, timeout=10) as server:
            server.login(MAIL_USER, MAIL_PASS)
            server.sendmail(MAIL_USER, MAIL_TO, msg.as_string())
        logger.info("Email sent successfully.")
        return True
    except Exception as exc:
        logger.error("Failed to send email: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------
@app.after_request
def set_security_headers(response):
    """Add security headers to every response."""
    # CSP compatible with Google Fonts CDN, Chart.js CDN, and inline theme script
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self'; "
        "frame-src 'none'; "
        "object-src 'none'; "
        "base-uri 'self';"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.is_secure:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    """Serve the main portfolio page."""
    resume_path = os.path.join(app.root_path, "static", "assets", "resume.pdf")
    resume_exists = os.path.exists(resume_path)
    return render_template("index.html", site_url=config.get("SITE_URL"), resume_exists=resume_exists)


@app.route("/contact", methods=["POST"])
def contact():
    """
    Handle contact form submissions.
    Validates required fields, sends an email, and returns JSON response.
    """
    # --- Rate limiting ---
    client_ip = request.remote_addr or "unknown"
    if _is_rate_limited(client_ip):
        return jsonify({"success": False, "message": "Too many requests. Please try again later."}), 429

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"success": False, "message": "Invalid request format."}), 400

    raw_name = data.get("name", "")
    raw_email = data.get("email", "")
    raw_message = data.get("message", "")

    if not isinstance(raw_name, str) or not isinstance(raw_email, str) or not isinstance(raw_message, str):
        return jsonify({"success": False, "message": "Invalid data format for fields."}), 400

    # Strip out newlines from name and email to prevent header injection
    name = re.sub(r'[\r\n\t]+', ' ', raw_name).strip()
    email = re.sub(r'[\r\n\t]+', ' ', raw_email).strip()
    message = raw_message.strip()

    # --- Honeypot check (server-side) ---
    if data.get("website", ""):
        # Bot detected — return fake success silently
        return jsonify({"success": True, "message": "Message received! I'll get back to you soon."})

    # --- Validation ---
    if not name:
        return jsonify({"success": False, "message": "Name is required."}), 400
    if len(name) > MAX_NAME_LEN:
        return jsonify({"success": False, "message": f"Name must be under {MAX_NAME_LEN} characters."}), 400

    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    if len(email) > MAX_EMAIL_LEN:
        return jsonify({"success": False, "message": "Email address is too long."}), 400

    if not message:
        return jsonify({"success": False, "message": "Message is required."}), 400
    if len(message) > MAX_MESSAGE_LEN:
        return jsonify({"success": False, "message": f"Message must be under {MAX_MESSAGE_LEN} characters."}), 400

    # Basic email format check
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"success": False, "message": "Please enter a valid email address."}), 400

    # --- Log to console ---
    logger.info("New contact form submission from %s <%s>", name, email)

    # --- Send email — check return value for truthful response ---
    email_sent = _send_email(name, email, message)

    if email_sent:
        return jsonify({"success": True, "message": "Message sent successfully! I'll get back to you soon."})
    else:
        # Email might not be configured — still log the message
        if not all([config.get("MAIL_USER"), config.get("MAIL_PASS"), config.get("MAIL_TO")]):
            # Dev mode: mail not configured, but message was logged
            logger.info("Message logged (email not configured): %s", message[:200])
            return jsonify({"success": True, "message": "Message received! I'll get back to you soon."})
        else:
            # Mail was configured but failed — be truthful
            return jsonify({
                "success": False,
                "message": "Something went wrong while sending your message. Please try again or use the email link above."
            }), 500


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def page_not_found(e):
    """Custom 404 page."""
    return render_template("404.html"), 404


@app.errorhandler(500)
def internal_error(e):
    """Custom 500 page — never expose debug info in production."""
    logger.error("Internal server error: %s", e)
    return render_template("500.html"), 500


@app.errorhandler(413)
def request_too_large(e):
    """Request too large."""
    return jsonify({"success": False, "message": "Request too large."}), 413


# ---------------------------------------------------------------------------
# Development server entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true", "yes")
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
