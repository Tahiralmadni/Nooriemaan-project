# 🔄 Handover Summary — Nooriemaan Project
**Session Date:** 2 April 2026  
**Next Session Goal:** Ustad Umair (Jamia Taiba) ki entry karna (13k salary) aur Remote Staff ki attendance/salary calculations baqi pages (`AttendanceSchedule.jsx`, `MajmoohiHazri.jsx`) mein implement karna.

---

## 📍 Project Location
```
c:\Users\tahir\OneDrive\Desktop\Nooriemaan project
```

## 🔑 Key Files (Yaad Rakhein)

| File | Kya Hai |
|------|---------|
| `src/utils/migrateStaffToFirebase.js` | **MASTER FILE** — Sab staff ka data yahan hai. Naya safe function `pushSingleStaff` shamil kya gaya hai. |
| `src/pages/AttendanceSchedule.jsx` | Attendance lagane ka main page — isme remote form banna baqi hai |
| `src/pages/StaffProfile.jsx` | Staff ki profile dikhata hai — Ab isme Edit Profile Modal aur Remote Support live hai |
| `src/pages/Teachers.jsx` | Staff list page — Incomplete profiles ab locked hain |
| `src/pages/MajmoohiHazri.jsx` | Majmoohi Hazri page |
| `src/pages/AttendanceReports.jsx` | Reports page |
| `src/hooks/useStaffData.js` | Shared hook — sab pages staff data ke liye |
| `src/locales/en.json` & `ur.json` | Translation files |
| `src/config/firebase.js` | Firebase config (project: nooeriemaan) |

---

## ✅ Aaj Kya Hua (2 April 2026)

### 1. ✅ Profile Edit Modal (`StaffProfile.jsx`)
- "Edit Profile" modal add kar diya gaya hai jisme admin Name (English, Urdu), Phone, aur Salary directly change kar sakta hai.
- `updateDoc` se directly Firebase update hota hai.
- Agar koi field (misal ke taur pr name) empty chhor de to validations error deti hain (toasts ke zariye).
- Remote staff (`isRemote: true`) ke liye quick stats ko update kar ke unka "Total Hours" dikhaya gaya hai bajaye fixed entry/exit ke.

### 2. ✅ Teacher Roster Protection (`Teachers.jsx`)
- Placeholder staff (jinki info poori nahi aur `setupComplete: false` hai) unko protect kiya gaya hai.
- Ab unka Profile View button (Eye icon) gray aur disable (`cursor: not-allowed`) hota hai. 

### 3. ✅ Safe Targeted DB Sync (`migrateStaffToFirebase.js`)
- Ek specific record ko push karne ke liye `pushSingleStaff` ka function likha gaya, taake sabko ghalti se override na kar sakein.
- **Staff 2 (Qari Syed Umair Attari)**: Salary 23,000 + 3,000 allowance correctly configuration database mein save kar di gayi hai.

### 4. ✅ Cleanup & Backfill Conclusion 
- Staff 15 (Hanzalah) ki 90 din ki remote attendance correctly configure kardi gayi. 
- Uska profile bhi setup ho gaya aur ab jo kacha kaam or routes (`BackfillHanzalah.jsx`) the, wo `App.jsx` aur repo se delete kar diye gaye hain. Application ab bilkul clean hai.

---

## ⚠️ PENDING KAAM (Next Session)

### 🔴 Priority 1: Ustad Umair (Jamia Taiba) Setup
- Abhi empty items hain jinhe configure karna hai. Ustad Umair ko un mein se kisi ID (e.g. 11) par allocate karna hoga.
- Enki salary Rs 13,000 rakhni hai, baqi parameters (roles, timings) verify kerke save karne hain.

### 🔴 Priority 2: Remote Staff Support — Baqi Pages
Hanzalah **remote job** hai (aur agey is concept ko dusro pr bhi implement kya jasake ga). Profiling hogayi hai, ab ye update laazmi karna hai:

#### A. `AttendanceSchedule.jsx`
- Remote staff ke liye: **hours + minutes input** chahiye fixed clock timings ki jagah.

#### B. `AttendanceReports.jsx` & `MajmoohiHazri.jsx`
- Reports mein `entryTime/exitTime` ki bajaye unhe ghantay (`hoursWorked`) check karwaye jayen aur total sum me in ghanto ki input salary calculation handle ho.

### 🟡 Priority 3: Global i18n (Tarjuma)
- Kuch pages mein abhi bhi hardcoded English/Urdu strings hain jo translation files se use nahi hore.

### 🟢 Priority 4: Baqi 10 Staff Setup
- Staff 11, 12, 13, 14, 16, 17, 19, 20, 21, 22, 23
- Enki configurations details users se confirm karwa ky gradually system me add aur push kerni hain.

---

## 📊 Staff Setup Status (13/23 Done)

| # | Naam | Status | Salary | Type |
|---|------|--------|--------|------|
| 1 | Muhammad Akram Attari (1) | ✅ Live | Rs 26,620 | Regular |
| 2 | Qari Syed Umair Attari | ✅ Live | Rs 23,000 | Regular (Allowances updated) |
| 3 | Muhammad Muneeb Sabir | ✅ Live | Rs 8,000 | Regular |
| 4 | Mudassir Raza (1) | ✅ Live | Rs 8,000 | Regular |
| 5 | Mudassir Raza (2) | ✅ Live | Rs 7,500 | Regular |
| 6 | Mudassir Raza (3) | ✅ Live | Rs 6,500 | Regular |
| 7 | Ubaid Raza (1) | ✅ Live | Rs 7,200 | Regular |
| 8 | Ubaid Raza (2) | ✅ Live | Rs 6,600 | Regular |
| 9 | Ubaid Raza (3) | ✅ Live | Rs 3,500 | Regular |
| 10 | Muhammad Rizwan Hussain | ✅ Live | Rs 10,000 | Regular |
| 15 | Hanzalah Tahir | ✅ Live | Rs 15,000 | **Remote** |
| 18 | Muhammad Dilawar Raza | ✅ Live | Rs 37,000 | Regular |

### Baqi Staff (Setup Baqi Hain — 11 Log)
Staff 11, 12, 13, 14, 16, 17, 19, 20, 21, 22, 23

---

## 💡 Zaroori Cheezein

1. **User beginner hai** — Aram se samajh kar kaam karta hai.
2. **Design Priority:** Design hamesha premium oar polished lagna chahiye thek colors, micro-interactions (Tailwind me tw-classes) ke zariye.
3. **Roman Urdu mein baat karo** — User Roman Urdu mein hi samajhta aur communicate karta hai.
4. **Git:** `main` branch par kaam hota hai aur client side sdk par architecture established hai (serviceAccountKey exist ni karti).
