(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const onHeaderScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgressBar');
  const onProgress = () => {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  onProgress();
  window.addEventListener('scroll', onProgress, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach(el => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', delay);
  });

  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- App carousel (swipe) ---------- */
  const track = document.getElementById('appCarouselTrack');
  const dotsWrap = document.getElementById('appCarouselDots');
  const screensCount = track.children.length;
  let current = 0;
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  for (let i = 0; i < screensCount; i++) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir a pantalla ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }
  const dotEls = Array.from(dotsWrap.children);

  const goTo = (index) => {
    current = Math.min(Math.max(index, 0), screensCount - 1);
    track.style.transform = `translateX(-${current * 100}%)`;
    dotEls.forEach((d, i) => d.classList.toggle('is-active', i === current));
  };

  const carousel = document.getElementById('appCarousel');
  const pointerDown = (x) => { dragging = true; startX = x; deltaX = 0; track.style.transition = 'none'; };
  const pointerMove = (x) => {
    if (!dragging) return;
    deltaX = x - startX;
    track.style.transform = `translateX(calc(-${current * 100}% + ${deltaX}px))`;
  };
  const pointerUp = () => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    if (Math.abs(deltaX) > 60) {
      goTo(current + (deltaX < 0 ? 1 : -1));
    } else {
      goTo(current);
    }
  };

  carousel.addEventListener('touchstart', e => pointerDown(e.touches[0].clientX), { passive: true });
  carousel.addEventListener('touchmove', e => pointerMove(e.touches[0].clientX), { passive: true });
  carousel.addEventListener('touchend', pointerUp);

  carousel.addEventListener('mousedown', e => { e.preventDefault(); pointerDown(e.clientX); });
  window.addEventListener('mousemove', e => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);

  let autoplay = reduceMotion ? null : setInterval(() => {
    goTo((current + 1) % screensCount);
  }, 4200);
  carousel.addEventListener('mouseenter', () => autoplay && clearInterval(autoplay));
  carousel.addEventListener('touchstart', () => autoplay && clearInterval(autoplay), { passive: true });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panel = trigger.nextElementSibling;

      document.querySelectorAll('.accordion__trigger').forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.nextElementSibling.style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.style.maxHeight = expanded ? null : panel.scrollHeight + 'px';
    });
  });

  /* ---------- Nav dropdown keyboard accessibility ---------- */
  document.querySelectorAll('.has-dropdown > .main-nav__link').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  /* ---------- Email capture forms -> landing page ---------- */
  document.querySelectorAll('[data-email-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      const params = email ? `?email=${encodeURIComponent(email)}` : '';
      window.location.href = `gracias.html${params}`;
    });
  });
})();
