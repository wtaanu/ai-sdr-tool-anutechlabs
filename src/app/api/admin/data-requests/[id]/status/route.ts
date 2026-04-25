import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { dataRequestStatusSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = dataRequestStatusSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("data_requests")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id,email,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("email_logs").insert({
      email_type: "admin_data_request_status_update",
      subject: `Data request ${body.status}: ${data.email}`,
      status: "draft"
    });

    return NextResponse.json({ ok: true, request: data, admin: session.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update data request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
