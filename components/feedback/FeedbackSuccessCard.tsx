"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardCopy,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(referenceNumber);

      setCopied(true);

      toast.success(
        "Namba ya kumbukumbu imenakiliwa.",
      );
    } catch {
      toast.error(
        "Imeshindwa kunakili namba ya kumbukumbu.",
      );
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto w-full max-w-2xl"
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
          shadow-slate-950/[0.07]

          dark:border-slate-800
          dark:bg-slate-950
          dark:shadow-black/30
        "
      >
        {/* Top success accent */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-x-0
            top-0
            h-1
            bg-linear-to-r
            from-emerald-500
            via-green-500
            to-violet-500
          "
        />

        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-64
            w-64
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-emerald-500/10
            blur-3xl

            dark:bg-emerald-500/5
          "
        />

        <CardHeader
          className="
            relative
            items-center
            px-5
            pb-2
            pt-12
            text-center

            sm:px-8
            sm:pt-14
          "
        >
          {/* Animated success icon */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.4,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.12,
              duration: 0.55,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="relative"
          >
            {/* Outer pulse */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: [0, 0.35, 0],
                scale: [0.8, 1.25, 1.4],
              }}
              transition={{
                duration: 1.4,
                delay: 0.35,
                ease: "easeOut",
              }}
              className="
                absolute
                inset-0
                rounded-full
                bg-emerald-400
              "
            />

            <div
              className="
                relative
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                border
                border-emerald-200
                bg-emerald-50
                shadow-lg
                shadow-emerald-500/15

                dark:border-emerald-900/60
                dark:bg-emerald-950/50
              "
            >
              <CheckCircle2
                className="
                  h-10
                  w-10
                  text-emerald-600
                  dark:text-emerald-400
                "
              />
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.4,
            }}
          >
            <CardTitle
              className="
                mt-6
                text-2xl
                font-bold
                tracking-tight
                text-slate-950

                sm:text-3xl

                dark:text-white
              "
            >
              Taarifa imetumwa
            </CardTitle>

            <CardDescription
              className="
                mx-auto
                mt-3
                max-w-md
                text-sm
                leading-7
                text-slate-500

                sm:text-base

                dark:text-slate-400
              "
            >
              Asante kwa kushiriki taarifa hii. Taarifa yako
              imepokelewa na unaweza kutumia namba ya
              kumbukumbu hapa chini kufuatilia taarifa yako.
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent
          className="
            relative
            space-y-5
            px-5
            pb-8
            pt-5

            sm:px-8
            sm:pb-10
          "
        >
          {/* Reference number */}
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.4,
            }}
            className="
              overflow-hidden
              rounded-2xl
              border
              border-violet-200/80

              bg-linear-to-br
              from-violet-50
              via-white
              to-indigo-50/60

              dark:border-violet-900/50
              dark:from-violet-950/40
              dark:via-slate-900
              dark:to-indigo-950/30
            "
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-violet-100
                    text-violet-700

                    dark:bg-violet-900/50
                    dark:text-violet-300
                  "
                >
                  <ClipboardCopy className="h-4 w-4" />
                </div>

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-slate-500

                    dark:text-slate-400
                  "
                >
                  Namba ya kumbukumbu
                </p>
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <code
                  className="
                    min-w-0
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                    text-lg
                    font-bold
                    tracking-[0.12em]
                    text-violet-700

                    sm:text-xl

                    dark:text-violet-400
                  "
                  title={referenceNumber}
                >
                  {referenceNumber}
                </code>

                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyReference}
                    aria-label="Nakili namba ya kumbukumbu"
                    className="
                      h-10
                      w-10
                      shrink-0
                      rounded-xl

                      border-violet-200
                      bg-white

                      text-violet-700

                      shadow-sm

                      hover:bg-violet-50
                      hover:text-violet-800

                      dark:border-violet-900/50
                      dark:bg-slate-900
                      dark:text-violet-300
                      dark:hover:bg-violet-950/50
                    "
                  >
                    <motion.div
                      key={copied ? "copied" : "copy"}
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
              </div>

              {/* Copy status */}
              <motion.div
                initial={false}
                animate={{
                  height: copied ? "auto" : 0,
                  opacity: copied ? 1 : 0,
                }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Namba imenakiliwa
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Security reminder */}
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.45,
              duration: 0.35,
            }}
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-slate-200/80
              bg-slate-50/70
              p-4

              dark:border-slate-800
              dark:bg-slate-900/60
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-slate-200
                text-slate-600

                dark:bg-slate-800
                dark:text-slate-300
              "
            >
              <ShieldCheck className="h-4 w-4" />
            </div>

            <p
              className="
                text-xs
                leading-6
                text-slate-500

                dark:text-slate-400
              "
            >
              Hifadhi namba hii ya kumbukumbu mahali salama.
              Itakusaidia kutambua na kufuatilia taarifa yako
              baadaye.
            </p>
          </motion.div>

          {/* Submit another */}
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.52,
              duration: 0.35,
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
          >
            <Button
              type="button"
              className="
                h-12
                w-full
                rounded-xl

                bg-violet-600

                font-semibold
                text-white

                shadow-lg
                shadow-violet-600/20

                transition-all

                hover:bg-violet-700
                hover:shadow-xl
                hover:shadow-violet-600/25
              "
              onClick={onSubmitAnother}
            >
              <Plus className="mr-2 h-4 w-4" />

              Tuma taarifa nyingine
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}