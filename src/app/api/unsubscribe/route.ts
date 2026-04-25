import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { unsubscribeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = unsubscribeSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const email = body.email.toLowerCase().trim();

    const { data: user } = await supabase
      .from("public_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    await supabase.from("email_suppressions").upsert(
      {
        email,
        reason: body.reason || null,
        source: "unsubscribe_page"
      },
      { onConflict: "email" }
    );

    if (user?.id) {
      await supabase.from("consent_logs").insert({
        user_id: user.id,
        consent_type: "marketing",
        status: "withdrawn",
        source_url: "unsubscribe_page"
      });
      await supabase.from("activity_timeline").insert({
        user_id: user.id,
        activity_type: "unsubscribed",
        details: { reason: body.reason || "" }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to unsubscribe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
