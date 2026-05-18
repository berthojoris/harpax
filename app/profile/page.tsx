import { Metadata } from "next";
import { ProfileView } from "@/features/profile/ProfileView";
import { requireCurrentUser } from "@/server/auth/session";
import { getDashboardSummary } from "@/server/services/workforce.service";

export const metadata: Metadata = {
  title: "Profil",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const summary = getDashboardSummary(user.id);
  return <ProfileView summary={summary} />;
}
