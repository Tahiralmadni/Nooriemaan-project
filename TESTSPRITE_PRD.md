# Product Requirements Document (PRD) - Nooriemaan Digital Portal

## 1. Project Overview
**Name:** Nooriemaan Digital Portal
**Platform:** Web Application (React + Firebase)
**Description:** A comprehensive staff and student management system built for Nooriemaan. The current focus is heavily on the **Staff Management, Attendance, and Salary Calculation** modules. The system features multi-language support (English/Urdu) and a robust role-based dashboard for administrators.

## 2. Authentication

### Login Credentials
- **GR Number:** 21435
- **Password:** User134
- **Login URL:** /login

### Login Flow
1. Navigate to `/login`
2. Wait **6 seconds** for the initial PageLoader animation to finish (mandatory loading screen)
3. Enter GR Number `21435` in the input field with `id="grNumber"`
4. Enter Password `User134` in the input field with `id="password"`
5. Click the Login / Submit button
6. Wait **4 seconds** for Firebase auth + PageLoader transition
7. Verify redirect to `/dashboard`

**IMPORTANT:** The login page shows a 5-second loading animation before showing the login form. Tests MUST wait for this animation to complete before trying to interact with form elements.

## 3. Core Modules & Objectives

### 3.1 Authentication & Roles
- **System Roles:** Super Admin, Branch Admin, Teachers.
- **Goal:** Secure login using Firebase Authentication. Ensure teachers only see their own attendance/profile, while Admins have full access.

### 3.2 Staff Management (Teachers Profile)
- **Features:** Add, Update, and Delete staff members.
- **Key Data Points:** Name (En/Ur), Role, Phone, Salary, Entry/Exit Timings, and Setup Date (Joining Date).

### 3.3 Attendance Tracking
- **Features:** Daily attendance marking (Present, Absent, Leave, Holiday).
- **Core Rules (Current Implementation):**
  - **Setup Date Logic:** If a staff member joins on or before the 10th of the month, their effective joining date is the 1st of that month. If after the 10th, it is their exact setup date.
  - **Not Joined Status:** Dates before the effective setup date must automatically show as Not Joined (`-`) to avoid incorrect Absent marks.
  - **Attendance Lock (Validation):**
    - Admins **cannot** mark a staff member as "Present" for today if there are unmarked previous days (since their setup date or start of the month). They must resolve past missing days first.
    - Entry and Exit times must be validated against the staff's scheduled shift timings.
  - **Automated Actions:** Sundays are automatically marked as Weekly Holidays.

### 3.4 Reporting & Summaries
- **Features:** Daily, Monthly, and Cumulative (Majmoohi Hazri) reports.
- **Functionality:** 
  - Dynamic UI tables highlighting staff status (Present = Green, Absent = Red, Leave = Amber, Holiday = Blue, Not Joined = Gray).
  - Export capabilities to **PDF** and **Excel** with custom styling and fonts (Amiri font for Urdu support).
  - **Note:** Deductions (Katoti) have been temporarily removed from all reports and exports.

## 4. Technology Stack Requirements
- **Frontend:** React (Vite environment), Tailwind CSS, Framer Motion (for animations).
- **Backend/Database:** Firebase Firestore, Firebase Authentication.
- **Exports:** 
  - `jspdf` & `jspdf-autotable` (PDF Export).
  - `exceljs` & `file-saver` (Excel Export).
- **Internationalization:** `react-i18next` for seamless English/Urdu bilingual context.

## 5. Current State & Testing Scope
The codebase has recently undergone significant logical refactoring regarding:
- *Overriding anomalous database absent records with "Not Joined" for dates before joining.*
- *Adding a chronological validation lock for daily attendance.*
- *Formatting Excel/PDF exports with complex styling and multi-language support.*

**Focus for Test Generation (to boost accuracy to 93%):**
- **Unit Tests:** For logical helpers like `isBeforeJoin` calculation inside reports and `checkMissingDays` in `AttendanceSchedule.jsx`.
- **Integration Tests:** Verifying that checking multiple past dates correctly blocks marking 'Present' today.
- **Export Integrity Tests:** Ensure Excel and PDF functions generate files without throwing UI-blocking exceptions.
