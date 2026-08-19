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
        shadow-emerald-950/5


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
            border-emerald-600/20

            bg-emerald-50/70

            text-emerald-950


            dark:border-emerald-400/20

            dark:bg-emerald-950/40

            dark:text-emerald-100
          "
        >

          <Info
            className="
              h-4
              w-4

              text-emerald-700


              dark:text-emerald-400
            "
          />


          <AlertDescription
            className="
              text-emerald-900


              dark:text-emerald-100
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