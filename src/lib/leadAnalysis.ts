import { agents } from "@/data/agents";

type LeadAnalysisInput = {
  fullName: string;
  email: string;
  selectedAgentIds: number[];
  customRequirement?: string;
  industry?: string;
  businessType?: string;
  currentProblem?: string;
  automationGoal: string;
  budgetRange?: string;
  timeline?: string;
  remarks?: string;
};

function fallbackLeadAnalysis(input: LeadAnalysisInput) {
  let score = 45;
  if (input.automationGoal.length > 80) score += 15;
  if (input.selectedAgentIds.length > 0) score += 10;
  if (input.customRequirement && input.customRequirement.length > 30) score += 10;
  if (input.budgetRange) score += 10;
  if (input.timeline && /urgent|now|immediate|this week|asap|month/i.test(input.timeline)) score += 10;

  const leadScore = Math.min(score, 100);
  const priority = leadScore >= 75 ? "Hot" : leadScore >= 60 ? "Warm" : "Review";
  const selectedAgents = input.selectedAgentIds
    .map((id) => agents.find((agent) => agent.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return {
    leadScore,
    priority,
    summary: [
      `${input.fullName} submitted interest from ${input.industry || "an unspecified industry"}.`,
      selectedAgents ? `Selected agents: ${selectedAgents}.` : "No fixed agent selected.",
      input.customRequirement ? `Custom request: ${input.customRequirement}.` : "",
      `Automation goal: ${input.automationGoal}.`,
      input.timeline ? `Timeline: ${input.timeline}.` : "",
      input.budgetRange ? `Budget range: ${input.budgetRange}.` : ""
    ]
      .filter(Boolean)
      .join(" "),
    suggestedReply: `Hi ${input.fullName}, thanks for sharing your requirement. I reviewed your ${input.industry || "business"} workflow and can discuss how AI SDR by AnutechLabs can help with ${input.automationGoal}.`,
    callAgenda: [
      "Understand current lead and workflow process",
      "Confirm target market and tools used",
      "Review best-fit AI agent or custom build",
      "Discuss integration, timeline, and next steps"
    ]
  };
}

export async function analyzeLead(input: LeadAnalysisInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackLeadAnalysis(input);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You analyze AI SDR leads. Return JSON with leadScore number 0-100, priority Hot/Warm/Review, summary, suggestedReply, callAgenda array."
          },
          {
            role: "user",
            content: JSON.stringify(input)
          }
        ]
      })
    });

    if (!response.ok) {
      return fallbackLeadAnalysis(input);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : null;

    return {
      ...fallbackLeadAnalysis(input),
      ...parsed
    };
  } catch {
    return fallbackLeadAnalysis(input);
  }
}
