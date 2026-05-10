# Cash Clinic — Website

Bilingual (Arabic/English) marketing site + booking platform for Cash Clinic.

## 🚀 Deploy to GitHub Pages (3 minutes)

1. Create a new GitHub repository — name it `cashclinic` (or anything you like)
2. Push everything in this folder to the `main` branch
3. Go to repo **Settings → Pages**
4. Source: **Deploy from a branch**, Branch: **main**, Folder: **`/ (root)`**
5. Click Save. Your site goes live at `https://YOUR-USERNAME.github.io/REPO-NAME/`
6. To use your custom domain `cashclinic.net`:
   - In Settings → Pages, add `cashclinic.net` as the custom domain
   - In your DNS provider, add a CNAME record pointing to `YOUR-USERNAME.github.io`

## 📁 Folder Structure

```
/
├── index.html              ← Homepage
├── assets/
│   ├── css/style.css       ← All styling (brand tokens, layout, animations)
│   ├── js/main.js          ← Language toggle, hero animation, reveals
│   └── img/                ← Logos and consultant photos
│       ├── cashclinic-logo.jpg
│       ├── cashgold-logo.jpg
│       ├── cashgo-logo.jpg
│       ├── cashnas-logo.jpg
│       ├── cashriyada-logo.jpg
│       ├── amina.jpg
│       ├── ghaliya.jpg
│       ├── hasan.jpg
│       └── sara.jpg
├── clinics/                ← Individual clinic pages (coming next)
└── README.md
```

## ✏️ Placeholders That Need Real Content

The site is live-ready visually, but these texts are **educated guesses** that you must verify or replace:

### Clinic descriptions (in `index.html` → search for `data-i18n="clinic.*.desc"`)
- **Cash Gold** — guessed: wealth management for HNW individuals
- **Cash Go** — guessed: travel finance, currency, transfers
- **Cash Nas** — guessed: personal/household finance
- **Cash Riyada** — guessed: entrepreneurship & business finance

### Consultant ↔ clinic assignments (in `index.html` → search for `consultant-tag`)
Currently mapped:
- Amina → Cash Gold
- Ghaliya → Cash Go
- Hasan → Cash Nas
- Sara → Cash Riyada

This is a **guess** — confirm the right mapping.

### Other placeholders
- Hero stats: `+500`, `4`, `4.9★` — replace with real numbers
- Consultant role labels — replace `مستشار مالي معتمد` with real titles
- Footer email `hello@cashclinic.net` — replace if different
- Instagram handle `@cashclinic` — replace if different

## 🔧 Editing Content

All text is in two places:
1. **Inside `index.html`** — for the Arabic version (page loads in Arabic by default)
2. **Inside `assets/js/main.js`** — in the `i18n` object, both `ar` and `en` versions

When you change a text, update **both** so the language toggle stays in sync.

## 🛠 Coming in Next Session

- [ ] 4 individual clinic pages (`clinics/cash-gold.html`, etc.)
- [ ] Booking flow UI (clinic → consultant → service → date → time → details)
- [ ] Firebase Firestore schema for bookings
- [ ] Firebase Functions for availability checking + Tap payment processing
- [ ] Confirmation email template
- [ ] Admin dashboard

## 📞 Brand Reference

- **Phone:** +965 6995 4849
- **Domain:** cashclinic.net
- **Brand colors:** Gold `#E8C011`, Orange `#F5A623`, Blue `#2F7EC7`, Purple `#7B2D8B`
- **Fonts:** Tajawal (Arabic), Bricolage Grotesque (English display), Manrope (English body)

---

Made with ♥ for Cash Clinic
