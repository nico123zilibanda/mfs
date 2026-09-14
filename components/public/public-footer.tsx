import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, ShieldCheck } from "lucide-react";

import { SITE } from "@/lib/constants/site";

export default function PublicFooter() {
  return (
    <footer
      className="
        mt-18
        border-t
        border-slate-800
        bg-slate-950
        text-slate-200

        dark:bg-black

        sm:mt-24
      "
    >

      <div
        className="
          mx-auto
          grid
          max-w-7xl
          gap-10
          px-4
          py-14

          sm:px-6
          lg:grid-cols-[1.4fr_1fr]
          lg:px-8
        "
      >

        {/* Brand */}

        <div className="flex items-start gap-4">

          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-purple-500/20
              bg-white
              p-1
            "
          >
            <Image
              src="/images/logo.jpeg"
              alt="Nembo ya Halmashauri ya Wilaya ya Mlele"
              width={56}
              height={56}
              sizes="20"
              priority
              className="
                h-full
                w-full
                rounded-full
                object-contain
              "
            />
          </div>


          <div>

            <p
              className="
                font-bold
                text-white
                tracking-tight
              "
            >
              {SITE.council}
            </p>


            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-400
              "
            >
              Njia salama ya kuwasilisha maoni,
              malalamiko na taarifa kwa urahisi.
            </p>


            <div
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-purple-500/20
                bg-purple-500/10
                px-3
                py-1.5
                text-xs
                font-medium
                text-purple-300
              "
            >

              <ShieldCheck className="h-3.5 w-3.5" />

              Maoni ma Malalamiko Portal

            </div>

          </div>

        </div>


        {/* Contact */}

        <div
          className="
            grid
            gap-5
            text-sm

            sm:grid-cols-2

            lg:grid-cols-1
          "
        >

          <Link
            href="/public/tracking"
            className="
              font-medium
              text-slate-300
              transition-colors

              hover:text-[#f5cc53]

              dark:text-slate-300
            "
          >
            Fuatilia taarifa yako
          </Link>


          <p
            className="
              flex
              items-center
              gap-3
              text-slate-400
            "
          >

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-purple-500/10
              "
            >
              <Phone
                className="
                  h-4
                  w-4
                  text-[#f5cc53]
                "
              />
            </span>

            {SITE.phone}

          </p>


          <p
            className="
              flex
              items-center
              gap-3
              text-slate-400
            "
          >

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-purple-500/10
              "
            >
              <MapPin
                className="
                  h-4
                  w-4
                  text-[#f5cc53]
                "
              />
            </span>

            {SITE.location}

          </p>


        </div>

      </div>


      {/* Copyright */}

      <div
        className="
          border-t
          border-white/10
          px-4
          py-5
          text-center
          text-xs
          text-slate-500

          dark:border-white/5
        "
      >
        © {new Date().getFullYear()} {SITE.council}.
        Haki zote zimehifadhiwa.
      </div>


    </footer>
  );
}