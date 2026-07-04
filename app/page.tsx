import Container from "@/components/layout/Container";
import FeedbackCard from "@/components/feedback/ FeedbackCard";
import FeedbackFooter from "@/components/feedback/FeedbackFooter";
import FeedbackForm from "@/components/feedback/FeedbackForm";

import AdminAccessCard from "@/components/admin/AdminAccessCard";

import PageHeader from "@/components/shared/PageHeader";
import PublicNavigation from "@/components/shared/PublicNavigation";
import Section from "@/components/shared/Section";
import SiteLogo from "@/components/shared/SiteLogo";

import { Separator } from "@/components/ui/separator";

import { SITE } from "@/lib/constants/site";

export default function HomePage() {
  return (
    <main>
      <Section>
        <Container>
          <div className="space-y-12">
            {/* Logo */}
            <SiteLogo />

            {/* Header */}
            <PageHeader
              title={SITE.name}
              description={SITE.description}
            />

            {/* Navigation */}
            <PublicNavigation current="feedback" />

            {/* Citizen Feedback Form */}
            <FeedbackCard>
              <div className="py-10">
                <FeedbackForm />
              </div>
            </FeedbackCard>

            {/* Administrator Section */}
            <section className="space-y-8">
              <Separator />

              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight">
                  Msimamizi
                </h2>

                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Sehemu hii ni kwa matumizi ya wasimamizi wa mfumo pekee.
                  Ingia kwenye dashibodi ili kusimamia taarifa za wananchi,
                  kufuatilia maendeleo ya uchakataji wa taarifa na kutoa
                  mrejesho pale inapohitajika.
                </p>
              </div>

              <AdminAccessCard />
            </section>

            {/* Footer */}
            <FeedbackFooter />
          </div>
        </Container>
      </Section>
    </main>
  );
}