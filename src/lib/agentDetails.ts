import type { Agent } from "@/data/agents";

const categoryProblems: Record<string, string[]> = {
  "AI SDR": ["Missed website leads", "Slow follow-up", "Manual qualification", "Unbooked sales calls"],
  Email: ["Inconsistent emails", "Weak follow-ups", "Unmanaged replies", "Low visibility into outreach"],
  LinkedIn: ["Manual prospecting", "No conversation tracking", "Irregular founder content", "Lost warm leads"],
  Meta: ["Lead forms not followed up", "Ad waste", "Slow response to Meta enquiries", "No CRM routing"],
  Social: ["DMs missed", "Content not reused", "No social lead capture", "Manual posting workload"],
  SEO: ["Low organic visibility", "No scalable landing pages", "Weak search intent mapping", "Content gaps"],
  Finance: ["Late payments", "Manual invoice tracking", "Unclear finance follow-up", "Missed reminders"],
  Compliance: ["Consent gaps", "Manual privacy requests", "Untracked policies", "Audit preparation stress"],
  Operations: ["Scattered documents", "Manual SOPs", "Slow task routing", "Disconnected workflows"],
  Industry: ["Industry-specific lead capture gaps", "Manual appointment handling", "Slow qualification", "Poor handoff"]
};

export function getAgentBusinessValue(agent: Agent) {
  return `This agent helps businesses turn ${agent.category.toLowerCase()} work into a repeatable workflow with clearer records, faster action, and less manual follow-up. It can be customized around your tools, team size, market, and process.`;
}

export function getAgentProblems(agent: Agent) {
  return categoryProblems[agent.category] || categoryProblems.Operations;
}

export function getAgentExpectations(agent: Agent) {
  return [
    `A discovery call to understand your current ${agent.category.toLowerCase()} process.`,
    "A workflow map showing what the agent should read, decide, create, and update.",
    "Integration planning for website forms, email, CRM, sheets, calendar, or other business tools.",
    "A practical build plan that can start simple and grow as your process becomes clearer."
  ];
}

export function getAgentIndustries(agent: Agent) {
  const base = ["B2B services", "consulting", "agencies", "SaaS", "local businesses"];
  if (agent.category === "Industry") return ["real estate", "healthcare", "education", "recruitment", "service businesses"];
  if (agent.category === "Finance") return ["service businesses", "agencies", "consulting", "B2B vendors", "finance teams"];
  if (agent.category === "Compliance") return ["global businesses", "healthcare", "finance", "SaaS", "operations teams"];
  if (agent.category === "LinkedIn") return ["B2B consulting", "SaaS", "agencies", "founder-led services", "recruitment"];
  if (agent.category === "Meta" || agent.category === "Social") return ["D2C", "coaches", "clinics", "education", "real estate"];
  return base;
}

export function toYouTubeEmbed(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&playsinline=1&rel=0` : "";
}
