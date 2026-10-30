import { notFound, redirect } from "next/navigation";

import MeetingRoom from "@/components/meetings/room/MeetingRoom";
import { getPublicMeetingAction } from "@/lib/actions/meeting.actions";

interface MeetingRoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MeetingRoomPage({ params }: MeetingRoomPageProps) {
  const { id } = await params;

  const result = await getPublicMeetingAction(id);

  if (!result.success) {
    notFound();
  }

  const meeting = result.data;

  if (meeting.status === "cancelled" || meeting.status === "ended") {
    redirect("/public");
  }

  if (meeting.status !== "live") {
    redirect("/public");
  }

  return <MeetingRoom meetingId={meeting.id} meeting={meeting} />;
}
