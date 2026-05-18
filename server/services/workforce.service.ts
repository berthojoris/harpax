import "server-only";

import { randomBytes, createHash, randomUUID } from "node:crypto";
import { getDatabase } from "@/server/data/db";
import {
  calculateOvertimeMinutes,
  calculateWorkDurationMinutes,
  classifyCheckIn,
  getStatusLabel,
  resolveCheckoutStatus,
} from "@/server/domain/attendance";
import type {
  AttendanceFilter,
  AttendanceRecord,
  AttendanceStatus,
  AuthenticatedUser,
  Office,
  Shift,
  UserRole,
} from "@/server/domain/types";
import type { LocationPayload } from "@/schemas/attendance.schema";
import { verifyPassword } from "@/server/auth/password";
import { calculateDistanceMeters } from "@/lib/distance";
import {
  formatDateKeyFull,
  formatDateKeyShort,
  formatDuration,
  formatFullDate,
  formatMonthLabel,
  formatTime,
  formatTimeWithZone,
  getCurrentMonthKey,
  getJakartaDateKey,
  getMonthRange,
  getWeekdayLabel,
  getWorkWeek,
  isFutureDateKey,
  parseTimeToMinutes,
} from "@/lib/dates";
import { toCsv } from "@/lib/csv";

const SESSION_DAYS = 7;
const PAGE_SIZE = 5;

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  avatar_url: string | null;
  role: string;
  office_id: string | null;
  shift_id: string | null;
  is_active: number;
};

type OfficeRow = {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  allowed_radius_meters: number;
};

type ShiftRow = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
};

type AttendanceRecordRow = {
  id: string;
  user_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_in_accuracy_meters: number | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_out_accuracy_meters: number | null;
  check_in_distance_meters: number | null;
  check_out_distance_meters: number | null;
  status: AttendanceStatus;
  work_duration_minutes: number | null;
  overtime_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type LoginUserRow = UserRow & {
  password_hash: string;
};

export type DashboardSummary = {
  user: AuthenticatedUser;
  today: {
    date: string;
    dateLabel: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    checkInLabel: string;
    checkOutLabel: string;
    status: AttendanceStatus | "not_started" | "complete";
    action: "check_in" | "check_out" | "complete";
  };
  week: {
    totalWorkMinutes: number;
    targetWorkMinutes: number;
    progress: number;
    days: Array<{
      date: string;
      label: string;
      status: "completed" | "today" | "pending" | "late" | "special";
      durationLabel: string;
    }>;
  };
  office: Office;
  shift: Shift;
  month: {
    monthLabel: string;
    attendedDays: number;
    lateDays: number;
    overtimeMinutes: number;
    consistency: number;
    punctuality: number;
  };
  recentActivities: Array<{
    title: string;
    description: string;
    status: "success" | "warning" | "info";
  }>;
};

export type AttendancePageData = {
  user: AuthenticatedUser;
  office: Office;
  shift: Shift;
  today: DashboardSummary["today"];
  currentDateLabel: string;
};

export type MonthlyReport = {
  user: AuthenticatedUser;
  office: Office;
  month: string;
  monthLabel: string;
  filter: AttendanceFilter;
  summary: {
    totalWorkMinutes: number;
    averageWorkMinutesPerDay: number;
    totalAttendanceDays: number;
    lateDays: number;
    overtimeDays: number;
    sickDays: number;
    onTimeDays: number;
  };
  chart: Array<{
    date: string;
    label: string;
    workMinutes: number;
    heightPercent: number;
    status: AttendanceStatus;
  }>;
  records: Array<{
    id: string;
    date: string;
    dayLabel: string;
    checkIn: string;
    checkOut: string;
    status: AttendanceStatus;
    statusLabel: string;
    durationLabel: string;
    overtimeLabel: string | null;
    notes: string | null;
    officeName: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
};

function mapUser(row: UserRow): AuthenticatedUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role as UserRole,
    officeId: row.office_id,
    shiftId: row.shift_id,
  };
}

function mapOffice(row: OfficeRow): Office {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    allowedRadiusMeters: row.allowed_radius_meters,
  };
}

function mapShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    name: row.name,
    startTime: row.start_time,
    endTime: row.end_time,
    gracePeriodMinutes: row.grace_period_minutes,
  };
}

function mapAttendanceRecord(row: AttendanceRecordRow): AttendanceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    attendanceDate: row.attendance_date,
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at,
    checkInLatitude: row.check_in_latitude,
    checkInLongitude: row.check_in_longitude,
    checkInAccuracyMeters: row.check_in_accuracy_meters,
    checkOutLatitude: row.check_out_latitude,
    checkOutLongitude: row.check_out_longitude,
    checkOutAccuracyMeters: row.check_out_accuracy_meters,
    checkInDistanceMeters: row.check_in_distance_meters,
    checkOutDistanceMeters: row.check_out_distance_meters,
    status: row.status,
    workDurationMinutes: row.work_duration_minutes ?? 0,
    overtimeMinutes: row.overtime_minutes ?? 0,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getUserById(userId: string): AuthenticatedUser | null {
  const row = getDatabase()
    .prepare("SELECT * FROM users WHERE id = ? AND is_active = 1")
    .get(userId) as UserRow | undefined;

  return row ? mapUser(row) : null;
}

function getOfficeById(officeId: string): Office | null {
  const row = getDatabase().prepare("SELECT * FROM offices WHERE id = ?").get(officeId) as OfficeRow | undefined;
  return row ? mapOffice(row) : null;
}

function getShiftById(shiftId: string): Shift | null {
  const row = getDatabase().prepare("SELECT * FROM shifts WHERE id = ?").get(shiftId) as ShiftRow | undefined;
  return row ? mapShift(row) : null;
}

function getAttendanceByDate(userId: string, dateKey: string): AttendanceRecord | null {
  const row = getDatabase()
    .prepare("SELECT * FROM attendance_records WHERE user_id = ? AND attendance_date = ?")
    .get(userId, dateKey) as AttendanceRecordRow | undefined;

  return row ? mapAttendanceRecord(row) : null;
}

function getUserContext(userId: string): { user: AuthenticatedUser; office: Office; shift: Shift } {
  const user = getUserById(userId);
  if (!user) throw new ServiceError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (!user.officeId || !user.shiftId) {
    throw new ServiceError("Akun belum memiliki kantor atau shift.", 403);
  }

  const office = getOfficeById(user.officeId);
  const shift = getShiftById(user.shiftId);
  if (!office || !shift) throw new ServiceError("Konfigurasi kantor atau shift tidak ditemukan.", 404);

  return { user, office, shift };
}

function getTodayState(userId: string): DashboardSummary["today"] {
  const date = getJakartaDateKey();
  const record = getAttendanceByDate(userId, date);

  if (!record?.checkInAt) {
    return {
      date,
      dateLabel: formatFullDate(),
      checkInAt: null,
      checkOutAt: null,
      checkInLabel: "--:-- WIB",
      checkOutLabel: "--:-- WIB",
      status: "not_started",
      action: "check_in",
    };
  }

  if (!record.checkOutAt) {
    return {
      date,
      dateLabel: formatFullDate(),
      checkInAt: record.checkInAt,
      checkOutAt: null,
      checkInLabel: formatTimeWithZone(record.checkInAt),
      checkOutLabel: "--:-- WIB",
      status: record.status,
      action: "check_out",
    };
  }

  return {
    date,
    dateLabel: formatFullDate(),
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
    checkInLabel: formatTimeWithZone(record.checkInAt),
    checkOutLabel: formatTimeWithZone(record.checkOutAt),
    status: "complete",
    action: "complete",
  };
}

function getFilterWhere(filter: AttendanceFilter): string {
  if (filter === "on_time") return "AND status = 'on_time'";
  if (filter === "late") return "AND status = 'late'";
  if (filter === "overtime") return "AND (status = 'overtime' OR overtime_minutes > 0)";
  if (filter === "special") return "AND status IN ('sick', 'leave', 'absent')";
  return "";
}

function getMonthlyRecords(userId: string, month: string): AttendanceRecord[] {
  const { start, endExclusive } = getMonthRange(month);
  const rows = getDatabase()
    .prepare(
      `SELECT * FROM attendance_records
       WHERE user_id = ? AND attendance_date >= ? AND attendance_date < ?
       ORDER BY attendance_date DESC`,
    )
    .all(userId, start, endExclusive) as AttendanceRecordRow[];

  return rows.map(mapAttendanceRecord);
}

function buildMonthSummary(records: AttendanceRecord[]): MonthlyReport["summary"] {
  const completedRecords = records.filter((record) => record.checkInAt && record.checkOutAt);
  const totalWorkMinutes = completedRecords.reduce((total, record) => total + record.workDurationMinutes, 0);
  const overtimeDays = records.filter((record) => record.overtimeMinutes > 0 || record.status === "overtime").length;
  const lateDays = records.filter((record) => record.status === "late").length;
  const sickDays = records.filter((record) => record.status === "sick").length;
  const onTimeDays = records.filter((record) => record.status === "on_time").length;

  return {
    totalWorkMinutes,
    averageWorkMinutesPerDay: completedRecords.length > 0 ? Math.round(totalWorkMinutes / completedRecords.length) : 0,
    totalAttendanceDays: completedRecords.length,
    lateDays,
    overtimeDays,
    sickDays,
    onTimeDays,
  };
}

function toReportRecord(record: AttendanceRecord, office: Office): MonthlyReport["records"][number] {
  const overtimeLabel = record.overtimeMinutes > 0 ? `+${formatDuration(record.overtimeMinutes)}` : null;

  return {
    id: record.id,
    date: record.attendanceDate,
    dayLabel: formatDateKeyShort(record.attendanceDate),
    checkIn: formatTime(record.checkInAt),
    checkOut: formatTime(record.checkOutAt),
    status: record.status,
    statusLabel: overtimeLabel && record.status === "overtime" ? `Lembur ${overtimeLabel}` : getStatusLabel(record.status),
    durationLabel: record.workDurationMinutes > 0 ? `Durasi ${formatDuration(record.workDurationMinutes)}` : office.name,
    overtimeLabel,
    notes: record.notes,
    officeName: office.name,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthenticatedUser> {
  const row = getDatabase()
    .prepare("SELECT * FROM users WHERE email = ? AND is_active = 1")
    .get(email) as LoginUserRow | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new ServiceError("Invalid email or password.", 401);
  }

  return mapUser(row);
}

export function createSession(userId: string): { token: string; expiresAt: Date } {
  const database = getDatabase();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  database
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), userId, hashToken(token), expiresAt.toISOString(), new Date().toISOString());

  return { token, expiresAt };
}

export function deleteSession(token: string): void {
  getDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function getUserBySessionToken(token: string): AuthenticatedUser | null {
  const database = getDatabase();
  database.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());

  const row = database
    .prepare(
      `SELECT users.*
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.is_active = 1`,
    )
    .get(hashToken(token), new Date().toISOString()) as UserRow | undefined;

  return row ? mapUser(row) : null;
}

export function getDashboardSummary(userId: string): DashboardSummary {
  const { user, office, shift } = getUserContext(userId);
  const today = getTodayState(userId);
  const weekDates = getWorkWeek();
  const records = weekDates.map((date) => getAttendanceByDate(userId, date));
  const targetWorkMinutes = (parseTimeToMinutes(shift.endTime) - parseTimeToMinutes(shift.startTime)) * 5;
  const totalWorkMinutes = records.reduce((total, record) => total + (record?.workDurationMinutes ?? 0), 0);
  const monthRecords = getMonthlyRecords(userId, getCurrentMonthKey());
  const monthSummary = buildMonthSummary(monthRecords);
  const workdaysSoFar = Math.max(1, monthRecords.length);

  const week = {
    totalWorkMinutes,
    targetWorkMinutes,
    progress: targetWorkMinutes > 0 ? Math.min(1, totalWorkMinutes / targetWorkMinutes) : 0,
    days: weekDates.map((date, index) => {
      const record = records[index];
      let status: DashboardSummary["week"]["days"][number]["status"] = "pending";

      if (date === getJakartaDateKey()) status = "today";
      else if (record?.status === "late") status = "late";
      else if (record && ["sick", "leave"].includes(record.status)) status = "special";
      else if (record?.checkInAt) status = "completed";
      else if (isFutureDateKey(date)) status = "pending";

      return {
        date,
        label: getWeekdayLabel(date),
        status,
        durationLabel:
          record && record.workDurationMinutes > 0
            ? formatDuration(record.workDurationMinutes)
            : status === "today"
              ? "Hari ini"
              : "Pending",
      };
    }),
  };

  const recentActivities = monthRecords.slice(0, 3).map((record) => ({
    title:
      record.status === "late"
        ? "Masuk terlambat"
        : record.checkOutAt
          ? "Absen keluar berhasil"
          : record.checkInAt
            ? "Absen masuk berhasil"
            : getStatusLabel(record.status),
    description: `${formatDateKeyFull(record.attendanceDate)}${record.checkOutAt ? ` - ${formatTimeWithZone(record.checkOutAt)}` : ""}`,
    status: record.status === "late" ? ("warning" as const) : record.status === "sick" ? ("info" as const) : ("success" as const),
  }));

  return {
    user,
    today,
    week,
    office,
    shift,
    month: {
      monthLabel: formatMonthLabel(getCurrentMonthKey()),
      attendedDays: monthSummary.totalAttendanceDays,
      lateDays: monthSummary.lateDays,
      overtimeMinutes: monthRecords.reduce((total, record) => total + record.overtimeMinutes, 0),
      consistency: Math.min(100, Math.round((monthSummary.totalAttendanceDays / workdaysSoFar) * 100)),
      punctuality:
        monthSummary.totalAttendanceDays > 0
          ? Math.round((monthSummary.onTimeDays / monthSummary.totalAttendanceDays) * 100)
          : 0,
    },
    recentActivities,
  };
}

export function getAttendancePageData(userId: string): AttendancePageData {
  const { user, office, shift } = getUserContext(userId);
  return {
    user,
    office,
    shift,
    today: getTodayState(userId),
    currentDateLabel: formatFullDate(),
  };
}

export function recordCheckIn(userId: string, payload: LocationPayload, userAgent: string | null): AttendanceRecord {
  const { office, shift } = getUserContext(userId);
  const now = new Date();
  const nowIso = now.toISOString();
  const attendanceDate = getJakartaDateKey(now);
  const existing = getAttendanceByDate(userId, attendanceDate);

  if (existing?.checkInAt) throw new ServiceError("You have already checked in today.", 409);

  const distanceMeters = calculateDistanceMeters(payload, office);
  if (distanceMeters > office.allowedRadiusMeters) {
    throw new ServiceError("You are outside the allowed office radius.", 403);
  }

  const status = classifyCheckIn(now, shift);
  const database = getDatabase();
  const recordId = existing?.id ?? randomUUID();

  database.exec("BEGIN");
  try {
    if (existing) {
      database
        .prepare(
          `UPDATE attendance_records
           SET check_in_at = ?, check_in_latitude = ?, check_in_longitude = ?,
               check_in_accuracy_meters = ?, check_in_distance_meters = ?,
               status = ?, updated_at = ?
           WHERE id = ?`,
        )
        .run(
          nowIso,
          payload.latitude,
          payload.longitude,
          payload.accuracyMeters ?? null,
          distanceMeters,
          status,
          nowIso,
          existing.id,
        );
    } else {
      database
        .prepare(
          `INSERT INTO attendance_records (
            id, user_id, attendance_date, check_in_at, check_in_latitude, check_in_longitude,
            check_in_accuracy_meters, check_in_distance_meters, status, work_duration_minutes,
            overtime_minutes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          recordId,
          userId,
          attendanceDate,
          nowIso,
          payload.latitude,
          payload.longitude,
          payload.accuracyMeters ?? null,
          distanceMeters,
          status,
          0,
          0,
          nowIso,
          nowIso,
        );
    }

    database
      .prepare(
        `INSERT INTO attendance_events (
          id, attendance_record_id, user_id, event_type, event_time, latitude, longitude,
          accuracy_meters, distance_meters, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        randomUUID(),
        recordId,
        userId,
        "check_in",
        nowIso,
        payload.latitude,
        payload.longitude,
        payload.accuracyMeters ?? null,
        distanceMeters,
        userAgent,
        nowIso,
      );

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const record = getAttendanceByDate(userId, attendanceDate);
  if (!record) throw new ServiceError("Unable to record attendance. Please try again.", 500);
  return record;
}

export function recordCheckOut(userId: string, payload: LocationPayload, userAgent: string | null): AttendanceRecord {
  const { office, shift } = getUserContext(userId);
  const now = new Date();
  const nowIso = now.toISOString();
  const attendanceDate = getJakartaDateKey(now);
  const existing = getAttendanceByDate(userId, attendanceDate);

  if (!existing?.checkInAt) throw new ServiceError("You must check in before checking out.", 409);
  if (existing.checkOutAt) throw new ServiceError("You have already checked out today.", 409);

  const distanceMeters = calculateDistanceMeters(payload, office);
  if (distanceMeters > office.allowedRadiusMeters) {
    throw new ServiceError("You are outside the allowed office radius.", 403);
  }

  const workDurationMinutes = calculateWorkDurationMinutes(existing.checkInAt, nowIso);
  const overtimeMinutes = calculateOvertimeMinutes(now, shift);
  const status = resolveCheckoutStatus(existing.status, overtimeMinutes);
  const database = getDatabase();

  database.exec("BEGIN");
  try {
    database
      .prepare(
        `UPDATE attendance_records
         SET check_out_at = ?, check_out_latitude = ?, check_out_longitude = ?,
             check_out_accuracy_meters = ?, check_out_distance_meters = ?,
             status = ?, work_duration_minutes = ?, overtime_minutes = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(
        nowIso,
        payload.latitude,
        payload.longitude,
        payload.accuracyMeters ?? null,
        distanceMeters,
        status,
        workDurationMinutes,
        overtimeMinutes,
        nowIso,
        existing.id,
      );

    database
      .prepare(
        `INSERT INTO attendance_events (
          id, attendance_record_id, user_id, event_type, event_time, latitude, longitude,
          accuracy_meters, distance_meters, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        randomUUID(),
        existing.id,
        userId,
        "check_out",
        nowIso,
        payload.latitude,
        payload.longitude,
        payload.accuracyMeters ?? null,
        distanceMeters,
        userAgent,
        nowIso,
      );

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const record = getAttendanceByDate(userId, attendanceDate);
  if (!record) throw new ServiceError("Unable to record attendance. Please try again.", 500);
  return record;
}

export function getMonthlyReport(
  userId: string,
  input: { month?: string; filter?: AttendanceFilter; page?: number },
): MonthlyReport {
  const { user, office, shift } = getUserContext(userId);
  const month = input.month ?? getCurrentMonthKey();
  const filter = input.filter ?? "all";
  const page = input.page ?? 1;
  const { start, endExclusive } = getMonthRange(month);
  const allMonthRecords = getMonthlyRecords(userId, month);
  const whereFilter = getFilterWhere(filter);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = getDatabase()
    .prepare(
      `SELECT * FROM attendance_records
       WHERE user_id = ? AND attendance_date >= ? AND attendance_date < ? ${whereFilter}
       ORDER BY attendance_date DESC
       LIMIT ? OFFSET ?`,
    )
    .all(userId, start, endExclusive, PAGE_SIZE + 1, offset) as AttendanceRecordRow[];

  const records = rows.slice(0, PAGE_SIZE).map(mapAttendanceRecord);
  const targetMinutes = parseTimeToMinutes(shift.endTime) - parseTimeToMinutes(shift.startTime);
  const chart = allMonthRecords
    .slice()
    .reverse()
    .slice(-14)
    .map((record) => ({
      date: record.attendanceDate,
      label: record.attendanceDate.slice(-2),
      workMinutes: record.workDurationMinutes,
      heightPercent:
        record.workDurationMinutes > 0 ? Math.max(18, Math.min(100, Math.round((record.workDurationMinutes / targetMinutes) * 100))) : 18,
      status: record.status,
    }));

  return {
    user,
    office,
    month,
    monthLabel: formatMonthLabel(month),
    filter,
    summary: buildMonthSummary(allMonthRecords),
    chart,
    records: records.map((record) => toReportRecord(record, office)),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      hasMore: rows.length > PAGE_SIZE,
    },
  };
}

export function exportMonthlyReportCsv(userId: string, month: string): string {
  const { user, office } = getUserContext(userId);
  const records = getMonthlyRecords(userId, month);

  return toCsv(
    [
      "Employee name",
      "Employee email",
      "Date",
      "Check-in time",
      "Check-out time",
      "Work duration",
      "Status",
      "Overtime duration",
      "Office location",
      "Notes",
    ],
    records.map((record) => [
      user.name,
      user.email,
      record.attendanceDate,
      formatTime(record.checkInAt),
      formatTime(record.checkOutAt),
      formatDuration(record.workDurationMinutes),
      getStatusLabel(record.status),
      formatDuration(record.overtimeMinutes),
      office.name,
      record.notes,
    ]),
  );
}
