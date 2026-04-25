export const metadata = {
  title: "Cookie Policy | AI SDR by AnutechLabs"
};

export default function CookiePolicyPage() {
  return (
    <main className="bg-mist py-16">
      <section className="section-shell max-w-4xl rounded-lg bg-white p-8 shadow-soft">
        <a className="text-sm font-bold text-orange-600" href="/">Back to website</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Cookie Policy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
          <p>The website uses essential local browser storage to remember verified access after OTP completion. Future analytics and marketing cookies should be activated only with region-aware consent where required.</p>
          <p>Users can clear browser storage to remove local verified-state data. Marketing preferences can be updated through unsubscribe and data request pages.</p>
        </div>
      </section>
    </main>
  );
}
