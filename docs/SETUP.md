# AI SDR by AnutechLabs Setup

## 1. Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `docs/supabase-schema.sql`.
4. Copy the project URL, anon key, and service role key.
5. Use the same Supabase project in both AI SDR and My Sales Tool.

The shared database now stores:

- AI SDR visitor profiles, OTP verification, enquiries, bookings, consent, unsubscribe, and data requests.
- Free AI audit requests, consent logs, generated audit reports, recommended agents, and email status.
- My Sales Tool job runs from Apollo/search/score/verify/draft/send/follow-up/reply workflows.
- Source-aware outreach drafts from `ai_sdr`, `apollo_client_acquisition`, and future `linkedin_future` / `meta_future` sources.
- Email send/queue/failure events from the My Sales Tool sending API.

## 2. Environment

Create `.env.local` in the project root:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SESSION_SECRET=
OTP_SECRET=
ADMIN_ALLOWED_EMAIL=wtaanu@gmail.com
ADMIN_PASSWORD=
OWNER_NOTIFICATION_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3001
BRAND_LOGO_URL=
GOOGLE_CALENDAR_ACCESS_TOKEN=
GOOGLE_CALENDAR_ID=primary
DEFAULT_MEETING_URL=
CLIENT_ACQUISITION_TOOL_PATH=C:\Users\pawan\Documents\Codex\My Sales Tool\Code
CLIENT_ACQUISITION_API_URL=http://127.0.0.1:4100
```

Use long random strings for `ADMIN_SESSION_SECRET` and `OTP_SECRET`.

Add the same shared database values in `C:\Users\pawan\Documents\Codex\My Sales Tool\Code\.env`:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLIENT_ACQUISITION_BRIDGE_PORT=4100
```

The AI SDR app calls `CLIENT_ACQUISITION_API_URL`. The My Sales Tool bridge receives those calls, runs approved jobs, sends or queues emails, and writes the results back into the shared Supabase tables.

## 3. Create First Admin

Generate a bcrypt password hash:

```powershell
node scripts/hash-password.mjs "YourStrongPassword"
```

Insert the admin user in Supabase SQL Editor:

```sql
insert into public.admin_users (email, password_hash, role)
values ('you@example.com', 'PASTE_HASH_HERE', 'owner');
```

## 4. Run

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Run the My Sales Tool bridge in a second terminal:

```powershell
cd "C:\Users\pawan\Documents\Codex\My Sales Tool\Code"
npm run bridge
```

Open:

```text
http://127.0.0.1:3001
http://127.0.0.1:3001/admin/login
```

## 5. Current Status

Wired:

- OTP request API.
- OTP verify API.
- Verified profile creation.
- Consent log creation.
- Admin login API.
- Protected `/admin` route.
- Agent interest submission.
- Custom agent request submission.
- Initial AI-style lead score and priority.
- Activity timeline records.
- Owner notification draft records.
- Call booking request API.
- Lead status update to `Call Booked`.
- Individual SEO landing pages for all 50 agents.
- Public privacy, terms, cookie policy, unsubscribe, and data request pages.
- Unsubscribe suppression records.
- Data/privacy request records.
- Admin visibility for recent call requests and data request counts.
- My Sales Tool email/outreach adapter.
- Branded OTP, verification, enquiry confirmation, owner alert, and booking emails.
- OpenAI lead analysis with heuristic fallback.
- Google Calendar event creation with safe fallback to manual requested status.
- Admin lead detail pages.
- Admin pipeline page.
- Admin call request management.
- Admin compliance center.
- Admin status update APIs for leads, bookings, and data requests.
- Admin logout.
- Admin email center.
- Admin agent manager and performance view.
- Admin custom request review.
- Admin analytics.
- Admin settings readiness page.
- Admin client acquisition / personal marketing funnel page.
- Readiness checks for existing Sales Tool path, Apollo service, drafts, follow-ups, inbox replies, and funnel template.
- Shared Supabase tables for Sales Tool job runs, source-aware outreach drafts, and email events.
- Admin client acquisition dashboard reading shared Supabase funnel records.
- My Sales Tool bridge API for running jobs, accepting external drafts, and sending/queueing email through the Sales Tool.
- Source identifiers for `ai_sdr`, `apollo_client_acquisition`, `linkedin_future`, and `meta_future`.
- SEO sitemap and robots.
- Industry SEO landing pages.
- Country SEO landing pages.
- Verified future chatbot entry point.
- Free audit form after verified subscription.
- On-screen AI audit report with analytics, ROI direction, recommended agents, roadmap, and quick wins.
- Free audit PDF email attachment through My Sales Tool SMTP bridge.
- Free audit logs and consent logs in admin compliance center.
- Ten long-tail SEO solution pages under `/solutions/[slug]`.

Pending:

- Supabase production project configuration.
- First admin user creation.
- My Sales Tool bridge running and SMTP configured.
- Google Calendar OAuth/access-token setup for production reliability.
- Zoom API integration if Zoom links should be generated dynamically instead of using `DEFAULT_MEETING_URL`.
- Real chatbot conversational backend when client traffic starts.
- Visual logo/image assets and final legal review before public launch.
- Production deployment of the bridge/API layer behind authentication.
