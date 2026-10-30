import { notFound } from "next/navigation";
import { meetingRepository } from "@/lib/repositories/meeting.repository";
import { MeetingLobby } from "@/components/meetings/public/MeetingLobby";

export default async function LiveMeetingPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  let meeting;
  try {
    meeting = await meetingRepository.findMeetingById(meetingId);
  } catch {
    notFound();
  }
  return <MeetingLobby meeting={meeting} />;
}
