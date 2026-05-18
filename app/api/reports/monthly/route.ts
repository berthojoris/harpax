import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { reportQuerySchema } from "@/schemas/report.schema";
import { getMonthlyReport, ServiceError } from "@/server/services/workforce.service";
import { getCurrentMonthKey } from "@/lib/dates";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = reportQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

  try {
    return NextResponse.json(
      getMonthlyReport(user.id, {
        month: parsed.month ?? getCurrentMonthKey(),
        filter: parsed.filter ?? "all",
        page: parsed.page,
      }),
    );
  } catch (error) {
    const message = error instanceof ServiceError ? error.message : "Unable to load report.";
    const status = error instanceof ServiceError ? error.status : 500;
    return NextResponse.json({ message }, { status });
  }
}
