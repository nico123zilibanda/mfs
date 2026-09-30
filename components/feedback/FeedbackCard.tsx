"use client";

import { motion } from "framer-motion";
import { Info, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeedbackCardProps {
  children: React.ReactNode;
}

export default function FeedbackCard({
  children,
}: FeedbackCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.99,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto w-full max-w-4xl"
    >
      <Card
        className="
          relative
          overflow-hidden
          rounded-3xl

          border
          border-slate-200/80

          bg-white

          shadow-2xl
          shadow-slate-950/6

          dark:border-slate-800
          dark:bg-slate-950
          dark:shadow-black/30
        "
      >
        {/* Decorative top gradient */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-x-0
            top-0
            h-1
            bg-linear-to-r
            from-violet-600
            via-purple-500
            to-indigo-500
          "
        />

        {/* Subtle ambient glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-48
            w-48
            rounded-full
            bg-violet-500/10
            blur-3xl

            dark:bg-violet-500/5
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-24
            bottom-0
            h-40
            w-40
            rounded-full
            bg-indigo-500/5
            blur-3xl
          "
        />

        <CardContent
          className="
            relative
            space-y-7

            p-5
            pt-7

            sm:p-8
            sm:pt-9

            lg:p-10
            lg:pt-11
          "
        >
          {/* Privacy / security notice */}
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.12,
            }}
          >
            <Alert
              className="
                relative
                overflow-hidden
                rounded-2xl

                border
                border-violet-200/80

                bg-linear-to-r
                from-violet-50
                via-purple-50/70
                to-indigo-50/50

                px-4
                py-3.5

                text-violet-950

                dark:border-violet-900/50
                dark:from-violet-950/40
                dark:via-purple-950/30
                dark:to-indigo-950/20
                dark:text-violet-100

                sm:px-5
                sm:py-4
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-100
                  text-violet-700

                  dark:bg-violet-900/50
                  dark:text-violet-300
                "
              >
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>

              <AlertDescription
                className="
                  ml-1
                  text-sm
                  leading-6
                  text-violet-900

                  dark:text-violet-100
                "
              >
                <span className="font-semibold">
                  Taarifa zako zinalindwa.
                </span>{" "}
                Tafadhali jaza taarifa zote kwa usahihi.
                Taarifa utakazowasilisha zitashughulikiwa kwa
                siri.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Form content */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
              delay: 0.18,
            }}
          >
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}