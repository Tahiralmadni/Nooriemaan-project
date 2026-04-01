# 🔄 Handover Summary — Nooriemaan Project
**Session Date:** 1 April 2026  
**Next Session Goal:** Staff 15 (Hanzalah Tahir) ka profile page complete karna + remote staff support sab pages mein

---

## 📍 Project Location
```
c:\Users\tahir\OneDrive\Desktop\Nooriemaan project
```

## 🔑 Key Files (Yaad Rakhein)

| File | Kya Hai |
|------|---------|
| `src/utils/migrateStaffToFirebase.js` | **MASTER FILE** — Sab staff ka data yahan hai (23 staff). Staff 15 UPDATED hai |
| `src/pages/AttendanceSchedule.jsx` | Attendance lagane ka main page — 63KB |
| `src/pages/StaffProfile.jsx` | Staff ki profile dikhata hai — Firebase se data lata hai |
| `src/pages/Teachers.jsx` | Staff list page |
| `src/pages/MajmoohiHazri.jsx` | Majmoohi Hazri page |
| `src/pages/AttendanceReports.jsx` | Reports page |
| `src/pages/BackfillHanzalah.jsx` | ⚠️ TEMPORARY — Backfill + Profile push page (delete karna hai baad mein) |
| `src/hooks/useStaffData.js` | Shared hook — sab pages staff data ke liye |
| `src/locales/en.json` & `ur.json` | Translation files |
| `src/config/firebase.js` | Firebase config (project: nooeriemaan) |

---

## ✅ Aaj Kya Hua (1 April 2026)

### 1. ✅ Staff 15 Profile Updated — `migrateStaffToFirebase.js`
```javascript
// Staff 15 ab ye hai:
{
    id: 15,
    nameUr: 'حنظلہ طاہر',
    nameEn: 'Hanzalah Tahir',
    roleUr: 'ڈیولپر',
    roleEn: 'Developer',
    entryTime: 'Remote',    // ← Fixed timing nahi hai
    exitTime: 'Remote',
    entryHour: 0,
    exitHour: 0,
    totalHours: 3,          // ← 3 ghante per day
    salary: 15000,
    isRemote: true,          // ← REMOTE flag (naya field)
    email: 'hanzalahtahir93@gmail.com',
    joinDate: 'January 2026',
    setupComplete: true
}
```

### 2. ✅ Attendance Backfill Complete (Jan-Mar 2026)
- **90 din** ka data Firebase `attendance` collection mein push ho chuka hai
- **52 din Present** — `hoursWorked: 3, minutesWorked: 0`
- **13 Sundays** — `status: 'holiday', reasonType: 'sunday'`
- **5 Special Holidays:**
  - 4 Feb → Shab-e-Barat (bara din)
  - 5 Feb → Kashmir Day
  - 21 Mar → Eid ul Fitr Day 1
  - 23 Mar → Eid ul Fitr Day 3 + Pakistan Day
  - 24 Mar → Eid ul Fitr Day 4
  - (22 Mar is Sunday + Eid — counted as Sunday)

### 3. ✅ Backfill Page Created
- Route: `/backfill` (temporary)
- File: `src/pages/BackfillHanzalah.jsx`
- Route registered in `src/App.jsx` line ~113

---

## ⚠️ PENDING KAAM (Next Session)

### 🔴 Priority 1: Staff 15 Profile Firebase Push
- `migrateStaffToFirebase.js` mein data UPDATED hai lekin **Firebase `staff/15` document abhi push nahi hua**
- Method: Ya toh `migrateStaff()` function call karo (sab staff push hoga), ya sirf staff 15 ka doc push karo
- BackfillHanzalah.jsx mein profile push ka code add ho raha tha — complete karna hai
- Profile push ke baad `/teachers/profile/15` par Staff 15 dikhega

### 🔴 Priority 2: Remote Staff Support — Sab Pages
Hanzalah **remote job** hai — fixed entry/exit time nahi, sirf **hours** count hote hain. Is wajah se ye pages update karne hain:

#### A. `AttendanceSchedule.jsx`
- Currently fixed timing validate karta hai (entryHour/exitHour)
- Remote staff ke liye: **hours + minutes input** chahiye timing ki jagah
- `isRemote: true` wale staff ke liye alag form dikhana hai
- Present status mein `hoursWorked` aur `minutesWorked` fields save karna hai

#### B. `StaffProfile.jsx`
- Currently `entryTime - exitTime` dikhata hai
- Remote staff ke liye: **"Remote — 3 Hours/Day"** dikhana chahiye
- `isRemote` flag check karna hai

#### C. `AttendanceReports.jsx`
- Currently `entryTime/exitTime` dikhata hai reports mein
- Remote staff ke liye `hoursWorked` dikhana chahiye
- Salary calculation remote staff ke liye `hoursWorked * perHourSalary` hogi

#### D. `MajmoohiHazri.jsx`
- Summary mein remote staff ko handle karna hai
- `hoursWorked` ka total dikhana chahiye

### 🟡 Priority 3: Cleanup
- `/backfill` route HATANA hai `App.jsx` se
- `BackfillHanzalah.jsx` page DELETE karna hai
- `scripts/backfill_hanzalah.js` bhi delete kar sakte hain

### 🟡 Priority 4: Global i18n (Tarjuma)
- Kuch pages mein abhi bhi hardcoded English/Urdu strings hain
- `en.json` aur `ur.json` update karna hai
- Sab hardcoded text ko `t('key')` se replace karna hai

### 🟢 Priority 5: Baqi 11 Staff Setup
- Staff 11, 12, 13, 14, 16, 17, 19, 20, 21, 22, 23
- In sab ka salary, timing, phone, role chahiye — user se poochna parega

---

## 🏗️ Architecture Samjho

```
Firebase Firestore (Project: nooeriemaan)
├── staff/{id}          ← Staff profiles (migrateStaffToFirebase.js se push hota hai)
├── attendance/{auto}   ← Daily attendance records
└── users/{uid}         ← Login user profiles
```

### Attendance Record Schema (Regular Staff):
```javascript
{
    staffId: 1,
    staffName: "Name",
    status: "present" | "absent" | "leave" | "holiday",
    date: Timestamp,
    entryTime: "08:00",     // 24hr format
    exitTime: "16:00",
    markedAt: "Time / Auto-saved / Backfill",
    salary: 26620,
    isLate: false,
    lateMinutes: 0,
    isEarlyLeave: false,
    earlyMinutes: 0,
    deduction: 0
}
```

### Attendance Record Schema (Remote Staff — Staff 15):
```javascript
{
    staffId: 15,
    staffName: "Hanzalah Tahir",
    status: "present",
    date: Timestamp,
    entryTime: "Remote",        // ← Fixed timing nahi
    exitTime: "Remote",
    hoursWorked: 3,             // ← NAYA FIELD
    minutesWorked: 0,           // ← NAYA FIELD
    markedAt: "Backfill",
    salary: 15000,
    isLate: false,
    lateMinutes: 0,
    deduction: 0
}
```

---

## 📊 Staff Setup Status (12/23 Done)

| # | Naam | Status | Salary | Type |
|---|------|--------|--------|------|
| 1 | Muhammad Akram Attari (1) | ✅ Live | Rs 26,620 | Regular |
| 2 | Qari Syed Umair Attari | ✅ Live | Rs 13,000 | Regular |
| 3 | Muhammad Muneeb Sabir | ✅ Live | Rs 8,000 | Regular |
| 4 | Mudassir Raza (1) | ✅ Live | Rs 8,000 | Regular |
| 5 | Mudassir Raza (2) | ✅ Live | Rs 7,500 | Regular |
| 6 | Mudassir Raza (3) | ✅ Live | Rs 6,500 | Regular |
| 7 | Ubaid Raza (1) | ✅ Live | Rs 7,200 | Regular |
| 8 | Ubaid Raza (2) | ✅ Live | Rs 6,600 | Regular |
| 9 | Ubaid Raza (3) | ✅ Live | Rs 3,500 | Regular |
| 10 | Muhammad Rizwan Hussain | ✅ Live | Rs 10,000 | Regular |
| 15 | Hanzalah Tahir | ⚠️ Profile Push BAQI | Rs 15,000 | **Remote** |
| 18 | Muhammad Dilawar Raza | ✅ Live | Rs 37,000 | Regular |

### Baqi Staff (Setup Nahi Hua — 11 log)
Staff 11, 12, 13, 14, 16, 17, 19, 20, 21, 22, 23

---

## 💡 Zaroori Cheezein

1. **User beginner hai** — Aram se samajh kar kaam karta hai
2. **Roman Urdu mein baat karo** — User Roman Urdu mein communicate karta hai
3. **Dev server:** `npm run dev` se chalata hai project (Vite, port 5173)
4. **Git:** `main` branch par kaam hota hai
5. **Remote Staff ka Formula ALAG hai:**
   - Regular: entry/exit time based — late/early deduction hoti hai
   - Remote (Hanzalah): hours based — 1 se 3 hours, minutes bhi
   - Remote staff ke liye **naya attendance form** banana hai
   - `hoursWorked` aur `minutesWorked` fields use hote hain
6. **serviceAccountKey.json NAHI HAI** — Firebase Admin SDK nahi chalega. Client-side SDK (browser) se sab hota hai

---

## 📁 Important Artifacts & Temp Files
- `handover_summary.md` — YE FILE (handover summary)
- `scripts/backfill_hanzalah.js` — Node.js backfill script (NOT USED — serviceAccountKey missing)
- `src/pages/BackfillHanzalah.jsx` — Browser-based backfill page (TEMPORARY — delete karna hai)
