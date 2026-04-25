import { agents } from "@/data/agents";

type FreeAuditInput = {
  fullName: string;
  email: string;
  company?: string | null;
  country?: string | null;
  industry: string;
  businessType: string;
  companyWebsite?: string;
  targetMarket?: string;
  monthlyLeads?: string;
  averageOrderValue?: string;
  currentTools?: string;
  responseTime?: string;
  teamSize?: string;
  biggestProblem: string;
  growthGoal: string;
};

export type FreeAuditReport = {
  headline: string;
  executiveSummary: string;
  opportunityScore: number;
  roiPotential: string;
  estimatedMonthlyLeakage: string;
  matchedAgents: Array<{
    id: number;
    name: string;
    slug: string;
    reason: string;
  }>;
  analytics: Array<{
    label: string;
    value: string;
    insight: string;
  }>;
  problemMap: string[];
  roadmap: string[];
  quickWins: string[];
  emailSummary: string;
};

function parseNumber(value?: string) {
  const match = value?.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function chooseAgents(input: FreeAuditInput) {
  const text = `${input.industry} ${input.businessType} ${input.biggestProblem} ${input.growthGoal} ${input.currentTools || ""}`.toLowerCase();
  const preferred = agents
    .map((agent) => {
      const haystack = `${agent.name} ${agent.category} ${agent.outcome} ${agent.workflow.join(" ")}`.toLowerCase();
      let score = 0;
      for (const token of text.split(/\W+/).filter((word) => word.length > 3)) {
        if (haystack.includes(token)) score += 1;
      }
      if (/lead|sales|client|follow|call|crm/.test(text) && agent.category === "AI SDR") score += 6;
      if (/email|inbox|reply|newsletter/.test(text) && agent.category === "Email") score += 5;
      if (/linkedin/.test(text) && agent.category === "LinkedIn") score += 7;
      if (/meta|facebook|instagram|ads/.test(text) && ["Meta", "Social"].includes(agent.category)) score += 6;
      if (/seo|google|traffic|content/.test(text) && agent.category === "SEO") score += 6;
      if (/invoice|payment|finance/.test(text) && agent.category === "Finance") score += 6;
      if (/privacy|gdpr|policy|audit|compliance/.test(text) && agent.category === "Compliance") score += 6;
      return { agent, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return preferred.map(({ agent }) => ({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    reason: `${agent.name} fits because it can ${agent.outcome.toLowerCase()}`
  }));
}

function fallbackAudit(input: FreeAuditInput): FreeAuditReport {
  const monthlyLeads = parseNumber(input.monthlyLeads);
  const orderValue = parseNumber(input.averageOrderValue);
  const responseRisk = /hour|day|manual|slow|later|24|48/i.test(input.responseTime || "") ? 18 : 8;
  const toolRisk = input.currentTools && input.currentTools.length > 20 ? 8 : 15;
  const leadRisk = monthlyLeads > 100 ? 22 : monthlyLeads > 30 ? 16 : 10;
  const opportunityScore = Math.min(96, 45 + responseRisk + toolRisk + leadRisk);
  const leakage = monthlyLeads && orderValue ? Math.round(monthlyLeads * orderValue * 0.08) : 0;
  const matchedAgents = chooseAgents(input);

  return {
    headline: `Free AI automation audit for ${input.company || input.businessType}`,
    executiveSummary: `${input.fullName}, your ${input.industry} workflow shows clear automation potential around response speed, lead qualification, follow-up discipline, and visibility. The strongest opportunity is to convert scattered interest into a measurable AI SDR pipeline with source tracking and call booking.`,
    opportunityScore,
    roiPotential: opportunityScore >= 80 ? "High" : opportunityScore >= 65 ? "Medium to High" : "Focused improvement",
    estimatedMonthlyLeakage: leakage ? `${leakage.toLocaleString()} potential monthly revenue exposure from missed or delayed follow-up` : "Revenue leakage depends on lead volume and average deal value; response time and follow-up gaps are the first items to measure.",
    matchedAgents,
    analytics: [
      {
        label: "Automation opportunity",
        value: `${opportunityScore}/100`,
        insight: "Based on lead volume, manual effort, response speed, and workflow clarity."
      },
      {
        label: "Response risk",
        value: responseRisk > 12 ? "Elevated" : "Controlled",
        insight: "Slow replies reduce conversion even when traffic quality is good."
      },
      {
        label: "Tool visibility",
        value: toolRisk > 10 ? "Fragmented" : "Partially tracked",
        insight: "A shared funnel gives you one view for enquiries, drafts, sends, replies, and calls."
      },
      {
        label: "ROI direction",
        value: opportunityScore >= 80 ? "Strong" : "Emerging",
        insight: "Best gains usually come from faster qualification, structured follow-ups, and fewer missed leads."
      }
    ],
    problemMap: [
      `Current problem: ${input.biggestProblem}`,
      `Growth goal: ${input.growthGoal}`,
      `Target market: ${input.targetMarket || input.country || "not specified"}`,
      `Current tools: ${input.currentTools || "not specified"}`
    ],
    roadmap: [
      "Capture every website, Apollo, LinkedIn, Meta, and referral lead into one shared database.",
      "Classify each lead by industry, urgency, value, and best-fit AI agent.",
      "Send branded, consent-aware recommendation emails with clear next steps.",
      "Book Google Meet calls for qualified leads and notify the owner with full context.",
      "Track conversion by source, agent, country, and follow-up stage."
    ],
    quickWins: [
      "Add AI response templates for the top three enquiry types.",
      "Route all new leads into the admin pipeline within seconds.",
      "Use one follow-up sequence for leads that do not book immediately.",
      "Measure response time and missed-call recovery weekly."
    ],
    emailSummary: `Your free AI audit found a ${opportunityScore}/100 automation opportunity. Recommended first agents: ${matchedAgents.map((agent) => agent.name).join(", ")}.`
  };
}

export function formatAuditReportText(report: FreeAuditReport) {
  return [
    report.headline,
    "",
    "Executive summary",
    report.executiveSummary,
    "",
    `Opportunity score: ${report.opportunityScore}/100`,
    `ROI potential: ${report.roiPotential}`,
    `Estimated leakage: ${report.estimatedMonthlyLeakage}`,
    "",
    "Recommended AI agents",
    ...report.matchedAgents.map((agent, index) => `${index + 1}. ${agent.name}: ${agent.reason}`),
    "",
    "Analytics",
    ...report.analytics.map((item) => `${item.label}: ${item.value} - ${item.insight}`),
    "",
    "Problem map",
    ...report.problemMap.map((item) => `- ${item}`),
    "",
    "Roadmap",
    ...report.roadmap.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Quick wins",
    ...report.quickWins.map((item) => `- ${item}`)
  ].join("\n");
}

export async function createFreeAuditReport(input: FreeAuditInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = fallbackAudit(input);

  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Create a concise but high-converting AI automation audit report. Return JSON matching: headline, executiveSummary, opportunityScore number, roiPotential, estimatedMonthlyLeakage, matchedAgents array with id/name/slug/reason, analytics array label/value/insight, problemMap array, roadmap array, quickWins array, emailSummary. Use only practical business claims."
          },
          {
            role: "user",
            content: JSON.stringify({
              input,
              availableAgents: agents
            })
          }
        ]
      })
    });

    if (!response.ok) return fallback;

    const result = await response.json();
    const parsed = JSON.parse(result.choices?.[0]?.message?.content || "{}");
    return {
      ...fallback,
      ...parsed,
      matchedAgents: Array.isArray(parsed.matchedAgents) && parsed.matchedAgents.length ? parsed.matchedAgents.slice(0, 5) : fallback.matchedAgents,
      analytics: Array.isArray(parsed.analytics) && parsed.analytics.length ? parsed.analytics.slice(0, 6) : fallback.analytics,
      problemMap: Array.isArray(parsed.problemMap) && parsed.problemMap.length ? parsed.problemMap : fallback.problemMap,
      roadmap: Array.isArray(parsed.roadmap) && parsed.roadmap.length ? parsed.roadmap : fallback.roadmap,
      quickWins: Array.isArray(parsed.quickWins) && parsed.quickWins.length ? parsed.quickWins : fallback.quickWins
    } satisfies FreeAuditReport;
  } catch {
    return fallback;
  }
}
