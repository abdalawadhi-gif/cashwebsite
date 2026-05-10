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

/* Language toggle */
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
    localStorage.setItem('lang', lang);
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
