export type AttendanceStatus =
  | "pending"
  | "on_time"
  | "late"
  | "overtime"
  | "incomplete"
  | "sick"
  | "leave"
  | "absent";

export type AttendanceFilter = "all" | "on_time" | "late" | "overtime" | "special";

export type UserRole = "employee" | "admin";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  officeId: string | null;
  shiftId: string | null;
};

export type Office = {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
};

export type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
};

export type AttendanceRecord = {
  id: string;
  userId: string;
  attendanceDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkInAccuracyMeters: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  checkOutAccuracyMeters: number | null;
  checkInDistanceMeters: number | null;
  checkOutDistanceMeters: number | null;
  status: AttendanceStatus;
  workDurationMinutes: number;
  overtimeMinutes: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
