"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, CalendarClock, CheckCircle2, Clock, DollarSign } from "lucide-react";
import {
  createSalesWasteAudit,
  formatMoney,
  type SalesCycleRange,
  type SalespeopleRange,
  type SalesWasteAudit,
  type WasteActivity
} from "@/lib/salesAudit";

const salespeopleOptions: SalespeopleRange[] = ["1-3", "4-10", "11-20", "20+"];
const cycleOptions: SalesCycleRange[] = ["7-14 days", "15-30 days", "30-60 days", "60+ days"];
const wasteOptions: WasteActivity[] = ["Lead entry", "CRM updates", "Follow-ups", "Data verification", "I'm not sure"];

const initialLead = {
  firstName: "",
  email: "",
  companyName: ""
};

const initialAnswers = {
  salespeople: "" as SalespeopleRange | "",
  salesCycle: "" as SalesCycleRange | "",
  biggestWaste: "" as WasteActivity | ""
};

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function conicGradient(report: SalesWasteAudit) {
  const colors = ["#f97316", "#111827", "#f59e0b", "#475569", "#fb923c"];
  let cursor = 0;
  const stops = report.activities.map((activity, index) => {
    const share = (activity.monthlyCost / report.totalMonthlyCost) * 100;
    const start = cursor;
    cursor += share;
    return `${colors[index]} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T | "";
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-base font-black text-slate-950">{label}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            className={`rounded-md border px-4 py-3 text-left text-sm font-bold transition ${
              value === option
                ? "border-orange-500 bg-orange-50 text-orange-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function AuditPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Audit preview</p>
            <p className="mt-2 text-xl font-black text-slate-950">$100,100/year</p>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[conic-gradient(#f97316_0_34%,#111827_34%_58%,#f59e0b_58%_79%,#64748b_79%_100%)]">
            <div className="h-10 w-10 rounded-full bg-white" />
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {[
            ["Lead Entry", "$32.5k/year", "bg-orange-500"],
            ["CRM Updates", "$26k/year", "bg-slate-950"],
            ["Follow-ups", "$20.8k/year", "bg-amber-500"],
            ["Data Work", "$20.8k/year", "bg-slate-500"]
          ].map(([label, value, color]) => (
            <div className="grid grid-cols-[92px_1fr_88px] items-center gap-3 text-xs" key={label}>
              <span className="font-bold text-slate-700">{label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-slate-200">
                <span className={`block h-full rounded-full ${color}`} style={{ width: value === "$32.5k/year" ? "82%" : "62%" }} />
              </span>
              <span className="text-right font-black text-slate-950">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Your result will show exact waste, cost by activity, savings roadmap, implementation phases, and the fastest automation win.
      </p>
    </div>
  );
}

export function FreeAuditPanel() {
  const [lead, setLead] = useState(initialLead);
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState<"lead" | "questions" | "results">("lead");
  const [screen, setScreen] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState<SalesWasteAudit | null>(null);
  const [tracking, setTracking] = useState<{ auditId?: string; userId?: string }>({});
  const meetingUrl = process.env.NEXT_PUBLIC_DEFAULT_MEETING_URL || process.env.NEXT_PUBLIC_MEETING_URL || "/#contact-us";

  const localReport = useMemo(() => {
    if (!answers.salespeople || !answers.salesCycle || !answers.biggestWaste) return null;
    return createSalesWasteAudit({
      firstName: lead.firstName,
      email: lead.email,
      companyName: lead.companyName,
      salespeople: answers.salespeople,
      salesCycle: answers.salesCycle,
      biggestWaste: answers.biggestWaste
    });
  }, [answers, lead]);

  function updateLead(field: keyof typeof lead, value: string) {
    setLead((current) => ({ ...current, [field]: value }));
  }

  async function startAuditLead() {
    setIsSavingLead(true);
    setMessage("");

    try {
      const response = await fetch("/api/free-audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        setTracking({ auditId: result.auditId, userId: result.userId });
      }
    } finally {
      setIsSavingLead(false);
      setStep("questions");
    }
  }

  async function createAudit() {
    if (!localReport) return;
    setIsSubmitting(true);
    setMessage("");
    setReport(localReport);
    setStep("results");

    try {
      const response = await fetch("/api/free-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          ...answers,
          auditId: tracking.auditId,
          userId: tracking.userId,
          consentToAudit: true
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Audit saved locally, but email delivery failed.");
      }

      if (result.report) {
        setReport(result.report);
      }
      setMessage("Your audit report has been created and emailed to you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your audit is visible here, but email delivery needs review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function trackCallClick() {
    void fetch("/api/free-audit/call-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auditId: tracking.auditId,
        email: lead.email,
        firstName: lead.firstName,
        companyName: lead.companyName
      })
    });
  }

  if (step === "questions") {
    return (
      <section id="free-audit" className="min-h-screen bg-mist px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Great. Let us customize your audit.</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Answer these 3 quick questions.</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">This takes 30 seconds and helps calculate your personalized sales-waste number.</p>

          <div className="mt-8 space-y-8">
            <OptionGroup label="1. How many salespeople do you have?" onChange={(value) => setAnswers((current) => ({ ...current, salespeople: value }))} options={salespeopleOptions} value={answers.salespeople} />
            <OptionGroup label="2. What's your average sales cycle?" onChange={(value) => setAnswers((current) => ({ ...current, salesCycle: value }))} options={cycleOptions} value={answers.salesCycle} />
            <OptionGroup label="3. Which activity wastes the MOST time for your team?" onChange={(value) => setAnswers((current) => ({ ...current, biggestWaste: value }))} options={wasteOptions} value={answers.biggestWaste} />
          </div>

          <button
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!localReport || isSubmitting}
            onClick={() => void createAudit()}
            type="button"
          >
            {isSubmitting ? "Creating audit..." : "Next"}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    );
  }

  if (step === "results" && report) {
    const screens = ["Executive Summary", "Detailed Breakdown", "Optimization Roadmap", "Implementation Plan", "Next Steps"];

    return (
      <section id="free-audit-results" className="min-h-screen bg-white px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Personalized sales automation audit</p>
              <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">
                Your Sales Team Is Wasting {formatMoney(report.totalAnnualCost)} Per Year
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">Here is exactly where and how much it is costing you.</p>
            </div>
            <a className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white" href={meetingUrl} onClick={trackCallClick}>
              <CalendarClock size={16} />
              Book Strategy Call
            </a>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {screens.map((item, index) => (
              <button
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-bold ${screen === index ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`}
                key={item}
                onClick={() => setScreen(index)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          {screen === 0 && (
            <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr] lg:items-center">
              <div className="mx-auto grid h-72 w-72 place-items-center rounded-full" style={{ background: conicGradient(report) }}>
                <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center shadow-soft">
                  <span className="text-xs font-bold uppercase text-slate-500">Total</span>
                  <span className="text-2xl font-black text-slate-950">{report.totalWeeklyHours} hrs/wk</span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.activities.map((activity) => (
                  <div className="rounded-lg border border-slate-200 bg-mist p-5" key={activity.key}>
                    <p className="font-black text-slate-950">{activity.label}</p>
                    <p className="mt-2 text-sm text-slate-600">{activity.hoursPerWeek} hours/week ({formatMoney(activity.monthlyCost)}/month)</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-orange-600">{percent(activity.monthlyCost, report.totalMonthlyCost)}% of waste</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === 1 && (
            <div className="mt-8">
              <h2 className="text-3xl font-black text-slate-950">Where Your Team Wastes Time</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {report.activities.slice(0, 4).map((activity) => (
                  <div className="rounded-lg border border-slate-200 p-5" key={activity.key}>
                    <h3 className="text-xl font-black text-slate-950">{activity.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">Current approach: {activity.currentApproach}</p>
                    <p className="mt-2 text-sm font-bold text-slate-800">Hours/week: {activity.hoursPerWeek} hours</p>
                    <p className="mt-2 text-sm font-bold text-slate-800">Cost/month: {formatMoney(activity.monthlyCost)}</p>
                    <p className="mt-2 text-sm leading-6 text-orange-700">Quick win: {activity.quickWin}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-300">Total annual cost</p>
                <p className="mt-2 text-4xl font-black">{formatMoney(report.totalAnnualCost)}</p>
              </div>
            </div>
          )}

          {screen === 2 && (
            <div className="mt-8">
              <h2 className="text-3xl font-black text-slate-950">Here Is How To Save {report.totalFreedHours} Hours/Week</h2>
              <div className="mt-5 space-y-4">
                {report.roadmap.slice(0, 4).map((activity, index) => (
                  <div className="rounded-lg border border-slate-200 p-5" key={activity.key}>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Priority {index + 1}{index === 0 ? " (Highest ROI)" : ""}: {activity.label}</p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
                      <p>Current cost: <strong>{formatMoney(activity.monthlyCost)}/month</strong></p>
                      <p>Savings: <strong>{formatMoney(activity.savingsMonthly)}/month</strong></p>
                      <p>Implementation: <strong>{activity.implementation}</strong></p>
                      <p>Impact: <strong>{activity.freedHours} hours/week freed</strong></p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-orange-50 p-5">
                  <DollarSign className="text-orange-600" size={22} />
                  <p className="mt-2 text-sm font-bold text-orange-900">Total potential savings</p>
                  <p className="mt-1 text-2xl font-black text-orange-900">{formatMoney(report.totalSavingsAnnual)}/year</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-5">
                  <Clock className="text-slate-700" size={22} />
                  <p className="mt-2 text-sm font-bold text-slate-700">Timeline</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{report.timeline}</p>
                </div>
                <div className="rounded-lg bg-slate-950 p-5 text-white">
                  <BarChart3 className="text-orange-300" size={22} />
                  <p className="mt-2 text-sm font-bold text-slate-300">Payback period</p>
                  <p className="mt-1 text-2xl font-black">{report.paybackMonths} months</p>
                </div>
              </div>
            </div>
          )}

          {screen === 3 && (
            <div className="mt-8">
              <h2 className="text-3xl font-black text-slate-950">Here Is Exactly How To Implement This</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {report.phases.map((phase) => (
                  <div className="rounded-lg border border-slate-200 p-5" key={phase.title}>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">{phase.week}</p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">{phase.title}</h3>
                    <p className="mt-3 text-sm text-slate-600">Action: {phase.action}</p>
                    <p className="mt-2 text-sm text-slate-600">Tools: {phase.tools}</p>
                    <p className="mt-2 text-sm text-slate-600">Time investment: {phase.setupTime}</p>
                    <p className="mt-2 text-sm text-slate-600">Ongoing: {phase.ongoing}</p>
                    <p className="mt-3 rounded-md bg-orange-50 p-3 text-sm font-bold text-orange-800">Result: {phase.result}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-300">Total freed time</p>
                <p className="mt-2 text-4xl font-black">{report.totalFreedHours} hours/week</p>
                <p className="mt-2 text-sm text-slate-300">Total annual value: {formatMoney(report.totalSavingsAnnual)}</p>
              </div>
            </div>
          )}

          {screen === 4 && (
            <div className="mt-8 rounded-lg border border-slate-200 bg-mist p-6 sm:p-8">
              <h2 className="text-3xl font-black text-slate-950">You Have Identified {formatMoney(report.totalSavingsAnnual)} In Opportunity</h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
                Your team could reclaim {report.totalFreedHours} hours/week and {formatMoney(report.totalSavingsAnnual)} in annual value. Implementation works best when the workflow is mapped clearly, priorities are chosen carefully, and the first automation starts with the fastest ROI area.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                {[
                  "Validate these numbers with your actual data",
                  "Identify which phase delivers value fastest",
                  "Map your 90-day implementation roadmap",
                  "Answer technical questions before you build"
                ].map((item) => (
                  <div className="flex items-start gap-3 rounded-md bg-white p-4" key={item}>
                    <CheckCircle2 className="mt-0.5 text-orange-500" size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <a className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white" href={meetingUrl} onClick={trackCallClick}>
                Book Your 30-Minute Strategy Call
                <ArrowRight size={16} />
              </a>
              <p className="mt-4 text-sm leading-6 text-slate-600">Zero obligation. You still leave with a clear plan even if we do not work together.</p>
            </div>
          )}

          {message && <p className="mt-5 rounded-md bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800">{message}</p>}
        </div>
      </section>
    );
  }

  return (
    <section id="free-audit" className="min-h-screen bg-white px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Free sales automation audit</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            See Where Your Sales Team Wastes Time
          </h1>
          <p className="mt-5 text-lg font-bold text-slate-700">5-minute audit. No credit card. Instant results.</p>
          <div className="mt-8 max-w-lg rounded-lg border border-slate-200 bg-mist p-5 shadow-soft">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void startAuditLead();
              }}
            >
              <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateLead("firstName", event.target.value)} placeholder="First Name" required value={lead.firstName} />
              <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateLead("email", event.target.value)} placeholder="Email" required type="email" value={lead.email} />
              <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateLead("companyName", event.target.value)} placeholder="Company Name" required value={lead.companyName} />
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400 disabled:bg-slate-300" disabled={isSavingLead} type="submit">
                {isSavingLead ? "Saving..." : "Get My Free Audit"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
        <AuditPreview />
      </div>
    </section>
  );
}
