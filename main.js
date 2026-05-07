import Lenis from '@studio-freight/lenis';

/* ========== SMOOTH SCROLLING (LENIS) ========== */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Anchor link smooth scrolling with Lenis
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement, {
          offset: -80, // offset for the fixed navbar
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        
        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        const menuToggle = document.getElementById('menuToggle');
        if (navLinks && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          document.body.style.overflow = '';
          if (menuToggle) {
            const spans = menuToggle.querySelectorAll('span');
            if (spans.length === 3) {
              spans[0].style.transform = 'none';
              spans[1].style.opacity = '1';
              spans[2].style.transform = 'none';
            }
          }
        }
      }
    }
  });
});

/* ========== NAVBAR SCROLL BEHAVIOR ========== */
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  
  if (currentScroll > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  if (currentScroll > lastScroll && currentScroll > 400) {
    navbar.style.transform = 'translateX(-50%) translateY(-120%)';
  } else {
    navbar.style.transform = 'translateX(-50%) translateY(0)';
  }
  
  lastScroll = currentScroll;
});

/* ========== MOBILE MENU ========== */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ========== SCROLL REVEAL ========== */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

/* ========== PARALLAX EFFECT ========== */
const heroBulb = document.querySelector('.hero-bulb');
const heroGlow = document.querySelector('.hero-glow');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY < 1200) {
    const offset = scrollY * 0.15;
    if (heroBulb) heroBulb.style.transform = `translateY(calc(-50% + ${offset}px))`;
    if (heroGlow) heroGlow.style.transform = `translateY(calc(-50% + ${offset * 0.5}px))`;
  }
}, { passive: true });

/* ========== COUNTER ANIMATION ========== */
const counters = document.querySelectorAll('[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.textContent.replace(/[0-9]/g, '');
      let current = 0;
      const increment = target / 40;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
      }, 30);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

/* ========== 3D TILT EFFECT ON SERVICE CARDS ========== */
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -5;
    const rotateY = (x - centerX) / centerX * 5;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

/* ========== SMOOTH ANCHOR SCROLLING ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
