"use server";

import { z } from "zod";

import { actionFailure, executeAction } from "@/lib/actions/utils";
import type { ActionResult } from "@/lib/types/action-result";

import {
  createMeetingSchema,
  updateMeetingSchema,
  registerMeetingSchema,
  listMeetingsSchema,
  type UpdateMeetingInput,
} from "@/lib/schemas/meeting";

import { meetingRepository } from "@/lib/repositories/meeting.repository";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { getLiveKitConfig, getRoomServiceClient } from "@/lib/livekit/server";
import { AccessToken } from "livekit-server-sdk";

import type {
  Meeting,
  MeetingsResponse,
  MeetingRegistration,
  MeetingRegistrationsResponse,
} from "@/lib/types/meeting";

const meetingIdSchema = z.string().uuid("Invalid meeting ID.");

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  let user = userData.user;
  if (!user || userError) {
    const { data: sessionData } = await supabase.auth.getSession();
    user = sessionData.session?.user ?? null;
  }
  if (!user) {
    throw new Error("Unauthorized.");
  }
  const role =
    (user.app_metadata as any)?.role ?? (user.user_metadata as any)?.role;
  if (role !== "admin" && role !== "system_admin") {
    throw new Error("Forbidden.");
  }
  return user.id;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Unauthorized.");
  return data.user.id;
}

/**
 * Live Meetings server actions.
 *
 * All administrative actions enforce server-side authorization and
 * derive identities from the authenticated session. Transitions follow
 * the allowed lifecycle: scheduled -> live -> ended; scheduled -> cancelled.
 *
 * CONCURRENCY NOTE (non-atomic): State checks are performed via separate
 * read-modify operations (findMeetingById followed by update). Under
 * concurrent requests two actors can both pass the precondition check
 * before either commit. This implementation does NOT guarantee atomic
 * transitions. To enforce atomicity and stronger invariants, prefer a
 * secure database RPC (e.g. `transition_live_meeting`) that validates the
 * current status in a single UPDATE ... WHERE id = $1 AND status = $2
 * returning the new row (with affected row checks), or use row-level
 * locking (SELECT ... FOR UPDATE) inside a transaction. Until such an
 * RPC/transaction exists, these actions must be treated as best-effort
 * with TOCTOU risk.
 */

/**
 * Create a scheduled meeting (admin only).
 */
export async function createMeetingAction(
  input: unknown,
): Promise<ActionResult<Meeting>> {
  const validation = createMeetingSchema.safeParse(input);
  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  const adminId = await requireAdmin();

  return executeAction(
    () => meetingRepository.createScheduledMeeting(validation.data, adminId),
    "Failed to create meeting.",
  );
}

/**
 * Update a meeting that is still scheduled (admin only).
 */
export async function updateMeetingAction(
  input: { id: string } & UpdateMeetingInput,
): Promise<ActionResult<Meeting>> {
  const { id, ...rest } = input as { id: string; [key: string]: unknown };
  const idValidation = meetingIdSchema.safeParse(id);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  const validation = updateMeetingSchema.safeParse(rest);
  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  await requireAdmin();

  // Non-atomic check: see CONCURRENCY NOTE above.
  const current = await meetingRepository.findMeetingById(idValidation.data);
  if (current.status !== "scheduled") {
    throw new Error("Only scheduled meetings can be updated.");
  }

  return executeAction(
    () => meetingRepository.updateScheduledMeeting(idValidation.data, validation.data),
    "Failed to update meeting.",
  );
}

/**
 * Cancel a meeting that is still scheduled (admin only).
 */
export async function cancelMeetingAction(input: {
  id: string;
}): Promise<ActionResult<Meeting>> {
  const idValidation = meetingIdSchema.safeParse(input?.id);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  await requireAdmin();

  // Non-atomic check: see CONCURRENCY NOTE above.
  const current = await meetingRepository.findMeetingById(idValidation.data);
  if (current.status !== "scheduled") {
    throw new Error("Only scheduled meetings can be cancelled.");
  }

  return executeAction(
    () =>
      meetingRepository.updateMeetingStatus({
        id: idValidation.data,
        status: "cancelled",
      }),
    "Failed to cancel meeting.",
  );
}

/**
 * Start a scheduled meeting (admin only).
 */
export async function startMeetingAction(input: {
  id: string;
}): Promise<ActionResult<Meeting>> {
  const idValidation = meetingIdSchema.safeParse(input?.id);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  await requireAdmin();

  // Non-atomic check: see CONCURRENCY NOTE above.
  const current = await meetingRepository.findMeetingById(idValidation.data);
  if (current.status !== "scheduled") {
    throw new Error("Only scheduled meetings can be started.");
  }

  return executeAction(
    () =>
      meetingRepository.updateMeetingStatus({
        id: idValidation.data,
        status: "live",
      }),
    "Failed to start meeting.",
  );
}

/**
 * End a live meeting (admin only).
 */
export async function endMeetingAction(input: { id: string }): Promise<ActionResult<Meeting>> {
  const idValidation = meetingIdSchema.safeParse(input?.id);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  await requireAdmin();

  // Non-atomic check: see CONCURRENCY NOTE above.
  const current = await meetingRepository.findMeetingById(idValidation.data);
  if (current.status !== "live") {
    throw new Error("Only live meetings can be ended.");
  }

  return executeAction(async () => {
    let cleanupWarning: string | null = null;
    try {
      const roomService = getRoomServiceClient();
      // Try to delete the room to remove participants
      await roomService.deleteRoom(current.roomName);
    } catch (err) {
      cleanupWarning =
        err instanceof Error
          ? `Meeting ended, but LiveKit cleanup failed: ${err.message}`
          : "Meeting ended, but LiveKit cleanup failed and participants may not have been removed.";
    }

    const meeting = await meetingRepository.updateMeetingStatus({
      id: idValidation.data,
      status: "ended",
    });

    if (cleanupWarning) {
      throw new Error(cleanupWarning);
    }

    return meeting;
  }, "Failed to end meeting.");
}

/**
 * Delete a meeting (admin only).
 */
export async function deleteMeetingAction(input: { id: string }): Promise<ActionResult<{ id: string }>> {
  const idValidation = meetingIdSchema.safeParse(input?.id);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  await requireAdmin();

  // Non-atomic check: see CONCURRENCY NOTE above.
  const current = await meetingRepository.findMeetingById(idValidation.data);
  if (current.status === "live") {
    throw new Error("Cannot delete a live meeting. End the meeting first.");
  }

  return executeAction(async () => {
    await meetingRepository.deleteMeeting(idValidation.data);
    return { id: idValidation.data };
  }, "Failed to delete meeting.");
}

/**
 * Retrieve public meeting information.
 */
export async function getPublicMeetingAction(id: string): Promise<ActionResult<Meeting>> {
  const idValidation = meetingIdSchema.safeParse(id);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => meetingRepository.findMeetingById(idValidation.data),
    "Failed to load meeting.",
  );
}

/**
 * Register an authenticated citizen for a meeting.
 */
export async function registerForMeetingAction(
  input: unknown,
): Promise<ActionResult<MeetingRegistration>> {
  const validation = registerMeetingSchema.safeParse(input);
  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  const userId = await requireUser();

  return executeAction(
    () => meetingRepository.createRegistration(validation.data, userId),
    "Failed to register.",
  );
}

/**
 * Retrieve the current citizen's registration status.
 */
export async function getMyRegistrationStatusAction(
  meetingId: string,
): Promise<ActionResult<boolean>> {
  const idValidation = meetingIdSchema.safeParse(meetingId);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  const userId = await requireUser();

  return executeAction(
    () => meetingRepository.hasUserRegistered(idValidation.data, userId),
    "Failed to check registration.",
  );
}

/**
 * Retrieve registrations for a meeting for authorized admins.
 */
export async function listMeetingRegistrationsAction(
  meetingId: string,
): Promise<ActionResult<MeetingRegistrationsResponse>> {
  const idValidation = meetingIdSchema.safeParse(meetingId);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  await requireAdmin();

  return executeAction(
    () => meetingRepository.listRegistrations(idValidation.data),
    "Failed to list registrations.",
  );
}

/**
 * List meetings (public/admin views).
 */
export async function registerAnonymousForMeetingAction(
  input: unknown,
): Promise<ActionResult<{ rawToken: string }>> {
  const validation = registerMeetingSchema.safeParse(input);
  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(async () => {
    const meeting = await meetingRepository.findMeetingById(validation.data.meetingId);
    if (meeting.status === "cancelled" || meeting.status === "ended") {
      throw new Error("Meeting is not open for registration.");
    }
    const result = await meetingRepository.createAnonymousRegistration(validation.data);
    return { rawToken: result.rawToken };
  }, "Failed to register.");
}

export async function requestMeetingTokenAction(input: {
  meetingId: string;
  rawToken: string;
}): Promise<ActionResult<{ token: string; serverUrl: string }>> {
  const meetingIdValidation = z
    .string()
    .uuid()
    .safeParse(input?.meetingId);

  if (!meetingIdValidation.success || !input?.rawToken) {
    return actionFailure("Validation failed.");
  }

  try {
    // 1. Retrieve meeting from trusted database source.
    const meeting = await meetingRepository.findMeetingById(
      meetingIdValidation.data,
    );

    if (meeting.status !== "live") {
      return actionFailure("Meeting is not live.");
    }

    // 2. Verify anonymous registration credential.
    const registration =
      await meetingRepository.verifyAnonymousRegistration(
        meetingIdValidation.data,
        input.rawToken,
      );

    if (!registration) {
      return actionFailure("Invalid registration credential.");
    }

    // 3. Identify the authenticated meeting creator (if present).
    const supabase = await createSupabaseServerClient();

    let user = null;
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser ?? null;
    } catch {
      user = null;
    }

    const isModerator = !!user && !!meeting.createdBy && user.id === meeting.createdBy;

    // 4. Generate trusted LiveKit participant metadata.
    const metadata = JSON.stringify({
      meetingRole: isModerator ? "moderator" : "participant",
    });

    // 5. Generate LiveKit token.
    const { url, apiKey, apiSecret } = getLiveKitConfig();

    const accessToken = new AccessToken(apiKey, apiSecret, {
      identity: `anon-${registration.id}`,
      name: registration.displayName,
      metadata,
      ttl: "10m",
    });

    accessToken.addGrant({
      roomJoin: true,
      room: meeting.roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await accessToken.toJwt();

    return {
      success: true,
      data: {
        token,
        serverUrl: url,
      },
    };
  } catch (error) {
    console.error("requestMeetingTokenAction failed:", error);

    return actionFailure(
      "Unable to generate meeting access token.",
    );
  }
}

export async function listMeetingsAction(
  input: unknown,
): Promise<ActionResult<MeetingsResponse>> {
  const validation = listMeetingsSchema.safeParse(input ?? {});
  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => meetingRepository.listMeetings(validation.data),
    "Failed to list meetings.",
  );
}

export type MeetingJoinInfo = {
  meetingId: string;
  roomName: string;
  status: Meeting["status"];
  canJoin: boolean;
  isRegistered: boolean;
  providerConfigured: boolean;
  token: string | null;
  serverUrl: string | null;
  identity: string | null;
};

/**
 * Get meeting join information for an authenticated registered citizen.
 * Token generation is server-side only. If no video provider is configured,
 * providerConfigured is false and token/serverUrl are null.
 */
export async function getMeetingJoinInfoAction(
  meetingId: string,
): Promise<ActionResult<MeetingJoinInfo>> {
  const idValidation = meetingIdSchema.safeParse(meetingId);
  if (!idValidation.success) {
    return actionFailure("Validation failed.");
  }

  const userId = await requireUser();

  return executeAction(async () => {
    const meeting = await meetingRepository.findMeetingById(idValidation.data);
    if (meeting.status === "cancelled" || meeting.status === "ended") {
      throw new Error("Meeting is not joinable.");
    }
    if (meeting.status !== "live") {
      throw new Error("Meeting is not live.");
    }

    const registered = await meetingRepository.hasUserRegistered(
      idValidation.data,
      userId,
    );
    if (!registered) {
      throw new Error("Not registered for this meeting.");
    }

    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitWsUrl = process.env.LIVEKIT_WS_URL;

    if (!livekitApiKey || !livekitApiSecret || !livekitWsUrl) {
      return {
        meetingId: meeting.id,
        roomName: meeting.roomName,
        status: meeting.status,
        canJoin: true,
        isRegistered: true,
        providerConfigured: false,
        token: null,
        serverUrl: null,
        identity: userId,
      };
    }

    // If LiveKit SDK were installed, we would generate token here.
    // Not installed in this environment - return safe boundary info.
    return {
      meetingId: meeting.id,
      roomName: meeting.roomName,
      status: meeting.status,
      canJoin: true,
      isRegistered: true,
      providerConfigured: false,
      token: null,
      serverUrl: livekitWsUrl,
      identity: userId,
    };
  }, "Failed to get meeting join information.");
}
