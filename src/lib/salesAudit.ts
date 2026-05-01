export type SalespeopleRange = "1-3" | "4-10" | "11-20" | "20+";
export type SalesCycleRange = "7-14 days" | "15-30 days" | "30-60 days" | "60+ days";
export type WasteActivity = "Lead entry" | "CRM updates" | "Follow-ups" | "Data verification" | "I'm not sure";

export type SalesWasteAuditInput = {
  firstName: string;
  email: string;
  companyName: string;
  salespeople: SalespeopleRange;
  salesCycle: SalesCycleRange;
  biggestWaste: WasteActivity;
};

export type SalesWasteActivity = {
  key: string;
  label: string;
  currentApproach: string;
  hoursPerWeek: number;
  monthlyCost: number;
  annualCost: number;
  quickWin: string;
  savingsMonthly: number;
  savingsAnnual: number;
  freedHours: number;
  implementation: string;
};

export type SalesWasteAudit = SalesWasteAuditInput & {
  averageSalespeople: number;
  totalWeeklyHours: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  totalSavingsAnnual: number;
  totalFreedHours: number;
  paybackMonths: number;
  timeline: string;
  topPriority: SalesWasteActivity;
  activities: SalesWasteActivity[];
  roadmap: SalesWasteActivity[];
  phases: Array<{
    title: string;
    week: string;
    action: string;
    tools: string;
    setupTime: string;
    ongoing: string;
    result: string;
  }>;
};

const teamSizeMap: Record<SalespeopleRange, number> = {
  "1-3": 2,
  "4-10": 7,
  "11-20": 15,
  "20+": 25
};

const cycleMultiplier: Record<SalesCycleRange, number> = {
  "7-14 days": 0.85,
  "15-30 days": 1,
  "30-60 days": 1.15,
  "60+ days": 1.3
};

const baseActivities = [
  {
    key: "lead-entry",
    label: "Lead Entry",
    baseHours: 12.5,
    currentApproach: "Manual capture from forms, inboxes, sheets, LinkedIn, and campaign lists",
    quickWin: "Consolidate every lead source into one tracked pipeline",
    implementation: "1 week",
    savingsRate: 0.72
  },
  {
    key: "crm-updates",
    label: "CRM Updates",
    baseHours: 10,
    currentApproach: "Manual copy/paste between email, CRM, sheets, and notes",
    quickWin: "Automate data flow and status updates between tools",
    implementation: "1 week",
    savingsRate: 0.7
  },
  {
    key: "follow-ups",
    label: "Follow-ups",
    baseHours: 8,
    currentApproach: "Manual emails one-by-one with inconsistent timing",
    quickWin: "Set up personalized sequences with reply and unsubscribe controls",
    implementation: "2 weeks",
    savingsRate: 0.75
  },
  {
    key: "data-verification",
    label: "Data Verification",
    baseHours: 8,
    currentApproach: "Manual checking for valid emails, duplicates, and missing fields",
    quickWin: "Add built-in validation before every campaign or handoff",
    implementation: "3 weeks",
    savingsRate: 0.68
  },
  {
    key: "other",
    label: "Other Sales Admin",
    baseHours: 4,
    currentApproach: "Manual reporting, reminders, notes, and handoffs",
    quickWin: "Standardize tasks and reports inside one operating dashboard",
    implementation: "2 weeks",
    savingsRate: 0.55
  }
];

function roundMoney(value: number) {
  return Math.round(value / 100) * 100;
}

function roundHours(value: number) {
  return Math.max(1, Math.round(value));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function createSalesWasteAudit(input: SalesWasteAuditInput): SalesWasteAudit {
  const averageSalespeople = teamSizeMap[input.salespeople] || 7;
  const scale = Math.max(0.35, Math.min(4, averageSalespeople / 7));
  const cycle = cycleMultiplier[input.salesCycle] || 1;
  const hourlyCost = 50;

  const activities = baseActivities.map((activity) => {
    const isFocus = activity.label === input.biggestWaste;
    const focusMultiplier = isFocus ? 1.35 : input.biggestWaste === "I'm not sure" ? 1.08 : 1;
    const hoursPerWeek = roundHours(activity.baseHours * scale * cycle * focusMultiplier);
    const monthlyCost = roundMoney(hoursPerWeek * hourlyCost * 4);
    const annualCost = monthlyCost * 12;
    const freedHours = roundHours(hoursPerWeek * activity.savingsRate);
    const savingsMonthly = roundMoney(monthlyCost * activity.savingsRate);

    return {
      key: activity.key,
      label: activity.label,
      currentApproach: activity.currentApproach,
      hoursPerWeek,
      monthlyCost,
      annualCost,
      quickWin: activity.quickWin,
      savingsMonthly,
      savingsAnnual: savingsMonthly * 12,
      freedHours,
      implementation: activity.implementation
    };
  });

  const totalWeeklyHours = activities.reduce((sum, activity) => sum + activity.hoursPerWeek, 0);
  const totalMonthlyCost = activities.reduce((sum, activity) => sum + activity.monthlyCost, 0);
  const totalAnnualCost = activities.reduce((sum, activity) => sum + activity.annualCost, 0);
  const totalSavingsAnnual = activities.reduce((sum, activity) => sum + activity.savingsAnnual, 0);
  const totalFreedHours = activities.reduce((sum, activity) => sum + activity.freedHours, 0);
  const roadmap = [...activities].sort((a, b) => b.savingsAnnual - a.savingsAnnual);
  const topPriority = roadmap[0];

  return {
    ...input,
    averageSalespeople,
    totalWeeklyHours,
    totalMonthlyCost,
    totalAnnualCost,
    totalSavingsAnnual,
    totalFreedHours,
    paybackMonths: 2,
    timeline: "4-6 weeks",
    topPriority,
    activities,
    roadmap,
    phases: [
      {
        title: "Lead Capture Automation",
        week: "Week 1",
        action: "Consolidate lead sources",
        tools: "CRM, Supabase, API connectors, and validation rules",
        setupTime: "4-6 hours setup",
        ongoing: "30 mins/week maintenance",
        result: `${activities.find((item) => item.key === "lead-entry")?.freedHours || 8} hours/week saved`
      },
      {
        title: "Follow-up Sequences",
        week: "Week 2-3",
        action: "Set up automated sequences",
        tools: "My Sales Tool, email bridge, reply tracking, and unsubscribe controls",
        setupTime: "6-8 hours setup",
        ongoing: "1 hour/week management",
        result: `${activities.find((item) => item.key === "follow-ups")?.freedHours || 6} hours/week saved`
      },
      {
        title: "CRM Automation",
        week: "Week 3",
        action: "Automate data flow and status changes",
        tools: "API connections, scoring logic, and admin dashboard",
        setupTime: "4-5 hours setup",
        ongoing: "30 mins/week monitoring",
        result: `${activities.find((item) => item.key === "crm-updates")?.freedHours || 7} hours/week saved`
      },
      {
        title: "Data Verification",
        week: "Week 4-6",
        action: "Build verification and suppression rules",
        tools: "Email validation, duplicate checks, and campaign hygiene",
        setupTime: "6-8 hours setup",
        ongoing: "1 hour/week review",
        result: `${activities.find((item) => item.key === "data-verification")?.freedHours || 5} hours/week saved`
      }
    ]
  };
}

export function formatSalesAuditText(report: SalesWasteAudit) {
  const activityLines = report.activities
    .map(
      (activity) =>
        `${activity.label}: ${activity.hoursPerWeek} hours/week, ${formatMoney(activity.annualCost)}/year. Quick win: ${activity.quickWin}.`
    )
    .join("\n");

  const roadmapLines = report.roadmap
    .map(
      (activity, index) =>
        `${index + 1}. ${activity.label}: save ${activity.freedHours} hours/week and ${formatMoney(activity.savingsAnnual)}/year. Implementation: ${activity.implementation}.`
    )
    .join("\n");

  return `Sales Automation Audit for ${report.companyName}

Executive Summary
Your sales team is wasting ${formatMoney(report.totalAnnualCost)} per year across manual sales work.
That equals ${report.totalWeeklyHours} hours/week and ${formatMoney(report.totalMonthlyCost)}/month.

Where time is being lost
${activityLines}

Optimization roadmap
${roadmapLines}

Total potential savings: ${formatMoney(report.totalSavingsAnnual)}/year
Total freed time: ${report.totalFreedHours} hours/week
Timeline to implementation: ${report.timeline}
Payback period: ${report.paybackMonths} months

Next step
Book a 30-minute strategy call to validate these numbers with your real workflow and map the first 90 days.`;
}
