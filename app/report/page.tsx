import { Metadata } from "next";
import { ReportView } from "@/features/report/ReportView";
import { getCurrentMonthKey } from "@/lib/dates";
import { reportQuerySchema } from "@/schemas/report.schema";
import { requireCurrentUser } from "@/server/auth/session";
import { getMonthlyReport } from "@/server/services/workforce.service";

export const metadata: Metadata = {
  title: "Laporan Kehadiran",
};

export const dynamic = "force-dynamic";

type ReportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const user = await requireCurrentUser();
  const params = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(params ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const query = reportQuerySchema.parse(normalizedParams);
  const report = getMonthlyReport(user.id, {
    month: query.month ?? getCurrentMonthKey(),
    filter: query.filter ?? "all",
    page: query.page,
  });

  return <ReportView report={report} />;
}
