/* =========================================================
   script.js — Akshara World Interactive Behaviors
   ========================================================= */

'use strict';

// ── Navbar Scroll Effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
let lastScroll = 0;

function handleNavbarScroll() {
  const scrollY = window.scrollY;
  if (scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = scrollY;
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // Run on load

// ── Active Nav Link on Scroll ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (scrollMid >= top && scrollMid < bottom) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${section.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// ── Mobile Hamburger Menu ─────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen.toString());
});

// Close menu when a link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// ── Smooth Scroll ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});

// ── Scroll Reveal Animation ───────────────────────────────
function addRevealClasses() {
  const revealTargets = [
    { selector: '.service-card', delays: [0, 0.1, 0.2] },
    { selector: '.testimonial-card', delays: [0, 0.1, 0.2] },
    { selector: '.about-content', delays: [0] },
    { selector: '.about-visual', delays: [0.15] },
    { selector: '.contact-info', delays: [0] },
    { selector: '.contact-form-container', delays: [0.15] },
    { selector: '.hero-badge', delays: [0] },
    { selector: '.hero-title', delays: [0.1] },
    { selector: '.hero-subtitle', delays: [0.2] },
    { selector: '.hero-actions', delays: [0.3] },
    { selector: '.hero-stats', delays: [0.4] },
    { selector: '.section-header', delays: [0] },
  ];

  revealTargets.forEach(({ selector, delays }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      const delay = delays[i] !== undefined ? delays[i] : (delays[delays.length - 1] || 0);
      el.style.transitionDelay = `${delay}s`;
    });
  });
}

addRevealClasses();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Contact Form Handling ─────────────────────────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('form-submit-btn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('form-name').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const message = document.getElementById('form-message').value.trim();

  if (!name || !email || !message) {
    shakeForm();
    return;
  }

  if (!isValidEmail(email)) {
    document.getElementById('form-email').focus();
    shakeField(document.getElementById('form-email'));
    return;
  }

  // Simulate form submission
  submitBtn.disabled = true;
  const btnText = submitBtn.querySelector('.btn-text');
  const btnIcon = submitBtn.querySelector('.btn-icon');
  btnText.textContent = 'Sending...';
  btnIcon.textContent = '⟳';

  await simulateDelay(1500);

  submitBtn.disabled = false;
  btnText.textContent = 'Send Message';
  btnIcon.textContent = '→';
  contactForm.reset();
  formSuccess.hidden = false;

  setTimeout(() => {
    formSuccess.hidden = true;
  }, 6000);
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shakeForm() {
  contactForm.style.animation = 'none';
  contactForm.offsetHeight; // reflow
  contactForm.style.animation = 'shake 0.4s ease';
}

function shakeField(field) {
  field.style.borderColor = '#EC4899';
  field.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.2)';
  setTimeout(() => {
    field.style.borderColor = '';
    field.style.boxShadow = '';
  }, 2000);
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── Mouse Parallax on Hero Visual ────────────────────────
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const moveX = (clientX / innerWidth - 0.5) * 20;
    const moveY = (clientY / innerHeight - 0.5) * 20;
    heroVisual.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
  });
}

// ── Cursor Glow Effect ────────────────────────────────────
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
  opacity: 0;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
  cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

// ── Animated Counter on Stats ─────────────────────────────
function animateCounter(el, target, suffix = '') {
  const isDecimal = String(target).includes('.');
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    const value = start + (target - start) * eased;
    el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(el => {
        const text = el.textContent;
        const match = text.match(/[\d.]+/);
        if (match) {
          const numVal = parseFloat(match[0]);
          const suffix = text.replace(/[\d.]+/, '');
          animateCounter(el, numVal, suffix);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ── Service Card Interactive Glow ─────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.left = `${x - 100}px`;
      glow.style.top = `${y - 100}px`;
    }
  });
});

// ── Page Load Animation ───────────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
