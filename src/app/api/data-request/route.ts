import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { dataRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = dataRequestSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const email = body.email.toLowerCase().trim();

    const { data, error } = await supabase
      .from("data_requests")
      .insert({
        full_name: body.fullName,
        email,
        request_type: body.requestType,
        country: body.country,
        details: body.details || null,
        status: "new"
      })
      .select("id,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("email_logs").insert({
      email_type: "owner_data_request_notification",
      subject: `Data request: ${body.requestType} - ${email}`,
      status: "draft"
    });

    return NextResponse.json({ ok: true, request: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit data request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
