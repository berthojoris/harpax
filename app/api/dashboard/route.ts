import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { getDashboardSummary, ServiceError } from "@/server/services/workforce.service";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json(getDashboardSummary(user.id));
  } catch (error) {
    const message = error instanceof ServiceError ? error.message : "Unable to load dashboard.";
    const status = error instanceof ServiceError ? error.status : 500;
    return NextResponse.json({ message }, { status });
  }
}
