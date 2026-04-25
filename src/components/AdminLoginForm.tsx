"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function login() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to login.");
      }

      window.location.href = "/admin";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void login(); }}>
      <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => setEmail(event.target.value)} placeholder="Admin email or user ID" required type="email" value={email} />
      <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => setPassword(event.target.value)} placeholder="Password" required type="password" value={password} />
      <button className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600" disabled={isLoading}>
        {isLoading ? "Checking..." : "Login"}
      </button>
      {message && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
    </form>
  );
}
