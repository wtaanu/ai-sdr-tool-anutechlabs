import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(7),
  country: z.string().min(2),
  company: z.string().min(1).optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  source: z.string().optional()
});

export const otpVerifySchema = signupSchema.extend({
  otp: z.string().regex(/^\d{6}$/)
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const enquirySchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email(),
  fullName: z.string().optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  selectedAgentIds: z.array(z.number().int()).default([]),
  customRequirement: z.string().optional().or(z.literal("")),
  industry: z.string().min(2),
  businessType: z.string().min(2),
  businessSize: z.string().optional().or(z.literal("")),
  targetMarket: z.string().optional().or(z.literal("")),
  currentProblem: z.string().optional().or(z.literal("")),
  automationGoal: z.string().min(5),
  budgetRange: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal(""))
});

export const agentInterestOpenSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  agentId: z.number().int().positive(),
  agentName: z.string().min(2),
  agentSlug: z.string().min(2),
  pageUrl: z.string().optional().or(z.literal(""))
});

export const bookingSchema = z.object({
  userId: z.string().uuid(),
  enquiryId: z.string().uuid(),
  preferredTime: z.string().min(10),
  country: z.string().min(2),
  notes: z.string().optional().or(z.literal(""))
});

export const unsubscribeSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional().or(z.literal(""))
});

export const dataRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  requestType: z.enum(["access", "correction", "deletion", "export", "withdraw_consent"]),
  country: z.string().min(2),
  details: z.string().optional().or(z.literal(""))
});

export const contactQuerySchema = z.object({
  email: z.string().email(),
  query: z.string().min(10).max(3000),
  pageUrl: z.string().optional().or(z.literal(""))
});

export const leadStatusSchema = z.object({
  status: z.enum(["New Lead", "Qualified", "Call Booked", "Call Done", "Proposal Sent", "Negotiation", "Won", "Lost"]),
  note: z.string().optional().or(z.literal(""))
});

export const bookingStatusSchema = z.object({
  status: z.enum(["requested", "scheduled", "completed", "cancelled"]),
  meetingLink: z.string().optional().or(z.literal(""))
});

export const dataRequestStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "completed", "rejected"]),
  note: z.string().optional().or(z.literal(""))
});

export const freeAuditSchema = z.object({
  auditId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  email: z.string().email(),
  firstName: z.string().min(1),
  companyName: z.string().min(1),
  salespeople: z.enum(["1-3", "4-10", "11-20", "20+"]),
  salesCycle: z.enum(["7-14 days", "15-30 days", "30-60 days", "60+ days"]),
  biggestWaste: z.enum(["Lead entry", "CRM updates", "Follow-ups", "Data verification", "I'm not sure"]),
  fullName: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  businessType: z.string().optional().or(z.literal("")),
  companyWebsite: z.string().optional().or(z.literal("")),
  targetMarket: z.string().optional().or(z.literal("")),
  monthlyLeads: z.string().optional().or(z.literal("")),
  averageOrderValue: z.string().optional().or(z.literal("")),
  currentTools: z.string().optional().or(z.literal("")),
  responseTime: z.string().optional().or(z.literal("")),
  teamSize: z.string().optional().or(z.literal("")),
  biggestProblem: z.string().optional().or(z.literal("")),
  growthGoal: z.string().optional().or(z.literal("")),
  consentToAudit: z.literal(true)
});

export const freeAuditStartSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().min(1)
});

export const freeAuditCallClickSchema = z.object({
  auditId: z.string().uuid().optional(),
  email: z.string().email(),
  firstName: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal(""))
});

export const freeAuditFollowupSchema = z.object({
  auditId: z.string().uuid(),
  followupType: z.enum(["value_reminder", "roadmap_help", "strategy_call", "case_study"])
});

export const agentVideoSchema = z.object({
  agentId: z.number().int().positive(),
  videoUrl: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal(""))
});

export const publicVideoSchema = z.object({
  title: z.string().min(3).max(180),
  about: z.string().min(10).max(1200),
  youtubeUrl: z.string().url(),
  tag: z.string().optional().or(z.literal(""))
});
