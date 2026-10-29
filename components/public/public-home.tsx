import FeedbackCard from "@/components/feedback/FeedbackCard";
import FeedbackFooter from "@/components/feedback/FeedbackFooter";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackHero from "@/components/feedback/FeedbackHero";

import Container from "@/components/layout/Container";

import Link from "next/link";
import PublicHero from "./public-hero";
import PublicProcess from "./public-process";
import PublicMeetings from "@/components/meetings/public/PublicMeetings";
import { listMeetingsAction } from "@/lib/actions/meeting.actions";


export default async function PublicHome() {
  const result = await listMeetingsAction({});
  const initialMeetings = result.success ? result.data.meetings : [];

  return (

    <>

      <PublicHero />

      <section className="py-8">
        <Container>
          <div className="flex justify-center">
            <Link
              href="/public/chat"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white font-medium shadow hover:bg-blue-700 transition"
            >
              Chat with Admin
            </Link>
          </div>
        </Container>
      </section>

      <PublicMeetings initialMeetings={initialMeetings} />

      {/* <PublicServices /> */}

      {/* <PublicTrust /> */}

      {/* <PublicStats /> */}



      <section
        id="feedback-form"
        className="
          scroll-mt-24

          bg-[#f7f8f5]

          py-18

          sm:py-24

          dark:bg-slate-950
        "
      >

        <Container>

          <FeedbackHero />

          <FeedbackCard>

          <FeedbackForm />

          </FeedbackCard>

          <FeedbackFooter />

        </Container>


      </section>

      <PublicProcess />

    </>

  );

}