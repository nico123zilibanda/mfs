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
    <Card
      className="
        mx-auto
        max-w-4xl

        border
        border-slate-200

        bg-white

        shadow-xl
        shadow-purple-950/5


        dark:border-slate-800

        dark:bg-slate-900

        dark:shadow-black/20
      "
    >

      <CardContent
        className="
          space-y-6

          p-5

          sm:p-8
        "
      >


        {/* Security Notice */}

        <Alert
          className="
            border
            border-purple-600/20

            bg-purple-50/70

            text-purple-950


            dark:border-purple-400/20

            dark:bg-purple-950/40

            dark:text-purple-100
          "
        >

          <Info
            className="
              h-4
              w-4

              text-purple-700


              dark:text-purple-400
            "
          />


          <AlertDescription
            className="
              text-purple-900


              dark:text-purple-100
            "
          >
            Tafadhali jaza taarifa zote kwa usahihi.
            Taarifa zako zitashughulikiwa kwa siri.
          </AlertDescription>


        </Alert>



        {children}


      </CardContent>

    </Card>
  );
}