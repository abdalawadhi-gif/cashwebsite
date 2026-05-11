/* Cash Clinic — booking page logic (Firestore-powered) */
import {
  db, collection, doc, getDoc, getDocs, addDoc, query, where, serverTimestamp
} from './firebase-config.js?v=10';

(async function bookingPage() {
  // ────────────── Resolve package from URL ──────────────
  const params = new URLSearchParams(location.search);
  const pkgId = params.get('p');
  const pkg = pkgId && window.PACKAGES ? window.PACKAGES[pkgId] : null;

  if (!pkg) {
    document.getElementById('bookingEmpty').style.display = '';
    return;
  }
  document.getElementById('bookingMain').style.display = '';

  const lang = () => document.documentElement.lang || 'ar';
  const L = (obj) => (obj && (obj[lang()] ?? obj.ar)) || '';

  // Map clinic code → consultant ID (used for Firestore queries)
  const CONSULTANT_BY_CLINIC = {
    'nas': 'ghaliya', 'gold': 'sara', 'riyada': 'hasan', 'go': 'amina',
  };
  const consultantId = CONSULTANT_BY_CLINIC[pkg.clinic];

  // ────────────── Booking state ──────────────
  const state = {
    pkg, pkgId, consultantId,
    format: pkg.formats[0],
    date: null, time: null,
    name: '', phone: '', email: '', notes: '',
    step: 1,
    workingHours: null,
    bookedSlots: {},
  };

  // ────────────── Fetch consultant config from Firestore ──────────────
  try {
    const cSnap = await getDoc(doc(db, 'consultants', consultantId));
    if (cSnap.exists()) {
      const c = cSnap.data();
      state.workingHours = c.workingHours || null;
    }
  } catch (e) {
    console.warn('Could not load consultant from Firestore, using defaults:', e);
  }
  // Default working hours fallback (Sun-Thu 9-18)
  if (!state.workingHours) {
    state.workingHours = {
      sun: [{start:'09:00',end:'18:00'}], mon: [{start:'09:00',end:'18:00'}],
      tue: [{start:'09:00',end:'18:00'}], wed: [{start:'09:00',end:'18:00'}],
      thu: [{start:'09:00',end:'18:00'}], fri: [], sat: [],
    };
  }

  // ────────────── Render summary sidebar ──────────────
  const fmtPrice = () => `${pkg.price} ${lang() === 'en' ? 'KWD' : 'د.ك'}${L(pkg.priceUnit) ? ' / ' + L(pkg.priceUnit) : ''}`;
  const fmtDuration = () => {
    const h = Math.floor(pkg.duration / 60);
    const m = pkg.duration % 60;
    if (lang() === 'en') {
      if (h && m) return `${h}h ${m}m`;
      if (h) return `${h}h`;
      return `${m} min`;
    } else {
      if (h && m) return `${h} ساعة ${m} دقيقة`;
      if (h) return h === 1 ? 'ساعة' : (h === 2 ? 'ساعتان' : `${h} ساعات`);
      return `${m} دقيقة`;
    }
  };

  function renderSummary() {
    document.getElementById('summaryClinic').textContent = L(pkg.clinicName);
    document.getElementById('summaryClinic').style.background = `${pkg.clinicColor}22`;
    document.getElementById('summaryClinic').style.color = pkg.clinicColor;
    document.getElementById('summaryTag').textContent = L(pkg.tag);
    document.getElementById('summaryName').textContent = L(pkg.name);
    document.getElementById('summaryConsultant').textContent = L(pkg.consultant);
    document.getElementById('summaryDuration').textContent = fmtDuration();
    document.getElementById('summaryPrice').textContent = fmtPrice();
    document.getElementById('payAmount').textContent = `${pkg.price} ${lang() === 'en' ? 'KWD' : 'د.ك'}`;
    setRow('summaryDateRow', 'summaryDate', state.date && formatDate(state.date));
    setRow('summaryTimeRow', 'summaryTime', state.time);
    setRow('summaryFormatRow', 'summaryFormat',
      state.format === 'online'
        ? (lang() === 'en' ? '💻 Online' : '💻 أونلاين')
        : (lang() === 'en' ? '🏢 In-person' : '🏢 حضوري'));
  }
  function setRow(rowId, valId, val) {
    const row = document.getElementById(rowId);
    if (val) { row.style.display=''; document.getElementById(valId).textContent = val; }
    else { row.style.display = 'none'; }
  }
  function formatDate(d) {
    if (lang() === 'en') return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return d.toLocaleDateString('ar-KW', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Format toggle
  const formatField = document.getElementById('formatField');
  if (pkg.formats.length < 2) formatField.style.display = 'none';
  else {
    document.querySelectorAll('#formatSegmented .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#formatSegmented .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.format = btn.dataset.value;
        renderSummary();
      });
    });
  }

  // ────────────── Calendar ──────────────
  let viewYear, viewMonth;
  const today = new Date(); today.setHours(0,0,0,0);
  const maxBookingDate = new Date(today);
  maxBookingDate.setDate(today.getDate() + 30);
  const DOW_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

  function isWorkingDay(d) {
    const key = DOW_KEYS[d.getDay()];
    return (state.workingHours[key] || []).length > 0;
  }

  function renderCalendar() {
    const grid = document.getElementById('calGrid');
    const monthLabel = document.getElementById('calMonth');
    const weekdaysContainer = document.getElementById('calWeekdays');
    const wkAr = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const wkEn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const labels = lang() === 'en' ? wkEn : wkAr;
    weekdaysContainer.innerHTML = labels.map(l => `<div class="cal-weekday">${l}</div>`).join('');

    const monthDate = new Date(viewYear, viewMonth, 1);
    monthLabel.textContent = lang() === 'en'
      ? monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : monthDate.toLocaleDateString('ar-KW', { month: 'long', year: 'numeric' });

    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    const minMonth = today.getFullYear() * 12 + today.getMonth();
    const viewMonthIdx = viewYear * 12 + viewMonth;
    const maxMonthIdx = maxBookingDate.getFullYear() * 12 + maxBookingDate.getMonth();
    prevBtn.disabled = viewMonthIdx <= minMonth;
    nextBtn.disabled = viewMonthIdx >= maxMonthIdx;

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstWeekday; i++) cells.push('<div class="cal-day other-month"></div>');
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day); d.setHours(0,0,0,0);
      let cls = 'cal-day';
      const isPast = d < today;
      const beyondHorizon = d > maxBookingDate;
      const notWorkingDay = !isWorkingDay(d);
      const isSelected = state.date && d.getTime() === state.date.getTime();
      const isToday = d.getTime() === today.getTime();
      if (isPast || beyondHorizon) cls += ' past';
      else if (notWorkingDay) cls += ' unavailable';
      if (isToday) cls += ' today';
      if (isSelected) cls += ' selected';
      const clickable = !isPast && !beyondHorizon && !notWorkingDay;
      cells.push(`<div class="${cls}" data-date="${d.toISOString()}" ${clickable?'':'aria-disabled="true"'}>${day}</div>`);
    }
    grid.innerHTML = cells.join('');

    grid.querySelectorAll('.cal-day[data-date]').forEach(cell => {
      if (cell.classList.contains('past') || cell.classList.contains('unavailable')) return;
      cell.addEventListener('click', async () => {
        const d = new Date(cell.dataset.date);
        state.date = d;
        state.time = null;
        renderCalendar();
        await fetchBookedSlots(d);
        renderTimeSlots();
        renderSummary();
        validateStep1();
      });
    });
  }

  // ────────────── Fetch real booked slots from Firestore ──────────────
  async function fetchBookedSlots(d) {
    const dayKey = isoDate(d);
    if (state.bookedSlots[dayKey]) return;
    try {
      const q = query(
        collection(db, 'bookings'),
        where('consultantId', '==', consultantId),
        where('date', '==', dayKey)
      );
      const snap = await getDocs(q);
      const taken = new Set();
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === 'cancelled') return;
        if (data.time) taken.add(data.time);
      });
      state.bookedSlots[dayKey] = taken;
    } catch (e) {
      console.warn('Could not load booked slots:', e);
      state.bookedSlots[dayKey] = new Set();
    }
  }

  // ────────────── Time slots ──────────────
  function renderTimeSlots() {
    const field = document.getElementById('slotsField');
    if (!state.date) { field.style.display = 'none'; return; }
    field.style.display = '';
    document.getElementById('selectedDateLabel').textContent = formatDate(state.date);

    const dayKey = DOW_KEYS[state.date.getDay()];
    const workSlots = state.workingHours[dayKey] || [];
    const durationMin = state.pkg.duration;
    const stepMin = 30;

    const allSlots = [];
    for (const win of workSlots) {
      const [sh, sm] = win.start.split(':').map(Number);
      const [eh, em] = win.end.split(':').map(Number);
      const startMin = sh*60+sm, endMin = eh*60+em;
      for (let t = startMin; t + durationMin <= endMin; t += stepMin) {
        const hh = String(Math.floor(t/60)).padStart(2,'0');
        const mm = String(t%60).padStart(2,'0');
        allSlots.push(`${hh}:${mm}`);
      }
    }

    const dateKey = isoDate(state.date);
    const taken = state.bookedSlots[dateKey] || new Set();

    const container = document.getElementById('timeSlots');
    if (allSlots.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--ink-2);font-size:14px">${lang()==='en'?'No slots available this day.':'لا توجد مواعيد متاحة هذا اليوم.'}</div>`;
      return;
    }

    container.innerHTML = allSlots.map(s => {
      const isBooked = taken.has(s);
      const isSelected = state.time === s;
      let cls = 'time-slot';
      if (isBooked) cls += ' unavailable';
      if (isSelected) cls += ' selected';
      return `<button type="button" class="${cls}" data-time="${s}" ${isBooked?'disabled':''}>${formatTime(s)}</button>`;
    }).join('');

    container.querySelectorAll('.time-slot:not(.unavailable)').forEach(btn => {
      btn.addEventListener('click', () => {
        state.time = btn.dataset.time;
        renderTimeSlots();
        renderSummary();
        validateStep1();
      });
    });
  }

  function isoDate(d) { return d.toISOString().slice(0,10); }
  function formatTime(hhmm) {
    if (lang() === 'en') {
      const [h, m] = hhmm.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      return `${h12}:${String(m).padStart(2,'0')} ${period}`;
    }
    return hhmm;
  }

  // ────────────── Step navigation ──────────────
  function goStep(n) {
    state.step = n;
    document.querySelectorAll('.step-panel').forEach(p => p.classList.toggle('active', parseInt(p.dataset.step) === n));
    document.querySelectorAll('.step-indicator .step').forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
    if (n === 3) renderReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep1() {
    document.getElementById('toStep2').disabled = !(state.date && state.time && state.format);
  }
  function validateStep2() {
    state.name = document.getElementById('fullName').value.trim();
    state.phone = document.getElementById('phone').value.trim();
    state.email = document.getElementById('email').value.trim();
    state.notes = document.getElementById('notes').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    const phoneOk = state.phone.length >= 6;
    return state.name && phoneOk && emailOk;
  }

  document.getElementById('toStep2').addEventListener('click', () => goStep(2));
  document.getElementById('toStep3').addEventListener('click', () => {
    if (!validateStep2()) {
      alert(lang()==='en'?'Please fill all required fields with valid values.':'يرجى ملء جميع الحقول المطلوبة بقيم صحيحة.');
      return;
    }
    goStep(3);
  });
  document.querySelectorAll('[data-back]').forEach(btn =>
    btn.addEventListener('click', () => goStep(state.step - 1)));

  document.getElementById('agreePolicy').addEventListener('change', e => {
    document.getElementById('payBtn').disabled = !e.target.checked;
  });

  // ────────────── Review ──────────────
  function renderReview() {
    const rows = [
      [lang()==='en'?'Clinic':'العيادة', L(pkg.clinicName)],
      [lang()==='en'?'Package':'الباقة', L(pkg.tag)],
      [lang()==='en'?'Service':'الخدمة', L(pkg.name)],
      [lang()==='en'?'Consultant':'الاستشاري', L(pkg.consultant)],
      [lang()==='en'?'Date':'التاريخ', state.date ? formatDate(state.date) : '—'],
      [lang()==='en'?'Time':'الوقت', state.time ? formatTime(state.time) : '—'],
      [lang()==='en'?'Format':'الصيغة',
        state.format === 'online'
          ? (lang()==='en'?'💻 Online':'💻 أونلاين')
          : (lang()==='en'?'🏢 In-person':'🏢 حضوري')],
      [lang()==='en'?'Duration':'المدة', fmtDuration()],
      [lang()==='en'?'Name':'الاسم', state.name],
      [lang()==='en'?'Phone':'الهاتف', state.phone],
      [lang()==='en'?'Email':'البريد', state.email],
    ];
    if (state.notes) rows.push([lang()==='en'?'Notes':'ملاحظات', state.notes]);
    document.getElementById('reviewCard').innerHTML =
      rows.map(([k,v]) => `<div class="review-row"><span>${k}</span><strong>${v||'—'}</strong></div>`).join('') +
      `<div class="review-total"><span>${lang()==='en'?'Total to pay':'الإجمالي'}</span><strong>${pkg.price} ${lang()==='en'?'KWD':'د.ك'}</strong></div>`;
  }

  // ────────────── Save booking to Firestore (Tap will come next) ──────────────
  document.getElementById('payBtn').addEventListener('click', async () => {
    const statusEl = document.getElementById('paymentStatus');
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = true;
    statusEl.style.display = '';
    statusEl.classList.remove('error');
    statusEl.innerHTML = lang()==='en' ? 'Saving booking…' : 'جاري حفظ الحجز…';

    try {
      const bookingData = {
        packageId: state.pkgId,
        packageName: L(pkg.name),
        packageTag: L(pkg.tag),
        clinic: pkg.clinic,
        consultantId: state.consultantId,
        consultantName: L(pkg.consultant),
        customerName: state.name,
        customerEmail: state.email,
        customerPhone: state.phone,
        customerNotes: state.notes,
        date: isoDate(state.date),
        time: state.time,
        duration: pkg.duration,
        format: state.format,
        price: pkg.price,
        currency: pkg.currency || 'KWD',
        status: 'pending',
        paymentStatus: 'pending',
        tapChargeId: null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      statusEl.style.background = 'rgba(74,222,128,0.15)';
      statusEl.style.color = '#15803D';
      statusEl.style.border = '1px solid rgba(74,222,128,0.35)';
      statusEl.innerHTML = lang()==='en'
        ? `✓ <strong>Booking received!</strong> Reference: <code>${docRef.id.slice(0,8)}</code><br><br>Payment integration with Tap is coming next. For now your booking is saved as <strong>pending payment</strong>. We'll contact you shortly to confirm.<br><br><a href="../index.html" style="color:#15803D;font-weight:800">Back to home</a>`
        : `✓ <strong>تم استلام الحجز!</strong> الرقم المرجعي: <code>${docRef.id.slice(0,8)}</code><br><br>سيتم إضافة الدفع عبر Tap في الخطوة التالية. حالياً تم حفظ حجزك كـ<strong>قيد الدفع</strong>. سنتواصل معك قريباً لتأكيد الموعد.<br><br><a href="../index.html" style="color:#15803D;font-weight:800">العودة للرئيسية</a>`;
    } catch (err) {
      console.error('Booking save failed:', err);
      statusEl.classList.add('error');
      statusEl.innerHTML = lang()==='en'
        ? `⚠️ Could not save booking. Please try again or contact us via WhatsApp.<br><small>${err.message || err}</small>`
        : `⚠️ تعذر حفظ الحجز. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.<br><small>${err.message || err}</small>`;
      payBtn.disabled = false;
    }
  });

  // ────────────── Init ──────────────
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  document.getElementById('calPrev').addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar();
  });

  renderCalendar();
  renderSummary();
  validateStep1();

  document.getElementById('langToggle').addEventListener('click', () => {
    setTimeout(() => {
      renderCalendar();
      renderTimeSlots();
      renderSummary();
      if (state.step === 3) renderReview();
    }, 50);
  });
})();
