import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { loginSchema } from "@/schemas/auth.schema";
import { authenticateUser, createSession, ServiceError } from "@/server/services/workforce.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please check your login details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    const session = createSession(user.id);
    const response = NextResponse.json({ user });

    response.cookies.set(siteConfig.sessionCookieName, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });

    return response;
  } catch (error) {
    const message = error instanceof ServiceError ? error.message : "Unable to login. Please try again.";
    const status = error instanceof ServiceError ? error.status : 500;
    return NextResponse.json({ message }, { status });
  }
}
