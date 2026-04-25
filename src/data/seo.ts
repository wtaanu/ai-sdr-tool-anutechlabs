export const industries = [
  "real-estate",
  "healthcare",
  "ecommerce",
  "education",
  "recruitment",
  "saas",
  "finance",
  "legal",
  "agency",
  "consulting"
];

export const countries = [
  "india",
  "usa",
  "uk",
  "uae",
  "singapore",
  "australia",
  "canada",
  "germany"
];

export const longTailSeoPages = [
  {
    slug: "ai-sdr-agent-for-small-business-lead-follow-up",
    title: "AI SDR Agent For Small Business Lead Follow-Up",
    description: "Capture website enquiries, qualify leads, send follow-ups, and book calls for small businesses using AI SDR automation.",
    industry: "Small business",
    useCase: "lead follow-up",
    agentIds: [1, 2, 4, 5, 29]
  },
  {
    slug: "ai-agent-for-real-estate-lead-qualification-and-site-visits",
    title: "AI Agent For Real Estate Lead Qualification And Site Visits",
    description: "Qualify property buyers, sellers, tenants, and investors with AI agents that route leads and book site visits.",
    industry: "Real estate",
    useCase: "lead qualification and visit booking",
    agentIds: [46, 2, 5, 25, 29]
  },
  {
    slug: "ai-agent-for-healthcare-clinic-appointment-booking",
    title: "AI Agent For Healthcare Clinic Appointment Booking",
    description: "Use AI to capture patient enquiries, answer common questions, and schedule clinic consultations with consent-aware workflows.",
    industry: "Healthcare",
    useCase: "appointment booking",
    agentIds: [47, 5, 25, 41, 42]
  },
  {
    slug: "ai-linkedin-prospecting-agent-for-b2b-consultants",
    title: "AI LinkedIn Prospecting Agent For B2B Consultants",
    description: "Find prospects, prepare LinkedIn outreach, track conversations, and move warm leads into a client acquisition funnel.",
    industry: "B2B consulting",
    useCase: "LinkedIn prospecting",
    agentIds: [17, 18, 19, 20, 2]
  },
  {
    slug: "ai-meta-lead-form-agent-for-facebook-and-instagram-campaigns",
    title: "AI Meta Lead Form Agent For Facebook And Instagram Campaigns",
    description: "Route Meta leads from Facebook and Instagram into verification, scoring, follow-up, and call booking workflows.",
    industry: "Performance marketing",
    useCase: "Meta lead form automation",
    agentIds: [21, 22, 23, 24, 2]
  },
  {
    slug: "ai-email-follow-up-agent-for-cold-outreach-replies",
    title: "AI Email Follow-Up Agent For Cold Outreach Replies",
    description: "Create reply-aware follow-up workflows for cold email, warm email, inbox triage, and lead scoring.",
    industry: "Sales teams",
    useCase: "email follow-up",
    agentIds: [3, 4, 13, 14, 15]
  },
  {
    slug: "invoice-and-payment-reminder-ai-agent-for-service-businesses",
    title: "Invoice And Payment Reminder AI Agent For Service Businesses",
    description: "Automate invoice reminders, payment follow-ups, finance records, and exception alerts for service companies.",
    industry: "Service business",
    useCase: "invoice and payment reminders",
    agentIds: [35, 36, 37, 40, 8]
  },
  {
    slug: "ai-content-repurposing-agent-for-linkedin-instagram-and-email",
    title: "AI Content Repurposing Agent For LinkedIn Instagram And Email",
    description: "Turn blogs, videos, calls, and webinars into social posts, emails, reels, newsletters, and SEO content.",
    industry: "Content teams",
    useCase: "content repurposing",
    agentIds: [28, 19, 24, 12, 30]
  },
  {
    slug: "ai-compliance-monitoring-agent-for-gdpr-dpdp-and-audit-readiness",
    title: "AI Compliance Monitoring Agent For GDPR DPDP And Audit Readiness",
    description: "Track privacy requests, consent logs, policies, audit evidence, and compliance workflows with AI agents.",
    industry: "Compliance teams",
    useCase: "GDPR DPDP and audit readiness",
    agentIds: [41, 42, 43, 44, 45]
  },
  {
    slug: "custom-ai-automation-agent-for-operations-and-crm-workflows",
    title: "Custom AI Automation Agent For Operations And CRM Workflows",
    description: "Design a custom AI workflow for CRM updates, SOPs, documents, vendor follow-ups, and operational tracking.",
    industry: "Operations",
    useCase: "custom AI automation",
    agentIds: [50, 8, 38, 39, 40]
  }
];

export function titleCaseSlug(slug: string) {
  return slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}
