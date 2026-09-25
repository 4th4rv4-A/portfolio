# Atharva Anil Meshram — Portfolio

A modern, high-performance developer portfolio built with Python, Flask, and vanilla web technologies. It features a custom "Cyber-Minimalist" design system, interactive 3D elements, a particle physics engine, and secure backend routing.

## Technology Stack

- **Backend:** Python 3, Flask, Gunicorn
- **Frontend:** HTML5, CSS3 (Custom Properties/Variables), Vanilla JavaScript
- **Data Viz:** Chart.js (Skills Radar)
- **Deployment:** WSGI-ready, PaaS-compatible (Procfile included)

## Features

- **Cyber-Minimalist Design System:** Robust CSS variables for effortless light/dark mode switching and consistent theming.
- **Hardware-Accelerated Animations:** Custom `requestAnimationFrame` particle engine and IntersectionObserver-driven scroll reveals with automatic graceful degradation on mobile and for users who prefer reduced motion.
- **Dynamic 3D Tilt:** Matrix transformations applied to project cards for an interactive feel.
- **Secure Contact Form:** 
  - Server-side email handling via SMTP (no client-side exposure of API keys or credentials)
  - HTML injection prevention
  - Rate limiting (5 requests / minute)
  - Honeypot bot protection
  - Size and length limits on all inputs
- **Fully Accessible:** Semantic HTML structure, `aria` attributes on custom controls, keyboard-trappable lightbox, and a "Skip to Content" link.
- **Custom Error Pages:** Stylized 404 and 500 error handlers that prevent information leakage.
- **SEO Optimized:** Complete with OpenGraph tags, JSON-LD schema markup, and distinct canonical structure.

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/4th4rv4-A/portfolio.git
   cd portfolio
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Copy the example config and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Note: Set `FLASK_DEBUG=1` for local development. To test the contact form, provide valid SMTP credentials. To enable absolute URLs for SEO metadata, set `SITE_URL`.*

5. **Run the Flask server**
   ```bash
   python app.py
   ```
   The application will be available at `http://localhost:5000`.

## Testing

This project includes a comprehensive pytest suite to verify backend security, rate limiting, and email dispatch logic.

```bash
pytest tests/
```

## Production Deployment

This portfolio is configured to run behind any standard WSGI HTTP Server like Gunicorn.

**Example startup command for production:**
```bash
gunicorn wsgi:app
```
(A `Procfile` is also included for compatibility with platforms like Heroku or Render.)

---
*Designed & Built by [Atharva Meshram](https://github.com/4th4rv4-A).*
