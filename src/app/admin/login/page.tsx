import { LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata = {
  title: "Admin Login | AI SDR by AnutechLabs"
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-5">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-soft">
        <div className="mb-7">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-slate-950 text-orange-400">
            <LockKeyhole size={22} />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">AI SDR by AnutechLabs admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in with the owner ID and password to manage verified leads, enquiries, calls, and agents.
          </p>
        </div>
        <AdminLoginForm />
      </section>
    </main>
  );
}
