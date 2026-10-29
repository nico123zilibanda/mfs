/**
 * Live Meetings module types.
 *
 * Mirrors the database tables `public.live_meetings` and
 * `public.live_meeting_registrations`.
 *
 * The database enforces meeting state and timestamp consistency
 * (status transitions, started_at/ended_at population). Domain code
 * must not bypass those constraints; this type layer only describes
 * the shape of data the repository returns and the inputs it accepts.
 */

/**
 * Allowed meeting lifecycle states.
 *
 * Must stay consistent with the database CHECK constraint on
 * `public.live_meetings.status`.
 */
export type MeetingStatus =
  | "scheduled"
  | "live"
  | "ended"
  | "cancelled";

export const MEETING_STATUS: readonly MeetingStatus[] = [
  "scheduled",
  "live",
  "ended",
  "cancelled",
] as const;

/**
 * Human-readable Swahili labels for each meeting status.
 */
export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: "Imepangwa",
  live: "Kwa moja kwa moja",
  ended: "Imemaliza",
  cancelled: "Imehairishwa",
} as const;

/**
 * A single live meeting row returned by the repository.
 *
 * `created_by`, `started_at`, `ended_at`, `room_name`, `status`,
 * `scheduled_start_at` and `updated_at` are all server-managed.
 * Clients never supply them through untrusted form input.
 */
export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  status: MeetingStatus;
  roomName: string;
  scheduledStartAt: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  createdBy: string | null;
}

/**
 * A single registration for a meeting.
 *
 * `user_id` references `auth.users` and is required for the current
 * registration model (anonymous registration is not supported).
 */
export interface MeetingRegistration {
  id: string;
  meetingId: string;
  userId: string | null;
  displayName: string;
  registeredAt: string;
  accessTokenHash: string | null;
}

/**
 * Lightweight projection used by public/admin listing views.
 */
export interface MeetingSummary extends Pick<Meeting, "id" | "title" | "status" | "scheduledStartAt" | "roomName"> {
  description: string | null;
  createdAt: string;
  participantCount: number;
}

/**
 * Input shape accepted when creating a meeting.
 *
 * Privileged fields (`created_by`, `started_at`, `ended_at`,
 * `status`, `room_name`) are intentionally absent so that untrusted
 * form input can never set them. The repository/server action must
 * assign them.
 */
export interface CreateMeetingInput {
  title: string;
  description?: string | null;
  scheduledStartAt: string;
}

/**
 * Input shape accepted when updating a meeting.
 *
 * All fields are optional because updates are partial. Privileged
 * fields remain absent so clients cannot mutate them.
 */
export interface UpdateMeetingInput {
  title?: string;
  description?: string | null;
  scheduledStartAt?: string;
}

/**
 * Input shape accepted when registering a citizen for a meeting.
 *
 * `meetingId` is the meeting being registered for. `displayName` is
 * the public name the citizen wants to show in the attendee list.
 * `userId` is derived from the authenticated session on the server.
 */
export interface RegisterMeetingInput {
  meetingId: string;
  displayName: string;
}

/**
 * Input shape accepted when unregistering a citizen from a meeting.
 */
export interface UnregisterMeetingInput {
  meetingId: string;
}

/**
 * Input shape accepted when an administrator transitions a meeting
 * status. The `status` is restricted to the allowed lifecycle
 * values; the server-side business logic performs the actual
 * transition validation.
 */
export interface UpdateMeetingStatusInput {
  id: string;
  status: MeetingStatus;
}

/**
 * Filters accepted when listing meetings.
 *
 * `status` is a single allowed value; when omitted, all statuses are
 * returned. `search` matches the meeting title (case-insensitive).
 */
export interface MeetingsFilters {
  status?: MeetingStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Paginated listing response, mirroring `ReportsResponse`.
 */
export interface MeetingsResponse {
  meetings: MeetingSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filters accepted when listing registrations for a meeting.
 */
export interface MeetingRegistrationFilters {
  page?: number;
  pageSize?: number;
}

/**
 * Paginated registration listing response.
 */
export interface MeetingRegistrationsResponse {
  registrations: MeetingRegistration[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}