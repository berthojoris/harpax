import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { exportMonthlyReportCsv, ServiceError } from "@/server/services/workforce.service";
import { getCurrentMonthKey } from "@/lib/dates";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const month = request.nextUrl.searchParams.get("month") ?? getCurrentMonthKey();

  try {
    const csv = exportMonthlyReportCsv(user.id, month);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="attendance-report-${user.id}-${month}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof ServiceError ? error.message : "Unable to export report.";
    const status = error instanceof ServiceError ? error.status : 500;
    return NextResponse.json({ message }, { status });
  }
}
