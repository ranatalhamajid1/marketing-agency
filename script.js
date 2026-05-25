/*!
 * NexaGrowth — Ultra Premium JS v2.0
 * Canvas Particles | 3D Tilt | Magnetic Buttons
 * Smooth Scroll | Counters | Form | Slider
 */
'use strict';

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const map = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a));
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

/* ════════════════════════════════════════
   LOADER  — letter drop + canvas shimmer
════════════════════════════════════════ */
(function Loader() {
  const loader = $('#loader');
  const pct    = $('#loader-pct');
  const canvas = $('#loader-canvas');
  if (!loader) return;

  if (sessionStorage.getItem('ng-loader-seen') === '1') {
    loader.classList.add('done');
    return;
  }
  sessionStorage.setItem('ng-loader-seen', '1');

  // Shimmer canvas
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + .5,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
      o: Math.random() * .5 + .1,
    }));
    let animId;
    (function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.o})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(drawParticles);
    })();
    // cleanup
    loader.addEventListener('transitionend', () => cancelAnimationFrame(animId), { once: true });
  }

  // Count up pct
  let count = 0;
  const tick = setInterval(() => {
    count = Math.min(count + Math.floor(Math.random() * 8) + 4, 100);
    if (pct) pct.textContent = count + '%';
    if (count >= 100) clearInterval(tick);
  }, 28);

  const hide = () => loader.classList.add('done');
  window.addEventListener('load', () => setTimeout(hide, 2100));
  setTimeout(hide, 3200); // hard fallback
})();

/* ════════════════════════════════════════
   HERO CANVAS — interactive particles
════════════════════════════════════════ */
(function HeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function createParticles() {
    // Reduce particle density on mobile to optimize performance
    const density = W < 768 ? 30000 : 15000;
    const n = Math.floor((W * H) / density);
    particles = Array.from({ length: Math.min(n, 90) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + .5,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      o: Math.random() * .4 + .1,
      hue: Math.random() > .5 ? 262 : 186,
    }));
  }
  createParticles();
  window.addEventListener('resize', createParticles, { passive: true });

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      // Repel from mouse
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.vx += (dx / dist) * force * .6;
        p.vy += (dy / dist) * force * .6;
      }
      p.vx = clamp(p.vx, -1.2, 1.2);
      p.vy = clamp(p.vy, -1.2, 1.2);
      p.vx *= .99; p.vy *= .99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.o})`;
      ctx.fill();

      // Connect close particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ddx = p.x - q.x, ddy = p.y - q.y;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `hsla(${p.hue},70%,65%,${.15 * (1 - d / 120)})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  })();
})();

/* ════════════════════════════════════════
   RESULTS CANVAS — wave background
════════════════════════════════════════ */
(function ResultsCanvas() {
  const canvas = $('#results-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;
  const resize = () => { W = canvas.width = canvas.parentElement.offsetWidth; H = canvas.height = canvas.parentElement.offsetHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = H / 2 + Math.sin(x * .006 + t + i * 1.1) * (40 + i * 20) + Math.sin(x * .012 - t * 1.3) * 20;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        if (i > 0) {
          const grad = ctx.createLinearGradient(0, 0, W, 0);
          grad.addColorStop(0, `rgba(139,92,246,0)`);
          grad.addColorStop(.5, `rgba(139,92,246,${0.04 - i * 0.01})`);
          grad.addColorStop(1, `rgba(6,182,212,0)`);
        }
      }
      ctx.strokeStyle = i === 0 ? 'rgba(139,92,246,.15)' : i === 1 ? 'rgba(139,92,246,.08)' : 'rgba(6,182,212,.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    t += .008;
    requestAnimationFrame(draw);
  })();
})();

/* ════════════════════════════════════════
   CUSTOM CURSOR
════════════════════════════════════════ */
(function Cursor() {
  const dot  = $('#c-dot');
  const ring = $('#c-ring');
  if (!dot || !ring) return;
  if (matchMedia('(pointer:coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function loop() {
    dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
    rx = lerp(rx, mx, .13); ry = lerp(ry, my, .13);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const hov = 'a,button,.svc-card,.port-card,.stat-card,.pf-btn,.glass-card';
  $$(hov).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hov'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
  });
  document.addEventListener('mousedown', () => dot.classList.add('click'));
  document.addEventListener('mouseup',   () => dot.classList.remove('click'));
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ════════════════════════════════════════
   SCROLL PROGRESS BAR
════════════════════════════════════════ */
(function ProgressBar() {
  const bar = $('#progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const el = document.documentElement;
    const p = el.scrollTop / (el.scrollHeight - el.clientHeight);
    bar.style.transform = `scaleX(${clamp(p, 0, 1)})`;
  }, { passive: true });
})();

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
(function Navbar() {
  const nav = $('#navbar');
  if (!nav) return;
  const scroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', scroll, { passive: true });
  scroll();

  // Active links
  const sections = $$('section[id]');
  const links = $$('.nl');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: .4 }).observe; // observe each
  sections.forEach(s => {
    new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }), { threshold: .4 }).observe(s);
  });
})();

/* ════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════ */
(function MobileMenu() {
  const btn  = $('#burger');
  const menu = $('#mobile-nav');
  if (!btn || !menu) return;
  const open = (v) => {
    btn.classList.toggle('open', v);
    menu.classList.toggle('open', v);
    btn.setAttribute('aria-expanded', v);
    menu.setAttribute('aria-hidden', !v);
  };
  btn.addEventListener('click', () => open(!btn.classList.contains('open')));
  $$('.mn-link').forEach(l => l.addEventListener('click', () => open(false)));
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) open(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
})();

/* ════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════ */
(function Theme() {
  const btn  = $('#theme-btn');
  const html = document.documentElement;
  if (!btn) return;
  const saved = localStorage.getItem('ng-theme');
  const pref  = saved || (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  html.setAttribute('data-theme', pref);
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ng-theme', next);
  });
})();

/* ════════════════════════════════════════
   SMOOTH SCROLL
════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    const offset = ($('#navbar')?.offsetHeight || 70);
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ════════════════════════════════════════
   REVEAL ON SCROLL
════════════════════════════════════════ */
(function Reveal() {
  const els = $$('[class*="reveal-"]');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ════════════════════════════════════════
   3D TILT CARDS
════════════════════════════════════════ */
(function Tilt() {
  const cards = $$('.tilt-card');
  const DEG = 12;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      const rotX = -y * DEG, rotY = x * DEG;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
      card.style.transition = 'transform .1s ease';
      // Move glow
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.left = (x * 100 + 50) + '%';
        glow.style.top  = (y * 100 + 50) + '%';
        glow.style.transform = 'translate(-50%,-50%)';
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
    });
  });
})();

/* ════════════════════════════════════════
   MAGNETIC BUTTONS
════════════════════════════════════════ */
(function Magnetic() {
  const btns = $$('.mag-btn');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top  - r.height / 2;
      const inner = btn.querySelector('span');
      btn.style.transform = `translate(${x * .25}px,${y * .25}px)`;
      if (inner) inner.style.transform = `translate(${x * .12}px,${y * .12}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      const inner = btn.querySelector('span');
      if (inner) inner.style.transform = '';
    });
  });
})();

/* ════════════════════════════════════════
   ANIMATED COUNTERS
════════════════════════════════════════ */
(function Counters() {
  const cards = $$('.stat-card[data-target]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const target = +e.target.dataset.target;
      const numEl  = e.target.querySelector('.count-num');
      if (!numEl) return;
      const dur = 1800, start = performance.now();
      requestAnimationFrame(function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        numEl.textContent = Math.round(easeOutCubic(t) * target);
        if (t < 1) requestAnimationFrame(tick);
        else { numEl.textContent = target; e.target.classList.add('counted'); }
      });
    });
  }, { threshold: .5 });
  cards.forEach(c => io.observe(c));
})();

/* ════════════════════════════════════════
   ORBITING PLANETS — spin with scroll
════════════════════════════════════════ */
(function OrbitScroll() {
  const orbit = $('#av-orbit');
  if (!orbit) return;
  let baseAngle = 0, lastY = 0;
  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastY;
    baseAngle += delta * .05;
    lastY = window.scrollY;
    orbit.style.transform = `rotate(${baseAngle}deg)`;
    orbit.style.setProperty('--baseAngle', baseAngle + 'deg');
  }, { passive: true });
})();

/* ════════════════════════════════════════
   PORTFOLIO FILTER
════════════════════════════════════════ */
(function PortfolioFilter() {
  const btns  = $$('.pf-btn');
  const cards = $$('.port-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      cards.forEach((card, i) => {
        const show = f === 'all' || card.dataset.cat === f;
        if (show) {
          card.classList.remove('hidden');
          card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.cssText = 'opacity:1;transform:none;transition:opacity .4s ease,transform .4s ease'; }, i * 60 + 20);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ════════════════════════════════════════
   TESTIMONIAL SLIDER
════════════════════════════════════════ */
(function Slider() {
  const track = $('#testi-track');
  const dots  = $$('.td');
  const prev  = $('#t-prev');
  const next  = $('#t-next');
  if (!track) return;
  let cur = 0, total = track.children.length, auto;

  const go = i => {
    cur = (i + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, j) => { d.classList.toggle('active', j === cur); d.setAttribute('aria-current', j === cur); });
  };
  const startAuto = () => { clearInterval(auto); auto = setInterval(() => go(cur + 1), 5000); };

  prev?.addEventListener('click', () => { go(cur - 1); startAuto(); });
  next?.addEventListener('click', () => { go(cur + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startAuto(); }));

  // Swipe
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { go(dx > 0 ? cur + 1 : cur - 1); startAuto(); }
  }, { passive: true });

  go(0); startAuto();
})();

/* ════════════════════════════════════════
   SECURITY — Input sanitizer
   Strips HTML/script tags before use.
════════════════════════════════════════ */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/* ════════════════════════════════════════
   CLOUDFLARE TURNSTILE — global callbacks
   The widget enables/disables submit.
════════════════════════════════════════ */
let _turnstileToken = null;

// Called by Turnstile when the user passes the challenge.
window.onTurnstileSuccess = function(token) {
  _turnstileToken = token;
  const btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = false;
  const errEl = document.getElementById('e-turnstile');
  if (errEl) errEl.textContent = '';
};

// Called by Turnstile on widget error (network, etc.).
window.onTurnstileError = function() {
  _turnstileToken = null;
  const btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = true;
  const errEl = document.getElementById('e-turnstile');
  if (errEl) errEl.textContent = 'Bot verification failed. Please refresh and try again.';
};

/* ════════════════════════════════════════
   CONTACT FORM — hardened handler
════════════════════════════════════════ */
(function Form() {
  const form      = $('#cform');
  const submitBtn = $('#submit-btn');
  const ok        = $('#form-ok');
  const errBanner = $('#form-err-msg');
  const errText   = $('#form-err-text');
  if (!form) return;

  /* ── Field validators ── */
  const LIMITS = { name: 100, email: 254, company: 150, message: 2000 };
  const fields = {
    'f-name':  v => {
      if (!v.trim() || v.trim().length < 2) return 'Please enter your full name.';
      if (v.trim().length > LIMITS.name)    return `Name must be under ${LIMITS.name} characters.`;
      return '';
    },
    'f-email': v => {
      if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email address.';
      if (v.length > LIMITS.email) return 'Email address is too long.';
      return '';
    },
    'f-svc':   v => v ? '' : 'Please select a service.',
    'f-msg':   v => {
      if (v.trim().length < 10)             return 'Message must be at least 10 characters.';
      if (v.trim().length > LIMITS.message) return `Message must be under ${LIMITS.message} characters.`;
      return '';
    },
  };

  const errMap = { 'f-name': 'e-name', 'f-email': 'e-email', 'f-svc': 'e-svc', 'f-msg': 'e-msg' };

  const setFieldError = (id, msg) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errMap[id]);
    if (el)  el.classList.toggle('err', !!msg);
    if (err) err.textContent = msg;
  };

  const validate = id => {
    const el = document.getElementById(id);
    if (!el) return true;
    const msg = fields[id](el.value);
    setFieldError(id, msg);
    return !msg;
  };

  /* ── Live validation on blur/change ── */
  Object.keys(fields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => validate(id));
    el.addEventListener('input', () => { if (el.classList.contains('err')) validate(id); });
  });

  /* ── Rate limiter: one submission per 60 s ── */
  const COOLDOWN_MS   = 60_000;
  let   lastSubmitAt  = 0;

  /* ── Show / hide the inline error banner ── */
  const showError = (msg) => {
    if (errText)   errText.textContent = msg || 'Please try again or email us directly.';
    if (errBanner) {
      errBanner.classList.add('show');
      errBanner.setAttribute('aria-hidden', 'false');
    }
    setTimeout(() => {
      if (errBanner) {
        errBanner.classList.remove('show');
        errBanner.setAttribute('aria-hidden', 'true');
      }
    }, 7000);
  };

  /* ── Form submit ── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    /* 1. Honeypot check — bots fill hidden fields */
    const honey = document.getElementById('f-hp');
    if (honey && honey.value.trim() !== '') {
      // Silent reject: looks like success to the bot
      return;
    }

    /* 2. Turnstile token check */
    if (!_turnstileToken) {
      const errEl = document.getElementById('e-turnstile');
      if (errEl) errEl.textContent = 'Please complete the verification challenge.';
      return;
    }

    /* 3. Input validation */
    const valid = Object.keys(fields).map(validate).every(Boolean);
    if (!valid) return;

    /* 4. Rate limiting */
    const now = Date.now();
    if (now - lastSubmitAt < COOLDOWN_MS) {
      const secsLeft = Math.ceil((COOLDOWN_MS - (now - lastSubmitAt)) / 1000);
      showError(`Please wait ${secsLeft} seconds before sending another message.`);
      return;
    }

    /* 5. Read & sanitize values */
    const rawName    = document.getElementById('f-name').value;
    const rawEmail   = document.getElementById('f-email').value;
    const rawCompany = (document.getElementById('f-co')?.value) || '';
    const rawMsg     = document.getElementById('f-msg').value;
    const svcEl      = document.getElementById('f-svc');
    const rawSvc     = svcEl?.options[svcEl.selectedIndex]?.text || '';
    const rawBudget  = document.getElementById('f-budget')?.value || '';

    /* 6. Submit */
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    lastSubmitAt = Date.now();

    fetch('https://formsubmit.co/ajax/contact@nexagrowth.xyz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject : 'New Lead from NexaGrowth Website',
        Name     : sanitizeInput(rawName),
        Email    : sanitizeInput(rawEmail),
        Company  : sanitizeInput(rawCompany) || 'Not provided',
        Service  : sanitizeInput(rawSvc),
        Budget   : sanitizeInput(rawBudget) || 'Not provided',
        Message  : sanitizeInput(rawMsg),
        _honey   : '',   // formsubmit.co honeypot field
        _captcha : 'false', // we use Turnstile ourselves
      }),
    })
    .then(res => {
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      return res.json();
    })
    .then(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      /* Reset form + error states */
      form.reset();
      _turnstileToken = null;
      Object.keys(fields).forEach(id => {
        const el = document.getElementById(id); if (el) el.classList.remove('err');
        const er = document.getElementById(errMap[id]); if (er) er.textContent = '';
      });

      /* Reset Turnstile widget */
      if (window.turnstile && document.getElementById('cf-turnstile-widget')) {
        window.turnstile.reset('#cf-turnstile-widget');
      }

      /* Show success message */
      if (ok) { ok.classList.add('show'); ok.setAttribute('aria-hidden', 'false'); }
      setTimeout(() => { if (ok) { ok.classList.remove('show'); ok.setAttribute('aria-hidden', 'true'); } }, 5500);
    })
    .catch(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      lastSubmitAt = 0; // allow retry on hard error

      /* Reset Turnstile */
      if (window.turnstile && document.getElementById('cf-turnstile-widget')) {
        window.turnstile.reset('#cf-turnstile-widget');
      }

      showError('Could not send your message. Please try again or email us directly at contact@nexagrowth.xyz');
    });
  });
})();

/* ════════════════════════════════════════
   BACK TO TOP
════════════════════════════════════════ */
(function BackToTop() {
  const btn = $('#btt');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('vis', window.scrollY > 600), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ════════════════════════════════════════
   PREFERS REDUCED MOTION — disable heavy anim
════════════════════════════════════════ */
if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
  document.documentElement.style.setProperty('--bounce', 'linear');
  document.documentElement.style.setProperty('--spring', 'linear');
  $$('[class*="reveal-"]').forEach(el => el.classList.add('in-view'));
  $$('.tilt-card').forEach(c => {
    c.removeEventListener('mousemove', () => {});
    c.removeEventListener('mouseleave', () => {});
  });
}

/* ═══════════════════════════════════════════
   COOKIE CONSENT (AdSense-Friendly)
   - Shows banner if user hasn't made a choice
   - AdSense loads regardless (AdSense-friendly)
   - Stores choice in localStorage
═══════════════════════════════════════════ */
(function initCookieConsent() {
  const banner = document.getElementById('cookie-consent');
  if (!banner) return;

  const consent = localStorage.getItem('ng-cookie-consent');
  if (consent) return; // User already made a choice, don't show

  // Show banner after a short delay for better UX
  setTimeout(() => {
    banner.classList.add('cc-show');
    banner.setAttribute('aria-hidden', 'false');
  }, 1500);

  const acceptBtn = document.getElementById('cc-accept');
  const rejectBtn = document.getElementById('cc-reject');

  function hideBanner(choice) {
    localStorage.setItem('ng-cookie-consent', choice);
    banner.classList.remove('cc-show');
    banner.setAttribute('aria-hidden', 'true');
  }

  if (acceptBtn) acceptBtn.addEventListener('click', () => hideBanner('accepted'));
  if (rejectBtn) rejectBtn.addEventListener('click', () => hideBanner('essential'));
})();

/* ════════════════════════════════════════
   FAQ ACCORDION (Homepage)
════════════════════════════════════════ */
(function HomeFAQ() {
  $$('.faq-q-home').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item-home');
      const wasOpen = item.classList.contains('open');
      // Close all items
      $$('.faq-item-home').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q-home')?.setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-a-home')?.setAttribute('aria-hidden', 'true');
      });
      // Toggle clicked item
      if (!wasOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        item.querySelector('.faq-a-home')?.setAttribute('aria-hidden', 'false');
      }
    });
  });
})();
