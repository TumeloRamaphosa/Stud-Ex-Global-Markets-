/**
 * Google Calendar Integration
 * Syncs content schedule with Google Calendar
 *
 * Calendar account: configured via GOOGLE_CALENDAR_ID env var
 *
 * Authentication: Use Google OAuth2 or service account.
 * Store credentials in environment variables, never in code.
 */

const GOOGLE_API_BASE = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = process.env.GOOGLE_ACCESS_TOKEN;
  if (!token) throw new Error('GOOGLE_ACCESS_TOKEN not configured');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a calendar event for a scheduled post.
 */
export async function createPostEvent(
  title: string,
  description: string,
  scheduledDate: string,
  scheduledTime: string,
  platforms: string[]
): Promise<{ eventId: string; htmlLink: string }> {
  const headers = await getAuthHeaders();

  // Build datetime (default to 15 min duration)
  const startDateTime = `${scheduledDate}T${scheduledTime || '09:00'}:00`;
  const endDate = new Date(`${startDateTime}`);
  endDate.setMinutes(endDate.getMinutes() + 15);
  const endDateTime = endDate.toISOString();

  const event = {
    summary: `[GoBot] ${title}`,
    description: `Marketing post scheduled via GoBot Marketing Hub\n\nPlatforms: ${platforms.join(', ')}\n\n${description}`,
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    colorId: '5', // Banana yellow — matches brand gold
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  const res = await fetch(
    `${GOOGLE_API_BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Calendar event creation failed: ${JSON.stringify(error)}`);
  }

  const data = await res.json();
  return { eventId: data.id, htmlLink: data.htmlLink };
}

/**
 * List upcoming marketing events from the calendar.
 */
export async function listUpcomingEvents(
  maxResults: number = 20
): Promise<{ id: string; summary: string; start: string; htmlLink: string }[]> {
  const headers = await getAuthHeaders();

  const now = new Date().toISOString();
  const res = await fetch(
    `${GOOGLE_API_BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
    { headers }
  );

  if (!res.ok) throw new Error('Failed to list calendar events');

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary,
    start: item.start?.dateTime || item.start?.date,
    htmlLink: item.htmlLink,
  }));
}

/**
 * Delete a calendar event (when a post is cancelled).
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const headers = await getAuthHeaders();

  await fetch(
    `${GOOGLE_API_BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${eventId}`,
    { method: 'DELETE', headers }
  );
}

export const calendarApi = {
  createEvent: createPostEvent,
  listUpcoming: listUpcomingEvents,
  deleteEvent,
};
