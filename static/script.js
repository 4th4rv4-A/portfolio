/* =============================================================
   SCRIPT.JS — Atharva Meshram Portfolio
   Design System: Cyber-Minimalist
   ============================================================= */

   (function () {
    'use strict';

    /* Flag for CSS: enables animations only when JS is present */
    document.documentElement.classList.add('js');

    /* Utilities */
    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    const qsa = (sel, ctx = document) => document.querySelectorAll(sel);
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;

    /* ---------------------------------------------------------
       1. ATMOSPHERE — Canvas Particle Field (Optimized)
    --------------------------------------------------------- */
    const Atmosphere = (function () {
        const canvas = qs('#atmosphere');
        if (!canvas || isReducedMotion) return { init: () => {}, updateColors: () => {} };

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: -1000, y: -1000 };
        let animId, w, h;
        
        // Performance safeguards: fewer particles on mobile, no connections
        const PARTICLE_COUNT = isMobile ? 20 : 45;
        const CONNECTION_DIST = 120;
        const MOUSE_RADIUS = 100;
        let accentRGB = [59, 130, 246]; // Default blue

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.25),
                    vy: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.25),
                    size: Math.random() * 1.5 + 0.5,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        function update(t) {
            for (let p of particles) {
                p.x += p.vx + Math.sin(p.phase + t * 0.0003) * 0.12;
                p.y += p.vy + Math.cos(p.phase + t * 0.00025) * 0.12;

                if (!isMobile) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MOUSE_RADIUS && dist > 0) {
                        const force = (1 - dist / MOUSE_RADIUS) * 1.5;
                        p.x += (dx / dist) * force;
                        p.y += (dy / dist) * force;
                    }
                }

                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            const [r, g, b] = accentRGB;

            if (!isMobile) {
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < CONNECTION_DIST) {
                            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }

            for (let p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
                ctx.fill();
            }
        }

        function loop(t) {
            update(t);
            draw();
            animId = requestAnimationFrame(loop);
        }

        function init() {
            resize();
            createParticles();

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => { resize(); createParticles(); }, 200);
            }, { passive: true });

            if (!isMobile) {
                window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
                window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });
            }

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) cancelAnimationFrame(animId);
                else animId = requestAnimationFrame(loop);
            });

            animId = requestAnimationFrame(loop);
        }

        return { init, updateColors: theme => { accentRGB = theme === 'light' ? [37, 99, 235] : [59, 130, 246]; } };
    })();

    /* ---------------------------------------------------------
       2. SCROLL PROGRESS
    --------------------------------------------------------- */
    const ScrollProgress = (function () {
        const bar = qs('#scroll-progress');
        if (!bar) return { init: () => {} };

        function onScroll() {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            bar.style.transform = `scaleX(${Math.min(progress, 1)})`;
        }

        return { init: () => window.addEventListener('scroll', onScroll, { passive: true }) };
    })();

    /* ---------------------------------------------------------
       3. NAVBAR
    --------------------------------------------------------- */
    const Navbar = (function () {
        const navbar = qs('#navbar');
        const hamburger = qs('#hamburger');
        const navLinks = qs('#nav-links');
        const sections = qsa('section[id]');
        const allNavLinks = qsa('.nav-link');

        function onScroll() {
            navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
            
            const scrollPos = window.scrollY + 100;
            sections.forEach(section => {
                const top = section.offsetTop;
                const id = section.getAttribute('id');
                if (scrollPos >= top && scrollPos < top + section.offsetHeight) {
                    allNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                    });
                }
            });
        }

        function closeMenu() {
            navLinks.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        function init() {
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();

            hamburger.addEventListener('click', () => {
                const isOpen = navLinks.classList.toggle('open');
                hamburger.classList.toggle('open', isOpen);
                hamburger.setAttribute('aria-expanded', isOpen);
            });

            allNavLinks.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const target = qs(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        closeMenu();
                    }
                });
            });

            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
            });
        }

        return { init };
    })();

    /* ---------------------------------------------------------
       4. THEME TOGGLE
    --------------------------------------------------------- */
    const ThemeToggle = (function () {
        const btn = qs('#theme-toggle');
        const html = document.documentElement;

        function setTheme(theme) {
            html.classList.add('theme-transition');
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            const metaTheme = qs('meta[name="theme-color"]');
            if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f0f0f5' : '#03040f');

            Atmosphere.updateColors(theme);
            if (window.SkillsRadar) window.SkillsRadar.updateTheme(theme);

            setTimeout(() => html.classList.remove('theme-transition'), 300);
        }

        function init() {
            if (!btn) return;
            btn.addEventListener('click', () => {
                const current = html.getAttribute('data-theme') || 'dark';
                setTheme(current === 'dark' ? 'light' : 'dark');
            });
        }

        return { init };
    })();

    /* ---------------------------------------------------------
       5. ANIMATION SYSTEM (Reveal, Parallax, Cursor, Tilt)
    --------------------------------------------------------- */
    const AnimationSystem = (function () {
        function initReveals() {
            if (isReducedMotion) return;
            const reveals = qsa('.reveal');
            
            // Set delay variable based on child index in group
            qsa('.reveal-group').forEach(group => {
                Array.from(group.querySelectorAll('.reveal')).forEach((el, i) => {
                    el.style.setProperty('--index', i);
                });
            });

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

            reveals.forEach(el => observer.observe(el));
        }

        function initParallax() {
            if (isReducedMotion) return;
            const root = document.documentElement;
            window.addEventListener('scroll', () => {
                // Update CSS custom property instead of direct transform to avoid conflicts
                root.style.setProperty('--parallax-rotate', `${window.scrollY * 0.05}deg`);
            }, { passive: true });
        }

        function initCursorGlow() {
            const glow = qs('#cursor-glow');
            if (!glow || isReducedMotion || isMobile) {
                if (glow) glow.style.display = 'none';
                return;
            }

            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let currentX = mouseX;
            let currentY = mouseY;

            window.addEventListener('mousemove', e => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }, { passive: true });

            // Smooth interpolation
            function animateGlow() {
                currentX += (mouseX - currentX) * 0.1;
                currentY += (mouseY - currentY) * 0.1;
                glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
                requestAnimationFrame(animateGlow);
            }
            requestAnimationFrame(animateGlow);
        }

        function init3DTilt() {
            if (isReducedMotion || isMobile) return;
            
            qsa('[data-tilt]').forEach(el => {
                el.addEventListener('mousemove', e => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const xPct = x / rect.width - 0.5;
                    const yPct = y / rect.height - 0.5;
                    
                    // Max tilt: 10deg
                    el.style.transform = `perspective(1000px) rotateY(${xPct * 10}deg) rotateX(${yPct * -10}deg) translateZ(10px)`;
                });
                
                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
                });
            });
        }

        return {
            init: () => {
                initReveals();
                initParallax();
                initCursorGlow();
                init3DTilt();
            }
        };
    })();

    /* ---------------------------------------------------------
       6. SKILLS RADAR (Chart.js)
    --------------------------------------------------------- */
    window.SkillsRadar = (function () {
        const canvas = qs('#skills-radar');
        let chart = null;

        function getColors(theme) {
            const isDark = theme !== 'light';
            return {
                accent: isDark ? '#3b82f6' : '#2563eb',
                accentGlow: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.12)',
                grid: isDark ? 'rgba(140,144,159,0.15)' : 'rgba(140,144,159,0.2)',
                labels: isDark ? '#e1e1f4' : '#11121f'
            };
        }

        function initChart(theme) {
            if (!canvas || !window.Chart) return;
            const c = getColors(theme);

            Chart.defaults.font.family = "'JetBrains Mono', monospace";
            Chart.defaults.color = c.labels;

            chart = new Chart(canvas, {
                type: 'radar',
                data: {
                    labels: ['Python', 'JavaScript', 'Frontend', 'Backend', 'Databases', 'AI / ML'],
                    datasets: [{
                        data: [85, 75, 80, 70, 65, 50],
                        backgroundColor: c.accentGlow,
                        borderColor: c.accent,
                        borderWidth: 2,
                        pointBackgroundColor: c.accent,
                        pointBorderColor: c.accent,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false }, tooltip: { cornerRadius: 4 } },
                    scales: {
                        r: {
                            min: 0, max: 100,
                            ticks: { display: false, stepSize: 20 },
                            grid: { color: c.grid },
                            angleLines: { color: c.grid },
                            pointLabels: { font: { size: 11, weight: 600 } }
                        }
                    },
                    animation: { duration: isReducedMotion ? 0 : 800 }
                }
            });
        }

        function init() {
            initChart(document.documentElement.getAttribute('data-theme') || 'dark');
            
            // Link chips to chart highlighting
            qsa('.skill-chip[data-axis]').forEach(chip => {
                chip.addEventListener('mouseenter', () => {
                    if (!chart) return;
                    const axis = parseInt(chip.dataset.axis);
                    chart.data.datasets[0].pointBackgroundColor = [85, 75, 80, 70, 65, 50].map((_, i) => 
                        i === axis ? '#ffffff' : chart.data.datasets[0].borderColor
                    );
                    chart.data.datasets[0].pointRadius = [85, 75, 80, 70, 65, 50].map((_, i) => 
                        i === axis ? 8 : 4
                    );
                    chart.update();
                });
                chip.addEventListener('mouseleave', () => {
                    if (!chart) return;
                    chart.data.datasets[0].pointBackgroundColor = chart.data.datasets[0].borderColor;
                    chart.data.datasets[0].pointRadius = 4;
                    chart.update();
                });
            });
        }

        return { init, updateTheme: theme => {
            if (!chart) return;
            const c = getColors(theme);
            chart.data.datasets[0].backgroundColor = c.accentGlow;
            chart.data.datasets[0].borderColor = c.accent;
            chart.data.datasets[0].pointBackgroundColor = c.accent;
            chart.options.scales.r.grid.color = c.grid;
            chart.options.scales.r.angleLines.color = c.grid;
            chart.options.scales.r.pointLabels.color = c.labels;
            chart.update();
        }};
    })();

    /* ---------------------------------------------------------
       7. CERTIFICATE LIGHTBOX (Robust single implementation)
    --------------------------------------------------------- */
    const CertLightbox = (function () {
        const certs = [];
        let currentIndex = 0;
        let zoom = 1;
        let lb, img, caption, prevFocus;

        function buildDOM() {
            lb = document.createElement('div');
            lb.className = 'lightbox';
            lb.id = 'dynamic-lightbox';
            lb.setAttribute('role', 'dialog');
            lb.setAttribute('aria-modal', 'true');
            lb.innerHTML = `
                <div class="lightbox__header">
                    <span class="lightbox__caption" id="lb-caption"></span>
                    <div class="lightbox__controls">
                        <button class="lightbox__btn" id="lb-zoom-out" aria-label="Zoom out"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
                        <button class="lightbox__btn" id="lb-zoom-in" aria-label="Zoom in"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
                        <button class="lightbox__btn" id="lb-close" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                </div>
                <div class="lightbox__content">
                    <img class="lightbox__img" id="lb-img" alt="" />
                    <button class="lightbox__nav lightbox__nav--prev" id="lb-prev" aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
                    <button class="lightbox__nav lightbox__nav--next" id="lb-next" aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
                </div>
            `;
            document.body.appendChild(lb);
            img = qs('#lb-img', lb);
            caption = qs('#lb-caption', lb);
        }

        function updateContent() {
            zoom = 1;
            img.style.transform = `scale(1)`;
            img.src = certs[currentIndex].src;
            img.alt = certs[currentIndex].alt;
            caption.textContent = certs[currentIndex].title;
        }

        function open(idx) {
            prevFocus = document.activeElement;
            currentIndex = idx;
            updateContent();
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const closeBtn = qs('#lb-close', lb);
                if (closeBtn) closeBtn.focus();
            }, 50);
        }

        function close() {
            lb.classList.remove('open');
            document.body.style.overflow = '';
            if (prevFocus) prevFocus.focus();
        }

        function init() {
            qsa('.cert-card').forEach((card, idx) => {
                const imgEl = qs('img', card);
                const titleEl = qs('.cert-card__title', card);
                if (imgEl && titleEl) {
                    certs.push({ src: imgEl.src, alt: imgEl.alt, title: titleEl.textContent });
                    qs('.cert-card__image-wrap', card).addEventListener('click', () => open(idx));
                }
            });

            if (certs.length === 0) return;
            buildDOM();

            qs('#lb-close', lb).addEventListener('click', close);
            qs('#lb-prev', lb).addEventListener('click', () => { currentIndex = (currentIndex - 1 + certs.length) % certs.length; updateContent(); });
            qs('#lb-next', lb).addEventListener('click', () => { currentIndex = (currentIndex + 1) % certs.length; updateContent(); });
            
            qs('#lb-zoom-in', lb).addEventListener('click', () => { zoom = Math.min(zoom + 0.25, 3); img.style.transform = `scale(${zoom})`; });
            qs('#lb-zoom-out', lb).addEventListener('click', () => { zoom = Math.max(zoom - 0.25, 0.5); img.style.transform = `scale(${zoom})`; });

            lb.addEventListener('click', e => { if (e.target.classList.contains('lightbox__content')) close(); });
            
            document.addEventListener('keydown', e => {
                if (!lb.classList.contains('open')) return;
                if (e.key === 'Escape') { close(); return; }
                if (e.key === 'ArrowLeft') { qs('#lb-prev', lb).click(); return; }
                if (e.key === 'ArrowRight') { qs('#lb-next', lb).click(); return; }
                if (e.key === 'Tab') {
                    const focusable = Array.from(lb.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
                    if (focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            });
        }

        return { init };
    })();

    /* ---------------------------------------------------------
       8. CONTACT FORM
    --------------------------------------------------------- */
    const ContactForm = (function () {
        const form = qs('#contact-form');
        const submitBtn = qs('#contact-submit');
        const statusEl = qs('#contact-status');
        let toast;

        function createToast() {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('aria-hidden', 'true');
            document.body.appendChild(toast);
        }

        function showStatus(msg, isError) {
            if (!toast) createToast();
            toast.textContent = msg;
            toast.className = `toast show ${isError ? 'toast--error' : 'toast--success'}`;
            statusEl.textContent = msg; // Read to screen readers
            setTimeout(() => { toast.classList.remove('show'); }, 5000);
        }

        function clearErrors() {
            qsa('.form__error-msg', form).forEach(el => el.remove());
            qsa('.form__input.error', form).forEach(el => el.classList.remove('error'));
        }

        function showError(input, msg) {
            input.classList.add('error');
            const err = document.createElement('div');
            err.className = 'form__error-msg';
            err.textContent = msg;
            input.parentNode.appendChild(err);
        }

        function init() {
            if (!form) return;

            form.addEventListener('submit', e => {
                e.preventDefault();
                clearErrors();
                
                // Honeypot (bot trap) check
                if (qs('#contact-website').value) return;

                const name = qs('#contact-name').value.trim();
                const email = qs('#contact-email').value.trim();
                const message = qs('#contact-message').value.trim();
                let valid = true;

                if (!name) { showError(qs('#contact-name'), 'Name is required'); valid = false; }
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(qs('#contact-email'), 'Valid email is required'); valid = false; }
                if (!message) { showError(qs('#contact-message'), 'Message is required'); valid = false; }

                if (!valid) {
                    showStatus('Please fix the errors in the form.', true);
                    return;
                }

                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = 'Sending... <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
                let isRateLimited = false;

                fetch('/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                })
                .then(res => res.json().then(data => ({ status: res.status, data })))
                .then(({ status, data }) => {
                    if (data.success) {
                        showStatus(data.message, false);
                        form.reset();
                    } else {
                        showStatus(data.message || 'An error occurred.', true);
                        if (status === 429) isRateLimited = true;
                    }
                })
                .catch(() => showStatus('Network error. Please try again.', true))
                .finally(() => {
                    if (isRateLimited) {
                        let remaining = 60;
                        submitBtn.innerHTML = `Please wait ${remaining}s...`;
                        const timer = setInterval(() => {
                            remaining -= 1;
                            if (remaining <= 0) {
                                clearInterval(timer);
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = originalText;
                            } else {
                                submitBtn.innerHTML = `Please wait ${remaining}s...`;
                            }
                        }, 1000);
                    } else {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                });
            });
        }
        return { init };
    })();

    /* ---------------------------------------------------------
       BOOTSTRAP
    --------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
        try { Atmosphere.init(); } catch (e) { console.error('Atmosphere failed:', e); }
        try { ScrollProgress.init(); } catch (e) { console.error('ScrollProgress failed:', e); }
        try { Navbar.init(); } catch (e) { console.error('Navbar failed:', e); }
        try { ThemeToggle.init(); } catch (e) { console.error('ThemeToggle failed:', e); }
        try { AnimationSystem.init(); } catch (e) { console.error('Animations failed:', e); }
        try { window.SkillsRadar.init(); } catch (e) { console.error('SkillsRadar failed:', e); }
        try { CertLightbox.init(); } catch (e) { console.error('Lightbox failed:', e); }
        try { ContactForm.init(); } catch (e) { console.error('ContactForm failed:', e); }
    });

})();
