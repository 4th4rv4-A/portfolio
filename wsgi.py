"""WSGI entry point for production deployment.

Usage with Gunicorn:
    gunicorn wsgi:app

Usage with other WSGI servers:
    The `app` object is a standard WSGI application.
"""
from app import app  # noqa: F401

if __name__ == "__main__":
    app.run()
