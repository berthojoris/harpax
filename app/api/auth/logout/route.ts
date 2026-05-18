import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getSessionToken } from "@/server/auth/session";
import { deleteSession } from "@/server/services/workforce.service";

export const runtime = "nodejs";

export async function POST() {
  const token = await getSessionToken();
  if (token) deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set(siteConfig.sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
