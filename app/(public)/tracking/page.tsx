// app/tracking/page.tsx

import TrackingForm from "@/components/tracking/TrackingForm";
import Container from "@/components/layout/Container";
import PublicNavigation from "@/components/shared/PublicNavigation";
import SiteLogo from "@/components/shared/SiteLogo";
import PageHeader from "@/components/shared/PageHeader";
import { SITE } from "@/lib/constants/site";
import FeedbackFooter from "@/components/feedback/FeedbackFooter";
export default function TrackingPage() {
  return (
    <main className="min-h-screen py-16">
      <Container>
        <div className="space-y-4 text-center">
          <SiteLogo />

          <PageHeader title={SITE.name} description={SITE.description} />

          <PublicNavigation current="tracking" />

          <TrackingForm />
          <FeedbackFooter />
          
        </div>
      </Container>
    </main>
  );
}
