import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { SITE } from "@/lib/constants/site";

export default function PublicFooter() {
  return (
    <footer
      className="
        relative
        mt-18
        overflow-hidden
        border-t
        border-white/10
        bg-purple-950
        text-purple-100

        sm:mt-24
      "
    >
      {/* =========================================================
          DECORATIVE BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top amber glow */}
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

        {/* Bottom cyan glow */}
        <div
          className="
            absolute
            bottom-0
            left-0
            h-40
            w-40
            rounded-full
            bg-cyan-400/5
            blur-3xl
          "
        />

        {/* Bottom purple glow */}
        <div
          className="
            absolute
            bottom-0
            right-0
            h-56
            w-56
            rounded-full
            bg-purple-400/10
            blur-3xl
          "
        />
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================= */}
      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          py-12

          sm:px-6
          sm:py-14

          lg:px-8
        "
      >
        <div
          className="
            grid
            gap-10

            lg:grid-cols-[1.5fr_1fr]
            lg:gap-16
          "
        >
          {/* =====================================================
              BRAND
          ===================================================== */}
          <div>
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-amber-300/20
                  bg-white
                  p-1
                  shadow-lg
                  shadow-black/10
                "
              >
                <Image
                  src="/images/logo.jpeg"
                  alt="Nembo ya Halmashauri ya Wilaya ya Mlele"
                  width={56}
                  height={56}
                  sizes="56px"
                  priority
                  className="
                    h-full
                    w-full
                    rounded-xl
                    object-contain
                  "
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-sm
                    font-bold
                    tracking-tight
                    text-white

                    sm:text-base
                  "
                >
                  {SITE.council}
                </p>

                <p
                  className="
                    mt-2
                    max-w-lg
                    text-sm
                    leading-6
                    text-purple-100/70
                  "
                >
                  Njia salama ya kuwasilisha maoni,
                  malalamiko na taarifa kwa urahisi,
                  haraka na kwa usalama.
                </p>
              </div>
            </div>

            {/* Portal badge */}
            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-300/20
                bg-amber-400/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-amber-300
              "
            >
              <ShieldCheck className="h-3.5 w-3.5" />

              Maoni na Malalamiko Portal
            </div>
          </div>

          {/* =====================================================
              CONTACT / QUICK ACCESS
          ===================================================== */}
          <div>
            <p
              className="
                mb-4
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-amber-300
              "
            >
              Mawasiliano
            </p>

            <div className="space-y-3">
              {/* Tracking */}
              <Link
                href="/public/tracking"
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-purple-100
                  backdrop-blur-sm
                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:border-cyan-300/30
                  hover:bg-white/10
                "
              >
                <span>Fuatilia taarifa yako</span>

                <ArrowRight
                  className="
                    h-4
                    w-4
                    text-cyan-300
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              {/* Phone */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-white/5
                  bg-white/5
                  px-4
                  py-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-amber-400/10
                  "
                >
                  <Phone className="h-4 w-4 text-amber-300" />
                </span>

                <span className="text-sm text-purple-100/70">
                  {SITE.phone}
                </span>
              </div>

              {/* Location */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-white/5
                  bg-white/5
                  px-4
                  py-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-400/10
                  "
                >
                  <MapPin className="h-4 w-4 text-cyan-300" />
                </span>

                <span className="text-sm text-purple-100/70">
                  {SITE.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM STATUS STRIP
        ========================================================= */}
        <div
          className="
            mt-10
            flex
            flex-col
            items-center
            justify-between
            gap-3
            border-t
            border-white/10
            pt-6
            text-center

            sm:flex-row
            sm:text-left
          "
        >
          <p className="text-xs text-purple-100/50 sm:text-sm">
            Halmashauri ya Wilaya ya Mlele
          </p>

          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-purple-100/50
            "
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />

            Mfumo salama na wa kuaminika
          </div>
        </div>
      </div>

      {/* =========================================================
          COPYRIGHT
      ========================================================= */}
      <div
        className="
          relative
          border-t
          border-white/10
          bg-purple-950/80
          px-4
          py-5
          text-center
          text-xs
          text-purple-100/40
          backdrop-blur-sm
        "
      >
        © {new Date().getFullYear()} {SITE.council}.
        Haki zote zimehifadhiwa.
      </div>
    </footer>
  );
}
