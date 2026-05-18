import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import Database from "better-sqlite3";

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const databasePath = process.env.WORKFORCE_DATABASE_PATH || path.join(process.cwd(), "data", "workforce.db");
const databaseDirectory = path.dirname(databasePath);

if (!existsSync(databaseDirectory)) {
  mkdirSync(databaseDirectory, { recursive: true });
}

const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.exec(readFileSync(path.join(process.cwd(), "server", "data", "schema.sql"), "utf8"));

const existingUser = database.prepare("SELECT COUNT(*) AS count FROM users").get();

if (existingUser.count === 0) {
  const now = new Date().toISOString();
  database.exec("BEGIN");
  try {
    database
      .prepare(
        `INSERT INTO offices (
          id, name, address, latitude, longitude, allowed_radius_meters, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "office_sudirman",
        "Kantor Pusat - Sudirman",
        "Gedung Sudirman Lantai 12, Jakarta Selatan",
        -6.2088,
        106.8456,
        100,
        now,
        now,
      );

    database
      .prepare(
        `INSERT INTO shifts (
          id, name, start_time, end_time, grace_period_minutes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run("shift_regular", "Reguler", "09:00", "17:00", 15, now, now);

    database
      .prepare(
        `INSERT INTO users (
          id, name, email, password_hash, avatar_url, role, office_id, shift_id, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "user_budi",
        "Budi Santoso",
        "budi@company.com",
        hashPassword("password123"),
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
        "employee",
        "office_sudirman",
        "shift_regular",
        1,
        now,
        now,
      );

    const records = [
      ["att_2026_05_15", "2026-05-15", "2026-05-15T01:57:00.000Z", "2026-05-15T10:06:00.000Z", "on_time", 489, 6, null],
      ["att_2026_05_14", "2026-05-14", "2026-05-14T02:12:00.000Z", "2026-05-14T10:20:00.000Z", "late", 488, 20, "Terlambat 12 menit"],
      ["att_2026_05_13", "2026-05-13", "2026-05-13T01:45:00.000Z", "2026-05-13T12:05:00.000Z", "overtime", 620, 125, null],
      ["att_2026_05_12", "2026-05-12", null, null, "sick", 0, 0, "Keterangan dokter terlampir"],
      ["att_2026_05_11", "2026-05-11", "2026-05-11T01:52:00.000Z", "2026-05-11T10:04:00.000Z", "on_time", 492, 4, null],
      ["att_2026_05_08", "2026-05-08", "2026-05-08T01:55:00.000Z", "2026-05-08T10:09:00.000Z", "on_time", 494, 9, null],
      ["att_2026_05_07", "2026-05-07", "2026-05-07T02:18:00.000Z", "2026-05-07T10:12:00.000Z", "late", 474, 12, "Terlambat 18 menit"],
      ["att_2026_05_06", "2026-05-06", "2026-05-06T01:47:00.000Z", "2026-05-06T10:03:00.000Z", "on_time", 496, 3, null],
      ["att_2026_05_05", "2026-05-05", "2026-05-05T01:58:00.000Z", "2026-05-05T10:01:00.000Z", "on_time", 483, 1, null],
    ];

    const insertRecord = database.prepare(
      `INSERT INTO attendance_records (
        id, user_id, attendance_date, check_in_at, check_out_at,
        check_in_latitude, check_in_longitude, check_in_accuracy_meters,
        check_out_latitude, check_out_longitude, check_out_accuracy_meters,
        check_in_distance_meters, check_out_distance_meters,
        status, work_duration_minutes, overtime_minutes, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const [id, attendanceDate, checkInAt, checkOutAt, status, workDuration, overtime, notes] of records) {
      insertRecord.run(
        id,
        "user_budi",
        attendanceDate,
        checkInAt,
        checkOutAt,
        checkInAt ? -6.2088 : null,
        checkInAt ? 106.8456 : null,
        checkInAt ? 12 : null,
        checkOutAt ? -6.2087 : null,
        checkOutAt ? 106.8457 : null,
        checkOutAt ? 15 : null,
        checkInAt ? 42 : null,
        checkOutAt ? 45 : null,
        status,
        workDuration,
        overtime,
        notes,
        now,
        now,
      );
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

database.close();
console.log(`WorkForce SQLite database is ready at ${databasePath}`);
