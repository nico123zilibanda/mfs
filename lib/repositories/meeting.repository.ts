import "server-only";

import crypto from "node:crypto";

import { createSupabaseServerClient } from "@/lib/auth/server";
import { ensureFound, throwDatabaseError } from "@/lib/db/errors";

import type {
  Meeting,
  MeetingRegistration,
  MeetingSummary,
  MeetingsResponse,
  MeetingRegistrationsResponse,
  CreateMeetingInput,
  UpdateMeetingInput,
  UpdateMeetingStatusInput,
  MeetingsFilters,
  MeetingRegistrationFilters,
} from "@/lib/types/meeting";

import type { RegisterMeetingInput } from "@/lib/schemas/meeting";

const MEETINGS_TABLE = "live_meetings";
const REGISTRATIONS_TABLE = "live_meeting_registrations";

type MeetingRow = {
  id: string;
  title: string;
  description: string | null;
  status: Meeting["status"];
  room_name: string;
  scheduled_start_at: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ended_at: string | null;
  created_by: string | null;
};

type RegistrationRow = {
  id: string;
  meeting_id: string;
  user_id: string | null;
  display_name: string;
  registered_at: string;
  access_token_hash: string | null;
};

function mapMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    roomName: row.room_name,
    scheduledStartAt: row.scheduled_start_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdBy: row.created_by ?? null,
  };
}

function mapRegistration(row: RegistrationRow): MeetingRegistration {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    userId: row.user_id,
    displayName: row.display_name,
    registeredAt: row.registered_at,
    accessTokenHash: row.access_token_hash,
  };
}

export async function listMeetings(
  filters: MeetingsFilters = {},
): Promise<MeetingsResponse> {
  const supabase = await createSupabaseServerClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(MEETINGS_TABLE)
    .select(
      "id,title,description,status,room_name,scheduled_start_at,created_at,updated_at,started_at,ended_at",
      { count: "exact" },
    )
    .order("scheduled_start_at", { ascending: true });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error, count } = await query.range(from, to);
  throwDatabaseError(error, "listing meetings");

  const meetings = (data as MeetingRow[] | null ?? []).map(mapMeeting);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Build summaries with participant counts
  const summaries: MeetingSummary[] = await Promise.all(
    meetings.map(async (m) => {
      const { count: pc } = await supabase
        .from(REGISTRATIONS_TABLE)
        .select("*", { count: "exact", head: true })
        .eq("meeting_id", m.id);
      return {
        id: m.id,
        title: m.title,
        status: m.status,
        scheduledStartAt: m.scheduledStartAt,
        roomName: m.roomName,
        description: m.description,
        createdAt: m.createdAt,
        participantCount: pc ?? 0,
      };
    }),
  );

  return { meetings: summaries, total, page, pageSize, totalPages };
}

export async function findMeetingById(id: string): Promise<Meeting> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(MEETINGS_TABLE)
    .select("id,title,description,status,room_name,scheduled_start_at,created_at,updated_at,started_at,ended_at")
    .eq("id", id)
    .maybeSingle();
  throwDatabaseError(error, "finding meeting by id");
  return mapMeeting(ensureFound(data as MeetingRow | null, "Meeting"));
}

export async function createScheduledMeeting(
  input: CreateMeetingInput,
  createdBy: string,
): Promise<Meeting> {
  const supabase = await createSupabaseServerClient();
  const roomName = `meeting-${crypto.randomUUID()}`;
  const { data, error } = await supabase
    .from(MEETINGS_TABLE)
    .insert({
      title: input.title,
      description: input.description ?? null,
      scheduled_start_at: input.scheduledStartAt,
      status: "scheduled",
      room_name: roomName,
      created_by: createdBy,
    })
    .select("*")
    .single();
  throwDatabaseError(error, "creating scheduled meeting");
  return mapMeeting(ensureFound(data as MeetingRow | null, "Meeting"));
}

export async function updateScheduledMeeting(
  id: string,
  input: UpdateMeetingInput,
): Promise<Meeting> {
  const supabase = await createSupabaseServerClient();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.scheduledStartAt !== undefined)
    patch.scheduled_start_at = input.scheduledStartAt;

  const { data, error } = await supabase
    .from(MEETINGS_TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  throwDatabaseError(error, "updating scheduled meeting");
  return mapMeeting(ensureFound(data as MeetingRow | null, "Meeting"));
}

export async function updateMeetingStatus(
  input: UpdateMeetingStatusInput,
): Promise<Meeting> {
  const supabase = await createSupabaseServerClient();
  const patch: Record<string, unknown> = { status: input.status };
  if (input.status === "live") patch.started_at = new Date().toISOString();
  if (input.status === "ended") patch.ended_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(MEETINGS_TABLE)
    .update(patch)
    .eq("id", input.id)
    .select("*")
    .single();
  throwDatabaseError(error, "updating meeting status");
  return mapMeeting(ensureFound(data as MeetingRow | null, "Meeting"));
}

export async function listRegistrations(
  meetingId: string,
  filters: MeetingRegistrationFilters = {},
): Promise<MeetingRegistrationsResponse> {
  const supabase = await createSupabaseServerClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(REGISTRATIONS_TABLE)
    .select("*", { count: "exact" })
    .eq("meeting_id", meetingId)
    .order("registered_at", { ascending: true })
    .range(from, to);
  throwDatabaseError(error, "listing registrations");

  const registrations = (data as RegistrationRow[] | null ?? []).map(
    mapRegistration,
  );
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { registrations, total, page, pageSize, totalPages };
}

export async function hasUserRegistered(
  meetingId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REGISTRATIONS_TABLE)
    .select("id")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();
  throwDatabaseError(error, "checking registration");
  return !!data;
}

export async function deleteMeeting(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  // Delete related registrations first to be safe if no cascade
  const { error: regError } = await supabase
    .from(REGISTRATIONS_TABLE)
    .delete()
    .eq("meeting_id", id);
  throwDatabaseError(regError, "deleting meeting registrations");

  const { error } = await supabase.from(MEETINGS_TABLE).delete().eq("id", id);
  throwDatabaseError(error, "deleting meeting");
}

export const meetingRepository = {
  listMeetings,
  findMeetingById,
  createScheduledMeeting,
  updateScheduledMeeting,
  updateMeetingStatus,
  listRegistrations,
  hasUserRegistered,
  createRegistration,
  createAnonymousRegistration,
  verifyAnonymousRegistration,
  deleteMeeting,
};

export async function verifyAnonymousRegistration(
  meetingId: string,
  rawToken: string,
): Promise<MeetingRegistration | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  if (supabaseUrl && serviceRoleKey) {
    const { createClient } = await import("@supabase/supabase-js");
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await serviceClient
      .from(REGISTRATIONS_TABLE)
      .select("*")
      .eq("meeting_id", meetingId)
      .eq("access_token_hash", hash)
      .maybeSingle();
    throwDatabaseError(error, "verifying registration");
    if (!data) return null;
    return mapRegistration(data as RegistrationRow);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REGISTRATIONS_TABLE)
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("access_token_hash", hash)
    .maybeSingle();
  throwDatabaseError(error, "verifying registration");
  if (!data) return null;
  return mapRegistration(data as RegistrationRow);
}

export async function createAnonymousRegistration(
  input: RegisterMeetingInput,
): Promise<{ registration: MeetingRegistration; rawToken: string }> {
  const supabase = await createSupabaseServerClient();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const { data, error } = await supabase.rpc("register_anonymous_meeting", {
    p_meeting_id: input.meetingId,
    p_display_name: input.displayName,
    p_token_hash: hash,
  });

  if (error) {
    if (error.message?.includes("already registered")) {
      throw new Error("You are already registered for this meeting.");
    }
    throw new Error(error.message || "Failed to register.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error("Failed to register.");
  }

  return {
    registration: {
      id: row.registration_id,
      meetingId: row.meeting_id,
      userId: null,
      displayName: row.display_name,
      registeredAt: new Date().toISOString(),
      accessTokenHash: hash,
    },
    rawToken,
  };
}

export async function createRegistration(
  input: RegisterMeetingInput,
  userId: string,
): Promise<MeetingRegistration> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(REGISTRATIONS_TABLE)
    .insert({
      meeting_id: input.meetingId,
      user_id: userId,
      display_name: input.displayName,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You are already registered for this meeting.");
    }
    throwDatabaseError(error, "creating registration");
  }
  return mapRegistration(ensureFound(data as RegistrationRow | null, "Registration"));
}
