create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  mobile text not null,
  country text not null,
  region text,
  company text,
  website text,
  is_email_verified boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.otp_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  resend_count int not null default 0,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  consent_type text not null,
  status text not null,
  country text,
  region text,
  policy_version text not null default 'draft',
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id bigint primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  outcome text not null,
  workflow jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_videos (
  agent_id bigint primary key,
  video_url text,
  title text,
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  selected_agent_ids bigint[] not null default '{}',
  custom_requirement text,
  industry text,
  business_type text,
  business_size text,
  target_market text,
  current_problem text,
  automation_goal text,
  budget_range text,
  timeline text,
  remarks text,
  ai_summary text,
  ai_lead_score int,
  ai_priority text,
  status text not null default 'New Lead',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  enquiry_id uuid references public.enquiries(id) on delete cascade,
  preferred_time timestamptz,
  timezone text,
  meeting_link text,
  calendar_event_id text,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete set null,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  email_type text not null,
  subject text,
  status text not null default 'draft',
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.email_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  request_type text not null,
  country text not null,
  details text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_timeline (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  enquiry_id uuid references public.enquiries(id) on delete cascade,
  activity_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.free_audit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  industry text not null,
  business_type text not null,
  company_website text,
  target_market text,
  monthly_leads text,
  average_order_value text,
  current_tools text,
  response_time text,
  team_size text,
  biggest_problem text not null,
  growth_goal text not null,
  opportunity_score int,
  roi_potential text,
  recommended_agent_ids bigint[] not null default '{}',
  report_json jsonb not null default '{}'::jsonb,
  report_text text,
  email_status text,
  consent_status text not null default 'accepted',
  created_at timestamptz not null default now()
);

create table if not exists public.client_acquisition_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  script_name text,
  status text not null,
  exit_code int,
  stdout text,
  stderr text,
  source text not null default 'my_sales_tool',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.client_acquisition_outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  draft_id text not null unique,
  lead_id text,
  draft_source text not null,
  source_record_id text,
  company_name text,
  buyer_name text,
  buyer_title text,
  email text,
  recommended_offer text,
  subject_line text,
  email_body_text text,
  email_body_html text,
  draft_status text not null default 'ready',
  send_result text,
  sent_at timestamptz,
  drafted_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists client_acquisition_outreach_drafts_source_idx
  on public.client_acquisition_outreach_drafts (draft_source, source_record_id);

create table if not exists public.client_acquisition_email_events (
  id uuid primary key default gen_random_uuid(),
  draft_id text,
  draft_source text not null,
  source_record_id text,
  email text,
  subject_line text,
  event_type text not null,
  provider_message_id text,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_prospects (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null unique,
  segment text,
  company_name text,
  buyer_name text,
  buyer_title text,
  email text not null,
  country text,
  industry text,
  employee_count text,
  website text,
  linkedin_url text,
  source text not null default 'apollo',
  recent_signal text,
  pain_notes text,
  tech_stack text,
  recommended_offer text,
  pitch_angle text,
  roi_reason text,
  lead_score int,
  budget_score int,
  urgency_score int,
  fit_score int,
  buyer_score int,
  verification_status text,
  verification_sub_status text,
  verification_notes text,
  prospect_status text not null default 'new',
  sequence_step int not null default 0,
  followup_count int not null default 0,
  last_sent_at timestamptz,
  next_followup_at timestamptz,
  replied_at timestamptz,
  unsubscribed_at timestamptz,
  call_status text,
  notes text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_prospects_segment_idx on public.sales_prospects (segment);
create index if not exists sales_prospects_status_idx on public.sales_prospects (prospect_status);
create index if not exists sales_prospects_email_idx on public.sales_prospects (email);

create table if not exists public.sales_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text not null,
  mail_type text not null,
  status text not null default 'draft',
  target_count int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_segments (
  id uuid primary key default gen_random_uuid(),
  segment_id text not null unique,
  label text not null,
  target_count int not null default 100,
  apollo_keywords text,
  target_titles text,
  target_locations text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_email_drafts (
  id uuid primary key default gen_random_uuid(),
  draft_id text not null unique,
  campaign_id uuid references public.sales_campaigns(id) on delete set null,
  prospect_id uuid references public.sales_prospects(id) on delete cascade,
  lead_id text,
  segment text,
  mail_type text not null,
  sequence_step int not null default 1,
  personalization jsonb not null default '{}'::jsonb,
  subject_line text not null,
  email_body_text text not null,
  email_body_html text,
  preview_html text,
  draft_status text not null default 'ready',
  review_notes text,
  send_result text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_email_drafts_status_idx on public.sales_email_drafts (draft_status);
create index if not exists sales_email_drafts_prospect_idx on public.sales_email_drafts (prospect_id);

create table if not exists public.sales_inbox_replies (
  id uuid primary key default gen_random_uuid(),
  reply_id text not null unique,
  prospect_id uuid references public.sales_prospects(id) on delete set null,
  lead_id text,
  from_email text,
  subject text,
  reply_text text,
  reply_category text,
  reply_sentiment text,
  next_action text,
  suggested_subject text,
  suggested_reply_text text,
  suggested_reply_html text,
  draft_status text not null default 'pending_review',
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_logs (
  id uuid primary key default gen_random_uuid(),
  trace_id text not null,
  level text not null,
  event_name text not null,
  route text,
  user_id uuid,
  email text,
  status text,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transaction_logs_trace_idx on public.transaction_logs (trace_id);
create index if not exists transaction_logs_event_idx on public.transaction_logs (event_name);
