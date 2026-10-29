import { listMeetingsAction } from "@/lib/actions/meeting.actions";
import AdminMeetingsManagement from "@/components/meetings/admin/AdminMeetingsManagement";
import DashboardPage from "@/components/dashboard/dashboard-page";

export default async function MeetingsPage() {
  const result = await listMeetingsAction({});

  const initialMeetings = result.success ? result.data.meetings : [];

  return (
    <DashboardPage>
      <AdminMeetingsManagement initialMeetings={initialMeetings} />
    </DashboardPage>
  );
}
