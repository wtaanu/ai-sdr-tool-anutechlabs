export type AgentCategory =
  | "AI SDR"
  | "Email"
  | "LinkedIn"
  | "Meta"
  | "Social"
  | "SEO"
  | "Finance"
  | "Compliance"
  | "Operations"
  | "Industry";

export type Agent = {
  id: number;
  name: string;
  slug: string;
  category: AgentCategory;
  outcome: string;
  workflow: string[];
};

export const agents: Agent[] = [
  { id: 1, name: "AI Lead Generation Agent", slug: "ai-lead-generation-agent", category: "AI SDR", outcome: "Finds qualified prospects by industry, region, role, and buying intent.", workflow: ["collect market signals", "score prospects", "prepare outreach"] },
  { id: 2, name: "AI Client Acquisition Agent", slug: "ai-client-acquisition-agent", category: "AI SDR", outcome: "Runs qualification, follow-ups, lead scoring, and sales pipeline movement.", workflow: ["capture lead", "analyze fit", "trigger follow-up"] },
  { id: 3, name: "AI Cold Email Agent", slug: "ai-cold-email-agent", category: "Email", outcome: "Creates personalized outbound emails and response-aware sequences.", workflow: ["research lead", "draft email", "track reply"] },
  { id: 4, name: "AI Follow-Up Agent", slug: "ai-follow-up-agent", category: "AI SDR", outcome: "Sends timely follow-ups based on lead status, interest, and replies.", workflow: ["detect stage", "draft next touch", "schedule send"] },
  { id: 5, name: "AI Appointment Booking Agent", slug: "ai-appointment-booking-agent", category: "AI SDR", outcome: "Qualifies prospects and books Zoom or Google Meet calls.", workflow: ["qualify", "match calendar", "send invite"] },
  { id: 6, name: "AI Proposal Drafting Agent", slug: "ai-proposal-drafting-agent", category: "AI SDR", outcome: "Turns client requirements into structured proposals and scopes.", workflow: ["summarize need", "map solution", "draft proposal"] },
  { id: 7, name: "AI Sales Call Prep Agent", slug: "ai-sales-call-prep-agent", category: "AI SDR", outcome: "Prepares client background, objections, questions, and call agenda.", workflow: ["research client", "identify angle", "build agenda"] },
  { id: 8, name: "AI CRM Update Agent", slug: "ai-crm-update-agent", category: "Operations", outcome: "Updates records, notes, stages, tasks, and next actions automatically.", workflow: ["read activity", "update record", "create task"] },
  { id: 9, name: "AI Deal Scoring Agent", slug: "ai-deal-scoring-agent", category: "AI SDR", outcome: "Scores leads by fit, urgency, authority, budget, and conversion likelihood.", workflow: ["read profile", "score signals", "rank priority"] },
  { id: 10, name: "AI Lost Lead Reactivation Agent", slug: "ai-lost-lead-reactivation-agent", category: "AI SDR", outcome: "Re-engages old prospects with relevant context and new offers.", workflow: ["find dormant lead", "create angle", "send reactivation"] },
  { id: 11, name: "AI Email Warm-Up Agent", slug: "ai-email-warm-up-agent", category: "Email", outcome: "Supports sender reputation and inbox placement workflows.", workflow: ["monitor sender", "warm domain", "flag risk"] },
  { id: 12, name: "AI Newsletter Agent", slug: "ai-newsletter-agent", category: "Email", outcome: "Drafts segmented newsletters with clean structure and unsubscribe links.", workflow: ["segment users", "draft message", "prepare send"] },
  { id: 13, name: "AI Email Reply Agent", slug: "ai-email-reply-agent", category: "Email", outcome: "Reads inbound replies and suggests strong response drafts.", workflow: ["classify reply", "find intent", "draft answer"] },
  { id: 14, name: "AI Inbox Triage Agent", slug: "ai-inbox-triage-agent", category: "Email", outcome: "Categorizes emails by lead intent, urgency, finance, support, or spam.", workflow: ["read inbox", "classify", "route"] },
  { id: 15, name: "AI Drip Campaign Agent", slug: "ai-drip-campaign-agent", category: "Email", outcome: "Runs multi-step nurturing sequences based on behavior and interest.", workflow: ["define segment", "send step", "adapt next"] },
  { id: 16, name: "AI Customer Re-Engagement Agent", slug: "ai-customer-re-engagement-agent", category: "Email", outcome: "Reconnects with inactive customers and past prospects.", workflow: ["find inactivity", "draft message", "track response"] },
  { id: 17, name: "AI LinkedIn Prospecting Agent", slug: "ai-linkedin-prospecting-agent", category: "LinkedIn", outcome: "Finds B2B prospects and prepares personalized connection flows.", workflow: ["define ICP", "find profiles", "prepare message"] },
  { id: 18, name: "AI LinkedIn Outreach Agent", slug: "ai-linkedin-outreach-agent", category: "LinkedIn", outcome: "Manages LinkedIn conversations and identifies warm opportunities.", workflow: ["track thread", "detect intent", "suggest reply"] },
  { id: 19, name: "AI LinkedIn Content Agent", slug: "ai-linkedin-content-agent", category: "LinkedIn", outcome: "Creates founder-led posts, comments, and thought leadership ideas.", workflow: ["pick topic", "write post", "repurpose insight"] },
  { id: 20, name: "AI LinkedIn Engagement Agent", slug: "ai-linkedin-engagement-agent", category: "LinkedIn", outcome: "Suggests comments and replies for target accounts and industry posts.", workflow: ["monitor feed", "find openings", "draft comment"] },
  { id: 21, name: "AI Meta Ads Intelligence Agent", slug: "ai-meta-ads-intelligence-agent", category: "Meta", outcome: "Reviews Meta campaign performance and suggests optimization actions.", workflow: ["read metrics", "find waste", "recommend change"] },
  { id: 22, name: "AI Meta Lead Form Agent", slug: "ai-meta-lead-form-agent", category: "Meta", outcome: "Captures, qualifies, and routes Facebook and Instagram form leads.", workflow: ["ingest lead", "verify details", "route CRM"] },
  { id: 23, name: "AI Instagram DM Agent", slug: "ai-instagram-dm-agent", category: "Social", outcome: "Responds to Instagram enquiries and moves qualified leads into CRM.", workflow: ["read DM", "answer", "capture lead"] },
  { id: 24, name: "AI Instagram Content Agent", slug: "ai-instagram-content-agent", category: "Social", outcome: "Creates reels ideas, captions, hooks, and carousel outlines.", workflow: ["find topic", "write hook", "plan post"] },
  { id: 25, name: "AI WhatsApp Sales Agent", slug: "ai-whatsapp-sales-agent", category: "Social", outcome: "Handles WhatsApp enquiries, reminders, FAQs, and lead qualification.", workflow: ["respond", "qualify", "book call"] },
  { id: 26, name: "AI Social Listening Agent", slug: "ai-social-listening-agent", category: "Social", outcome: "Tracks mentions, competitors, and buying-intent signals.", workflow: ["monitor terms", "score signal", "alert owner"] },
  { id: 27, name: "AI Content Calendar Agent", slug: "ai-content-calendar-agent", category: "Social", outcome: "Plans posts across LinkedIn, Instagram, X, and Meta.", workflow: ["map themes", "schedule posts", "track output"] },
  { id: 28, name: "AI Content Repurposing Automation Agent", slug: "ai-content-repurposing-automation-agent", category: "Social", outcome: "Turns blogs, videos, calls, and webinars into posts, emails, reels, and threads.", workflow: ["extract ideas", "reshape formats", "prepare assets"] },
  { id: 29, name: "AI Website Chat Agent", slug: "ai-website-chat-agent", category: "AI SDR", outcome: "Answers visitor questions and captures qualified leads.", workflow: ["chat", "qualify", "handoff"] },
  { id: 30, name: "AI SEO Content Agent", slug: "ai-seo-content-agent", category: "SEO", outcome: "Creates SEO briefs, landing pages, FAQs, and article outlines.", workflow: ["research query", "create brief", "draft content"] },
  { id: 31, name: "AI Programmatic SEO Agent", slug: "ai-programmatic-seo-agent", category: "SEO", outcome: "Generates scalable pages for industries, regions, and agent use cases.", workflow: ["map keyword", "build page", "link cluster"] },
  { id: 32, name: "AI Blog Research Agent", slug: "ai-blog-research-agent", category: "SEO", outcome: "Researches topics, competitors, and customer questions for blogs.", workflow: ["collect SERP", "cluster topics", "brief article"] },
  { id: 33, name: "AI Landing Page Optimization Agent", slug: "ai-landing-page-optimization-agent", category: "SEO", outcome: "Improves copy, CTA placement, section order, and conversion messaging.", workflow: ["audit page", "find friction", "suggest test"] },
  { id: 34, name: "AI Review And Reputation Agent", slug: "ai-review-and-reputation-agent", category: "Social", outcome: "Collects reviews, detects negative feedback, and triggers recovery workflows.", workflow: ["request review", "detect sentiment", "route issue"] },
  { id: 35, name: "Invoice And Payment Reminder Automator", slug: "invoice-and-payment-reminder-automator", category: "Finance", outcome: "Sends payment reminders, tracks status, and updates finance records.", workflow: ["read invoice", "send reminder", "update status"] },
  { id: 36, name: "AI Invoice Processing Agent", slug: "ai-invoice-processing-agent", category: "Finance", outcome: "Extracts invoice data and prepares accounting entries.", workflow: ["parse invoice", "validate fields", "export record"] },
  { id: 37, name: "AI Expense Categorization Agent", slug: "ai-expense-categorization-agent", category: "Finance", outcome: "Categorizes expenses and flags unusual transactions.", workflow: ["read expense", "classify", "flag anomaly"] },
  { id: 38, name: "AI Document Processing Agent", slug: "ai-document-processing-agent", category: "Operations", outcome: "Extracts structured data from PDFs, forms, contracts, and spreadsheets.", workflow: ["upload file", "extract fields", "review output"] },
  { id: 39, name: "AI Operations SOP Agent", slug: "ai-operations-sop-agent", category: "Operations", outcome: "Creates and updates standard operating procedures from workflows.", workflow: ["observe process", "draft SOP", "version document"] },
  { id: 40, name: "AI Vendor Follow-Up Agent", slug: "ai-vendor-follow-up-agent", category: "Operations", outcome: "Tracks vendor communication, pending items, and document due dates.", workflow: ["track due date", "send reminder", "log update"] },
  { id: 41, name: "AI Compliance Monitoring Agent", slug: "ai-compliance-monitoring-agent", category: "Compliance", outcome: "Tracks policy tasks, audit checkpoints, and documentation gaps.", workflow: ["read checklist", "find gaps", "notify owner"] },
  { id: 42, name: "AI GDPR And Privacy Request Agent", slug: "ai-gdpr-privacy-request-agent", category: "Compliance", outcome: "Handles data access, deletion, consent withdrawal, and privacy requests.", workflow: ["capture request", "verify identity", "track resolution"] },
  { id: 43, name: "AI Contract Review Assistant", slug: "ai-contract-review-assistant", category: "Compliance", outcome: "Summarizes contracts and flags risky clauses for human review.", workflow: ["read contract", "summarize terms", "flag risk"] },
  { id: 44, name: "AI Internal Policy Agent", slug: "ai-internal-policy-agent", category: "Compliance", outcome: "Answers employee questions from company policies and documents.", workflow: ["index policy", "answer query", "cite source"] },
  { id: 45, name: "AI Audit Preparation Agent", slug: "ai-audit-preparation-agent", category: "Compliance", outcome: "Organizes records, checklists, and evidence for audits.", workflow: ["collect evidence", "map checklist", "report gaps"] },
  { id: 46, name: "AI Real Estate Lead Agent", slug: "ai-real-estate-lead-agent", category: "Industry", outcome: "Qualifies buyers, sellers, tenants, and property investors.", workflow: ["capture intent", "qualify budget", "book visit"] },
  { id: 47, name: "AI Healthcare Clinic Booking Agent", slug: "ai-healthcare-clinic-booking-agent", category: "Industry", outcome: "Captures patient enquiries and schedules appointments.", workflow: ["collect concern", "find slot", "confirm visit"] },
  { id: 48, name: "AI Education Counselling Agent", slug: "ai-education-counselling-agent", category: "Industry", outcome: "Qualifies students and recommends courses or programs.", workflow: ["collect goal", "match program", "book counsellor"] },
  { id: 49, name: "AI Recruitment Screening Agent", slug: "ai-recruitment-screening-agent", category: "Industry", outcome: "Screens candidates, summarizes resumes, and schedules interviews.", workflow: ["parse resume", "score fit", "schedule interview"] },
  { id: 50, name: "AI Custom Business Automation Agent", slug: "ai-custom-business-automation-agent", category: "Operations", outcome: "Designs custom AI workflows for business processes not listed in the catalogue.", workflow: ["study workflow", "design agent", "build automation"] }
];

export const categories: AgentCategory[] = [
  "AI SDR",
  "Email",
  "LinkedIn",
  "Meta",
  "Social",
  "SEO",
  "Finance",
  "Compliance",
  "Operations",
  "Industry"
];
