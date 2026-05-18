import { Metadata } from "next";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";
import { requireCurrentUser } from "@/server/auth/session";
import { getAttendancePageData } from "@/server/services/workforce.service";

export const metadata: Metadata = {
  title: "Absen",
};

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const user = await requireCurrentUser();
  const data = getAttendancePageData(user.id);
  return <AttendanceClient data={data} />;
}
