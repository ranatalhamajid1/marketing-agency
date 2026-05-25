/*!
 * NexaGrowth Tools — Shared JS v1.0
 * FAQ Accordion | Copy | Share | Filter | Search | Toast | Nav
 */
'use strict';

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ════════════════════════════════════════
   NAVBAR SCROLL
════════════════════════════════════════ */
(function NavScroll() {
  const nav = $('.tool-nav');
  if (!nav) return;
  const check = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════ */
(function MobileMenu() {
  const burger = $('.nav-burger');
  const menu = $('.mobile-menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
  });
  $$('a', menu).forEach(link =>
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
    })
  );
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      burger.classList.remove('open');
      menu.classList.remove('open');
    }
  });
})();

/* ════════════════════════════════════════
   FAQ ACCORDION
════════════════════════════════════════ */
(function FAQ() {
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      $$('.faq-item').forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

/* ════════════════════════════════════════
   COPY TO CLIPBOARD
════════════════════════════════════════ */
function copyToClipboard(text, btn) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
    if (btn) {
      btn.classList.add('btn-copied');
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      setTimeout(() => { btn.classList.remove('btn-copied'); btn.innerHTML = orig; }, 2000);
    }
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied to clipboard!');
  });
}

/* ════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════ */
function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ════════════════════════════════════════
   SHARE TOOL
════════════════════════════════════════ */
function shareTool(title) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: title || document.title, url }).catch(() => {});
  } else {
    copyToClipboard(url);
    showToast('Link copied!');
  }
}

/* ════════════════════════════════════════
   DOWNLOAD TEXT AS FILE
════════════════════════════════════════ */
function downloadText(content, filename, type) {
  const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'nexagrowth-output.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('File downloaded!');
}

/* ════════════════════════════════════════
   TOOLS HUB — SEARCH & FILTER
════════════════════════════════════════ */
(function ToolsFilter() {
  const search = $('#tools-search');
  const filterBtns = $$('.filter-btn');
  const cards = $$('.tool-hub-card');
  if (!search && !filterBtns.length) return;

  let activeFilter = 'all';

  function filterCards() {
    const query = (search?.value || '').toLowerCase().trim();
    cards.forEach(card => {
      const cat = card.dataset.cat || '';
      const text = (card.textContent || '').toLowerCase();
      const matchesFilter = activeFilter === 'all' || cat === activeFilter;
      const matchesSearch = !query || text.includes(query);
      card.classList.toggle('hidden', !(matchesFilter && matchesSearch));
    });
  }

  if (search) {
    search.addEventListener('input', filterCards);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      filterCards();
    });
  });
})();

/* ════════════════════════════════════════
   THEME (apply saved preference)
════════════════════════════════════════ */
(function Theme() {
  const saved = localStorage.getItem('ng-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();
