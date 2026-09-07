import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface FeedbackCardProps {
  children: React.ReactNode;
}

export default function FeedbackCard({
  children,
}: FeedbackCardProps) {
  return (
    <Card className="mt-8 bg-primary-foreground">
      <CardContent className="space-y-6 p-8">
        <Alert>
          <Info className="h-4 w-4 " />

          <AlertDescription>
            Tafadhali jaza taarifa zote kwa usahihi.
            Taarifa zako zitashughulikiwa kwa siri.
          </AlertDescription>
        </Alert>

        {children}
      </CardContent>
    </Card>
  );
}