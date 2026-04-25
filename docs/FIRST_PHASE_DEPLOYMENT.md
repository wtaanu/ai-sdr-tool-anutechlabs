# First Phase Deployment

## Production Flow

- AI SDR public site deploys as the main Vercel project.
- My Sales Tool bridge deploys as a separate backend service and exposes an HTTPS API URL.
- Hostinger is used for the custom domain/DNS.
- Supabase is the shared production database for both projects.

## AI SDR Vercel Project

Project path:

```text
C:\Users\pawan\Documents\Codex\My Portfolio\Code\ai-sdr-website
```

Build command:

```text
npm run build
```

Install command:

```text
npm install
```

Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_ALLOWED_EMAIL=wtaanu@gmail.com
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
OTP_SECRET=
OWNER_NOTIFICATION_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SITE_URL=https://your-domain.com
BRAND_LOGO_URL=
GOOGLE_CALENDAR_ACCESS_TOKEN=
GOOGLE_CALENDAR_ID=primary
DEFAULT_MEETING_URL=
CLIENT_ACQUISITION_API_URL=https://your-sales-tool-api-domain.com
```

Set `ADMIN_PASSWORD` in Vercel to the owner password. Do not commit it to code.

## My Sales Tool Backend

Project path:

```text
C:\Users\pawan\Documents\Codex\My Sales Tool\Code
```

Run command:

```text
npm run bridge
```

Environment variables:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLIENT_ACQUISITION_BRIDGE_PORT=4100
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Anutech Labs
SMTP_REPLY_TO=
SMTP_TLS_REJECT_UNAUTHORIZED=false
IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=
IMAP_PASS=
IMAP_INBOX=INBOX
IMAP_LOOKBACK_DAYS=14
OPENAI_API_KEY=
APOLLO_API_KEY=
ZEROBOUNCE_API_KEY=
```

Important: a plain Hostinger shared hosting plan usually cannot run this Node bridge continuously. Use one of these for the bridge:

- Vercel serverless adaptation later.
- Railway / Render / Fly.io as the easiest Node API host.
- Hostinger VPS if upgraded.

For first phase, deploy AI SDR to Vercel and run My Sales Tool bridge on a Node-capable host with a public HTTPS URL. Put that URL in `CLIENT_ACQUISITION_API_URL`.

## Hostinger Domain

In Hostinger DNS:

1. Add the custom domain to the AI SDR Vercel project.
2. Copy Vercel DNS records.
3. In Hostinger, set:
   - `A` record for root domain if Vercel gives one.
   - `CNAME` for `www` to Vercel target.
4. In Vercel, wait for SSL verification.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.

## Required Supabase SQL

Before testing production, run the full SQL:

```text
docs/supabase-schema.sql
```

This includes:

- OTP/profile/consent/enquiry/booking tables.
- Free audit tables.
- Agent videos.
- Sales prospects, campaigns, drafts, replies, segments.
- Transaction logs.

## Production Checks

1. Public site opens on custom domain.
2. Subscribe form sends OTP by email.
3. OTP is not displayed on screen.
4. User can verify and unlock the site.
5. `/free-audit` creates report and emails PDF.
6. `/admin/login` only accepts owner email.
7. `/admin` redirects to login when not authenticated.
8. Login remains active in the browser for about six months unless cookies are cleared.
9. Admin Client Acquisition can reach the Sales Tool API.
10. Transaction logs appear in Supabase `transaction_logs`.
