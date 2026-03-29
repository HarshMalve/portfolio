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
  const track = $('#testimonials-track');
  const prevBtn = $('#slider-prev');
  const nextBtn = $('#slider-next');
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
        // --- GOOGLE ANALYTICS EVENT TRACKING ---
        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', {
            'event_category': 'Contact',
            'event_label': 'Portfolio Form Submitted'
          });
        }
        // ---------------------------------------        
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


  // ─── Three.js Hero Background ───
  function initThreeJsConfig() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();

    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create Geometry (Abstract complex wireframe)
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);

    // Create Material - using the primary CSS variable color if possible, fallback to electric blue
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';

    const material = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    const torusKnot = new THREE.Mesh(geometry, material);

    // Add an inner sphere
    const sphereGeo = new THREE.IcosahedronGeometry(8, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);

    // Group them
    const group = new THREE.Group();
    group.add(torusKnot);
    group.add(sphere);
    scene.add(group);

    // Position it slightly to the right to balance the text
    group.position.x = 8;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.001;
      mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();
    let isVisible = true;

    const observerOpts = { root: null, rootMargin: '0px', threshold: 0 };
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, observerOpts);
    io.observe(document.getElementById('hero'));

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return; // Pause when off-screen

      const elapsedTime = clock.getElapsedTime();

      // Slow idle rotation
      group.rotation.y = elapsedTime * 0.1;
      group.rotation.x = elapsedTime * 0.05;

      torusKnot.rotation.z = elapsedTime * -0.05;

      // Mouse interactivity (smooth interpolation)
      targetX = mouseX * 2;
      targetY = mouseY * 2;

      group.rotation.y += 0.05 * (targetX - group.rotation.y);
      group.rotation.x += 0.05 * (targetY - group.rotation.x);

      // Subtle floating
      group.position.y = Math.sin(elapsedTime * 0.5) * 2;

      renderer.render(scene, camera);
    }

    animate();

    // Listen for theme changes to update the 3D color
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
          material.color.set(newColor);
          sphereMat.color.set(newColor);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  // Initialize after DOM is fully ready
  initThreeJsConfig();

  // ─── Tilt Effect for Cards ───
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      setTimeout(() => {
        card.style.transition = 'transform var(--transition-base), box-shadow var(--transition-base)';
      }, 50);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  // ─── Three.js Services Icons ───
  function createServiceIcon(canvasId, geometryFn) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(window.devicePixelRatio);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';
    const material = new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.8 });

    const group = new THREE.Group();
    geometryFn(group, material);
    scene.add(group);

    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    io.observe(canvas);

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;
      group.rotation.x += 0.01;
      group.rotation.y += 0.015;
      renderer.render(scene, camera);
    }
    animate();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          material.color.set(getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim());
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  // Web Dev: Wireframe Box (Browser)
  createServiceIcon('service-web-canvas', (group, material) => {
    const geo = new THREE.BoxGeometry(5, 4, 1);
    group.add(new THREE.Mesh(geo, material));
  });

  // Mobile Dev: Taller Wireframe Box (Phone)
  createServiceIcon('service-mobile-canvas', (group, material) => {
    const geo = new THREE.BoxGeometry(3, 6, 0.5);
    group.add(new THREE.Mesh(geo, material));
  });

  // Backend: Stacked Cylinders (Database)
  createServiceIcon('service-backend-canvas', (group, material) => {
    const geo = new THREE.CylinderGeometry(2.5, 2.5, 1.5, 12);
    const db1 = new THREE.Mesh(geo, material);
    db1.position.y = 2;
    const db2 = new THREE.Mesh(geo, material);
    const db3 = new THREE.Mesh(geo, material);
    db3.position.y = -2;
    group.add(db1, db2, db3);
  });

  // ─── Three.js Contact Node Network ───
  function initContactNodes() {
    const canvas = document.getElementById('contact-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, document.getElementById('contact').offsetHeight || 600);
    renderer.setPixelRatio(window.devicePixelRatio);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';

    // Particles
    const particleCount = window.innerWidth > 768 ? 150 : 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1000;
      positions[i + 1] = (Math.random() - 0.5) * 600;
      positions[i + 2] = (Math.random() - 0.5) * 400;

      velocities.push({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: primaryColor,
      size: 3,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lines connecting nearby particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.15
    });

    const linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    scene.add(linesMesh);

    let mouseX = 0, mouseY = 0;
    let contactRect = document.getElementById('contact').getBoundingClientRect();

    window.addEventListener('scroll', () => { contactRect = document.getElementById('contact').getBoundingClientRect(); }, { passive: true });
    window.addEventListener('resize', () => {
      contactRect = document.getElementById('contact').getBoundingClientRect();
      camera.aspect = window.innerWidth / contactRect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, contactRect.height);
    });

    document.addEventListener('mousemove', (e) => {
      if (e.clientY >= contactRect.top && e.clientY <= contactRect.bottom) {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.5;
        mouseY = (e.clientY - contactRect.top - contactRect.height / 2) * -0.5;
      }
    });

    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    io.observe(document.getElementById('contact'));

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (mouseY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      const positions = particles.geometry.attributes.position.array;
      let linePositions = [];

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        if (positions[i3] > 500 || positions[i3] < -500) velocities[i].x *= -1;
        if (positions[i3 + 1] > 300 || positions[i3 + 1] < -300) velocities[i].y *= -1;
        if (positions[i3 + 2] > 200 || positions[i3 + 2] < -200) velocities[i].z *= -1;
        if (positions[i3 + 2] > 200 || positions[i3 + 2] < -200) velocities[i].z *= -1;

        // Check connections
        for (let j = i + 1; j < particleCount; j++) {
          const j3 = j * 3;
          const dx = positions[i3] - positions[j3];
          const dy = positions[i3 + 1] - positions[j3 + 1];
          const dz = positions[i3 + 2] - positions[j3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 15000) {
            linePositions.push(
              positions[i3], positions[i3 + 1], positions[i3 + 2],
              positions[j3], positions[j3 + 1], positions[j3 + 2]
            );
          }
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

      renderer.render(scene, camera);
    }
    animate();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
          material.color.set(newColor);
          lineMaterial.color.set(newColor);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  initContactNodes();

  // ─── Three.js Projects Background (Floating Geometries) ───
  function initProjects3D() {
    const canvas = document.getElementById('projects-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, document.getElementById('projects').offsetHeight || 800);
    renderer.setPixelRatio(window.devicePixelRatio);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';
    const material = new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.2 });

    const geometries = [
      new THREE.BoxGeometry(6, 6, 6),
      new THREE.TetrahedronGeometry(5),
      new THREE.OctahedronGeometry(4)
    ];

    const particles = new THREE.Group();
    const particleCount = window.innerWidth > 768 ? 40 : 15;

    for (let i = 0; i < particleCount; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mesh = new THREE.Mesh(geo, material);

      mesh.position.x = (Math.random() - 0.5) * 400;
      mesh.position.y = (Math.random() - 0.5) * 300;
      mesh.position.z = (Math.random() - 0.5) * 100 - 50;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      // Custom attributes for animation
      mesh.userData = {
        speedR: (Math.random() - 0.5) * 0.02,
        speedY: Math.random() * 0.2 + 0.1
      };

      particles.add(mesh);
    }
    scene.add(particles);

    let projectsRect = document.getElementById('projects').getBoundingClientRect();
    window.addEventListener('resize', () => {
      projectsRect = document.getElementById('projects').getBoundingClientRect();
      camera.aspect = window.innerWidth / projectsRect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, projectsRect.height);
    });

    let mouseX = 0;
    document.addEventListener('mousemove', (e) => {
      if (e.clientY >= projectsRect.top && e.clientY <= projectsRect.bottom) {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      }
    });

    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    io.observe(document.getElementById('projects'));

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.lookAt(scene.position);

      particles.children.forEach(mesh => {
        mesh.rotation.x += mesh.userData.speedR;
        mesh.rotation.y += mesh.userData.speedR;
        mesh.position.y += mesh.userData.speedY;

        if (mesh.position.y > 150) {
          mesh.position.y = -150;
          mesh.position.x = (Math.random() - 0.5) * 400;
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          material.color.set(getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim());
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  // ─── Three.js Testimonials Background (Wave Ribbon) ───
  function initTestimonials3D() {
    const canvas = document.getElementById('testimonials-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 100;
    camera.position.y = 20;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, document.getElementById('testimonials').offsetHeight || 500);
    renderer.setPixelRatio(window.devicePixelRatio);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';

    // Create a large flat plane with many segments
    const geometry = new THREE.PlaneGeometry(300, 100, 30, 10);
    geometry.rotateX(-Math.PI / 2); // Lay flat

    const material = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.15
    });

    const ribbon = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material);
    scene.add(ribbon);

    let testRect = document.getElementById('testimonials').getBoundingClientRect();
    window.addEventListener('resize', () => {
      testRect = document.getElementById('testimonials').getBoundingClientRect();
      camera.aspect = window.innerWidth / testRect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, testRect.height);
    });

    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    io.observe(document.getElementById('testimonials'));

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = clock.getElapsedTime() * 0.5;

      const positionAttribute = geometry.getAttribute('position');
      const positions = positionAttribute.array;
      let vertexId = 0;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        // Calculate a wave height using sine waves on X and Z
        positions[i + 1] = Math.sin(x * 0.05 + time) * 10 + Math.cos(z * 0.05 + time * 1.5) * 5;
      }

      positionAttribute.needsUpdate = true;
      ribbon.geometry.dispose();
      ribbon.geometry = new THREE.WireframeGeometry(geometry);

      // Slow rotation
      ribbon.rotation.y = Math.sin(time * 0.2) * 0.1;

      renderer.render(scene, camera);
    }
    animate();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          material.color.set(getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim());
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  // Initialize after a short delay to ensure layout boundaries are computed
  setTimeout(() => {
    initProjects3D();
    initTestimonials3D();
  }, 100);

  // ─── Cookie Consent Banner ───
  const cookieBanner = document.getElementById('cookie-consent-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  const declineBtn = document.getElementById('decline-cookies');

  if (cookieBanner) {
    const consentPreference = localStorage.getItem('cookieConsent');
  
    if (!consentPreference) {
      setTimeout(() => {
        cookieBanner.classList.remove('cookie-hidden');
      }, 1000);
    } else {
      cookieBanner.remove();
    }
  
    const handleConsent = (preference) => {
      localStorage.setItem('cookieConsent', preference);
      cookieBanner.classList.add('cookie-hidden');
      setTimeout(() => {
        cookieBanner.remove();
      }, 400);
    };
  
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => handleConsent('accepted'));
    }
  
    if (declineBtn) {
      declineBtn.addEventListener('click', () => handleConsent('declined'));
    }
  }

})();