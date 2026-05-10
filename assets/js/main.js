/* ═══════════════════════════════════════════════════════════
   CASH CLINIC — MAIN SCRIPT
═══════════════════════════════════════════════════════════ */

/* ─── HERO DOT GRID ─────────────────────────────────────────
   Generates a 7×7 grid of dots/coins matching the brand logo.
   Pattern is hand-tuned to look balanced and brand-correct.
─────────────────────────────────────────────────────────── */
(function buildHeroGrid(){
  const grid = document.getElementById('heroGrid');
  if (!grid) return;

  // Pattern: 0=blue, 1=orange, 2=purple, 3=blue-large, 4=coin
  // 7×7 grid arranged like the Cash Clinic logo
  const pattern = [
    [2,0,4,1,2,0,1],
    [0,1,1,0,1,4,0],
    [3,4,2,3,2,1,3],
    [1,3,0,4,0,3,2],
    [2,0,1,2,3,0,1],
    [0,4,3,0,1,2,4],
    [2,1,0,1,4,0,2],
  ];

  const colors = {
    0: 'var(--blue)',
    1: 'var(--orange)',
    2: 'var(--purple)',
    3: 'var(--blue)',
  };

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

/* ─── LANGUAGE TOGGLE ────────────────────────────────────────
   Switches between Arabic (RTL) and English (LTR).
   Translations are kept in `i18n` below — easy to extend.
─────────────────────────────────────────────────────────── */
const i18n = {
  ar: {
    'nav.clinics': 'عياداتنا',
    'nav.team':    'استشاريونا',
    'nav.how':     'كيف نعمل',
    'nav.contact': 'تواصل معنا',
    'nav.book':    'احجز الآن',

    'hero.eyebrow':   'عيادة الصحة المالية الأولى في الكويت',
    'hero.title.1':   'صحتك ',
    'hero.title.2':   'المالية',
    'hero.title.3':   'تبدأ من ',
    'hero.title.4':   'هنا',
    'hero.lede':      'أربع عيادات متخصصة، استشاريون معتمدون، وحلول مالية مفصّلة على احتياجك. احجز جلستك في دقيقة واحدة وادفع بأمان عبر Tap.',
    'hero.cta.primary':   'احجز جلستك',
    'hero.cta.secondary': 'تعرّف على عياداتنا',
    'hero.stat.1': 'عميل سعيد',
    'hero.stat.2': 'عيادات متخصصة',
    'hero.stat.3': 'تقييم العملاء',

    'clinics.eyebrow': 'عياداتنا الأربع',
    'clinics.title':   'اختر العيادة المناسبة لك',
    'clinics.lede':    'كل عيادة لها استشاريون متخصصون، خدمات مفصّلة، وأوقات حجز خاصة بها.',
    'clinic.gold.tag':    'إدارة الثروة',
    'clinic.gold.desc':   'عيادة متخصصة في إدارة الثروات والاستثمارات للأفراد ذوي الدخل المرتفع. تخطيط مالي شامل وحماية للأصول.',
    'clinic.go.tag':      'المال والسفر',
    'clinic.go.desc':     'استشارات مالية للسفر، التحويلات الدولية، إدارة العملات، وميزانيات الإجازات والابتعاث.',
    'clinic.nas.tag':     'التمويل الشخصي',
    'clinic.nas.desc':    'الخدمة الأساسية — ميزانية البيت، إدارة الديون، توفير الأهداف، وبناء عادات مالية صحية.',
    'clinic.riyada.tag':  'ريادة الأعمال',
    'clinic.riyada.desc': 'استشارات لأصحاب المشاريع — خطة مالية، تمويل، تسعير، توقعات إيرادات، وإدارة كاش فلو.',
    'clinic.cta':         'اكتشف الخدمات',

    'team.eyebrow':    'فريق الاستشاريين',
    'team.title':      'استشاريون معتمدون لخدمتك',
    'team.lede':       'كل استشاري متخصص في عيادة معينة. اختر من تشاء واحجز معه مباشرة.',
    'role.placeholder':'مستشار مالي معتمد',

    'how.eyebrow': 'كيف نعمل',
    'how.title':   '٤ خطوات للحصول على استشارتك',
    'how.s1.t':    'اختر عيادتك',
    'how.s1.d':    'حدد العيادة الأنسب لاحتياجك من بين عياداتنا الأربع.',
    'how.s2.t':    'احجز الموعد',
    'how.s2.d':    'اختر الاستشاري والوقت المناسب من الأوقات المتاحة.',
    'how.s3.t':    'ادفع بأمان',
    'how.s3.d':    'ادفع برسوم الجلسة عبر Tap بطريقة آمنة ومشفرة.',
    'how.s4.t':    'احصل على استشارتك',
    'how.s4.d':    'جلسة فيديو أو مكالمة مع الاستشاري في الموعد المحدد.',

    'cta.title':   'جاهز تبدأ؟',
    'cta.lede':    'احجز جلستك الأولى اليوم وخذ الخطوة الأولى نحو صحة مالية أفضل.',
    'cta.button':  'احجز جلستك الآن',

    'footer.about':   'عيادة الصحة المالية الأولى في الكويت. نقدم استشارات متخصصة لتساعدك في تحقيق أهدافك المالية.',
    'footer.clinics': 'العيادات',
    'footer.links':   'روابط',
    'footer.contact': 'تواصل',
    'footer.rights':  'جميع الحقوق محفوظة.',
  },

  en: {
    'nav.clinics': 'Our Clinics',
    'nav.team':    'Our Team',
    'nav.how':     'How It Works',
    'nav.contact': 'Contact',
    'nav.book':    'Book Now',

    'hero.eyebrow':   "Kuwait's leading financial wellness clinic",
    'hero.title.1':   'Your ',
    'hero.title.2':   'financial',
    'hero.title.3':   'wellness starts ',
    'hero.title.4':   'here',
    'hero.lede':      'Four specialized clinics, certified consultants, and tailored financial solutions. Book your session in under a minute and pay securely via Tap.',
    'hero.cta.primary':   'Book Your Session',
    'hero.cta.secondary': 'Explore Our Clinics',
    'hero.stat.1': 'Happy clients',
    'hero.stat.2': 'Specialized clinics',
    'hero.stat.3': 'Client rating',

    'clinics.eyebrow': 'Our Four Clinics',
    'clinics.title':   'Find the right clinic for you',
    'clinics.lede':    'Each clinic has its own consultants, services, and dedicated booking hours.',
    'clinic.gold.tag':    'Wealth Management',
    'clinic.gold.desc':   'Specialized clinic for wealth management and investments for high-net-worth individuals. Comprehensive financial planning and asset protection.',
    'clinic.go.tag':      'Travel & Money',
    'clinic.go.desc':     'Financial guidance for travel, international transfers, currency management, and budgets for vacations and study abroad.',
    'clinic.nas.tag':     'Personal Finance',
    'clinic.nas.desc':    'Our core service — household budgeting, debt management, savings goals, and building healthy money habits.',
    'clinic.riyada.tag':  'Entrepreneurship',
    'clinic.riyada.desc': 'Advisory for business owners — financial planning, funding, pricing, revenue forecasts, and cash-flow management.',
    'clinic.cta':         'Explore services',

    'team.eyebrow':    'Our Consultants',
    'team.title':      'Certified consultants ready to help',
    'team.lede':       'Each consultant specializes in a specific clinic. Choose your match and book directly.',
    'role.placeholder':'Certified Financial Consultant',

    'how.eyebrow': 'How It Works',
    'how.title':   '4 steps to your consultation',
    'how.s1.t':    'Choose your clinic',
    'how.s1.d':    'Select the clinic that best fits your need from our four.',
    'how.s2.t':    'Book your slot',
    'how.s2.d':    'Pick a consultant and an available time that works for you.',
    'how.s3.t':    'Pay securely',
    'how.s3.d':    'Pay the session fee via Tap with full encryption.',
    'how.s4.t':    'Get your consultation',
    'how.s4.d':    'Video or phone call with your consultant at the chosen time.',

    'cta.title':   'Ready to start?',
    'cta.lede':    "Book your first session today and take your first step toward better financial health.",
    'cta.button':  'Book Now',

    'footer.about':   "Kuwait's leading financial wellness clinic. Specialized consultations to help you reach your financial goals.",
    'footer.clinics': 'Clinics',
    'footer.links':   'Links',
    'footer.contact': 'Contact',
    'footer.rights':  'All rights reserved.',
  }
};

(function setupLanguageToggle(){
  const btn = document.getElementById('langToggle');
  const html = document.documentElement;
  let current = localStorage.getItem('lang') || 'ar';

  const apply = (lang) => {
    current = lang;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    btn.textContent = lang === 'ar' ? 'EN' : 'ع';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang][key] !== undefined) el.textContent = i18n[lang][key];
    });
    localStorage.setItem('lang', lang);
  };

  apply(current);
  btn.addEventListener('click', () => apply(current === 'ar' ? 'en' : 'ar'));
})();

/* ─── MOBILE MENU ───────────────────────────────────────── */
(function mobileMenu(){
  const toggle = document.getElementById('menuToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
})();

/* ─── REVEAL ON SCROLL ──────────────────────────────────── */
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
