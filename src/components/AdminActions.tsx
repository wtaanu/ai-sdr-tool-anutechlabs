"use client";

import { useState } from "react";

const leadStatuses = ["New Lead", "Qualified", "Call Booked", "Call Done", "Proposal Sent", "Negotiation", "Won", "Lost"];
const bookingStatuses = ["requested", "scheduled", "completed", "cancelled"];
const requestStatuses = ["new", "reviewing", "completed", "rejected"];

export function LeadStatusControl({ enquiryId, currentStatus }: { enquiryId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: string) {
    setStatus(nextStatus);
    setMessage("");
    const response = await fetch(`/api/admin/enquiries/${enquiryId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const result = await response.json();
    setMessage(response.ok ? "Updated" : result.error || "Update failed");
  }

  return (
    <div className="space-y-2">
      <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" onChange={(event) => void updateStatus(event.target.value)} value={status}>
        {leadStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

export function BookingStatusControl({
  bookingId,
  currentStatus,
  currentMeetingLink
}: {
  bookingId: string;
  currentStatus: string;
  currentMeetingLink?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [meetingLink, setMeetingLink] = useState(currentMeetingLink || "");
  const [message, setMessage] = useState("");

  async function updateBooking(nextStatus = status) {
    setMessage("");
    const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, meetingLink })
    });
    const result = await response.json();
    setMessage(response.ok ? "Booking updated" : result.error || "Update failed");
  }

  return (
    <div className="space-y-2">
      <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" onChange={(event) => { setStatus(event.target.value); void updateBooking(event.target.value); }} value={status}>
        {bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs" onChange={(event) => setMeetingLink(event.target.value)} placeholder="Meeting link" value={meetingLink} />
      <button className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white" onClick={() => void updateBooking()} type="button">
        Save link
      </button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

export function DataRequestStatusControl({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: string) {
    setStatus(nextStatus);
    setMessage("");
    const response = await fetch(`/api/admin/data-requests/${requestId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const result = await response.json();
    setMessage(response.ok ? "Updated" : result.error || "Update failed");
  }

  return (
    <div className="space-y-2">
      <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" onChange={(event) => void updateStatus(event.target.value)} value={status}>
        {requestStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

export function LogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100" onClick={() => void logout()} type="button">
      Logout
    </button>
  );
}
