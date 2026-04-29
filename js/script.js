(function () {
    'use strict';

    var html = document.documentElement;
    var header = document.getElementById('header');
    var themeToggle = document.getElementById('theme-toggle');
    var hamburger = document.getElementById('hamburger');
    var siteNav = document.getElementById('site-nav');
    var contactForm = document.getElementById('contact-form');
    var fadeEls = document.querySelectorAll('.fade-up');
    var cookieBanner = document.getElementById('cookie-consent-banner');
    var acceptBtn = document.getElementById('accept-cookies');
    var declineBtn = document.getElementById('decline-cookies');
    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    var heroHeadline = document.getElementById('hero-headline');

    /* ─── Rotating Hero Headlines ─── */
    var headlines = [
        "We build the software founders stop losing sleep over.",
        "We help ambitious teams ship products that actually hold up.",
        "Great products deserve engineering that doesn\u2019t cut corners. That\u2019s where we come in.",
        "We\u2019re the engineering partner you bring in when it has to work the first time.",
        "We take messy, ambitious ideas and turn them into software people rely on.",
        "We work with teams who\u2019ve outgrown \u201Cgood enough\u201D engineering."
    ];

    if (heroHeadline) {
        heroHeadline.textContent = headlines[Math.floor(Math.random() * headlines.length)];
    }


    /* ─── Theme Toggle ─── */
    function initTheme() {
        var saved = localStorage.getItem('theme');
        var theme = saved || 'dark';
        html.setAttribute('data-theme', theme);
        updateThemeColor(theme);
    }

    function updateThemeColor(theme) {
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', theme === 'dark' ? '#1A1C19' : '#F4F0EA');
        }
    }

    function toggleTheme() {
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeColor(next);
    }

    initTheme();
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    /* ─── Hamburger Menu ─── */
    if (hamburger && siteNav) {
        hamburger.addEventListener('click', function () {
            var isOpen = siteNav.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        siteNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                siteNav.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* ─── Sticky Header ─── */
    window.addEventListener('scroll', function () {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    /* ─── Intersection Observer (Fade-In) ─── */
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        fadeEls.forEach(function (el) { observer.observe(el); });
    } else {
        fadeEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ─── Form Submission ─── */
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = this.querySelector('button[type="submit"]');
            var original = btn.textContent;
            btn.textContent = 'Sending\u2026';
            btn.disabled = true;

            var data = new FormData(this);
            var url = 'https://script.google.com/macros/s/AKfycbxkbjR_KBoYq3XPmXByra95uIvAvCMLw1ErJUMsda6fdyWUonj2Cg-9vXG5F2DBUP2BQg/exec';

            fetch(url, { method: 'POST', body: data })
                .then(function () {
                    btn.textContent = 'Sent';
                    setTimeout(function () {
                        contactForm.reset();
                        btn.textContent = original;
                        btn.disabled = false;
                    }, 3000);
                })
                .catch(function () {
                    btn.textContent = 'Error. Try again.';
                    btn.disabled = false;
                });
        });
    }

    /* ─── Smooth Scroll ─── */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) { target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* ─── Cookie Consent + Google Analytics ─── */
    function loadGoogleAnalytics() {
        if (window.gtag) return;

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-X72ZFT0C0L';
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', 'G-X72ZFT0C0L');
    }

    if (cookieBanner) {
        var consentPreference = localStorage.getItem('cookieConsent');

        if (!consentPreference) {
            setTimeout(function () {
                cookieBanner.classList.remove('cookie-hidden');
            }, 1500);
        } else {
            cookieBanner.remove();
            if (consentPreference === 'accepted') {
                loadGoogleAnalytics();
            }
        }

        var handleConsent = function (preference) {
            localStorage.setItem('cookieConsent', preference);
            cookieBanner.classList.add('cookie-hidden');
            setTimeout(function () {
                cookieBanner.remove();
            }, 400);
            if (preference === 'accepted') {
                loadGoogleAnalytics();
            }
        };

        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () { handleConsent('accepted'); });
        }
        if (declineBtn) {
            declineBtn.addEventListener('click', function () { handleConsent('declined'); });
        }
    }

})();