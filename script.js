/**
 * script.js – Mohd Shami Portfolio
 * White | Blue | Black – Professional 3D Theme
 * Features:
 *   - Preloader animation
 *   - Custom glow cursor
 *   - Three.js 3D geometric hero background
 *   - Animated typing effect
 *   - AOS scroll animations
 *   - Stat counter animation
 *   - 3D card tilt effects
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
  setTimeout(() => {
    preloader.classList.add('hidden');
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
  initStatCounters();
  init3DTiltCards();
}

/* ============================================================
   2. CUSTOM CURSOR GLOW
   ============================================================ */
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  const dot  = document.getElementById('cursor-dot');
  let mx = 0, my = 0;
  let gx = 0, gy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animateGlow() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  const interactiveEls = document.querySelectorAll('a, button, input, textarea, .project-card, .cert-card, .stat-card, .chip');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.transform = 'translate(-50%,-50%) scale(2.5)'; });
    el.addEventListener('mouseleave', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
  });

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; dot.style.opacity = '1'; });
}

/* ============================================================
   3. THREE.JS HERO BACKGROUND – 3D Network Geometry
   ============================================================ */
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  camera.position.z = 6;

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

  /* ---- Particles – Blue & White palette ---- */
  const PARTICLE_COUNT = 2000;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const speeds    = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color('#3b82f6'),  // blue-500
    new THREE.Color('#60a5fa'),  // blue-400
    new THREE.Color('#93c5fd'),  // blue-300
    new THREE.Color('#bfdbfe'),  // blue-200
    new THREE.Color('#ffffff'),  // white
    new THREE.Color('#1d4ed8'),  // blue-700
    new THREE.Color('#2563eb'),  // blue-600
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    speeds[i]            = Math.random() * 0.01 + 0.002;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size:         0.055,
    vertexColors: true,
    transparent:  true,
    opacity:      0.8,
    depthWrite:   false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ---- Connecting lines – blue network ---- */
  const lineGeo = new THREE.BufferGeometry();
  const lineVerts = [];
  for (let i = 0; i < 600; i++) {
    const ia = Math.floor(Math.random() * PARTICLE_COUNT) * 3;
    const ib = Math.floor(Math.random() * PARTICLE_COUNT) * 3;
    const dx = positions[ia] - positions[ib];
    const dy = positions[ia+1] - positions[ib+1];
    const dz = positions[ia+2] - positions[ib+2];
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < 5) {
      lineVerts.push(positions[ia], positions[ia+1], positions[ia+2]);
      lineVerts.push(positions[ib], positions[ib+1], positions[ib+2]);
    }
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.06 });
  const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(linesMesh);

  /* ---- Floating 3D Geometric shapes ---- */
  const shapeGroup = new THREE.Group();
  scene.add(shapeGroup);

  // Wireframe icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.12 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(4, 2, -3);
  shapeGroup.add(ico);

  // Wireframe octahedron
  const octGeo = new THREE.OctahedronGeometry(0.8, 0);
  const octMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, wireframe: true, transparent: true, opacity: 0.1 });
  const oct = new THREE.Mesh(octGeo, octMat);
  oct.position.set(-4, -2, -2);
  shapeGroup.add(oct);

  // Wireframe torus
  const torGeo = new THREE.TorusGeometry(0.7, 0.2, 12, 32);
  const torMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, transparent: true, opacity: 0.09 });
  const tor = new THREE.Mesh(torGeo, torMat);
  tor.position.set(-3, 3, -4);
  shapeGroup.add(tor);

  // Wireframe dodecahedron
  const dodGeo = new THREE.DodecahedronGeometry(0.6, 0);
  const dodMat = new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.1 });
  const dod = new THREE.Mesh(dodGeo, dodMat);
  dod.position.set(3, -3, -3);
  shapeGroup.add(dod);

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

    // Drift particles upward
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 11) pos[i * 3 + 1] = -11;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Gentle rotation following mouse
    particles.rotation.y += (targetRotY * 0.5 - particles.rotation.y) * 0.04;
    particles.rotation.x += (targetRotX * 0.3 - particles.rotation.x) * 0.04;
    linesMesh.rotation.y = particles.rotation.y;
    linesMesh.rotation.x = particles.rotation.x;

    // Auto-spin
    particles.rotation.z = t * 0.015;

    // Animate geometric shapes
    ico.rotation.x = t * 0.3;
    ico.rotation.y = t * 0.2;
    ico.position.y = 2 + Math.sin(t * 0.5) * 0.5;

    oct.rotation.x = t * 0.4;
    oct.rotation.z = t * 0.25;
    oct.position.y = -2 + Math.cos(t * 0.6) * 0.4;

    tor.rotation.x = t * 0.35;
    tor.rotation.y = t * 0.5;
    tor.position.x = -3 + Math.sin(t * 0.3) * 0.5;

    dod.rotation.y = t * 0.3;
    dod.rotation.z = t * 0.2;
    dod.position.y = -3 + Math.sin(t * 0.4) * 0.3;

    // Shape group follows mouse slightly
    shapeGroup.rotation.y += (targetRotY * 0.3 - shapeGroup.rotation.y) * 0.02;
    shapeGroup.rotation.x += (targetRotX * 0.2 - shapeGroup.rotation.x) * 0.02;

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
    'Data Scientist',
    'ML Engineer',
    'AI Developer',
    'Python Enthusiast',
    'Power BI Expert',
    'Problem Solver',
  ];

  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  const SPEED_TYPE   = 80;
  const SPEED_DELETE = 45;
  const PAUSE_WORD   = 1800;

  function tick() {
    const current = words[wordIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        return setTimeout(tick, PAUSE_WORD);
      }
    } else {
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
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); }
    else                      { navbar.classList.remove('scrolled'); }

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
  const circumference = 2 * Math.PI * 50;

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
   11. STAT COUNTER ANIMATION
   ============================================================ */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isFloat = target % 1 !== 0;
        const duration = 1500;
        const startTime = performance.now();

        function updateCount(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;

          if (isFloat) {
            el.textContent = current.toFixed(1);
          } else {
            el.textContent = Math.round(current);
          }

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = isFloat ? target.toFixed(1) : target;
            // Add a "+" suffix for integers
            if (!isFloat && target > 1) el.textContent = target + '+';
          }
        }
        requestAnimationFrame(updateCount);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

/* ============================================================
   12. 3D TILT CARD EFFECT
   ============================================================ */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.project-card, .cert-card, .stat-card, .contact-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================================================
   13. CONTACT FORM
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
   14. BACK TO TOP BUTTON
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
   15. SMOOTH SCROLL for older browsers (polyfill)
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
