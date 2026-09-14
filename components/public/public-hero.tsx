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
          src="/images/banner_malalamiko.png"
          alt="Mfumo wa Maoni na Malalamiko kwa Wananchi wa Wilaya ya Mlele"
          width={2048}
          height={676}
          priority
          sizes="100vw"
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
              Wasilisha taarifa yako au fuatilia hatua iliyofikiwa kwa
              urahisi, haraka na kwa usalama.
            </p>
          </div>

          {/* =====================================================
              TWO ACTION CARDS
          ===================================================== */}
          <div
            className="
              mx-auto
              grid
              max-w-5xl
              gap-4

              md:grid-cols-2
            "
          >
            {/* TOA TAARIFA */}
            <div
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-amber-300/20
                bg-white/8
                p-5
                shadow-xl
                shadow-black/10
                backdrop-blur-md

                transition
                duration-300

                hover:-translate-y-1
                hover:border-amber-300/40
                hover:bg-white/10
              "
            >
              {/* Accent line */}
              <div
                className="
                  absolute
                  inset-x-0
                  top-0
                  h-1
                  bg-linear-to-r
                  from-transparent
                  via-amber-400
                  to-transparent
                "
              />

              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-amber-400/15
                    text-amber-300
                  "
                >
                  <Send className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className="
                      text-base
                      font-bold
                      text-white

                      sm:text-lg
                    "
                  >
                    Toa Taarifa
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-5
                      text-purple-100/70
                    "
                  >
                    Wasilisha maoni, malalamiko au taarifa mpya.
                  </p>
                </div>

                <Button
                  asChild
                  className="
                    shrink-0
                    rounded-xl
                    bg-amber-500
                    px-5
                    font-bold
                    text-purple-950
                    shadow-lg
                    shadow-amber-950/20

                    hover:bg-amber-400
                  "
                >
                  <Link href="#feedback-form">
                    Anza
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* FUATILIA TAARIFA */}
            <div
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-cyan-300/20
                bg-white/8
                p-5
                shadow-xl
                shadow-black/10
                backdrop-blur-md

                transition
                duration-300

                hover:-translate-y-1
                hover:border-cyan-300/40
                hover:bg-white/10
              "
            >
              {/* Accent line */}
              <div
                className="
                  absolute
                  inset-x-0
                  top-0
                  h-1
                  bg-linear-to-r
                  from-transparent
                  via-cyan-300
                  to-transparent
                "
              />

              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-400/15
                    text-cyan-300
                  "
                >
                  <Search className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className="
                      text-base
                      font-bold
                      text-white

                      sm:text-lg
                    "
                  >
                    Fuatilia Taarifa
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-5
                      text-purple-100/70
                    "
                  >
                    Angalia hali na maendeleo ya taarifa yako.
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="
                    shrink-0
                    rounded-xl
                    border-cyan-300/40
                    bg-cyan-400/10
                    px-5
                    font-bold
                    text-white

                    hover:border-cyan-300
                    hover:bg-cyan-300
                    hover:text-purple-950
                  "
                >
                  <Link href="/public/tracking">
                    Fuatilia
                    <Search className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom portal strip */}
          <div
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
              Mfumo salama na wa kuaminika
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}