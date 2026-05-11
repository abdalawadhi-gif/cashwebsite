# Cash Clinic — Firebase Setup Guide

You've created the Firebase project. Now there are 3 manual steps you need to do in the Firebase Console, **then** you can use the admin panel.

---

## Step 1 — Apply security rules

These rules control who can read/write data in your database.

1. Go to https://console.firebase.google.com → open your `cashwebsite-39007` project
2. Left sidebar: **Build → Firestore Database**
3. Click the **Rules** tab at the top
4. **Delete everything** in the editor
5. Open the file `firestore.rules` (in the ZIP I sent) → **copy its entire contents**
6. **Paste** into the rules editor
7. Click **Publish** (top right)

You should see "Rules published successfully".

---

## Step 2 — Create 5 user logins

You need one admin login (you) and 4 consultant logins. All happens in **Authentication**.

1. Left sidebar: **Build → Authentication → Users tab**
2. Click **"Add user"** (top right)
3. For each user, enter email + a strong password, then click Add user:

| Role | Suggested email | Password |
|---|---|---|
| Admin (you) | your-email@example.com | choose your own |
| Ghaliya | ghaliya@cashclinic.net | choose for her |
| Sara | sara@cashclinic.net | choose for her |
| Hasan | hasan@cashclinic.net | choose for him |
| Amina | amina@cashclinic.net | choose for her |

After creating each user, you'll see them in the list with a long "User UID" (looks like `aBcDeFg123XyZ...`).

**Copy each user's UID** — you'll need them in Step 3.

> 💡 You can use any emails you want. The emails don't need to actually exist as inboxes — they're just login identifiers. But using `@cashclinic.net` keeps things tidy.

---

## Step 3 — Link each UID to a role

Each user needs a Firestore document in `users/` telling the system if they're an admin or a consultant (and which one).

1. Left sidebar: **Build → Firestore Database**
2. Click **Start collection** (if first time) or **+ Add collection**
3. Collection ID: `users` → Next
4. For the **admin** user:
   - Document ID: paste your admin UID
   - Add field: `role` = (string) `admin`
   - Add field: `email` = (string) your-email@example.com
   - Click Save

5. For **each consultant**, add a new document to the same `users` collection:
   - Document ID: paste the consultant's UID
   - Add field: `role` = (string) `consultant`
   - Add field: `consultantId` = (string) one of: `ghaliya`, `sara`, `hasan`, `amina`
   - Add field: `email` = (string) the email you set
   - Save

You should end up with 5 documents in `users/`. Example:

```
users/
  ├─ aBc123... { role: "admin",      email: "..." }
  ├─ Xyz456... { role: "consultant", consultantId: "ghaliya", email: "..." }
  ├─ Pqr789... { role: "consultant", consultantId: "sara",    email: "..." }
  ├─ Mno012... { role: "consultant", consultantId: "hasan",   email: "..." }
  └─ Stu345... { role: "consultant", consultantId: "amina",   email: "..." }
```

---

## Step 4 — Seed the 4 consultant records

This creates the consultant documents (with placeholder working hours Sun–Thu 9 AM – 6 PM).

1. Upload the new ZIP to GitHub and wait for it to deploy
2. Open: **https://abdalawadhi-gif.github.io/cashwebsite/admin/setup.html**
3. Sign in with your **admin** email/password
4. Click **"Create the 4 consultant records"**
5. You'll see "✓ created" for each one
6. Click **"Go to Dashboard →"**

---

## You're done 🎉

- **Admin login**: https://abdalawadhi-gif.github.io/cashwebsite/admin/login.html
- **Customer booking**: https://abdalawadhi-gif.github.io/cashwebsite/book.html?p=nas-debtors

Try making a test booking from the customer side — it should appear in your admin dashboard immediately.

---

## What's next

- I'll build the **schedule management UI** (set hours per consultant, block out dates, add extra slots) — next step
- After that: **Tap Payments integration**
- After that: **Email/WhatsApp confirmations** when bookings come in
