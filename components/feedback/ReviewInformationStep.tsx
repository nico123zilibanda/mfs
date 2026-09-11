"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Send,
  UserRound,
} from "lucide-react";


import type { FeedbackInput } from "@/lib/schemas/feedback";


import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";



interface ReviewInformationStepProps {
  values: FeedbackInput;
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}



export default function ReviewInformationStep({
  values,
  isPending,
  onBack,
  onSubmit,
}: ReviewInformationStepProps) {


  return (

    <div
      className="
        space-y-8
      "
    >


      {/* Heading */}

      <div
        className="
          flex
          items-start
          gap-4
        "
      >

        <div
          className="
            flex
            h-14
            w-14
            shrink-0

            items-center
            justify-center

            rounded-2xl

            bg-purple-900/10

            text-[#6d28d9]

            dark:bg-purple-950/40
          "
        >

          <CheckCircle2
            className="
              h-7
              w-7
            "
          />

        </div>


        <div>

          <h3
            className="
              text-xl
              font-bold

              text-slate-950

              dark:text-white
            "
          >
            Hakiki taarifa zako
          </h3>


          <p
            className="
              mt-1

              text-sm
              leading-6

              text-slate-500

              dark:text-slate-400
            "
          >
            Hakikisha taarifa zote ni sahihi kabla ya kuzituma.
          </p>

        </div>


      </div>





      {/* Citizen information */}

      <ReviewSection
        icon={UserRound}
        title="Taarifa za mwananchi"
      >

        <div
          className="
            grid
            gap-6

            sm:grid-cols-2
          "
        >

          <ReviewItem
            label="Jina kamili"
            value={
              values.fullName ||
              "Haijawekwa"
            }
          />


          <ReviewItem
            label="Namba ya simu"
            value={values.phone}
          />


          <ReviewItem
            label="Kijiji"
            value={values.village}
          />


          <ReviewItem
            label="Kata"
            value={values.ward}
          />

        </div>


      </ReviewSection>





      {/* Complaint information */}

      <ReviewSection
        icon={FileText}
        title="Taarifa ya tukio"
      >

        <div
          className="
            space-y-6
          "
        >

          <ReviewItem
            label="Maelezo ya tukio"
            value={values.corruptionDescription}
          />


          <ReviewItem
            label="Uliombwa rushwa?"
            value={
              values.hasBribeRequest
                ? "Ndiyo"
                : "Hapana"
            }
          />


        </div>


      </ReviewSection>





      {/* Actions */}

      <div
        className="
          flex

          flex-col-reverse

          gap-3

          border-t

          border-slate-100

          pt-8


          sm:flex-row

          sm:justify-between


          dark:border-slate-800
        "
      >


        <Button
          type="button"

          variant="outline"

          size="lg"

          className="
            rounded-xl

            border-slate-300

            px-7


            dark:border-slate-700
          "

          disabled={isPending}

          onClick={onBack}
        >

          <ArrowLeft
            className="
              mr-2
              h-4
              w-4
            "
          />

          Rudi

        </Button>





        <Button
          type="button"

          size="lg"

          className="
            rounded-xl

            bg-[#6d28d9]

            px-8

            font-semibold

            text-white

            shadow-lg

            shadow-purple-900/20

            hover:bg-[#4c1d95]
          "

          disabled={isPending}

          onClick={onSubmit}
        >

          {isPending ? (

            "Inatuma taarifa..."

          ) : (

            <>
              Tuma taarifa

              <Send
                className="
                  ml-2
                  h-4
                  w-4
                "
              />
            </>

          )}

        </Button>


      </div>


    </div>

  );
}





function ReviewSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {


  return (

    <section
      className="
        rounded-2xl

        border

        border-slate-200

        bg-slate-50/70

        p-5

        shadow-sm


        sm:p-6


        dark:border-slate-800

        dark:bg-slate-900/60
      "
    >


      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            flex
            h-9
            w-9

            items-center
            justify-center

            rounded-lg

            bg-purple-900/10

            text-[#6d28d9]


            dark:bg-purple-950/40
          "
        >

          <Icon
            className="
              h-5
              w-5
            "
          />

        </div>


        <h4
          className="
            font-bold

            text-slate-950

            dark:text-white
          "
        >

          {title}

        </h4>


      </div>



      <Separator
        className="
          my-5

          bg-slate-200

          dark:bg-slate-800
        "
      />


      {children}


    </section>

  );
}





function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {


  return (

    <div>

      <p
        className="
          text-xs

          font-semibold

          uppercase

          tracking-wide

          text-slate-500

          dark:text-slate-400
        "
      >

        {label}

      </p>



      <p
        className="
          mt-2

          whitespace-pre-wrap

          leading-7

          text-slate-900

          dark:text-slate-100
        "
      >

        {value}

      </p>


    </div>

  );
}