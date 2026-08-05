/* ==========================================================================
   Rebank / BBVA — site-wide behaviour
   Smooth scroll (Lenis) + scroll-linked reveals & parallax (GSAP ScrollTrigger)
   + nav state + FAQ accordions + Bivi chat widget
   ========================================================================== */
(function(){
  "use strict";

  /* ---------- 1. Smooth, weighted scroll (Lenis) -------------------------- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.3,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time)=>{ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    window.__lenis = lenis;
  }

  /* ---------- 2. Nav: sticky shadow + active link + scroll-to -------------- */
  const nav = document.querySelector('.site-nav');
  if (nav){
    const onScroll = ()=> nav.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if (id.length > 1){
        const target = document.querySelector(id);
        if (target){
          e.preventDefault();
          if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.2 });
          else target.scrollIntoView({ behavior:'smooth' });
        }
      }
    });
  });

  /* ---------- 3. Scroll-linked reveal + parallax (GSAP ScrollTrigger) ----- */
  function initScrollFx(){
    if (!(window.gsap && window.ScrollTrigger)) {
      // Fallback: IntersectionObserver reveal, no GSAP available
      const els = document.querySelectorAll('.reveal, .reveal-scale');
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{ if (en.isIntersecting){ en.target.classList.add('is-visible'); io.unobserve(en.target);} });
      }, { threshold:.16 });
      els.forEach(el=> io.observe(el));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Staggered fade/slide-up reveals, batched per section for a livelier cascade
    gsap.utils.toArray('.reveal, .reveal-scale').forEach((el, i)=>{
      const scaleMode = el.classList.contains('reveal-scale');
      gsap.fromTo(el,
        { opacity:0, y: scaleMode ? 0 : 46, scale: scaleMode ? .9 : 1 },
        {
          opacity:1, y:0, scale:1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger:{ trigger: el, start:'top 88%' }
        }
      );
    });

    // Parallax: elements move at different speed than scroll
    gsap.utils.toArray('[data-speed]').forEach(el=>{
      const speed = parseFloat(el.getAttribute('data-speed')) || .15;
      gsap.to(el, {
        yPercent: speed * 100,
        ease:'none',
        scrollTrigger:{ trigger: el.closest('section') || el, start:'top bottom', end:'bottom top', scrub: 0.6 }
      });
    });

    // Hero heading letter/word drift + scale-in
    gsap.utils.toArray('[data-hero-in]').forEach(el=>{
      gsap.fromTo(el, { opacity:0, y:60 }, { opacity:1, y:0, duration:1.1, ease:'power4.out', delay:.1 });
    });

    // Progress-style number count-up when stat cards enter view
    gsap.utils.toArray('[data-count]').forEach(el=>{
      const end = el.getAttribute('data-count');
      const suffixMatch = end.match(/[^0-9.,]+$/);
      const suffix = suffixMatch ? suffixMatch[0] : '';
      const numeric = parseFloat(end.replace(/[^0-9.]/g,'')) || 0;
      const obj = { val:0 };
      ScrollTrigger.create({
        trigger: el, start:'top 90%', once:true,
        onEnter:()=> gsap.to(obj, {
          val: numeric, duration:1.6, ease:'power2.out',
          onUpdate:()=>{ el.textContent = (numeric % 1 === 0 ? Math.floor(obj.val) : obj.val.toFixed(1)) + suffix; }
        })
      });
    });

    // Section background color hint bar (progress indicator top of viewport)
    const bar = document.querySelector('.scroll-progress');
    if (bar){
      gsap.to(bar, { scaleX:1, ease:'none', scrollTrigger:{ scrub:.3, start:0, end: () => document.body.scrollHeight - window.innerHeight } });
    }

    // Card tilt-in stagger for grid rows
    document.querySelectorAll('[data-stagger]').forEach(group=>{
      const items = group.children;
      gsap.fromTo(items, { opacity:0, y:50 }, {
        opacity:1, y:0, duration:.8, ease:'power3.out', stagger:.12,
        scrollTrigger:{ trigger: group, start:'top 85%' }
      });
    });

    // Floating Bivi drifts subtly with scroll velocity on hero sections
    document.querySelectorAll('[data-bivi-drift]').forEach(el=>{
      gsap.to(el, {
        y: -30, rotation: 4, ease:'none',
        scrollTrigger:{ trigger: el, start:'top bottom', end:'bottom top', scrub:1 }
      });
    });
  }
  initScrollFx();

  /* ---------- 4. FAQ accordions ------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', ()=>{
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i=> i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ---------- 5. Bivi floating chat widget --------------------------------- */
  function buildBiviWidget(){
    if (document.querySelector('.bivi-widget')) return;
    const wrap = document.createElement('div');
    wrap.className = 'bivi-widget';
    wrap.innerHTML = `
      <div class="bivi-panel">
        <div class="bivi-panel-head">
          <div data-bivi data-bivi-size="32"></div>
          <div>
            <div style="font-weight:600;font-size:13px;">Bivi</div>
            <div class="status">En línea · responde al instante</div>
          </div>
          <button class="bivi-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="bivi-panel-body" id="biviBody">
          <div class="bivi-msg bot">¡Hola! Soy Bivi. Tu asistente de BBVA. ¿En qué te echo un cable?</div>
          <div class="bivi-quick" id="biviQuick">
            <button data-q="puntos">Ver mis puntos</button>
            <button data-q="gasto">Dividir un gasto</button>
            <button data-q="bloquear">Bloquear tarjeta</button>
          </div>
        </div>
        <div class="bivi-panel-input">
          <input type="text" placeholder="Escríbele a Bivi…" id="biviInput" />
          <button id="biviSend" aria-label="Enviar">↑</button>
        </div>
      </div>
      <button class="bivi-fab" aria-label="Habla con Bivi">
        <div data-bivi data-bivi-size="42"></div>
        <span class="badge">1</span>
      </button>
    `;
    document.body.appendChild(wrap);
    if (window.BIVI) BIVI.mount();

    const fab = wrap.querySelector('.bivi-fab');
    const closeBtn = wrap.querySelector('.bivi-close');
    fab.addEventListener('click', ()=>{
      wrap.classList.toggle('open');
      const badge = fab.querySelector('.badge');
      if (badge) badge.remove();
    });
    closeBtn.addEventListener('click', ()=> wrap.classList.remove('open'));

    const body = wrap.querySelector('#biviBody');
    const input = wrap.querySelector('#biviInput');
    const sendBtn = wrap.querySelector('#biviSend');

    const answers = {
      puntos: 'Tienes 12.480 puntos ≈ 124 € para canjear. ¿Te enseño las recompensas?',
      gasto: 'Crea un grupo en BBVA Split y yo calculo quién debe qué. ¿Quieres que abra la calculadora?',
      bloquear: 'Hecho, en un caso real bloquearía tu tarjeta al instante desde aquí. Puedes reactivarla cuando quieras.',
      default: 'Buena pregunta — en la app real te respondería con detalle. Por ahora esto es una demo de la interfaz.'
    };

    function pushMsg(text, who){
      const div = document.createElement('div');
      div.className = 'bivi-msg ' + who;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }
    function botReply(key){
      const typing = document.createElement('div');
      typing.className = 'bivi-msg bot';
      typing.textContent = '•••';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      setTimeout(()=>{
        typing.textContent = answers[key] || answers.default;
      }, 650);
    }
    wrap.querySelectorAll('[data-q]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        pushMsg(btn.textContent, 'me');
        botReply(btn.getAttribute('data-q'));
      });
    });
    function sendCustom(){
      const val = input.value.trim();
      if (!val) return;
      pushMsg(val, 'me');
      input.value = '';
      botReply('default');
    }
    sendBtn.addEventListener('click', sendCustom);
    input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') sendCustom(); });
  }
  buildBiviWidget();

  /* ---------- 6. Mark active nav link based on current page ---------------- */
  const page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---------- 7. Header search (lupa) + mobile hamburger menu -------------- */
  (function enhanceNav(){
    const navWrap = document.querySelector('.site-nav .wrap');
    const navEl = document.querySelector('.site-nav');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    if (!navWrap || !navEl || !navLinks || !navActions) return;

    // --- search ---
    const searchWrap = document.createElement('div');
    searchWrap.className = 'nav-search';
    searchWrap.innerHTML = `
      <button class="nav-search-btn" aria-label="Buscar" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
      <form class="nav-search-form" id="navSearchForm">
        <input type="text" id="navSearchInput" placeholder="Pregúntale a Bivi…" autocomplete="off">
        <button type="submit" aria-label="Enviar">→</button>
      </form>
    `;
    navWrap.insertBefore(searchWrap, navActions);
    const searchBtn = searchWrap.querySelector('.nav-search-btn');
    const searchInput = searchWrap.querySelector('#navSearchInput');
    searchBtn.addEventListener('click', ()=>{
      searchWrap.classList.toggle('open');
      if (searchWrap.classList.contains('open')) setTimeout(()=> searchInput.focus(), 150);
    });
    searchWrap.querySelector('#navSearchForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const q = searchInput.value.trim();
      if (!q) return;
      window.location.href = 'bivi.html?q=' + encodeURIComponent(q);
    });

    // --- mobile hamburger ---
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Abrir menú');
    burger.innerHTML = '<span></span><span></span><span></span>';
    navWrap.appendChild(burger);

    const panel = document.createElement('div');
    panel.className = 'nav-mobile-panel';
    panel.innerHTML = navLinks.innerHTML + `<div class="nav-mobile-actions">${navActions.innerHTML}</div>`;
    navEl.appendChild(panel);

    burger.addEventListener('click', ()=>{
      burger.classList.toggle('is-open');
      navEl.classList.toggle('mobile-open');
    });
    panel.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{
      burger.classList.remove('is-open');
      navEl.classList.remove('mobile-open');
    }));
  })();

  /* ---------- 8. Cookie consent banner -------------------------------------- */
  (function cookieBanner(){
    const KEY = 'bbva_cookies_choice';
    function build(){
      if (document.querySelector('.cookie-banner')) return document.querySelector('.cookie-banner');
      const bar = document.createElement('div');
      bar.className = 'cookie-banner';
      bar.innerHTML = `
        <p>Usamos cookies propias y de terceros para que la web funcione bien y para entender cómo la usas. Puedes aceptarlas o rechazar las no esenciales.</p>
        <div class="cookie-actions">
          <button class="btn btn-outline" id="cookieReject">Rechazar</button>
          <button class="btn btn-primary" id="cookieAccept">Aceptar</button>
        </div>
      `;
      document.body.appendChild(bar);
      bar.querySelector('#cookieAccept').addEventListener('click', ()=>{
        localStorage.setItem(KEY, 'accepted');
        bar.classList.remove('show');
      });
      bar.querySelector('#cookieReject').addEventListener('click', ()=>{
        localStorage.setItem(KEY, 'rejected');
        bar.classList.remove('show');
      });
      return bar;
    }
    const choice = localStorage.getItem(KEY);
    const bar = build();
    if (!choice){
      setTimeout(()=> bar.classList.add('show'), 900);
    }
    // let any "Cookies" footer link reopen the preferences banner
    document.querySelectorAll('.footer-bottom span').forEach(span=>{
      if (/cookies/i.test(span.textContent)){
        span.innerHTML = span.innerHTML.replace(/Cookies/i, '<a href="#" id="reopenCookies" style="text-decoration:underline;">Cookies</a>');
      }
    });
    document.getElementById('reopenCookies')?.addEventListener('click', (e)=>{
      e.preventDefault();
      localStorage.removeItem(KEY);
      bar.classList.add('show');
    });
  })();

  /* ---------- 9. Scroll-down cue: fade once the user starts scrolling ------- */
  (function scrollCue(){
    const cues = document.querySelectorAll('.scroll-cue');
    if (!cues.length) return;
    const onScroll = ()=>{
      const hide = window.scrollY > 80;
      cues.forEach(c=> c.classList.toggle('is-hidden', hide));
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    cues.forEach(c=> c.addEventListener('click', ()=>{
      const next = c.closest('header, section')?.nextElementSibling;
      if (next){
        if (lenis) lenis.scrollTo(next, { offset:-90, duration:1.1 });
        else next.scrollIntoView({ behavior:'smooth' });
      }
    }));
  })();

  /* ---------- 10. Prefill Bivi chat from ?q= (header search / other pages) -- */
  (function prefillBiviQuery(){
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (!q) return;
    setTimeout(()=>{
      document.querySelector('.bivi-widget')?.classList.add('open');
      const body = document.getElementById('biviBody');
      if (!body) return;
      const me = document.createElement('div');
      me.className = 'bivi-msg me';
      me.textContent = q;
      body.appendChild(me);
      const reply = document.createElement('div');
      reply.className = 'bivi-msg bot';
      reply.textContent = '•••';
      body.appendChild(reply);
      body.scrollTop = body.scrollHeight;
      setTimeout(()=>{ reply.textContent = 'Buena pregunta — en la app real te la respondo con detalle. Por ahora esto es una demo de la interfaz.'; }, 700);
    }, 400);
  })();

})();
