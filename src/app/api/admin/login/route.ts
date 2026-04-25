import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminSessionMaxAge, getAdminCookieName, signAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { adminLoginSchema } from "@/lib/validators";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("admin_login");
  try {
    const body = adminLoginSchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();
    const allowedEmail = (process.env.ADMIN_ALLOWED_EMAIL || "wtaanu@gmail.com").toLowerCase().trim();

    await logTransaction({ traceId, eventName: "admin_login_started", route: "/api/admin/login", email, status: "started" });

    if (email !== allowedEmail) {
      await logTransaction({ traceId, level: "warn", eventName: "admin_login_email_blocked", route: "/api/admin/login", email, status: "blocked" });
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    if (process.env.ADMIN_PASSWORD) {
      if (body.password !== process.env.ADMIN_PASSWORD) {
        await logTransaction({ traceId, level: "warn", eventName: "admin_login_password_failed", route: "/api/admin/login", email, status: "failed" });
        return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
      }

      const cookieStore = await cookies();
      cookieStore.set(getAdminCookieName(), signAdminSession(email), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: adminSessionMaxAge,
        path: "/"
      });
      await logTransaction({ traceId, eventName: "admin_login_completed", route: "/api/admin/login", email, status: "completed", metadata: { mode: "env_password" } });
      return NextResponse.json({ ok: true, traceId });
    }

    const supabase = getSupabaseAdminClient();

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("email,password_hash,role")
      .eq("email", email)
      .maybeSingle();

    if (error || !admin) {
      await logTransaction({ traceId, level: "warn", eventName: "admin_login_user_missing", route: "/api/admin/login", email, status: "failed" });
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(body.password, admin.password_hash);
    if (!isValid) {
      await logTransaction({ traceId, level: "warn", eventName: "admin_login_bcrypt_failed", route: "/api/admin/login", email, status: "failed" });
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(getAdminCookieName(), signAdminSession(email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: adminSessionMaxAge,
      path: "/"
    });

    await logTransaction({ traceId, eventName: "admin_login_completed", route: "/api/admin/login", email, status: "completed", metadata: { mode: "supabase_bcrypt" } });

    return NextResponse.json({ ok: true, traceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to login.";
    await logTransaction({ traceId, level: "error", eventName: "admin_login_failed", route: "/api/admin/login", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
