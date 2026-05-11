# Product Requirements Document (PRD)

# WorkForce Mobile Attendance PWA

**Document Version:** 1.0  
**Product Type:** Mobile-first Progressive Web App (PWA)  
**Frontend Framework:** Next.js  
**Database:** SQLite  
**Primary Device Target:** Mobile devices only  
**Language of Application UI:** Indonesian  
**PRD Language:** English  
**Core Screens:** Login, Dashboard, Report, Check-in / Check-out  

---

## 1. Executive Summary

WorkForce is a simple mobile attendance application designed for employees to record daily attendance through a clean, mobile-first PWA experience. The application allows users to log in, view their daily attendance status, perform check-in and check-out actions, and review attendance reports.

The product is intentionally lightweight and focused. It will be built using Next.js with SQLite as the database, and delivered as a Progressive Web App so users can install it on their mobile devices without going through an app store.

The main experience is optimized around four core interfaces:

1. **Login**: User authentication screen.
2. **Dashboard**: Daily summary, weekly attendance status, location/network information, and navigation.
3. **Report**: Attendance history, monthly analytics, filters, and export access.
4. **Check-in / Check-out**: Location-aware attendance recording screen.

The app is intended for small to medium organizations that need a simple, practical, and mobile-friendly attendance system without complex HR management features.

---

## 2. Product Goals

### 2.1 Primary Goals

- Enable employees to record attendance from mobile devices quickly and reliably.
- Provide a simple dashboard showing current attendance status, work hours, and location eligibility.
- Allow employees to review attendance history and monthly attendance analytics.
- Support check-in and check-out flows with basic location validation.
- Deliver an installable PWA experience using Next.js.
- Keep the backend and storage simple using SQLite.

### 2.2 Secondary Goals

- Provide clear feedback after successful or failed attendance actions.
- Support mobile-first usability with large touch targets and minimal cognitive load.
- Allow users to export or download attendance reports.
- Support basic attendance status classification such as on time, late, overtime, sick, and absent.
- Provide an app-like experience using PWA features such as installability, responsive layout, and offline-aware UI.

### 2.3 Non-Goals

The following features are explicitly outside the scope of the initial version:

- Full HR management system.
- Payroll calculation.
- Multi-company tenant management.
- Complex approval workflows.
- Admin dashboard for managing all employees.
- Face recognition.
- Biometric authentication integration.
- Native Android or iOS app.
- Real-time employee tracking.
- Shift scheduling management UI.
- Leave request management.
- Chat, announcements, or internal messaging.

---

## 3. Target Users

### 3.1 Primary User: Employee

Employees use the application to:

- Log in to their account.
- Check in at the beginning of the workday.
- Check out at the end of the workday.
- View today's attendance status.
- Confirm whether they are within the allowed office radius.
- Review weekly attendance progress.
- Review previous attendance records.
- Export or view monthly attendance summaries.

### 3.2 Secondary User: System Administrator

Although the initial UI does not include an admin interface, the system must be designed with basic administrator-managed data in mind. Administrators may manage data directly through seed data, database scripts, or future internal tools.

Administrator-owned data includes:

- Employee accounts.
- Office locations.
- Allowed attendance radius.
- Shift start and end times.
- Attendance correction records, if added later.

---

## 4. Key User Problems

Employees need a quick way to record attendance from mobile devices without filling long forms or navigating complex systems. Many attendance systems are too heavy for simple use cases, especially for small teams.

The app solves these problems by providing:

- A single-purpose mobile attendance experience.
- A clear check-in / check-out action.
- Location validation to reduce incorrect attendance submissions.
- A dashboard that immediately tells the employee what action is available next.
- A report screen that makes attendance history easy to review.

---

## 5. Product Scope

### 5.1 In Scope

- Mobile-first PWA built with Next.js.
- SQLite database for user, attendance, location, and shift data.
- User login with email and password.
- Dashboard with daily attendance state.
- Check-in and check-out action.
- Geolocation validation against office location.
- Weekly attendance summary.
- Monthly attendance report.
- Attendance record list.
- Basic filtering in report screen.
- Export button for attendance report.
- Bottom navigation for Dashboard, History/Report, and Profile placeholder.
- Toast or alert feedback after attendance actions.

### 5.2 Out of Scope for V1

- Complete profile screen functionality.
- Admin-facing UI.
- Employee invitation flow.
- Password reset via email.
- Leave request submission.
- Approval or rejection flows.
- Push notification system.
- Multi-branch office switching by user.
- Payroll or salary integration.

---

## 6. Design Principles

### 6.1 Mobile-First

The app is designed specifically for mobile devices. Desktop responsiveness is not a priority for the initial version. The UI should feel like a native mobile app when installed as a PWA.

### 6.2 Minimal Interaction

The attendance action should require the fewest possible steps. Employees should be able to check in or check out within seconds.

### 6.3 Clear State Communication

The user must always understand:

- Whether they have checked in today.
- Whether they have checked out today.
- Whether they are inside the allowed office location radius.
- Whether their network/location status is acceptable.
- Whether an attendance action succeeded or failed.

### 6.4 Visual Consistency

The UI should follow the visual direction shown in the provided mockups:

- Clean card-based layout.
- Blue as the main brand color.
- Mint/green accent for successful attendance and active navigation.
- Rounded cards and buttons.
- Soft shadows.
- Bottom navigation.
- Large typography for time and primary actions.

---

## 7. Application Screens

## 7.1 Screen 1: Login

### 7.1.1 Purpose

The Login screen allows employees to authenticate before accessing attendance features.

### 7.1.2 UI Elements

- App logo/icon.
- App name: `WorkForce`.
- Subtitle: `Silakan masuk ke akun Anda`.
- Email input field.
- Password input field.
- Forgot password link: `Lupa?`.
- Primary button: `Masuk`.
- Registration prompt: `Belum punya akun? Daftar sekarang`.

### 7.1.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| LOGIN-001 | User can enter email address. | Must Have |
| LOGIN-002 | User can enter password. | Must Have |
| LOGIN-003 | Password field must mask input. | Must Have |
| LOGIN-004 | User can submit login form. | Must Have |
| LOGIN-005 | App validates required fields before submission. | Must Have |
| LOGIN-006 | App shows error message for invalid credentials. | Must Have |
| LOGIN-007 | Successful login redirects user to Dashboard. | Must Have |
| LOGIN-008 | Auth session should persist across PWA reloads until logout/session expiry. | Must Have |
| LOGIN-009 | Forgot password link can be shown but may be disabled or placeholder in V1. | Should Have |
| LOGIN-010 | Registration link can be shown but may be disabled or placeholder in V1. | Should Have |

### 7.1.4 Validation Rules

- Email is required.
- Email must use a valid email format.
- Password is required.
- Password minimum length should be 6 characters.

### 7.1.5 Error States

- Empty email: `Email is required.`
- Invalid email: `Please enter a valid email address.`
- Empty password: `Password is required.`
- Invalid credentials: `Invalid email or password.`
- Server/database error: `Unable to login. Please try again.`

### 7.1.6 Acceptance Criteria

- Given a user enters valid credentials, when they tap `Masuk`, then they are redirected to the Dashboard.
- Given a user enters invalid credentials, when they tap `Masuk`, then an error message is displayed.
- Given a user leaves required fields empty, when they tap `Masuk`, then inline validation messages are displayed.
- Given a user is already authenticated, when they open the app, then they should be redirected to Dashboard.

---

## 7.2 Screen 2: Dashboard

### 7.2.1 Purpose

The Dashboard provides a quick daily overview of the employee's attendance status and the next available attendance action.

### 7.2.2 UI Elements

- Header with user avatar.
- App title: `WorkForce`.
- Notification icon.
- Greeting text, for example: `Selamat Pagi, Budi!`.
- Current date display.
- Check-in status card.
- Check-out status card.
- Weekly attendance card.
- Total working hours summary.
- Attendance progress status, for example: `On Track`.
- Location and network card.
- Bottom navigation:
  - Dashboard.
  - History / Report.
  - Profile.

### 7.2.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| DASH-001 | Dashboard shows authenticated user's name. | Must Have |
| DASH-002 | Dashboard shows current date in localized format. | Must Have |
| DASH-003 | Dashboard shows today's check-in time if available. | Must Have |
| DASH-004 | Dashboard shows today's check-out time if available. | Must Have |
| DASH-005 | Dashboard shows placeholder `--:-- WIB` when check-in or check-out is missing. | Must Have |
| DASH-006 | Check-in card should be visually active if user has not checked in. | Must Have |
| DASH-007 | Check-out card should be visually active if user has checked in but not checked out. | Must Have |
| DASH-008 | Dashboard shows weekly attendance status for weekdays. | Must Have |
| DASH-009 | Dashboard shows total working hours for the current week. | Must Have |
| DASH-010 | Dashboard shows user's assigned office location. | Must Have |
| DASH-011 | Dashboard shows whether the user is within allowed attendance radius. | Must Have |
| DASH-012 | Dashboard shows network/location status label. | Should Have |
| DASH-013 | Tapping active check-in/check-out card navigates to Check-in / Check-out screen. | Must Have |
| DASH-014 | Tapping `Detail` in weekly attendance navigates to Report screen. | Should Have |
| DASH-015 | Bottom navigation allows switching between Dashboard and Report. | Must Have |

### 7.2.4 Weekly Attendance Logic

The weekly attendance section should display Monday to Friday by default.

Each day can have one of the following states:

| State | Meaning | Visual Treatment |
|---|---|---|
| Completed | User has valid attendance record. | Green check icon |
| Today | Current day. | Blue highlighted circle |
| Pending | Future day or no record yet. | Grey dot |
| Late | User checked in after allowed time. | Red or warning indicator |
| Sick/Leave | User has approved non-working status. | Grey or neutral badge |

### 7.2.5 Attendance Status Logic

| Condition | Dashboard Status |
|---|---|
| No check-in today | Check-in available, check-out disabled |
| Checked in but not checked out | Check-out available |
| Checked in and checked out | Attendance complete |
| Current location outside allowed radius | Attendance action disabled or blocked |
| Location permission denied | User must enable location permission |

### 7.2.6 Acceptance Criteria

- Given a user has not checked in today, the Dashboard displays the check-in card as the primary active action.
- Given a user has already checked in, the Dashboard displays the check-in time and enables the check-out action.
- Given a user has checked out, the Dashboard displays both check-in and check-out times.
- Given a user is outside the allowed radius, the Dashboard must clearly indicate the location issue.
- Given a user taps the active attendance card, the app opens the Check-in / Check-out screen.

---

## 7.3 Screen 3: Report

### 7.3.1 Purpose

The Report screen allows employees to review attendance history and monthly attendance analytics.

### 7.3.2 UI Elements

- Header with avatar, app title, and notification icon.
- Page title: `Laporan Kehadiran`.
- Month label, for example: `Bulan Oktober 2023`.
- Export button.
- Monthly summary card.
- Total working hours.
- Average working hours per day.
- Bar chart for attendance / working hours trend.
- Filter buttons:
  - `Semua Data`.
  - `Tepat Waktu`.
  - `Terlambat`.
- Attendance list grouped by date.
- Status badges:
  - `Tepat Waktu`.
  - `Terlambat`.
  - `Lembur`.
  - `Sakit`.
- Load more button.
- Bottom navigation.

### 7.3.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| REP-001 | Report screen shows current month by default. | Must Have |
| REP-002 | Report screen shows total working hours for selected month. | Must Have |
| REP-003 | Report screen shows average working hours per attendance day. | Must Have |
| REP-004 | Report screen shows attendance records sorted by date descending. | Must Have |
| REP-005 | Each record shows date, check-in time, check-out time, and status. | Must Have |
| REP-006 | User can filter records by all, on-time, and late. | Must Have |
| REP-007 | Report screen supports load more pagination. | Should Have |
| REP-008 | Export button generates attendance report file. | Should Have |
| REP-009 | Bar chart visualizes working hours or attendance status trend. | Should Have |
| REP-010 | Sick or special status can be displayed when record has no normal check-in/check-out. | Should Have |

### 7.3.4 Attendance Record Display Rules

Each attendance record should display:

- Date label, for example: `Jum, 13 Okt`.
- Check-in time.
- Check-out time.
- Status badge.
- Overtime duration if applicable.
- Special notes if applicable, such as `Keterangan Dokter Terlampir`.

### 7.3.5 Monthly Summary Calculations

#### Total Working Hours

Total working hours are calculated by summing the duration between check-in and check-out for all completed attendance records in the selected month.

#### Average Working Hours

Average working hours are calculated by dividing total working hours by the number of completed attendance days.

#### Overtime

Overtime is calculated when the user's check-out time is later than the assigned shift end time.

Example:

- Shift end: 17:00
- Check-out: 19:30
- Overtime: 2.5 hours

The UI may show overtime as `(+2.5j)` or similar Indonesian-localized text.

### 7.3.6 Export Requirements

For V1, export can be implemented as CSV.

Exported fields:

- Employee name.
- Employee email.
- Date.
- Check-in time.
- Check-out time.
- Work duration.
- Status.
- Overtime duration.
- Office location.
- Notes.

Recommended filename format:

```text
attendance-report-{employeeId}-{YYYY-MM}.csv
```

### 7.3.7 Acceptance Criteria

- Given a user opens the Report screen, the current month's attendance summary is displayed.
- Given a user selects `Terlambat`, only late records are shown.
- Given a user selects `Tepat Waktu`, only on-time records are shown.
- Given the user taps `Ekspor`, a CSV report is generated or downloaded.
- Given there are more records than the initial limit, the `Muat Lebih Banyak` button loads additional records.

---

## 7.4 Screen 4: Check-in / Check-out

### 7.4.1 Purpose

The Check-in / Check-out screen allows employees to record attendance after validating current location and attendance state.

### 7.4.2 UI Elements

- Header with avatar, app title, and notification icon.
- Success toast or alert after attendance action.
- Current date.
- Large current time display.
- Shift schedule badge.
- Map or location illustration.
- Current location label.
- Primary attendance button:
  - `Absen Masuk` before check-in.
  - `Absen Keluar` after check-in.
- Helper text: `Pastikan Anda berada di area kantor`.
- Bottom navigation.

### 7.4.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| ATT-001 | App requests browser geolocation permission before attendance action. | Must Have |
| ATT-002 | App captures current latitude and longitude. | Must Have |
| ATT-003 | App validates distance between current location and assigned office location. | Must Have |
| ATT-004 | App allows check-in only if user has not checked in today. | Must Have |
| ATT-005 | App allows check-out only if user has checked in and has not checked out today. | Must Have |
| ATT-006 | App stores check-in timestamp with location metadata. | Must Have |
| ATT-007 | App stores check-out timestamp with location metadata. | Must Have |
| ATT-008 | App shows success message after successful check-in. | Must Have |
| ATT-009 | App shows success message after successful check-out. | Must Have |
| ATT-010 | App blocks attendance if user is outside allowed radius. | Must Have |
| ATT-011 | App shows error if location permission is denied. | Must Have |
| ATT-012 | App shows loading state while location is being detected. | Should Have |
| ATT-013 | App records user agent or device info for audit purposes. | Could Have |
| ATT-014 | App prevents duplicate submissions from double tapping. | Must Have |

### 7.4.4 Location Validation

The app should compare the user's current coordinates with the assigned office coordinates.

Required office location fields:

- Office name.
- Latitude.
- Longitude.
- Allowed radius in meters.

A user is eligible to check in or check out when:

```text
distance(userLocation, officeLocation) <= office.allowedRadiusMeters
```

Recommended default radius:

```text
100 meters
```

The UI mockup mentions an accuracy example of `12m`. The app should store the browser-reported geolocation accuracy where available.

### 7.4.5 Attendance Time Rules

Default shift example:

```text
09:00 - 17:00
```

Recommended attendance classification:

| Condition | Status |
|---|---|
| Check-in time <= shift start + grace period | On Time |
| Check-in time > shift start + grace period | Late |
| Check-out time > shift end | Overtime |
| Check-in exists but no check-out | Incomplete |
| No attendance record on working day | Absent |

Recommended grace period:

```text
15 minutes
```

### 7.4.6 Success and Error Messages

Success messages:

- `Berhasil Absen Masuk`
- `Waktu tercatat: 08:45 AM`
- `Berhasil Absen Keluar`
- `Waktu tercatat: 17:05 PM`

Error messages:

- `Location permission is required to record attendance.`
- `You are outside the allowed office radius.`
- `You have already checked in today.`
- `You have already checked out today.`
- `Unable to record attendance. Please try again.`

### 7.4.7 Acceptance Criteria

- Given a user is inside the allowed office radius and has not checked in today, when they tap `Absen Masuk`, then the app records check-in and shows a success message.
- Given a user has checked in and is inside the allowed office radius, when they tap `Absen Keluar`, then the app records check-out and shows a success message.
- Given a user is outside the allowed radius, when they tap the attendance button, then the app blocks the action and shows an error.
- Given a user denies location permission, the app explains that location access is required.
- Given the user double taps the attendance button, only one attendance record is created.

---

## 8. Navigation Structure

### 8.1 Route Map

Recommended Next.js App Router structure:

```text
/app
  /login
    page.tsx
  /dashboard
    page.tsx
  /report
    page.tsx
  /attendance
    page.tsx
  layout.tsx
  page.tsx
```

### 8.2 Route Behavior

| Route | Purpose | Auth Required |
|---|---|---|
| `/login` | User login | No |
| `/dashboard` | Main dashboard | Yes |
| `/report` | Attendance report | Yes |
| `/attendance` | Check-in / check-out | Yes |
| `/` | Redirect based on auth state | Conditional |

### 8.3 Bottom Navigation

The bottom navigation should be visible on authenticated screens only:

- Dashboard: `/dashboard`
- History / Report: `/report`
- Profile: placeholder or disabled in V1

Because the requested app only contains four core UIs, the Profile tab may be visually present to match the mockup, but it should either:

- Open a simple placeholder state, or
- Be disabled until a future version.

Recommended V1 behavior: keep Profile as a non-functional placeholder to preserve the mobile navigation design, but do not build a full Profile screen.

---

## 9. Data Model

## 9.1 SQLite Tables

### 9.1.1 users

Stores employee account information.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  office_id TEXT,
  shift_id TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (office_id) REFERENCES offices(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);
```

### 9.1.2 offices

Stores allowed office locations.

```sql
CREATE TABLE offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  allowed_radius_meters INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 9.1.3 shifts

Stores employee shift configuration.

```sql
CREATE TABLE shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  grace_period_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 9.1.4 attendance_records

Stores daily attendance records.

```sql
CREATE TABLE attendance_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  attendance_date TEXT NOT NULL,
  check_in_at TEXT,
  check_out_at TEXT,
  check_in_latitude REAL,
  check_in_longitude REAL,
  check_in_accuracy_meters REAL,
  check_out_latitude REAL,
  check_out_longitude REAL,
  check_out_accuracy_meters REAL,
  check_in_distance_meters REAL,
  check_out_distance_meters REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  work_duration_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, attendance_date)
);
```

### 9.1.5 attendance_events

Optional but recommended audit table for every raw attendance action.

```sql
CREATE TABLE attendance_events (
  id TEXT PRIMARY KEY,
  attendance_record_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_time TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  accuracy_meters REAL,
  distance_meters REAL,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 9.1.6 sessions

Stores application sessions if not using JWT-only authentication.

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 10. Attendance Status Definitions

Recommended status values:

| Status | Description |
|---|---|
| `pending` | Attendance record exists but no check-in yet. |
| `on_time` | User checked in within the allowed time. |
| `late` | User checked in after grace period. |
| `overtime` | User checked out later than shift end time. |
| `incomplete` | User checked in but did not check out. |
| `sick` | User is marked sick. |
| `leave` | User is on leave. |
| `absent` | User has no attendance record for a working day. |

If a record is both late and overtime, the system should store the main status as `late` and store overtime separately in `overtime_minutes`, or introduce a combined status later. For V1, keep the status model simple.

---

## 11. API Requirements

The app can use Next.js Route Handlers for API endpoints.

## 11.1 Authentication APIs

### POST `/api/auth/login`

Authenticates user.

Request:

```json
{
  "email": "budi@company.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "user_001",
    "name": "Budi",
    "email": "budi@company.com",
    "avatarUrl": "/avatars/budi.png"
  }
}
```

### POST `/api/auth/logout`

Clears session.

Response:

```json
{
  "success": true
}
```

### GET `/api/auth/me`

Returns current authenticated user.

---

## 11.2 Dashboard APIs

### GET `/api/dashboard`

Returns dashboard summary for authenticated user.

Response:

```json
{
  "user": {
    "id": "user_001",
    "name": "Budi",
    "avatarUrl": "/avatars/budi.png"
  },
  "today": {
    "date": "2023-10-24",
    "checkInAt": "2023-10-24T08:00:00+07:00",
    "checkOutAt": null,
    "status": "on_time"
  },
  "week": {
    "totalWorkMinutes": 495,
    "targetWorkMinutes": 2400,
    "days": [
      { "date": "2023-10-23", "label": "Sen", "status": "completed" },
      { "date": "2023-10-24", "label": "Sel", "status": "today" }
    ]
  },
  "office": {
    "name": "Kantor Pusat - Sudirman",
    "address": "Gedung Sudirman, Jakarta",
    "allowedRadiusMeters": 100
  }
}
```

---

## 11.3 Attendance APIs

### GET `/api/attendance/today`

Returns today's attendance state.

### POST `/api/attendance/check-in`

Records check-in.

Request:

```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "accuracyMeters": 12
}
```

Response:

```json
{
  "success": true,
  "message": "Check-in recorded successfully.",
  "record": {
    "id": "att_001",
    "checkInAt": "2023-10-24T08:45:00+07:00",
    "status": "on_time",
    "distanceMeters": 42
  }
}
```

### POST `/api/attendance/check-out`

Records check-out.

Request:

```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "accuracyMeters": 15
}
```

Response:

```json
{
  "success": true,
  "message": "Check-out recorded successfully.",
  "record": {
    "id": "att_001",
    "checkOutAt": "2023-10-24T17:05:00+07:00",
    "workDurationMinutes": 500,
    "overtimeMinutes": 5
  }
}
```

---

## 11.4 Report APIs

### GET `/api/reports/monthly?month=2023-10&filter=all&page=1`

Returns monthly report.

Response:

```json
{
  "month": "2023-10",
  "summary": {
    "totalWorkMinutes": 9840,
    "averageWorkMinutesPerDay": 492,
    "totalAttendanceDays": 20,
    "lateDays": 2,
    "overtimeDays": 3
  },
  "chart": [
    { "date": "2023-10-01", "workMinutes": 480, "status": "on_time" },
    { "date": "2023-10-02", "workMinutes": 510, "status": "overtime" }
  ],
  "records": [
    {
      "date": "2023-10-13",
      "dayLabel": "Jum, 13 Okt",
      "checkIn": "07:55 AM",
      "checkOut": "17:05 PM",
      "status": "on_time",
      "overtimeMinutes": 5
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

### GET `/api/reports/export?month=2023-10`

Generates CSV export.

---

## 12. Business Logic

## 12.1 Check-in Logic

1. Verify authenticated user.
2. Get user's assigned office and shift.
3. Check if attendance record for today already exists.
4. If check-in already exists, reject duplicate check-in.
5. Validate geolocation payload.
6. Calculate distance from office.
7. Reject if distance exceeds allowed radius.
8. Determine attendance status based on shift start and grace period.
9. Create or update attendance record.
10. Create attendance event audit row.
11. Return success response.

## 12.2 Check-out Logic

1. Verify authenticated user.
2. Get today's attendance record.
3. Reject if no check-in exists.
4. Reject if check-out already exists.
5. Validate geolocation payload.
6. Calculate distance from office.
7. Reject if distance exceeds allowed radius.
8. Calculate work duration.
9. Calculate overtime if applicable.
10. Update attendance record.
11. Create attendance event audit row.
12. Return success response.

## 12.3 Distance Calculation

Use the Haversine formula to calculate distance between two coordinates.

Input:

- User latitude.
- User longitude.
- Office latitude.
- Office longitude.

Output:

- Distance in meters.

## 12.4 Work Duration Calculation

Work duration:

```text
checkOutAt - checkInAt
```

Store result in minutes.

## 12.5 Overtime Calculation

Overtime:

```text
max(0, checkOutAt - shiftEndTime)
```

Store result in minutes.

---

## 13. PWA Requirements

### 13.1 Installability

The application must include:

- Web app manifest.
- App name and short name.
- Theme color.
- Background color.
- App icons.
- Mobile viewport support.
- Service worker support.

Recommended manifest:

```json
{
  "name": "WorkForce Attendance",
  "short_name": "WorkForce",
  "description": "Simple mobile attendance app",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#F8F7FF",
  "theme_color": "#0647AD",
  "orientation": "portrait"
}
```

### 13.2 Offline Behavior

Because attendance actions require accurate real-time location and server validation, offline attendance submission is not recommended for V1.

Offline behavior should be:

- Cached app shell can open.
- Dashboard can show last known data with an offline indicator.
- Check-in and check-out buttons should be disabled while offline.
- Report screen can show cached recent data if available.
- User must reconnect to perform attendance actions.

### 13.3 PWA Acceptance Criteria

- User can install the app from a supported mobile browser.
- Installed app opens in standalone mode.
- App uses portrait orientation.
- App shell loads even with poor connection.
- Attendance action is blocked when offline.

---

## 14. Technical Requirements

## 14.1 Frontend

- Next.js App Router.
- TypeScript.
- Mobile-first responsive CSS.
- Component-based architecture.
- Client-side geolocation API usage.
- Toast notification system.
- Form validation.
- Bottom navigation component.
- Protected route handling.

Recommended UI component structure:

```text
/components
  /auth
    LoginForm.tsx
  /dashboard
    AttendanceActionCard.tsx
    WeeklyAttendanceCard.tsx
    LocationNetworkCard.tsx
  /attendance
    AttendanceButton.tsx
    LocationStatus.tsx
    TimeDisplay.tsx
  /report
    ReportSummaryCard.tsx
    AttendanceChart.tsx
    ReportFilterTabs.tsx
    AttendanceRecordList.tsx
  /layout
    AppHeader.tsx
    BottomNavigation.tsx
    MobilePageShell.tsx
```

## 14.2 Backend

- Next.js Route Handlers.
- SQLite database.
- Database access through a lightweight query layer or ORM.
- Secure password hashing.
- Session-based authentication using HTTP-only cookies.
- Server-side validation for attendance actions.

Recommended libraries:

- `better-sqlite3` or Prisma with SQLite.
- `bcryptjs` or Argon2-compatible hashing library.
- `zod` for request validation.
- `date-fns` for date formatting and calculations.

## 14.3 Timezone

Default timezone:

```text
Asia/Jakarta
```

All timestamps should be stored in ISO 8601 format. For display, convert to local Indonesian time format.

## 14.4 Security

- Store password as secure hash only.
- Use HTTP-only secure cookies for session tokens.
- Do not expose password hash through API responses.
- Validate all API inputs server-side.
- Prevent duplicate check-in and check-out actions.
- Use CSRF protection if using cookie-based session mutations.
- Rate limit login attempts.
- Sanitize all user-provided text fields.

---

## 15. UI and UX Requirements

## 15.1 Layout

- Mobile viewport should be optimized for 360px to 430px width.
- Main content width should fill screen with safe side padding.
- Bottom navigation should be fixed or sticky near the bottom.
- Main action buttons should have at least 44px height.
- Cards should use rounded corners and soft shadows.

## 15.2 Visual Style

Recommended colors:

| Usage | Color |
|---|---|
| Primary blue | `#0647AD` |
| Deep blue | `#003F9E` |
| Success green | `#6EF2B3` |
| Success dark | `#087A55` |
| Background | `#F8F7FF` |
| Card background | `#FFFFFF` |
| Border | `#D8DCEB` |
| Text primary | `#111827` |
| Text secondary | `#6B7280` |
| Error red | `#DC2626` |

## 15.3 Interaction States

Required states:

- Loading.
- Disabled.
- Success.
- Error.
- Empty data.
- Offline.
- Location permission denied.
- Location outside radius.

## 15.4 Accessibility

- Buttons must be reachable with keyboard navigation.
- Inputs must have associated labels.
- Color must not be the only status indicator.
- Touch targets should be large enough for mobile use.
- Text should remain readable on small screens.
- Toast messages should be announced to assistive technology where possible.

---

## 16. Empty, Loading, and Error States

### 16.1 Login

- Loading: show button spinner or disabled button text `Memproses...`.
- Error: show inline form error.

### 16.2 Dashboard

- Loading: show card skeletons.
- Empty: show no attendance record state.
- Error: show retry button.
- Offline: show offline banner and disable attendance actions.

### 16.3 Report

- Loading: show chart and list skeletons.
- Empty: show `No attendance records found for this month.`
- Filter empty: show `No records match this filter.`
- Error: show retry button.

### 16.4 Check-in / Check-out

- Loading location: show `Detecting your location...`
- Permission denied: show clear instruction to enable location.
- Outside radius: show office location and current distance if available.
- Success: show toast and update UI.

---

## 17. Seed Data for Development

Recommended seed data:

### User

```text
Name: Budi
Email: budi@company.com
Password: password123
Office: Kantor Pusat - Sudirman
Shift: Regular 09:00 - 17:00
```

### Office

```text
Name: Kantor Pusat - Sudirman
Address: Gedung Sudirman, Jakarta
Allowed Radius: 100 meters
```

### Shift

```text
Name: Regular
Start: 09:00
End: 17:00
Grace Period: 15 minutes
```

---

## 18. Analytics and Metrics

### 18.1 Product Metrics

- Daily active users.
- Successful check-ins per day.
- Successful check-outs per day.
- Failed attendance attempts due to location.
- Failed attendance attempts due to permission denied.
- Report export count.

### 18.2 Operational Metrics

- API response time.
- Login failure rate.
- Attendance submission error rate.
- SQLite query error rate.
- PWA install rate.

---

## 19. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| GPS location is inaccurate indoors. | Users may be blocked incorrectly. | Allow reasonable radius and show accuracy information. |
| User denies location permission. | Attendance cannot be recorded. | Explain permission requirement clearly. |
| SQLite has limited concurrency. | Scaling issue for large teams. | Suitable for small teams; migrate later if needed. |
| PWA behavior varies across browsers. | Install or offline behavior may differ. | Test on Chrome Android and Safari iOS. |
| Users forget to check out. | Incomplete attendance records. | Show clear dashboard state and future reminder support. |
| Device time manipulation. | Incorrect attendance time. | Always use server time for official records. |

---

## 20. Implementation Milestones

### Milestone 1: Project Foundation

- Set up Next.js project.
- Configure TypeScript.
- Set up SQLite database.
- Create database schema and seed data.
- Configure basic PWA manifest.

### Milestone 2: Authentication

- Build Login UI.
- Implement login API.
- Implement password hashing.
- Implement cookie-based session.
- Add route protection.

### Milestone 3: Dashboard

- Build Dashboard UI.
- Implement dashboard API.
- Show today's attendance state.
- Show weekly attendance summary.
- Show office location card.

### Milestone 4: Attendance Flow

- Build Check-in / Check-out UI.
- Implement geolocation capture.
- Implement radius validation.
- Implement check-in API.
- Implement check-out API.
- Add success and error states.

### Milestone 5: Report

- Build Report UI.
- Implement monthly report API.
- Implement filters.
- Implement chart data.
- Implement load more.
- Implement CSV export.

### Milestone 6: PWA Polish and QA

- Add service worker.
- Improve offline state.
- Test installability.
- Test mobile layouts.
- Test attendance edge cases.
- Fix UI inconsistencies.

---

## 21. MVP Acceptance Criteria

The MVP is complete when:

- User can log in successfully.
- Authenticated user can access Dashboard.
- Dashboard shows today's attendance state.
- User can check in from allowed office location.
- User can check out from allowed office location.
- Duplicate check-in and check-out are prevented.
- Attendance actions store timestamp and location metadata.
- Report screen shows monthly attendance records.
- Report filters work for all, on-time, and late data.
- CSV export works for selected month.
- App can be installed as a PWA on mobile.
- App layout is optimized for mobile devices.

---

## 22. Future Enhancements

Potential post-MVP features:

- Profile screen.
- Password reset.
- Employee registration flow.
- Admin dashboard.
- Leave and sick request submission.
- Attendance correction request.
- Push notification reminder for check-in/check-out.
- Multi-office support.
- QR code attendance mode.
- Photo capture during check-in.
- Face verification.
- Payroll integration.
- PostgreSQL migration for larger organizations.
- Supervisor approval workflow.

---

## 23. Open Questions

1. Should registration be available publicly or only through admin-created accounts?
2. Should forgotten password flow be implemented in V1?
3. Should attendance export be CSV only, or should PDF also be supported?
4. What is the final allowed office radius?
5. Should users be allowed to check out outside the office radius?
6. Should the app support weekends or only Monday to Friday?
7. Should late status use a fixed grace period or be configurable per shift?
8. Should incomplete attendance records be automatically closed at end of day?
9. Should location accuracy below a certain threshold be required?
10. Should the system store raw attendance events for audit in V1?

---

## 24. Recommended V1 Decisions

To keep the app simple and aligned with the four-screen scope, the recommended V1 decisions are:

- Use admin-seeded users only; do not implement registration yet.
- Show registration link in UI as disabled or placeholder.
- Show forgot password link as disabled or placeholder.
- Use one default office location per user.
- Use one default shift per user.
- Use 100 meters as default office radius.
- Use 15 minutes as default late grace period.
- Use server time as the source of truth for attendance timestamps.
- Export report as CSV.
- Disable attendance actions while offline.
- Keep Profile tab as placeholder for future work.

---

## 25. Appendix: Suggested Status Badge Labels

| Internal Status | Indonesian UI Label |
|---|---|
| `on_time` | Tepat Waktu |
| `late` | Terlambat |
| `overtime` | Lembur |
| `sick` | Sakit |
| `leave` | Cuti |
| `absent` | Tidak Hadir |
| `incomplete` | Belum Lengkap |

---

## 26. Appendix: Suggested Indonesian UI Copy

### Login

- `Silakan masuk ke akun Anda`
- `Email`
- `Kata Sandi`
- `Lupa?`
- `Masuk`
- `Belum punya akun? Daftar sekarang`

### Dashboard

- `Selamat Pagi, {name}!`
- `Masuk`
- `Keluar`
- `Kehadiran Minggu Ini`
- `Total Jam Kerja`
- `Lokasi & Jaringan`
- `Anda berada di dalam radius absensi yang diizinkan`
- `Jaringan Stabil`

### Report

- `Laporan Kehadiran`
- `Bulan {month} {year}`
- `Ekspor`
- `Total Jam Kerja`
- `Rata-rata`
- `Semua Data`
- `Tepat Waktu`
- `Terlambat`
- `Muat Lebih Banyak`

### Attendance

- `Lokasi Saat Ini`
- `Absen Masuk`
- `Absen Keluar`
- `Pastikan Anda berada di area kantor`
- `Berhasil Absen Masuk`
- `Berhasil Absen Keluar`
- `Waktu tercatat: {time}`

---

## 27. Final Notes

This PRD defines a focused, practical, and implementation-ready scope for a simple mobile attendance PWA. The product should prioritize speed, clarity, location validation, and reliable attendance recording over complex HR features.

The four-screen limitation is suitable for an MVP, as long as the backend data model is designed with enough flexibility to support future enhancements such as admin management, leave requests, and richer reporting.
