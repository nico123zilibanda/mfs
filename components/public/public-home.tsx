import FeedbackCard from "@/components/feedback/FeedbackCard";
import FeedbackFooter from "@/components/feedback/FeedbackFooter";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackHero from "@/components/feedback/FeedbackHero";

import Container from "@/components/layout/Container";

import PublicHero from "./public-hero";
import PublicProcess from "./public-process";
import PublicServices from "./public-services";
import PublicStats from "./public-stats";
import PublicTrust from "./public-trust";


export default function PublicHome() {

  return (

    <>

      <PublicHero />

      <PublicServices />

      <PublicTrust />

      <PublicStats />

      <PublicProcess />


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


    </>

  );

}