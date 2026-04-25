import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { leadStatusSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = leadStatusSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id,user_id,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: enquiry.user_id,
      enquiry_id: enquiry.id,
      activity_type: "admin_status_updated",
      details: {
        status: body.status,
        note: body.note || "",
        admin: session.email
      }
    });

    return NextResponse.json({ ok: true, enquiry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
