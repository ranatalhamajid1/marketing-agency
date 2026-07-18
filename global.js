/*!
 * NexaGrowth — Global JS v1.0
 * Loaded on EVERY page for: Consent Mode V2, Cookie Banner, Outbound Links, Author Bio
 */
'use strict';

/* ════════════════════════════════════════
   1. GOOGLE CONSENT MODE V2 — UPDATE
   Updates consent state after user choice.
   Default 'denied' is set inline in <head>.
════════════════════════════════════════ */
(function ConsentModeUpdate() {
  const saved = localStorage.getItem('ng-cookie-consent');
  if (saved === 'accepted') {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
  }
})();

/* ════════════════════════════════════════
   2. COOKIE CONSENT BANNER — DYNAMIC
   Injects banner on every page if user
   has not yet made a choice.
════════════════════════════════════════ */
(function CookieConsentBanner() {
  const consent = localStorage.getItem('ng-cookie-consent');
  if (consent) return; // Already chose

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .ng-cc{position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:0 20px 20px;pointer-events:none;opacity:0;transform:translateY(20px);transition:opacity .4s ease,transform .4s ease}
    .ng-cc.ng-cc-show{opacity:1;transform:translateY(0);pointer-events:auto}
    .ng-cc-inner{max-width:720px;margin:0 auto;background:rgba(12,12,18,.96);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:24px 28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;box-shadow:0 20px 60px rgba(0,0,0,.5)}
    [data-theme="light"] .ng-cc-inner{background:rgba(245,244,251,.97);border-color:rgba(0,0,0,.08);box-shadow:0 10px 40px rgba(0,0,0,.12)}
    .ng-cc-text{flex:1;min-width:240px}
    .ng-cc-text strong{display:block;font-size:.92rem;margin-bottom:4px;color:#f0eefb}
    [data-theme="light"] .ng-cc-text strong{color:#0d0c1a}
    .ng-cc-text p{font-size:.82rem;color:#9490b0;line-height:1.6;margin:0}
    [data-theme="light"] .ng-cc-text p{color:#4e4a6a}
    .ng-cc-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .ng-cc-btn{padding:10px 22px;border-radius:99px;font-size:.82rem;font-weight:600;cursor:pointer;border:none;font-family:'Inter',sans-serif;transition:all .25s ease}
    .ng-cc-accept{background:linear-gradient(135deg,#8b5cf6 0%,#06b6d4 100%);color:#fff;box-shadow:0 4px 16px rgba(139,92,246,.35)}
    .ng-cc-accept:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(139,92,246,.5)}
    .ng-cc-reject{background:rgba(255,255,255,.06);color:#9490b0;border:1px solid rgba(255,255,255,.1)}
    [data-theme="light"] .ng-cc-reject{background:rgba(0,0,0,.04);color:#4e4a6a;border-color:rgba(0,0,0,.1)}
    .ng-cc-reject:hover{color:#f0eefb;border-color:rgba(255,255,255,.2)}
    [data-theme="light"] .ng-cc-reject:hover{color:#0d0c1a;border-color:rgba(0,0,0,.2)}
    .ng-cc-link{font-size:.78rem;color:#8b5cf6;text-decoration:none;font-weight:500}
    .ng-cc-link:hover{text-decoration:underline}
  `;
  document.head.appendChild(style);

  // Determine relative root path
  const path = window.location.pathname;
  let root = '';
  if (path.includes('/blog/')) root = '../';
  else if (path.includes('/tools/')) root = '../';
  else if (path.includes('/authors/')) root = '../';

  // Create banner
  const banner = document.createElement('div');
  banner.className = 'ng-cc';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="ng-cc-inner">
      <div class="ng-cc-text">
        <strong>🍪 We respect your privacy</strong>
        <p>This website uses cookies for essential functionality and analytics to improve your experience. By clicking "Accept All," you consent to the use of all cookies.</p>
      </div>
      <div class="ng-cc-actions">
        <button class="ng-cc-btn ng-cc-accept" id="ng-cc-accept">Accept All</button>
        <button class="ng-cc-btn ng-cc-reject" id="ng-cc-reject">Essential Only</button>
        <a href="${root}privacy.html" class="ng-cc-link">Privacy Policy</a>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // Show after short delay
  setTimeout(function() {
    banner.classList.add('ng-cc-show');
  }, 1200);

  function hideBanner(choice) {
    localStorage.setItem('ng-cookie-consent', choice);
    banner.classList.remove('ng-cc-show');
    setTimeout(function() { banner.remove(); }, 500);

    // Update Consent Mode
    if (choice === 'accepted' && typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
  }

  document.getElementById('ng-cc-accept').addEventListener('click', function() { hideBanner('accepted'); });
  document.getElementById('ng-cc-reject').addEventListener('click', function() { hideBanner('essential'); });
})();

/* ════════════════════════════════════════
   3. OUTBOUND LINK SAFETY
   Adds target="_blank" and rel="noopener
   noreferrer" to all external links.
════════════════════════════════════════ */
(function OutboundLinks() {
  var links = document.querySelectorAll('a[href^="http"], a[href^="//"]');
  var host = window.location.hostname;
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    try {
      var url = new URL(a.href, window.location.origin);
      if (url.hostname !== host && url.hostname !== 'www.' + host) {
        a.setAttribute('target', '_blank');
        var rel = (a.getAttribute('rel') || '').trim();
        if (rel.indexOf('noopener') === -1) rel += ' noopener';
        if (rel.indexOf('noreferrer') === -1) rel += ' noreferrer';
        a.setAttribute('rel', rel.trim());
      }
    } catch (e) { /* skip malformed */ }
  }
})();

/* ════════════════════════════════════════
   4. AUTHOR BIO CARD — BLOG INJECTION
   Automatically injects author bio at
   the bottom of blog <article> elements.
════════════════════════════════════════ */
(function AuthorBio() {
  // Only inject on blog post pages (not index)
  var path = window.location.pathname;
  if (!path.includes('/blog/') || path.endsWith('/blog/') || path.endsWith('/blog/index.html')) return;

  var article = document.querySelector('article.blog-content');
  if (!article) return;

  // Check if one already exists
  if (article.querySelector('.ng-author-bio')) return;

  var bio = document.createElement('div');
  bio.className = 'ng-author-bio';
  bio.innerHTML = `
    <div class="ng-ab-avatar">RTM</div>
    <div class="ng-ab-info">
      <h4><a href="../authors/talha-majid.html">Rana Talha Majid</a></h4>
      <p class="ng-ab-role">Founder & Digital Marketing Specialist at NexaGrowth</p>
      <p class="ng-ab-desc">CS student turned digital marketer, specializing in SEO, paid advertising, and conversion-focused web development for Pakistani businesses. Passionate about data-driven growth strategies.</p>
      <div class="ng-ab-socials">
        <a href="https://linkedin.com/in/rana-muhammad-talha-majid-25233228b" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="https://www.instagram.com/nexa_growthagency/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
      </div>
    </div>
  `;

  // Inject styles for the bio card
  if (!document.getElementById('ng-ab-styles')) {
    var style = document.createElement('style');
    style.id = 'ng-ab-styles';
    style.textContent = `
      .ng-author-bio{display:flex;gap:20px;align-items:flex-start;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.18);border-radius:18px;padding:28px;margin:48px 0 24px}
      [data-theme="light"] .ng-author-bio{background:rgba(139,92,246,.05);border-color:rgba(139,92,246,.15)}
      .ng-ab-avatar{width:64px;height:64px;min-width:64px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:#fff;letter-spacing:.04em}
      .ng-ab-info h4{font-size:1rem;font-weight:700;margin-bottom:2px}
      .ng-ab-info h4 a{color:#f0eefb;text-decoration:none;transition:.25s}
      [data-theme="light"] .ng-ab-info h4 a{color:#0d0c1a}
      .ng-ab-info h4 a:hover{color:#8b5cf6}
      .ng-ab-role{font-size:.8rem;color:#8b5cf6;font-weight:600;margin-bottom:8px}
      .ng-ab-desc{font-size:.84rem;color:#9490b0;line-height:1.65}
      [data-theme="light"] .ng-ab-desc{color:#4e4a6a}
      .ng-ab-socials{display:flex;gap:12px;margin-top:10px}
      .ng-ab-socials a{color:#9490b0;transition:.25s}
      .ng-ab-socials a:hover{color:#8b5cf6}
      @media(max-width:560px){.ng-author-bio{flex-direction:column;align-items:center;text-align:center}.ng-ab-socials{justify-content:center}}
    `;
    document.head.appendChild(style);
  }

  // Insert before CTA box or at end of article
  var cta = article.querySelector('.cta-box');
  if (cta) {
    article.insertBefore(bio, cta);
  } else {
    article.appendChild(bio);
  }
})();
