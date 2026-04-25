type CalendarEventInput = {
  clientName: string;
  clientEmail: string;
  industry?: string | null;
  preferredTime: string;
  timezone: string;
  notes?: string;
};

export async function createCalendarEvent(input: CalendarEventInput) {
  const accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const meetingUrl = process.env.DEFAULT_MEETING_URL || "";

  if (!accessToken) {
    return {
      created: false,
      meetingLink: meetingUrl,
      eventId: null,
      detail: "GOOGLE_CALENDAR_ACCESS_TOKEN is not configured."
    };
  }

  const start = new Date(input.preferredTime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: `AI SDR consultation - ${input.clientName}`,
        description: [
          `Client: ${input.clientName}`,
          `Email: ${input.clientEmail}`,
          input.industry ? `Industry: ${input.industry}` : "",
          input.notes ? `Notes: ${input.notes}` : "",
          meetingUrl ? `Fallback meeting link: ${meetingUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        start: {
          dateTime: start.toISOString(),
          timeZone: input.timezone
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: input.timezone
        },
        attendees: [{ email: input.clientEmail }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      created: false,
      meetingLink: meetingUrl,
      eventId: null,
      detail: result.error?.message || "Google Calendar event creation failed."
    };
  }

  return {
    created: true,
    meetingLink: result.hangoutLink || meetingUrl || result.htmlLink || "",
    eventId: result.id as string,
    detail: "Calendar event created."
  };
}
