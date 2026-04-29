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
  timezone: z.string().min(2),
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
  userId: z.string().uuid().optional(),
  email: z.string().email(),
  fullName: z.string().optional().or(z.literal("")),
  industry: z.string().min(2),
  businessType: z.string().min(2),
  companyWebsite: z.string().optional().or(z.literal("")),
  targetMarket: z.string().optional().or(z.literal("")),
  monthlyLeads: z.string().optional().or(z.literal("")),
  averageOrderValue: z.string().optional().or(z.literal("")),
  currentTools: z.string().optional().or(z.literal("")),
  responseTime: z.string().optional().or(z.literal("")),
  teamSize: z.string().optional().or(z.literal("")),
  biggestProblem: z.string().min(10),
  growthGoal: z.string().min(10),
  consentToAudit: z.literal(true)
});

export const agentVideoSchema = z.object({
  agentId: z.number().int().positive(),
  videoUrl: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal(""))
});
