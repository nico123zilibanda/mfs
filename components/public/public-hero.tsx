import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function PublicHero() {
  return (
    <section className="relative w-full overflow-hidden bg-purple-950">
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="relative w-full">
        <Image
          src="/images/ongea_ded.png"
          alt="Mfumo wa Maoni na Malalamiko kwa Wananchi wa Wilaya ya Mlele"
          width={2048}
          height={676}
          sizes="38"
          priority
          className="
            block
            h-auto
            w-full
          "
        />
      </div>

      {/* =========================================================
          PORTAL ACTION AREA
      ========================================================= */}
      <div
        className="
          relative
          border-t
          border-white/10
          bg-linear-to-b
          from-purple-950
          via-purple-900
          to-purple-950
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              left-1/2
              top-0
              h-48
              w-180
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-amber-400/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              h-32
              w-32
              rounded-full
              bg-cyan-400/5
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              right-0
              h-40
              w-40
              rounded-full
              bg-purple-400/10
              blur-3xl
            "
          />
        </div>

        <Container
          className="
            relative
            py-7
            sm:py-8
            lg:py-10
          "
        >
          {/* Intro */}
          <div className="mx-auto mb-6 max-w-2xl text-center">
            <div
              className="
                mb-2
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-amber-300
              "
            >
              <ShieldCheck className="h-4 w-4" />
              Ongea na DED mlele
            </div>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-purple-100/80

                sm:text-base
              "
            >
              Wasilisha taarifa yako au fuatilia hatua iliyofikiwa.
              
            </p>
          </div>

          {/* =====================================================
              TWO ACTION CARDS
          ===================================================== */}

          <div
            className="
              mx-auto
              flex
              max-w-xl
              flex-col
              items-center
              justify-center
              gap-3

              sm:flex-row
            "
          >
            {/* Anza */}
            <Button
              asChild
              size="lg"
              className="
                h-12
                min-w-40

                rounded-xl

                bg-amber-500
                px-6

                font-bold
                text-purple-950

                shadow-lg
                shadow-amber-950/20

                transition-all
                duration-200

                hover:bg-amber-400
                hover:shadow-xl
                hover:shadow-amber-950/25

                active:scale-[0.98]
              "
            >
              <Link href="#feedback-form">
                Anza
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* Fuatilia */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="
                h-12
                min-w-40

                rounded-xl

                border
                border-cyan-300/40

                bg-transparent

                px-6

                font-bold
                text-white

                transition-all
                duration-200

                hover:border-cyan-300
                hover:bg-cyan-300
                hover:text-purple-950

                active:scale-[0.98]
              "
            >
              <Link href="/public/tracking">
                Fuatilia
                <Search className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Bottom portal strip */}
          {/* <div
            className="
              mx-auto
              mt-7
              flex
              max-w-5xl
              flex-col
              items-center
              justify-between
              gap-3
              border-t
              border-white/10
              pt-5
              text-center

              sm:flex-row
              sm:text-left
            "
          >
            <p className="text-xs text-purple-100/60 sm:text-sm">
              Halmashauri ya Wilaya ya Mlele
            </p>

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-medium
                text-purple-100/60
              "
            >
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              Malalamiko Portal
            </div>
          </div> */}
        </Container>
      </div>
    </section>
  );
}