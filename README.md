# Atharva Anil Meshram — Portfolio

A modern, high-performance developer portfolio built with Python, Flask, and vanilla web technologies. It features the "Editorial Day / Glass Night" design system, ensuring an elegant reading experience by day and a sleek, glassy interface by night.

Live Site: [https://portfolio-red-one-hri03mzsfp.vercel.app/](https://portfolio-red-one-hri03mzsfp.vercel.app/)

## Technology Stack

- **Backend:** Python 3, Flask, Gunicorn
- **Frontend:** HTML5, CSS3 (Custom Properties/Variables), Vanilla JavaScript
- **Data Viz:** Chart.js (Skills Radar)
- **Deployment:** WSGI-ready, Vercel-compatible

## Features

- **Editorial Day / Glass Night Design System:** Robust CSS variables for effortless light/dark mode switching and consistent theming.
- **Accessible and Responsive:** Keyboard-focusable elements, ARIA labels, semantic HTML landmarks (`<main>`), and graceful degradation for users who prefer reduced motion.
- **Secure Contact Form:** 
  - Server-side email handling via SMTP (no client-side exposure of API keys or credentials)
  - HTML injection prevention
  - Rate limiting (5 requests / minute)
  - Honeypot bot protection
  - Size and length limits on all inputs
- **Custom Error Pages:** Stylized 404 and 500 error handlers that prevent information leakage and respect user theme preference.
- **SEO Optimized:** Complete with OpenGraph tags, JSON-LD schema markup, and distinct canonical structure based on `SITE_URL`.

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
   *Note: Set `FLASK_DEBUG=1` for local development. To test the contact form, provide valid SMTP credentials.*

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

## Production Deployment (Vercel)

This portfolio is configured to run on Vercel as a Python serverless function. 

**Important Vercel Configuration:**
You must manually configure the following Environment Variables in your Vercel project settings:
- `SITE_URL`: Set this to your live domain (e.g. `https://portfolio-red-one-hri03mzsfp.vercel.app`). This is required for correct canonical tags, Open Graph preview image links, and `sitemap.xml` generation.
- `MAIL_USER`, `MAIL_PASS`, `MAIL_TO`: Set these to enable the contact form. `MAIL_PASS` should be an app-specific password if using Gmail.
- `SECRET_KEY`: A secure random string for Flask sessions (if needed).

No `.env` file should be committed to the repository.

---
*Designed & Built by [Atharva Meshram](https://github.com/4th4rv4-A).*
