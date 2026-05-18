import { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { requireCurrentUser } from "@/server/auth/session";
import { getDashboardSummary } from "@/server/services/workforce.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const summary = getDashboardSummary(user.id);
  return <DashboardView summary={summary} />;
}
