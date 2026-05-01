import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
