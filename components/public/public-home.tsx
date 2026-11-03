// components/public/public-home.tsx
import PublicHero from "./public-hero";
import PublicProcess from "./public-process";
import PublicMeetings from "@/components/meetings/public/PublicMeetings";
import { listMeetingsAction } from "@/lib/actions/meeting.actions";

export default async function PublicHome() {
  const result = await listMeetingsAction({});
  const initialMeetings = result.success ? result.data.meetings : [];

  return (
    <main
      className="
        relative
        w-full
        overflow-x-hidden
      "
    >
      {/* Hero */}
      <section className="relative w-full">
        <PublicHero />
      </section>

      {/* Meetings */}
      <section
        id="meetings"
        className="
          scroll-mt-24
          w-full
          border-t
          border-slate-100

          dark:border-slate-900
        "
      >
        <PublicMeetings initialMeetings={initialMeetings} />
      </section>

      {/* Process */}
      <section
        id="process"
        className="
          scroll-mt-24
          w-full
          border-t
          border-slate-100

          dark:border-slate-900
        "
      >
        <PublicProcess />
      </section>
    </main>
  );
}