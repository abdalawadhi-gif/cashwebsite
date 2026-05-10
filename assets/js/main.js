/* Cash Clinic — main script */

/* Hero dot grid */
(function buildHeroGrid(){
  const grid = document.getElementById('heroGrid');
  if (!grid) return;
  const pattern = [
    [2,0,4,1,2,0,1],
    [0,1,1,0,1,4,0],
    [3,4,2,3,2,1,3],
    [1,3,0,4,0,3,2],
    [2,0,1,2,3,0,1],
    [0,4,3,0,1,2,4],
    [2,1,0,1,4,0,2],
  ];
  const colors = { 0:'var(--blue)', 1:'var(--orange)', 2:'var(--purple)', 3:'var(--blue)' };
  pattern.flat().forEach((type, i) => {
    const dot = document.createElement('div');
    dot.className = type === 4 ? 'dot coin' : 'dot';
    if (type !== 4) dot.style.background = colors[type];
    if (type === 3) dot.style.transform = 'scale(1.15)';
    if (type === 4) dot.textContent = '$';
    dot.style.animationDelay = (i * 0.04) + 's';
    grid.appendChild(dot);
  });
})();

/* Language toggle — swaps text and attributes via data-en / data-en-{attr} */
(function setupLanguageToggle(){
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  const html = document.documentElement;
  let current = localStorage.getItem('lang') || 'ar';

  const apply = (lang) => {
    current = lang;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    btn.textContent = lang === 'ar' ? 'EN' : 'ع';
    btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    localStorage.setItem('lang', lang);

    // Swap inner HTML for elements with data-en — but NEVER touch structural elements
    document.querySelectorAll('[data-en]').forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'head' || tag === 'html' || tag === 'body') return; // safety
      if (!el.hasAttribute('data-ar')) {
        el.setAttribute('data-ar', el.innerHTML.trim());
      }
      el.innerHTML = lang === 'en'
        ? el.getAttribute('data-en')
        : el.getAttribute('data-ar');
    });

    // Swap attributes for elements with data-en-{attr}
    document.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const m = attr.name.match(/^data-en-(.+)$/);
        if (!m) return;
        const targetAttr = m[1];
        const arKey = `data-ar-${targetAttr}`;
        if (!el.hasAttribute(arKey)) {
          el.setAttribute(arKey, el.getAttribute(targetAttr) || '');
        }
        el.setAttribute(targetAttr, lang === 'en'
          ? attr.value
          : el.getAttribute(arKey));
      });
    });
  };
  apply(current);
  btn.addEventListener('click', () => apply(current === 'ar' ? 'en' : 'ar'));
})();

/* Mobile menu */
(function mobileMenu(){
  const toggle = document.getElementById('menuToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
})();

/* Reveal on scroll */
(function revealOnScroll(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ─── WhatsApp integration ───────────────────────────────── */
(function whatsappIntegration(){
  const PHONE = '96522260820';
  const GREETING = 'مرحباً، ';
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  const waLink = (text) =>
    `https://wa.me/${PHONE}?text=${encodeURIComponent(GREETING + text)}`;

  // 1. Package book buttons go directly to the booking page (no WhatsApp redirect)
  //    The book buttons have href="book.html?p=<pkg-id>" set in the HTML.
  //    Users can still use WhatsApp via the floating FAB, footer icon, or CTAs.

  // 2. Upgrade any existing wa.me links to include the prefilled greeting message
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => {
    if (a.classList.contains('wa-fab') || a.classList.contains('pkg-book')) return;
    try {
      const url = new URL(a.href);
      if (!url.searchParams.has('text')) {
        a.href = waLink('أريد الاستفسار عن خدمات كاش كلينك');
      }
      a.target = '_blank';
      a.rel = 'noopener';
    } catch(e) {}
  });

  // 3. Add WhatsApp icon to footer social links
  document.querySelectorAll('.social-links').forEach(box => {
    if (box.querySelector('.wa-social')) return;
    const a = document.createElement('a');
    a.className = 'wa-social';
    a.href = waLink('أريد الاستفسار عن خدمات كاش كلينك');
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'WhatsApp');
    a.innerHTML = WA_ICON;
    box.insertBefore(a, box.firstChild);
  });

  // 4. Floating WhatsApp button — always visible bottom corner
  if (!document.querySelector('.wa-fab')) {
    const fab = document.createElement('a');
    fab.className = 'wa-fab';
    fab.href = waLink('أريد الاستفسار عن خدمات كاش كلينك');
    fab.target = '_blank';
    fab.rel = 'noopener';
    fab.setAttribute('aria-label', 'تواصل عبر واتساب');
    fab.innerHTML = WA_ICON;
    document.body.appendChild(fab);
  }
})();
