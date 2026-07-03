import Container from "@/components/layout/Container";
import PageHeader from "@/components/shared/PageHeader";
import SiteLogo from "@/components/shared/SiteLogo";

import LoginForm from "@/components/admin/LoginForm";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import FeedbackFooter from "@/components/feedback/FeedbackFooter";

export const metadata = {
  title: "Login",
  description:
    "Login to access the Mlele District Council Feedback Management Dashboard.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-muted/30 py-16">
      <Container>
        <div className="mx-auto flex w-full max-w-md flex-col space-y-8">
          <SiteLogo />

          <PageHeader
            title="Ingia Kwenye Dashibodi ya Msimamizi"
            description="Ingia kwa kutumia akaunti yako ya msimamizi ili kudhibiti maoni ya raia."
          />

          <Card className="shadow-sm">
            <CardContent className="p-8">
              <LoginForm />
            </CardContent>
          </Card>
            <FeedbackFooter />

        </div>
      </Container>
    </main>
  );
}