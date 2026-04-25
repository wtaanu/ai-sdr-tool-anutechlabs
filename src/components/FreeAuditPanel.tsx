"use client";

import { useState } from "react";
import { BarChart3, FileText, MailCheck, Sparkles } from "lucide-react";
import { isVisitorVerified, openSubscribeGate } from "@/components/SubscribeGate";

type AuditReport = {
  headline: string;
  executiveSummary: string;
  opportunityScore: number;
  roiPotential: string;
  estimatedMonthlyLeakage: string;
  matchedAgents: Array<{ id: number; name: string; slug: string; reason: string }>;
  analytics: Array<{ label: string; value: string; insight: string }>;
  problemMap: string[];
  roadmap: string[];
  quickWins: string[];
};

const initialForm = {
  industry: "",
  businessType: "",
  companyWebsite: "",
  targetMarket: "",
  monthlyLeads: "",
  averageOrderValue: "",
  currentTools: "",
  responseTime: "",
  teamSize: "",
  biggestProblem: "",
  growthGoal: "",
  consentToAudit: false
};

export function FreeAuditPanel() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitAudit() {
    setIsSubmitting(true);
    setMessage("");

    try {
      if (!isVisitorVerified()) {
        openSubscribeGate();
        throw new Error("Verify your email first. Your free audit will unlock immediately after OTP verification.");
      }

      const rawUser = window.localStorage.getItem("anutechlabs_verified_user");
      const user = rawUser ? JSON.parse(rawUser) as { id?: string } : null;

      if (!user?.id) {
        openSubscribeGate();
        throw new Error("Verified profile not found. Please verify again.");
      }

      const response = await fetch("/api/free-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user.id })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to create audit.");
      }

      setReport(result.report);
      setMessage("Audit created. The same report is being emailed as a PDF.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create audit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="free-audit" className="bg-white py-20">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
              <Sparkles size={16} />
              Free audit today
            </div>
            <h2 className="mt-5 text-4xl font-black leading-tight text-slate-950">
              Get a free AI automation audit before choosing any agent.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Share your lead flow, tools, response time, and growth goal. AI SDR will create an on-screen report with analytics, ROI direction, recommended agents, and a practical roadmap. A PDF copy is emailed automatically.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: BarChart3, label: "Analytics score" },
                { icon: FileText, label: "PDF report" },
                { icon: MailCheck, label: "Consent logged" }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 p-4">
                  <item.icon className="text-orange-500" size={22} />
                  <p className="mt-3 text-sm font-bold text-slate-800">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-lg border border-slate-200 bg-mist p-5 shadow-soft" onSubmit={(event) => { event.preventDefault(); void submitAudit(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("industry", event.target.value)} placeholder="Industry" required value={form.industry} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("businessType", event.target.value)} placeholder="Business type" required value={form.businessType} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("companyWebsite", event.target.value)} placeholder="Website optional" value={form.companyWebsite} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("targetMarket", event.target.value)} placeholder="Target market/country" value={form.targetMarket} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("monthlyLeads", event.target.value)} placeholder="Monthly leads/enquiries" value={form.monthlyLeads} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("averageOrderValue", event.target.value)} placeholder="Avg order/deal value" value={form.averageOrderValue} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("responseTime", event.target.value)} placeholder="Average response time" value={form.responseTime} />
              <input className="rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("teamSize", event.target.value)} placeholder="Team size" value={form.teamSize} />
            </div>
            <textarea className="mt-4 min-h-24 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("currentTools", event.target.value)} placeholder="Current tools: CRM, WhatsApp, Sheets, email, website forms, Apollo, etc." value={form.currentTools} />
            <textarea className="mt-4 min-h-28 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("biggestProblem", event.target.value)} placeholder="Biggest problem you want to fix" required value={form.biggestProblem} />
            <textarea className="mt-4 min-h-28 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("growthGoal", event.target.value)} placeholder="What should improve in the next 30-90 days?" required value={form.growthGoal} />
            <label className="mt-4 flex gap-3 text-xs leading-5 text-slate-600">
              <input className="mt-1" checked={form.consentToAudit} onChange={(event) => updateField("consentToAudit", event.target.checked)} required type="checkbox" />
              <span>I agree that AnutechLabs can analyze this information to create my free audit report and email the PDF with unsubscribe/privacy options.</span>
            </label>
            <button className="mt-5 w-full rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating audit..." : "Get your free audit today"}
            </button>
            {message && (
              <p className={`mt-4 rounded-md px-4 py-3 text-sm ${message.startsWith("Audit created") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                {message}
              </p>
            )}
          </form>
        </div>

        {report && (
          <article className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">AI audit report</p>
                <h3 className="mt-3 text-3xl font-black text-slate-950">{report.headline}</h3>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{report.executiveSummary}</p>
              </div>
              <div className="rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-300">opportunity</p>
                <p className="mt-2 text-4xl font-black">{report.opportunityScore}/100</p>
                <p className="mt-2 text-sm text-slate-300">{report.roiPotential}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {report.analytics.map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-600">{item.label}</p>
                  <p className="mt-2 text-xl font-black text-slate-950">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{item.insight}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div>
                <h4 className="font-black text-slate-950">Recommended agents</h4>
                <div className="mt-4 space-y-3">
                  {report.matchedAgents.map((agent) => (
                    <a key={agent.id} className="block rounded-md border border-orange-200 bg-orange-50 p-4" href={`/ai-agents/${agent.slug}`}>
                      <p className="font-bold text-orange-800">{agent.name}</p>
                      <p className="mt-2 text-xs leading-5 text-orange-900">{agent.reason}</p>
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-black text-slate-950">Roadmap</h4>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {report.roadmap.map((item, index) => <li key={item}>{index + 1}. {item}</li>)}
                </ol>
              </div>
              <div>
                <h4 className="font-black text-slate-950">Quick wins</h4>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {report.quickWins.map((item) => <li key={item}>- {item}</li>)}
                </ul>
                <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{report.estimatedMonthlyLeakage}</p>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
