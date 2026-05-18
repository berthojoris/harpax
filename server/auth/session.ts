import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getUserBySessionToken } from "@/server/services/workforce.service";
import type { AuthenticatedUser } from "@/server/domain/types";

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(siteConfig.sessionCookieName)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return getUserBySessionToken(token);
}

export async function requireCurrentUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
