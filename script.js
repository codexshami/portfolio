/**
 * script.js – Mohd Shami Portfolio
 * Features:
 *   - Preloader animation
 *   - Custom glow cursor
 *   - Three.js particle hero background
 *   - Animated typing effect
 *   - AOS scroll animations
 *   - Skill bars + SVG ring chart animation (on scroll)
 *   - Smooth scrollbar highlight active nav
 *   - Dark / Light theme toggle
 *   - Contact form feedback
 *   - Back-to-top button
 *   - Hamburger mobile menu
 */

/* ============================================================
   1. PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  // Give the fill animation (2 s) a moment to finish, then fade out
  setTimeout(() => {
    preloader.classList.add('hidden');
    // Init everything only after preloader hides
    initAll();
  }, 2200);
});

function initAll() {
  initCursor();
  initThreeJS();
  initTypingEffect();
  initAOS();
  initNavbar();
  initHamburger();
  initThemeToggle();
  initSkillBars();
  initRingCharts();
  initContactForm();
  initBackToTop();
}

/* ============================================================
   2. CUSTOM CURSOR GLOW
   ============================================================ */
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  const dot  = document.getElementById('cursor-dot');
  let mx = 0, my = 0; // mouse position
  let gx = 0, gy = 0; // glow position (lags behind)

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    // Dot follows immediately
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Smooth glow follows mouse with lerp
  function animateGlow() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // Scale dot on links / buttons
  const interactiveEls = document.querySelectorAll('a, button, input, textarea, .project-card, .cert-card');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.transform = 'translate(-50%,-50%) scale(2.5)'; });
    el.addEventListener('mouseleave', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; dot.style.opacity = '1'; });
}

/* ============================================================
   3. THREE.JS HERO BACKGROUND (Particles)
   ============================================================ */
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  camera.position.z = 5;

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Particles ---- */
  const PARTICLE_COUNT = 1800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const speeds    = new Float32Array(PARTICLE_COUNT);

  // Color palette for particles
  const palette = [
    new THREE.Color('#00f5ff'),
    new THREE.Color('#bf00ff'),
    new THREE.Color('#00ff88'),
    new THREE.Color('#ffcc00'),
    new THREE.Color('#ffffff'),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;  // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;  // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;  // z
    speeds[i]            = Math.random() * 0.012 + 0.003;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size:         0.06,
    vertexColors: true,
    transparent:  true,
    opacity:      0.85,
    depthWrite:   false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ---- Connecting lines (sparse) ---- */
  const lineGeo = new THREE.BufferGeometry();
  const lineVerts = [];
  // Connect close-neighbour pairs for a network feel
  for (let i = 0; i < 500; i++) {
    const ia = Math.floor(Math.random() * PARTICLE_COUNT) * 3;
    const ib = Math.floor(Math.random() * PARTICLE_COUNT) * 3;
    lineVerts.push(positions[ia], positions[ia+1], positions[ia+2]);
    lineVerts.push(positions[ib], positions[ib+1], positions[ib+2]);
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.06 });
  const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(linesMesh);

  /* ---- Mouse parallax ---- */
  let targetRotX = 0, targetRotY = 0;
  document.addEventListener('mousemove', (e) => {
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.6;
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.4;
  });

  /* ---- Animation loop ---- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Drift particles upward slowly
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10; // wrap
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Gentle rotation
    particles.rotation.y += (targetRotY * 0.5 - particles.rotation.y) * 0.04;
    particles.rotation.x += (targetRotX * 0.3 - particles.rotation.x) * 0.04;
    linesMesh.rotation.y = particles.rotation.y;
    linesMesh.rotation.x = particles.rotation.x;

    // Subtle auto-spin
    particles.rotation.z = t * 0.02;

    renderer.render(scene, camera);
  }
  animate();
}

/* ============================================================
   4. TYPING EFFECT
   ============================================================ */
function initTypingEffect() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const words = [
    'Data Analyst',
    'AI Developer',
    'Python Enthusiast',
    'ML Engineer',
    'Power BI Expert',
    'Problem Solver',
  ];

  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  const SPEED_TYPE   = 80;   // ms per character while typing
  const SPEED_DELETE = 45;   // ms per character while deleting
  const PAUSE_WORD   = 1800; // pause after full word

  function tick() {
    const current = words[wordIdx];

    if (!deleting) {
      // Type
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        return setTimeout(tick, PAUSE_WORD);
      }
    } else {
      // Delete
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx  = (wordIdx + 1) % words.length;
      }
    }
    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  }
  tick();
}

/* ============================================================
   5. AOS – ANIMATE ON SCROLL
   ============================================================ */
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      once: true,
      easing: 'ease-out-cubic',
      offset: 80,
    });
  }
}

/* ============================================================
   6. NAVBAR – scroll class + active section highlight
   ============================================================ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled class for glass background
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); }
    else                      { navbar.classList.remove('scrolled'); }

    // Active link highlight
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   7. HAMBURGER MOBILE MENU
   ============================================================ */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close menu when a link is clicked
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

/* ============================================================
   8. DARK / LIGHT THEME TOGGLE
   ============================================================ */
function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const root = document.documentElement;

  // Load saved preference
  const saved = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', saved);
  updateIcon(saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon(next);
  });

  function updateIcon(theme) {
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ============================================================
   9. SKILL BAR ANIMATION (triggered on scroll into view)
   ============================================================ */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.dataset.width || '0';
        bar.style.width = width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   10. SVG RING CHART ANIMATION
   ============================================================ */
function initRingCharts() {
  const rings = document.querySelectorAll('.ring-fill');
  const circumference = 2 * Math.PI * 50; // r=50 → 314.16

  // Set initial state
  rings.forEach(ring => {
    ring.style.strokeDasharray  = circumference;
    ring.style.strokeDashoffset = circumference;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ring = entry.target;
        const pct  = parseFloat(ring.dataset.pct) / 100;
        ring.style.strokeDashoffset = circumference * (1 - pct);
        observer.unobserve(ring);
      }
    });
  }, { threshold: 0.4 });

  rings.forEach(ring => observer.observe(ring));
}

/* ============================================================
   11. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('c-name').value.trim();
    const email   = document.getElementById('c-email').value.trim();
    const message = document.getElementById('c-msg').value.trim();

    if (!name || !email || !message) return;

    // Simulate a send (replace with actual API call / EmailJS)
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled  = false;
      success.textContent = `✅ Thanks, ${name}! Your message has been received. I'll get back to you soon.`;
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1500);
  });
}

/* ============================================================
   12. BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   13. SMOOTH SCROLL for older browsers (polyfill)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
