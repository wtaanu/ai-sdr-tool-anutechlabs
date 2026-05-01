-- AI SDR by AnutechLabs
-- Supabase update for public videos, agent demo videos, and the new free audit funnel.
-- Safe to run more than once.

create extension if not exists pgcrypto;

-- 1) Public video library for /videos and admin public video form.
create table if not exists public.learning_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  about text not null,
  tag text,
  youtube_url text not null,
  youtube_video_id text not null,
  embed_url text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_videos_published_created_idx
  on public.learning_videos (is_published, created_at desc);

-- 2) Per-agent demo videos shown on individual agent pages.
create table if not exists public.agent_videos (
  agent_id bigint primary key,
  video_url text,
  title text,
  updated_at timestamptz not null default now()
);

alter table public.agent_videos
  add column if not exists video_url text,
  add column if not exists title text,
  add column if not exists updated_at timestamptz not null default now();

-- 3) Free audit requests.
-- The new funnel stores all new status tracking in report_json:
-- status = started | summary_generated | strategy_call_clicked
-- startedAt, summaryGeneratedAt, strategyCallClickedAt, salespeople, salesCycle, biggestWaste, totals, phases, roadmap.
create table if not exists public.free_audit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  industry text not null default 'Sales automation',
  business_type text not null default 'Sales team',
  company_website text,
  target_market text,
  monthly_leads text,
  average_order_value text,
  current_tools text,
  response_time text,
  team_size text,
  biggest_problem text not null default 'Free audit started',
  growth_goal text not null default 'Free sales automation audit',
  opportunity_score int,
  roi_potential text,
  recommended_agent_ids bigint[] not null default '{}',
  report_json jsonb not null default '{}'::jsonb,
  report_text text,
  email_status text,
  consent_status text not null default 'accepted',
  created_at timestamptz not null default now()
);

alter table public.free_audit_requests
  alter column industry set default 'Sales automation',
  alter column business_type set default 'Sales team',
  alter column biggest_problem set default 'Free audit started',
  alter column growth_goal set default 'Free sales automation audit',
  add column if not exists company_website text,
  add column if not exists target_market text,
  add column if not exists monthly_leads text,
  add column if not exists average_order_value text,
  add column if not exists current_tools text,
  add column if not exists response_time text,
  add column if not exists team_size text,
  add column if not exists opportunity_score int,
  add column if not exists roi_potential text,
  add column if not exists recommended_agent_ids bigint[] not null default '{}',
  add column if not exists report_json jsonb not null default '{}'::jsonb,
  add column if not exists report_text text,
  add column if not exists email_status text,
  add column if not exists consent_status text not null default 'accepted',
  add column if not exists created_at timestamptz not null default now();

create index if not exists free_audit_requests_created_idx
  on public.free_audit_requests (created_at desc);

create index if not exists free_audit_requests_user_idx
  on public.free_audit_requests (user_id, created_at desc);

create index if not exists free_audit_requests_status_idx
  on public.free_audit_requests ((report_json->>'status'), created_at desc);

create index if not exists free_audit_requests_email_status_idx
  on public.free_audit_requests (email_status, created_at desc);

-- 4) Timeline logs used by admin tracking.
create table if not exists public.activity_timeline (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.public_users(id) on delete cascade,
  enquiry_id uuid references public.enquiries(id) on delete cascade,
  activity_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_timeline_user_created_idx
  on public.activity_timeline (user_id, created_at desc);

create index if not exists activity_timeline_type_created_idx
  on public.activity_timeline (activity_type, created_at desc);

-- 5) Email logs used for audit PDF delivery and admin follow-up email tracking.
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

create index if not exists email_logs_user_created_idx
  on public.email_logs (user_id, created_at desc);

create index if not exists email_logs_type_created_idx
  on public.email_logs (email_type, created_at desc);

-- 6) Replies table used by Free Audit admin page to decide if a 2-day follow-up is needed.
create table if not exists public.sales_inbox_replies (
  id uuid primary key default gen_random_uuid(),
  reply_id text unique,
  prospect_id uuid,
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

alter table public.sales_inbox_replies
  add column if not exists from_email text,
  add column if not exists subject text,
  add column if not exists reply_category text,
  add column if not exists reply_sentiment text,
  add column if not exists received_at timestamptz;

create index if not exists sales_inbox_replies_from_email_idx
  on public.sales_inbox_replies (from_email, received_at desc);

-- 7) Optional starter public video. Safe duplicate guard by youtube_video_id.
insert into public.learning_videos (
  title,
  about,
  tag,
  youtube_url,
  youtube_video_id,
  embed_url,
  is_published
)
select
  'AI automation demo by AnutechLabs',
  'A short demonstration video for business owners exploring AI agents, sales automation, and client acquisition workflows.',
  'AI automation',
  'https://youtube.com/shorts/D-MCL_Alf-c?si=8MloESqzSF3PU8Qu',
  'D-MCL_Alf-c',
  'https://www.youtube.com/embed/D-MCL_Alf-c',
  true
where not exists (
  select 1 from public.learning_videos where youtube_video_id = 'D-MCL_Alf-c'
);
