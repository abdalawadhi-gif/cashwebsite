/* Cash Clinic — booking page logic */

(function bookingPage() {
  // ────────────── Resolve package from URL ──────────────
  const params = new URLSearchParams(location.search);
  const pkgId = params.get('p');
  const pkg = pkgId && window.PACKAGES ? window.PACKAGES[pkgId] : null;

  if (!pkg) {
    document.getElementById('bookingEmpty').style.display = '';
    return;
  }
  document.getElementById('bookingMain').style.display = '';

  // Active language helper
  const lang = () => document.documentElement.lang || 'ar';
  const L = (obj) => (obj && (obj[lang()] ?? obj.ar)) || '';

  // ────────────── Booking state ──────────────
  const state = {
    pkg,
    pkgId,
    format: pkg.formats[0],
    date: null,        // Date object
    time: null,        // 'HH:MM'
    name: '', phone: '', email: '', notes: '',
    step: 1,
  };

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
    // Pay button
    document.getElementById('payAmount').textContent = `${pkg.price} ${lang() === 'en' ? 'KWD' : 'د.ك'}`;
    // Selected date/time/format if present
    const dateRow = document.getElementById('summaryDateRow');
    const timeRow = document.getElementById('summaryTimeRow');
    const fmtRow  = document.getElementById('summaryFormatRow');
    if (state.date) {
      dateRow.style.display = '';
      document.getElementById('summaryDate').textContent = formatDate(state.date);
    } else { dateRow.style.display = 'none'; }
    if (state.time) {
      timeRow.style.display = '';
      document.getElementById('summaryTime').textContent = state.time;
    } else { timeRow.style.display = 'none'; }
    if (state.format) {
      fmtRow.style.display = '';
      document.getElementById('summaryFormat').textContent =
        state.format === 'online'
          ? (lang() === 'en' ? '💻 Online' : '💻 أونلاين')
          : (lang() === 'en' ? '🏢 In-person' : '🏢 حضوري');
    }
  }

  function formatDate(d) {
    if (lang() === 'en') {
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    return d.toLocaleDateString('ar-KW', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // ────────────── Format toggle ──────────────
  const formatField = document.getElementById('formatField');
  if (pkg.formats.length < 2) {
    formatField.style.display = 'none';
  } else {
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
  let viewYear, viewMonth; // currently shown month
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 30-day booking horizon
  const maxBookingDate = new Date(today);
  maxBookingDate.setDate(today.getDate() + 30);

  function isWorkingDay(d) {
    // Kuwait weekend: Friday (5), Saturday (6). Open Sun-Thu.
    const day = d.getDay();
    return day !== 5 && day !== 6;
  }

  function renderCalendar() {
    const grid = document.getElementById('calGrid');
    const monthLabel = document.getElementById('calMonth');
    const weekdaysContainer = document.getElementById('calWeekdays');

    // Weekday labels
    const wkLabelsAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const wkLabelsEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = lang() === 'en' ? wkLabelsEn : wkLabelsAr;
    weekdaysContainer.innerHTML = labels.map(l => `<div class="cal-weekday">${l}</div>`).join('');

    // Month header
    const monthDate = new Date(viewYear, viewMonth, 1);
    monthLabel.textContent = lang() === 'en'
      ? monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : monthDate.toLocaleDateString('ar-KW', { month: 'long', year: 'numeric' });

    // Nav button states
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    const minMonth = today.getFullYear() * 12 + today.getMonth();
    const viewMonthIdx = viewYear * 12 + viewMonth;
    const maxMonthIdx = maxBookingDate.getFullYear() * 12 + maxBookingDate.getMonth();
    prevBtn.disabled = viewMonthIdx <= minMonth;
    nextBtn.disabled = viewMonthIdx >= maxMonthIdx;

    // Build day grid
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    // leading blanks for previous-month days (we just leave them empty styled)
    for (let i = 0; i < firstWeekday; i++) {
      cells.push('<div class="cal-day other-month"></div>');
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      d.setHours(0, 0, 0, 0);
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
      cells.push(`<div class="${cls}" data-date="${d.toISOString()}" ${clickable ? '' : 'aria-disabled="true"'}>${day}</div>`);
    }

    grid.innerHTML = cells.join('');

    // Wire up day clicks
    grid.querySelectorAll('.cal-day[data-date]').forEach(cell => {
      if (cell.classList.contains('past') || cell.classList.contains('unavailable')) return;
      cell.addEventListener('click', () => {
        const d = new Date(cell.dataset.date);
        state.date = d;
        state.time = null;  // reset time
        renderCalendar();
        renderTimeSlots();
        renderSummary();
        validateStep1();
      });
    });
  }

  // ────────────── Time slots ──────────────
  function renderTimeSlots() {
    const field = document.getElementById('slotsField');
    if (!state.date) {
      field.style.display = 'none';
      return;
    }
    field.style.display = '';
    document.getElementById('selectedDateLabel').textContent = formatDate(state.date);

    // Working hours: 9:00 AM to 6:00 PM, 30-min slots
    // Last slot must end by 6 PM, so last start time depends on duration
    const slots = [];
    const startHour = 9;
    const endHour = 18; // 6 PM
    const stepMin = 30;
    const durationMin = state.pkg.duration;
    let h = startHour, m = 0;
    while (true) {
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + durationMin;
      if (slotEnd > endHour * 60) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
      m += stepMin;
      if (m >= 60) { m = 0; h++; }
    }

    // Fake "booked" slots for demonstration (will be replaced with Firestore data later)
    const dayKey = state.date.toISOString().slice(0,10);
    const bookedSlots = pseudoRandomBookedSlots(dayKey, slots);

    const container = document.getElementById('timeSlots');
    container.innerHTML = slots.map(s => {
      const isBooked = bookedSlots.has(s);
      const isSelected = state.time === s;
      let cls = 'time-slot';
      if (isBooked) cls += ' unavailable';
      if (isSelected) cls += ' selected';
      return `<button type="button" class="${cls}" data-time="${s}" ${isBooked ? 'disabled' : ''}>${formatTime(s)}</button>`;
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

  function formatTime(hhmm) {
    if (lang() === 'en') {
      const [h, m] = hhmm.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      return `${h12}:${String(m).padStart(2,'0')} ${period}`;
    }
    return hhmm;
  }

  // Deterministic "fake" busy slots (so each date shows consistent unavailability until backend wired)
  function pseudoRandomBookedSlots(dayKey, slots) {
    const seed = hashStr(dayKey);
    const set = new Set();
    const count = 1 + (seed % 3); // 1-3 booked per day
    for (let i = 0; i < count; i++) {
      const idx = (seed * (i + 1)) % slots.length;
      set.add(slots[idx]);
    }
    return set;
  }
  function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }

  // ────────────── Step navigation ──────────────
  function goStep(n) {
    state.step = n;
    document.querySelectorAll('.step-panel').forEach(p => {
      p.classList.toggle('active', parseInt(p.dataset.step) === n);
    });
    document.querySelectorAll('.step-indicator .step').forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
    if (n === 3) renderReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep1() {
    const ok = !!(state.date && state.time && state.format);
    document.getElementById('toStep2').disabled = !ok;
  }
  function validateStep2() {
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const notes = document.getElementById('notes').value.trim();
    state.name = name; state.phone = phone; state.email = email; state.notes = notes;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneOk = phone.length >= 6;
    return name && phoneOk && emailOk;
  }

  document.getElementById('toStep2').addEventListener('click', () => goStep(2));
  document.getElementById('toStep3').addEventListener('click', () => {
    if (!validateStep2()) {
      alert(lang() === 'en' ? 'Please fill all required fields with valid values.' : 'يرجى ملء جميع الحقول المطلوبة بقيم صحيحة.');
      return;
    }
    goStep(3);
  });
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => goStep(state.step - 1));
  });

  // Live-validate step 2 fields
  ['fullName', 'phone', 'email'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {});
  });

  // Policy checkbox enables pay
  document.getElementById('agreePolicy').addEventListener('change', (e) => {
    document.getElementById('payBtn').disabled = !e.target.checked;
  });

  // ────────────── Review render ──────────────
  function renderReview() {
    const c = document.getElementById('reviewCard');
    const rows = [
      [lang() === 'en' ? 'Clinic' : 'العيادة', L(pkg.clinicName)],
      [lang() === 'en' ? 'Package' : 'الباقة', L(pkg.tag)],
      [lang() === 'en' ? 'Service' : 'الخدمة', L(pkg.name)],
      [lang() === 'en' ? 'Consultant' : 'الاستشاري', L(pkg.consultant)],
      [lang() === 'en' ? 'Date' : 'التاريخ', state.date ? formatDate(state.date) : '—'],
      [lang() === 'en' ? 'Time' : 'الوقت', state.time ? formatTime(state.time) : '—'],
      [lang() === 'en' ? 'Format' : 'الصيغة',
        state.format === 'online'
          ? (lang() === 'en' ? '💻 Online' : '💻 أونلاين')
          : (lang() === 'en' ? '🏢 In-person' : '🏢 حضوري')],
      [lang() === 'en' ? 'Duration' : 'المدة', fmtDuration()],
      [lang() === 'en' ? 'Name' : 'الاسم', state.name],
      [lang() === 'en' ? 'Phone' : 'الهاتف', state.phone],
      [lang() === 'en' ? 'Email' : 'البريد', state.email],
    ];
    if (state.notes) rows.push([lang() === 'en' ? 'Notes' : 'ملاحظات', state.notes]);
    c.innerHTML = rows.map(([k, v]) => `<div class="review-row"><span>${k}</span><strong>${v || '—'}</strong></div>`).join('') +
      `<div class="review-total"><span>${lang() === 'en' ? 'Total to pay' : 'الإجمالي'}</span><strong>${pkg.price} ${lang() === 'en' ? 'KWD' : 'د.ك'}</strong></div>`;
  }

  // ────────────── Pay (placeholder until Tap is wired) ──────────────
  document.getElementById('payBtn').addEventListener('click', () => {
    const status = document.getElementById('paymentStatus');
    status.style.display = '';
    status.classList.remove('error');
    status.innerHTML = lang() === 'en'
      ? '⚙️ Payment integration is coming next. Booking saved below for now — we\'ll wire up Tap Payments in the next step.<br><br><strong>Booking summary saved.</strong>'
      : '⚙️ تكامل الدفع قادم في الخطوة التالية. تم حفظ الحجز مبدئياً — سيتم ربط Tap للدفع في الخطوة التالية.<br><br><strong>تم حفظ ملخص الحجز.</strong>';
    console.log('Booking payload (will be sent to Firebase + Tap):', {
      packageId: state.pkgId,
      clinic: pkg.clinic,
      price: pkg.price,
      date: state.date && state.date.toISOString().slice(0,10),
      time: state.time,
      duration: pkg.duration,
      format: state.format,
      consultant: pkg.consultant.ar,
      customer: { name: state.name, phone: state.phone, email: state.email, notes: state.notes },
      createdAt: new Date().toISOString(),
    });
  });

  // ────────────── Init ──────────────
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();

  document.getElementById('calPrev').addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();
  renderSummary();
  validateStep1();

  // Re-render when language changes
  document.getElementById('langToggle').addEventListener('click', () => {
    setTimeout(() => {
      renderCalendar();
      renderTimeSlots();
      renderSummary();
      if (state.step === 3) renderReview();
    }, 50);
  });

})();
