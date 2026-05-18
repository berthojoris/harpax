import { getJakartaMinutes, parseTimeToMinutes } from "@/lib/dates";
import type { AttendanceStatus, Shift } from "@/server/domain/types";

export function classifyCheckIn(now: Date, shift: Shift): AttendanceStatus {
  const checkInMinutes = getJakartaMinutes(now);
  const allowedMinutes = parseTimeToMinutes(shift.startTime) + shift.gracePeriodMinutes;
  return checkInMinutes <= allowedMinutes ? "on_time" : "late";
}

export function calculateWorkDurationMinutes(checkInAt: string, checkOutAt: string): number {
  return Math.max(
    0,
    Math.round((new Date(checkOutAt).getTime() - new Date(checkInAt).getTime()) / 60_000),
  );
}

export function calculateOvertimeMinutes(checkOut: Date, shift: Shift): number {
  return Math.max(0, getJakartaMinutes(checkOut) - parseTimeToMinutes(shift.endTime));
}

export function resolveCheckoutStatus(previousStatus: AttendanceStatus, overtimeMinutes: number): AttendanceStatus {
  if (previousStatus === "late") return "late";
  return overtimeMinutes > 0 ? "overtime" : previousStatus;
}

export function getStatusLabel(status: AttendanceStatus): string {
  const labels: Record<AttendanceStatus, string> = {
    pending: "Belum Absen",
    on_time: "Tepat Waktu",
    late: "Terlambat",
    overtime: "Lembur",
    incomplete: "Belum Lengkap",
    sick: "Sakit",
    leave: "Cuti",
    absent: "Tidak Hadir",
  };

  return labels[status];
}
