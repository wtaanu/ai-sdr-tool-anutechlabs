export const dynamic = "force-dynamic";

const settings = [
  ["Supabase URL", "NEXT_PUBLIC_SUPABASE_URL"],
  ["Supabase service role", "SUPABASE_SERVICE_ROLE_KEY"],
  ["OpenAI API", "OPENAI_API_KEY"],
  ["Warm email API", "WARM_EMAIL_API_URL"],
  ["Owner email", "OWNER_NOTIFICATION_EMAIL"],
  ["Google calendar token", "GOOGLE_CALENDAR_ACCESS_TOKEN"],
  ["Default meeting URL", "DEFAULT_MEETING_URL"],
  ["Brand logo URL", "BRAND_LOGO_URL"],
  ["Client acquisition path", "CLIENT_ACQUISITION_TOOL_PATH"],
  ["Client acquisition API", "CLIENT_ACQUISITION_API_URL"]
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell max-w-4xl">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Environment readiness for production. Values are not displayed for security.</p>
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="space-y-3">
            {settings.map(([label, key]) => (
              <div key={key} className="flex items-center justify-between rounded-md bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-950">{label}</p>
                  <p className="text-xs text-slate-500">{key}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${process.env[key] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {process.env[key] ? "Configured" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
