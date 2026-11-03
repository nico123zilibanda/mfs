import Container from "@/components/layout/Container";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackHero from "@/components/feedback/FeedbackHero";

export default function FeedbackPage() {
  return (
    <section
      className="
        min-h-[calc(100vh-18rem)]
        w-full
        bg-[#f7f8f5]
        py-16

        dark:bg-slate-950

        sm:py-20

        lg:py-24
      "
    >
      <Container>
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-3xl
            flex-col
            gap-8

            sm:gap-10
          "
        >
          <FeedbackHero />

          <FeedbackCard>
            <FeedbackForm />
          </FeedbackCard>
        </div>
      </Container>
    </section>
  );
}