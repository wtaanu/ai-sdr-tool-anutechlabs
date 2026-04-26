import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { enquirySchema } from "@/lib/validators";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { analyzeLead } from "@/lib/leadAnalysis";

export async function POST(request: Request) {
  try {
    const body = enquirySchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data: user, error: userError } = await supabase
      .from("public_users")
      .select("id,email,full_name,is_email_verified")
      .eq("id", body.userId)
      .eq("is_email_verified", true)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "Verified profile not found. Please subscribe and verify first." }, { status: 403 });
    }

    const analysis = await analyzeLead({
      fullName: user.full_name,
      email: user.email,
      selectedAgentIds: body.selectedAgentIds,
      customRequirement: body.customRequirement || undefined,
      industry: body.industry,
      businessType: body.businessType,
      currentProblem: body.currentProblem || undefined,
      automationGoal: body.automationGoal,
      budgetRange: body.budgetRange || undefined,
      timeline: body.timeline || undefined,
      remarks: body.remarks || undefined
    });

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert({
        user_id: body.userId,
        selected_agent_ids: body.selectedAgentIds,
        custom_requirement: body.customRequirement || null,
        industry: body.industry,
        business_type: body.businessType,
        business_size: body.businessSize || null,
        target_market: body.targetMarket || null,
        current_problem: body.currentProblem || null,
        automation_goal: body.automationGoal,
        budget_range: body.budgetRange || null,
        timeline: body.timeline || null,
        remarks: body.remarks || null,
        ai_summary: analysis.summary,
        ai_lead_score: analysis.leadScore,
        ai_priority: analysis.priority,
        status: "New Lead"
      })
      .select("id,ai_summary,ai_lead_score,ai_priority,status")
      .single();

    if (enquiryError) {
      return NextResponse.json({ error: enquiryError.message }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: body.userId,
      enquiry_id: enquiry.id,
      activity_type: "interest_submitted",
      details: {
        selectedAgentIds: body.selectedAgentIds,
        aiLeadScore: analysis.leadScore,
        aiPriority: analysis.priority,
        suggestedReply: analysis.suggestedReply,
        callAgenda: analysis.callAgenda
      }
    });

    if (body.selectedAgentIds.length) {
      await supabase
        .from("agent_interest_events")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          enquiry_id: enquiry.id
        })
        .eq("user_id", body.userId)
        .in("agent_id", body.selectedAgentIds)
        .eq("status", "opened")
        .is("submitted_at", null);
    }

    const clientEmailResult = await sendBrandedEmail({
      to: [
        {
          email: user.email,
          firstName: user.full_name.split(" ")[0],
          company: body.businessType,
          country: body.targetMarket || "",
          persona: "ai_sdr_lead",
          target: body.automationGoal
        }
      ],
      subject: "We received your AI agent requirement",
      content: withComplianceFooter(`Hi {{first_name}},

Thanks for sharing your AI agent requirement with AI SDR by AnutechLabs.

Our system has captured your business context and initial requirement. The next best step is to request a consultation call so we can understand your workflow and suggest the right agent or custom build.`)
    });

    await supabase.from("email_logs").insert({
      user_id: body.userId,
      enquiry_id: enquiry.id,
      email_type: "client_interest_confirmation",
      subject: "We received your AI agent requirement",
      status: clientEmailResult.status,
      provider_message_id: clientEmailResult.detail,
      sent_at: clientEmailResult.sent ? new Date().toISOString() : null
    });

    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
    const ownerEmailResult = ownerEmail
      ? await sendBrandedEmail({
          to: [
            {
              email: ownerEmail,
              firstName: "Owner",
              company: "AnutechLabs",
              persona: "owner_alert",
              target: "new enquiry"
            }
          ],
          subject: `New AI SDR interest: ${body.industry} - ${analysis.priority}`,
          content: `New verified enquiry received.

Name: ${user.full_name}
Email: ${user.email}
Industry: ${body.industry}
Business type: ${body.businessType}
Lead score: ${analysis.leadScore}
Priority: ${analysis.priority}

Summary:
${analysis.summary}

Suggested reply:
${analysis.suggestedReply}

Call agenda:
${analysis.callAgenda.join("\n")}`
        })
      : { status: "draft", sent: false, detail: "OWNER_NOTIFICATION_EMAIL is not configured." };

    await supabase.from("email_logs").insert({
      user_id: body.userId,
      enquiry_id: enquiry.id,
      email_type: "owner_new_interest_notification",
      subject: `New AI SDR interest: ${body.industry}`,
      status: ownerEmailResult.status,
      provider_message_id: ownerEmailResult.detail,
      sent_at: ownerEmailResult.sent ? new Date().toISOString() : null
    });

    return NextResponse.json({ ok: true, enquiry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit enquiry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
