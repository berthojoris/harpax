import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { locationPayloadSchema } from "@/schemas/attendance.schema";
import { recordCheckIn, ServiceError } from "@/server/services/workforce.service";
import { formatTimeWithZone } from "@/lib/dates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const payload = await request.json().catch(() => null);
  const parsed = locationPayloadSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ message: "Invalid location payload." }, { status: 400 });

  try {
    const record = recordCheckIn(user.id, parsed.data, request.headers.get("user-agent"));
    return NextResponse.json({
      success: true,
      message: "Berhasil Absen Masuk",
      recordedAt: formatTimeWithZone(record.checkInAt),
      record: {
        id: record.id,
        checkInAt: record.checkInAt,
        status: record.status,
        distanceMeters: record.checkInDistanceMeters,
      },
    });
  } catch (error) {
    const message = error instanceof ServiceError ? error.message : "Unable to record attendance. Please try again.";
    const status = error instanceof ServiceError ? error.status : 500;
    return NextResponse.json({ message }, { status });
  }
}
