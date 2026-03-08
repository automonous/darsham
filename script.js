/* ========================================================================
   DARSHAM SERVICES HUB — JavaScript
   Geometric precision in motion · Verdant beauty
   ======================================================================== */

(function () {
  'use strict';

  // ── Geometric Background Canvas ──────────────────────────────────────
  const canvas = document.getElementById('geo-canvas');
  const ctx = canvas.getContext('2d');
  let animationId;
  let mouse = { x: -1000, y: -1000 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Hexagonal grid nodes — tessellation foundation
  class GeoNode {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.size = Math.random() * 1.8 + 0.8;
      this.opacity = Math.random() * 0.25 + 0.04;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.004 + 0.001;
    }
    update(time) {
      this.x = this.baseX + Math.sin(time * this.speed + this.phase) * 2.5;
      this.y = this.baseY + Math.cos(time * this.speed * 0.7 + this.phase) * 2.5;
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = (180 - dist) / 180;
        this.x -= dx * force * 0.015;
        this.y -= dy * force * 0.015;
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(58, 187, 120, ${this.opacity})`;
      ctx.fill();
    }
  }

  const nodes = [];
  const spacing = 110;

  function createNodes() {
    nodes.length = 0;
    const cols = Math.ceil(canvas.width / spacing) + 2;
    const rows = Math.ceil(canvas.height / (spacing * 0.866)) + 2;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const offsetX = j % 2 === 0 ? 0 : spacing / 2;
        nodes.push(new GeoNode(i * spacing + offsetX, j * spacing * 0.866));
      }
    }
  }
  createNodes();
  window.addEventListener('resize', createNodes);

  function drawConnections(ctx) {
    const maxDist = spacing * 1.15;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const mx = (nodes[i].x + nodes[j].x) / 2;
          const my = (nodes[i].y + nodes[j].y) / 2;
          const mouseDist = Math.sqrt((mouse.x - mx) ** 2 + (mouse.y - my) ** 2);
          const mouseInfl = Math.max(0, 1 - mouseDist / 280);
          const alpha = (0.025 + mouseInfl * 0.07) * (1 - dist / maxDist);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(58, 187, 120, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const node of nodes) {
      node.update(time);
      node.draw(ctx);
    }
    drawConnections(ctx);
    animationId = requestAnimationFrame(animate);
  }
  animationId = requestAnimationFrame(animate);

  // Visibility API — pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else animationId = requestAnimationFrame(animate);
  });

  // ── Navigation ───────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const sections = document.querySelectorAll('.section');

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  }, { passive: true });

  // Active section tracking
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach((s) => sectionObserver.observe(s));

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('is-active');
      navLinksContainer.classList.toggle('is-open');
    });
    // Close on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('is-active');
        navLinksContainer.classList.remove('is-open');
      });
    });
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll Reveal Animations ─────────────────────────────────────────
  const animEls = document.querySelectorAll('[data-animate]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  animEls.forEach((el) => revealObserver.observe(el));

  // ── Interactive Card Hover Glow ──────────────────────────────────────
  function addRadialHover(cards, color) {
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, var(--color-bg-card) 65%)`;
      });
      card.addEventListener('mouseleave', () => { card.style.background = ''; });
    });
  }

  addRadialHover(document.querySelectorAll('.service-card'), 'rgba(58, 187, 120, 0.06)');
  addRadialHover(document.querySelectorAll('.team-card'), 'rgba(74, 168, 212, 0.05)');

  // ── Highlight item micro-interaction ─────────────────────────────────
  document.querySelectorAll('.highlight-item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const icon = item.querySelector('.highlight-item__icon');
      if (icon) icon.style.transform = 'scale(1.15) rotate(15deg)';
    });
    item.addEventListener('mouseleave', () => {
      const icon = item.querySelector('.highlight-item__icon');
      if (icon) icon.style.transform = '';
    });
  });

  // Style the icon transitions
  document.querySelectorAll('.highlight-item__icon').forEach((icon) => {
    icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });

  // ── Geo-illustration hover parallax ──────────────────────────────────
  document.querySelectorAll('.geo-illustration').forEach((ill) => {
    ill.addEventListener('mousemove', (e) => {
      const rect = ill.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      const svg = ill.querySelector('svg');
      if (svg) {
        svg.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
        svg.style.transition = 'transform 0.15s ease-out';
      }
    });
    ill.addEventListener('mouseleave', () => {
      const svg = ill.querySelector('svg');
      if (svg) {
        svg.style.transform = '';
        svg.style.transition = 'transform 0.4s ease-out';
      }
    });
  });

  // ── Subtle hex cursor trail ──────────────────────────────────────────
  let trailCount = 0;
  document.addEventListener('mousemove', (e) => {
    trailCount++;
    if (trailCount % 10 !== 0) return;
    const hex = document.createElement('div');
    hex.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 10px;
      height: 10px;
      border: 1px solid rgba(58, 187, 120, 0.25);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) rotate(30deg);
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(hex);
    requestAnimationFrame(() => {
      hex.style.opacity = '0';
      hex.style.transform = 'translate(-50%, -50%) rotate(90deg) scale(2.5)';
    });
    setTimeout(() => hex.remove(), 700);
  });

  // ── Contact Form ─────────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = '<span>Enquiry Received ✓</span>';
      btn.style.background = 'var(--color-secondary)';
      btn.style.pointerEvents = 'none';

      contactForm.querySelectorAll('.form-input').forEach((input) => {
        input.value = '';
        input.disabled = true;
      });

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.pointerEvents = '';
        contactForm.querySelectorAll('.form-input').forEach((input) => {
          input.disabled = false;
        });
      }, 3500);
    });
  }

  // ── Hero parallax ────────────────────────────────────────────────────
  const heroVisual = document.querySelector('.hero__visual');
  if (heroVisual) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroVisual.style.transform = `translateY(${y * 0.12}px)`;
      }
    }, { passive: true });
  }

})();
