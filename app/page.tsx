import Container from "@/components/layout/Container";
import FeedbackCard from "@/components/feedback/ FeedbackCard";
import FeedbackFooter from "@/components/feedback/FeedbackFooter";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/shared/Section";
import SiteLogo from "@/components/shared/SiteLogo";
import { SITE } from "@/lib/constants/site";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import PublicNavigation from "@/components/shared/PublicNavigation";

export default function HomePage() {
  return (
    <main>
      <Section>
        <Container>
          <div className="space-y-10">
            <SiteLogo />

            <PageHeader
              title={SITE.name}
              description={SITE.description}
            />

            <PublicNavigation current="feedback" />
            <FeedbackCard>
              <div className="py-10 text-muted-foreground">
                <FeedbackForm />
              </div>
            </FeedbackCard>

            <FeedbackFooter />
          </div>
        </Container>
      </Section>
    </main>
  );
}