"use client";

import {
  Check,
  CheckCircle2,
  ClipboardCopy,
  Plus,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";


import {
  Button,
} from "@/components/ui/button";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";



type FeedbackSuccessCardProps = {
  referenceNumber: string;
  onSubmitAnother: () => void;
};



export default function FeedbackSuccessCard({
  referenceNumber,
  onSubmitAnother,
}: FeedbackSuccessCardProps) {


  const [
    copied,
    setCopied,
  ] = useState(false);



  async function copyReference() {

    try {

      await navigator.clipboard.writeText(
        referenceNumber
      );


      setCopied(true);


      toast.success(
        "Namba ya kumbukumbu imenakiliwa."
      );


      setTimeout(
        () => setCopied(false),
        2000
      );


    } catch {

      toast.error(
        "Imeshindwa kunakili namba ya kumbukumbu."
      );

    }

  }



  return (

    <Card
      className="
        mx-auto
        max-w-2xl

        overflow-hidden

        border
        border-emerald-900/15

        bg-white

        shadow-xl
        shadow-emerald-950/5


        dark:border-emerald-900/40
        dark:bg-slate-950
      "
    >


      {/* Header */}

      <CardHeader
        className="
          items-center

          px-5
          pt-10

          text-center

          sm:px-8
        "
      >


        <div
          className="
            mb-5

            flex
            h-20
            w-20

            items-center
            justify-center

            rounded-full

            bg-emerald-100

            shadow-inner


            dark:bg-emerald-950/50
          "
        >

          <CheckCircle2
            className="
              h-10
              w-10

              text-[#006b3c]

              dark:text-emerald-400
            "
          />

        </div>



        <CardTitle
          className="
            text-2xl
            font-bold

            text-slate-950

            dark:text-white
          "
        >

          Taarifa imetumwa

        </CardTitle>



        <CardDescription
          className="
            mt-2

            max-w-md

            leading-7

            text-slate-600

            dark:text-slate-400
          "
        >

          Asante kwa kushiriki.
          Hifadhi namba hii ya kumbukumbu
          ili uweze kufuatilia hatua za
          taarifa yako.

        </CardDescription>


      </CardHeader>




      <CardContent
        className="
          space-y-6

          px-5

          pb-8

          sm:px-8
        "
      >


        {/* Reference box */}

        <div
          className="
            rounded-2xl

            border

            border-emerald-900/15

            bg-emerald-50/70

            p-5


            dark:border-emerald-800/40

            dark:bg-emerald-950/30
          "
        >


          <p
            className="
              text-sm

              font-medium

              text-slate-600

              dark:text-slate-300
            "
          >

            Namba ya kumbukumbu

          </p>



          <div
            className="
              mt-3

              flex

              items-center

              justify-between

              gap-3
            "
          >


            <code
              className="
                overflow-hidden

                text-base

                font-bold

                tracking-[0.15em]

                text-[#006b3c]

                sm:text-lg

                dark:text-emerald-400
              "
            >

              {referenceNumber}

            </code>



            <Button
              type="button"

              variant="outline"

              size="icon"

              className="
                shrink-0

                rounded-xl

                border-emerald-900/20

                bg-white

                hover:bg-emerald-50


                dark:border-emerald-800/40

                dark:bg-slate-900
              "

              onClick={copyReference}

              aria-label="Nakili namba ya kumbukumbu"
            >

              {copied ? (

                <Check
                  className="
                    h-4
                    w-4

                    text-[#006b3c]
                  "
                />

              ) : (

                <ClipboardCopy
                  className="
                    h-4
                    w-4
                  "
                />

              )}

            </Button>


          </div>


        </div>





        <Button
          type="button"

          className="
            h-12

            w-full

            rounded-xl

            bg-[#006b3c]

            font-semibold

            text-white

            shadow-lg

            shadow-emerald-900/20

            hover:bg-[#005631]
          "

          onClick={onSubmitAnother}
        >

          <Plus
            className="
              mr-2

              h-4
              w-4
            "
          />

          Tuma taarifa nyingine

        </Button>



      </CardContent>


    </Card>

  );
}