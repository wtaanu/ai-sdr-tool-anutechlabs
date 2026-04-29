"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { Agent } from "@/data/agents";

const categoryUseCases: Record<string, string[]> = {
  "Lead Generation": ["Lead qualification", "Follow-up automation", "Call booking", "CRM movement"],
  "Email Automation": ["Email drafting", "Reply handling", "Sequence planning", "Deliverability-aware workflows"],
  "LinkedIn Automation": ["Prospect research", "Connection strategy", "Conversation tracking", "Content-led outreach"],
  "Instagram Automation": ["DM handling", "Instagram content planning", "Lead capture", "Engagement workflows"],
  "Social Media Automation": ["Lead form routing", "Campaign intelligence", "Social listening", "Retargeting support"],
  "SEO Automation": ["Search intent mapping", "Landing page planning", "FAQ generation", "Programmatic SEO"],
  "Finance Automation": ["Invoice tracking", "Payment reminders", "Record updates", "Exception alerts"],
  "Compliance Automation": ["Consent tracking", "Policy workflows", "Request management", "Audit support"],
  "Business Automation": ["Document processing", "SOP creation", "Task routing", "Workflow automation"],
  "Industry Automation": ["Industry intake", "Client qualification", "Appointment routing", "Case summaries"]
};

export function AgentInterestModal({
  agent,
  onClose
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const useCases = categoryUseCases[agent.category] || categoryUseCases["Business Automation"];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [interestLogged, setInterestLogged] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{ id: string; userId: string; score: number; priority: string } | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    mobile: "",
    industry: "",
    businessType: "",
    businessSize: "",
    targetMarket: "",
    currentProblem: "",
    automationGoal: "",
    customRequirement: agent.id === 50 ? "" : "",
    budgetRange: "",
    timeline: "",
    remarks: ""
  });
  const [bookingForm, setBookingForm] = useState({
    preferredTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    notes: ""
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateBookingField(field: keyof typeof bookingForm, value: string) {
    setBookingForm((current) => ({ ...current, [field]: value }));
  }

  async function logOpenedInterest() {
    if (interestLogged || !form.email.includes("@")) return;
    setInterestLogged(true);
    try {
      await fetch("/api/agent-interest-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          agentId: agent.id,
          agentName: agent.name,
          agentSlug: agent.slug,
          pageUrl: window.location.pathname
        })
      });
    } catch {
      setInterestLogged(false);
    }
  }

  async function submitInterest() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedAgentIds: agent.id === 50 ? [] : [agent.id],
          ...form,
          customRequirement: form.customRequirement || (agent.id === 50 ? form.automationGoal : "")
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit interest.");
      }

      setSubmittedEnquiry({
        id: result.enquiry.id,
        userId: result.user.id,
        score: result.enquiry.ai_lead_score,
        priority: result.enquiry.ai_priority
      });
      setMessage("Interest submitted. This lead is now ready for review inside your AI SDR admin dashboard.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit interest.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestBooking() {
    setIsBooking(true);
    setBookingMessage("");

    try {
      if (!submittedEnquiry?.userId || !submittedEnquiry?.id) {
        throw new Error("Submit your interest before requesting a call.");
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: submittedEnquiry.userId,
          enquiryId: submittedEnquiry.id,
          ...bookingForm
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to request call.");
      }

      setBookingMessage("Call request saved. You will receive confirmation once the calendar invite is finalized.");
      setBookingComplete(true);
    } catch (error) {
      setBookingMessage(error instanceof Error ? error.message : "Unable to request call.");
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-sm">
      <section className="code-grid w-full max-w-5xl rounded-lg border border-orange-500/30 bg-[#0f1115] text-white shadow-2xl shadow-black">
        <div className="flex items-start justify-between gap-5 border-b border-orange-500/20 p-5 md:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-orange-500/30 bg-black/50 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-orange-300">
                {agent.category}
              </span>
              <span className="font-mono text-xs text-orange-400">agent::{String(agent.id).padStart(2, "0")}</span>
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">{agent.name}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{agent.outcome}</p>
          </div>
          <button
            aria-label="Close agent details"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-orange-500/30 bg-black/40 text-orange-300 transition hover:bg-orange-500 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-lg border border-orange-500/20 bg-black/45 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">how it works</p>
              <div className="mt-4 space-y-3">
                {agent.workflow.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-md bg-white/[0.03] p-3 font-mono text-sm text-slate-200">
                    <span className="text-orange-400">{index === 0 ? "input" : index === 1 ? "analyze" : "output"}</span>
                    <span className="text-slate-500">::</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((item) => (
                <div key={item} className="rounded-lg border border-orange-500/15 bg-[#151922] p-4">
                  <p className="font-mono text-xs text-orange-300">use_case</p>
                  <h3 className="mt-2 text-sm font-bold text-white">{item}</h3>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-orange-500/20 bg-[#151922] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">business fit</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                This agent is suitable when a business wants fewer manual steps, faster response time, cleaner records,
                and a repeatable workflow that can be tracked inside the AI SDR by AnutechLabs admin dashboard.
              </p>
            </div>
          </div>

          <form className="rounded-lg border border-orange-500/25 bg-black/55 p-5" onSubmit={(event) => { event.preventDefault(); void submitInterest(); }}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">show interest</p>
            <h3 className="mt-3 text-2xl font-black text-white">Tell us where this agent fits.</h3>
            <div className={`mt-5 space-y-4 ${submittedEnquiry ? "opacity-55" : ""}`}>
              <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onBlur={() => void logOpenedInterest()} onChange={(event) => updateField("email", event.target.value)} placeholder="Email address" required type="email" value={form.email} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("fullName", event.target.value)} placeholder="Name optional" value={form.fullName} />
                <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("mobile", event.target.value)} placeholder="Mobile optional" value={form.mobile} />
              </div>
              <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("industry", event.target.value)} placeholder="Industry type" required value={form.industry} />
              <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("businessType", event.target.value)} placeholder="Business type" required value={form.businessType} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("businessSize", event.target.value)} placeholder="Business size optional" value={form.businessSize} />
                <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("targetMarket", event.target.value)} placeholder="Target market/country" value={form.targetMarket} />
              </div>
              <textarea className="min-h-24 w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("currentProblem", event.target.value)} placeholder="Current problem or manual process" value={form.currentProblem} />
              <textarea className="min-h-28 w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("automationGoal", event.target.value)} placeholder="What do you want to automate or improve?" required value={form.automationGoal} />
              {agent.id === 50 && (
                <textarea className="min-h-24 w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("customRequirement", event.target.value)} placeholder="Describe your custom AI agent idea" value={form.customRequirement} />
              )}
              <textarea className="min-h-24 w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("remarks", event.target.value)} placeholder="Why are you interested? Add remarks or current tools." value={form.remarks} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("budgetRange", event.target.value)} placeholder="Budget range optional" value={form.budgetRange} />
                <input className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => updateField("timeline", event.target.value)} placeholder="Timeline" value={form.timeline} />
              </div>
              <button className="w-full rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400" disabled={isSubmitting || Boolean(submittedEnquiry)} type="submit">
                {isSubmitting ? "Submitting..." : "Submit interest"}
              </button>
              {message && (
                <p className={`rounded-md px-4 py-3 text-xs leading-5 ${message.startsWith("Interest submitted") ? "bg-orange-500/10 text-orange-200" : "bg-red-500/10 text-red-200"}`}>
                  {message}
                </p>
              )}
            </div>
            {submittedEnquiry && (
              <div className="mt-5 rounded-lg border border-orange-500/25 bg-orange-500/10 p-4">
                {bookingComplete ? (
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-300">journey complete</p>
                    <h4 className="mt-2 text-xl font-black text-white">Your call request is saved.</h4>
                    <p className="mt-3 text-sm leading-6 text-orange-100">
                      Your details, agent interest, lead score, and preferred call time are now in the AI SDR by AnutechLabs admin dashboard.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <a className="rounded-md border border-orange-400 bg-black/40 px-4 py-3 text-center text-sm font-bold text-orange-100 hover:bg-orange-500 hover:text-white" href="/ai-agents">
                        Explore more agents
                      </a>
                      <button className="rounded-md bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-400" onClick={onClose} type="button">
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-300">next step</p>
                    <h4 className="mt-2 text-lg font-black text-white">Request a consultation call</h4>
                    <p className="mt-2 text-xs leading-5 text-orange-100">
                      Lead priority: {submittedEnquiry.priority} · Initial score: {submittedEnquiry.score}
                    </p>
                    <div className="mt-4 space-y-3">
                      <input
                        className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
                        onChange={(event) => updateBookingField("preferredTime", event.target.value)}
                        type="datetime-local"
                        value={bookingForm.preferredTime}
                      />
                      <input
                        className="w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400"
                        onChange={(event) => updateBookingField("timezone", event.target.value)}
                        placeholder="Timezone"
                        value={bookingForm.timezone}
                      />
                      <textarea
                        className="min-h-20 w-full rounded-md border border-orange-500/20 bg-[#11141b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400"
                        onChange={(event) => updateBookingField("notes", event.target.value)}
                        placeholder="Preferred agenda or call notes"
                        value={bookingForm.notes}
                      />
                      <button
                        className="w-full rounded-md border border-orange-400 bg-black/40 px-5 py-3 text-sm font-black text-orange-100 transition hover:bg-orange-500 hover:text-white"
                        disabled={isBooking || !bookingForm.preferredTime}
                        onClick={requestBooking}
                        type="button"
                      >
                        {isBooking ? "Saving call request..." : "Request call booking"}
                      </button>
                      {bookingMessage && (
                        <p className={`rounded-md px-4 py-3 text-xs leading-5 ${bookingMessage.startsWith("Call request saved") ? "bg-orange-500/10 text-orange-100" : "bg-red-500/10 text-red-200"}`}>
                          {bookingMessage}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
