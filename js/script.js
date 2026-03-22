/* ============================================================
   Harshavardhan Malve — Portfolio JavaScript
   Theme Toggle · Scroll Animations · Mobile Menu · Form
   ============================================================ */

(function () {
  'use strict';

  // ─── DOM References ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const html = document.documentElement;
  const header = $('#header');
  const themeToggle = $('#theme-toggle');
  const hamburger = $('#hamburger');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');
  const contactForm = $('#contact-form');
  const sections = $$('section[id]');

  // ─── Theme Toggle ───
  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    } else {
      // Respect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark');
  }

  initTheme();
  themeToggle.addEventListener('click', toggleTheme);

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });


  // ─── Sticky Header ───
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  // ─── Active Nav Highlighting ───
  function highlightActiveNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = $(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }


  // ─── Mobile Hamburger Menu ───
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
    });
  });


  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ─── Scroll Reveal (Intersection Observer) ───
  const animElements = $$('.anim-fade-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    animElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: make everything visible
    animElements.forEach((el) => el.classList.add('visible'));
  }


  // ─── Testimonial Slider ───
  const track    = $('#testimonials-track');
  const prevBtn  = $('#slider-prev');
  const nextBtn  = $('#slider-next');
  const dotsWrap = $('#slider-dots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const cards = track.querySelectorAll('.testimonial-card');
    let current = 0;
    let autoTimer;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Auto-play
    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 6000); }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }
    startAuto();

    // Pause on hover
    const slider = track.closest('.testimonial-slider');
    slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    slider.addEventListener('mouseleave', startAuto);

    // Touch / swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    }, { passive: true });
  }



  // ─── Contact Form: Custom Validation ───
  const errorIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  const validators = {
    name: { test: v => v.length >= 2, msg: 'Please enter your full name' },
    email: { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email address' },
    subject: { test: v => v.length >= 3, msg: 'Subject must be at least 3 characters' },
    message: { test: v => v.length >= 10, msg: 'Message must be at least 10 characters' },
  };

  function showError(field, msg) {
    clearFeedback(field);
    field.classList.add('invalid');
    field.classList.remove('valid');
    const err = document.createElement('span');
    err.className = 'form-error';
    err.innerHTML = `${errorIcon} ${msg}`;
    field.parentNode.appendChild(err);
  }

  function showValid(field) {
    clearFeedback(field);
    field.classList.add('valid');
    field.classList.remove('invalid');
  }

  function clearFeedback(field) {
    field.classList.remove('invalid', 'valid');
    const existing = field.parentNode.querySelector('.form-error');
    if (existing) existing.remove();
  }

  function validateField(field) {
    const rule = validators[field.id];
    if (!rule) return true;
    const value = field.value.trim();
    if (!value) {
      showError(field, rule.msg);
      return false;
    }
    if (!rule.test(value)) {
      showError(field, rule.msg);
      return false;
    }
    showValid(field);
    return true;
  }

  // Validate on blur
  Object.keys(validators).forEach(id => {
    const field = $(`#${id}`);
    if (!field) return;
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;
    Object.keys(validators).forEach(id => {
      const field = $(`#${id}`);
      if (field && !validateField(field)) isValid = false;
    });

    if (!isValid) return;

    // Show success state
    const submitBtn = $('#submit-btn');
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span>Message Sent!</span>
    `;
    submitBtn.style.background = '#10b981';
    submitBtn.style.pointerEvents = 'none';


    const scriptURL = 'https://script.google.com/macros/s/AKfycbxkbjR_KBoYq3XPmXByra95uIvAvCMLw1ErJUMsda6fdyWUonj2Cg-9vXG5F2DBUP2BQg/exec';
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.style.pointerEvents = 'none';

    const formData = new FormData(contactForm);

    fetch(scriptURL, { method: 'POST', body: formData })
      .then(response => {
        // Success state
        submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span>Message Sent!</span>
    `;
        submitBtn.style.background = '#10b981';

        setTimeout(() => {
          contactForm.reset();
          submitBtn.innerHTML = `
        <span>Send Message</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      `;
          submitBtn.style.background = '';
          submitBtn.style.pointerEvents = '';
        }, 3000);
      })
      .catch(error => {
        console.error('Error!', error.message);
        submitBtn.innerHTML = '<span>Error! Try Again</span>';
        submitBtn.style.pointerEvents = '';
      });
  });


})();