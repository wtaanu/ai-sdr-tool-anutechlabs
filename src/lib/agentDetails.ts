import type { Agent } from "@/data/agents";

const categoryProblems: Record<string, string[]> = {
  "Lead Generation": ["Missed website leads", "Slow follow-up", "Manual qualification", "Unbooked sales calls"],
  "Email Automation": ["Inconsistent emails", "Weak follow-ups", "Unmanaged replies", "Low visibility into outreach"],
  "LinkedIn Automation": ["Manual prospecting", "No conversation tracking", "Irregular founder content", "Lost warm leads"],
  "Instagram Automation": ["DMs missed", "Instagram content not reused", "No Instagram lead capture", "Manual posting workload"],
  "Social Media Automation": ["Social leads not followed up", "Ad and content waste", "Slow response to social enquiries", "No CRM routing"],
  "SEO Automation": ["Low organic visibility", "No scalable landing pages", "Weak search intent mapping", "Content gaps"],
  "Finance Automation": ["Late payments", "Manual invoice tracking", "Unclear finance follow-up", "Missed reminders"],
  "Compliance Automation": ["Consent gaps", "Manual privacy requests", "Untracked policies", "Audit preparation stress"],
  "Business Automation": ["Scattered documents", "Manual SOPs", "Slow task routing", "Disconnected workflows"],
  "Industry Automation": ["Industry-specific lead capture gaps", "Manual appointment handling", "Slow qualification", "Poor handoff"]
};

const categoryFit: Record<string, string> = {
  "Lead Generation": "sales teams, founders, agencies, and service businesses that need more qualified calls without increasing manual follow-up",
  "Email Automation": "teams sending outbound, nurture, newsletters, transactional updates, or reply-based sales conversations",
  "LinkedIn Automation": "B2B founders, consultants, recruiters, agencies, and sales teams using LinkedIn to create warm conversations",
  "Instagram Automation": "brands, creators, coaches, clinics, local businesses, and service teams using Instagram DMs and content to create leads",
  "Social Media Automation": "businesses that receive enquiries, comments, DMs, ad leads, or content opportunities across social channels",
  "SEO Automation": "companies that want compounding organic traffic from search pages, articles, landing pages, and content clusters",
  "Finance Automation": "owners and finance teams that need payment discipline, cleaner records, and fewer manual reminders",
  "Compliance Automation": "businesses that need privacy, policy, audit, contract, and evidence workflows to be tracked properly",
  "Business Automation": "teams with repeated document, SOP, vendor, CRM, or internal workflow tasks",
  "Industry Automation": "businesses with industry-specific enquiry, booking, screening, qualification, or handoff processes"
};

function sentenceCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function workflowPhrase(agent: Agent) {
  return agent.workflow.map((step) => step.toLowerCase()).join(" -> ");
}

export function getAgentPageDescription(agent: Agent) {
  const [input, analyze, output] = agent.workflow;

  return `${agent.outcome} It is designed for ${categoryFit[agent.category] || categoryFit.Operations}, where the daily bottleneck is usually to ${input.toLowerCase()}, ${analyze.toLowerCase()}, and ${output.toLowerCase()} without losing speed, context, or follow-up quality.`;
}

export function getAgentBusinessValues(agent: Agent) {
  return [
    `${agent.name} is built to ${agent.outcome.toLowerCase()} Instead of waiting for a person to remember the next step, it turns the process into a measurable workflow: ${workflowPhrase(agent)}.`,
    `Best fit for ${categoryFit[agent.category] || categoryFit.Operations}. The agent can be adapted for your region, language, niche, offer, tools, and approval process.`,
    `Business value comes from faster action, fewer missed opportunities, cleaner records, and consistent execution. It can start with one focused use case and later connect with CRM, email, calendar, website forms, WhatsApp, LinkedIn, Meta, or internal dashboards.`
  ];
}

export function getAgentProblems(agent: Agent) {
  const base = categoryProblems[agent.category] || categoryProblems["Business Automation"];
  const [input, analyze, output] = agent.workflow;

  return [
    `${sentenceCase(input)} is still handled manually or inconsistently.`,
    `${sentenceCase(analyze)} depends on memory, spreadsheets, or scattered notes.`,
    `${sentenceCase(output)} happens too late, so revenue opportunities are missed.`,
    base[0]
  ];
}

export function getAgentExpectations(agent: Agent) {
  return [
    `A discovery call to understand where ${agent.name} should fit in your current business process.`,
    `A workflow map for how the agent will ${agent.workflow[0]}, ${agent.workflow[1]}, and ${agent.workflow[2]}.`,
    `Clear rules for inputs, decisions, approvals, human handoff, notifications, and reporting.`,
    `Integration planning around your existing tools, such as website forms, email, CRM, calendar, sheets, WhatsApp, LinkedIn, Meta, or internal systems.`,
    `A practical first version that can be tested quickly, then improved with real user and lead data.`
  ];
}

export function getAgentIndustries(agent: Agent) {
  const base = ["B2B services", "consulting", "agencies", "SaaS", "local businesses"];
  if (agent.category === "Industry Automation") return ["real estate", "healthcare", "education", "recruitment", "service businesses"];
  if (agent.category === "Finance Automation") return ["service businesses", "agencies", "consulting", "B2B vendors", "finance teams"];
  if (agent.category === "Compliance Automation") return ["global businesses", "healthcare", "finance", "SaaS", "operations teams"];
  if (agent.category === "LinkedIn Automation") return ["B2B consulting", "SaaS", "agencies", "founder-led services", "recruitment"];
  if (agent.category === "Instagram Automation" || agent.category === "Social Media Automation") return ["D2C", "coaches", "clinics", "education", "real estate"];
  return base;
}

export function toYouTubeEmbed(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&playsinline=1&rel=0` : "";
}
