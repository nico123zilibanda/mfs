"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center text-center">

      {/* Tanzania Emblem */}
      <div className="group relative">

        {/* Glow */}
        <div
          className="
            absolute -inset-3
            rounded-full
            bg-emerald-200/40
            blur-xl
            transition-all
            duration-300

            group-hover:bg-emerald-300/60

            dark:bg-emerald-500/20
            dark:group-hover:bg-emerald-400/30
          "
        />

        {/* Logo Container */}
        <div
          className="
            relative
            flex
            h-28
            w-28
            items-center
            justify-center
            rounded-full

            border
            border-emerald-100
            bg-white
            shadow-xl
            ring-8
            ring-emerald-50

            dark:border-emerald-500/20
            dark:bg-slate-800
            dark:ring-emerald-500/10
            dark:shadow-black/40
          "
        >
          <Image
            src="/images/tanzania-logo.png"
            alt="Nembo ya Taifa"
            width={76}
            height={76}
            sizes="76"
            priority
            className="object-contain"
          />
        </div>

      </div>


      {/* System Identity */}
      <div className="mt-7 space-y-3">

        <h1
          className="
            text-2xl
            font-extrabold
            tracking-tight

            text-slate-950

            dark:text-white

            sm:text-3xl
          "
        >
          ONGEA NA DED MLELE
        </h1>


        {/* Tanzania Green Accent */}
        <div
          className="
            mx-auto
            h-1
            w-16
            rounded-full
            bg-[#006b3c]

            shadow-sm
            shadow-emerald-500/30
          "
        />


        <p
          className="
            text-sm
            font-medium

            text-slate-600

            dark:text-slate-300
          "
        >
          Halmashauri ya Wilaya ya Mlele
        </p>

      </div>


      {/* Security Badge */}
      <div
        className="
          mt-7
          flex
          items-center
          gap-2
          rounded-full

          border
          border-emerald-200
          bg-emerald-50

          px-5
          py-2.5

          shadow-sm


          dark:border-emerald-500/20
          dark:bg-emerald-500/10
        "
      >

        <div
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full

            bg-emerald-100

            dark:bg-emerald-500/20
          "
        >
          <ShieldCheck
            className="
              h-4
              w-4

              text-[#006b3c]

              dark:text-emerald-400
            "
          />
        </div>


        <span
          className="
            text-xs
            font-bold
            uppercase
            tracking-widest

            text-[#006b3c]

            dark:text-emerald-400
          "
        >
          Msimamizi Salama
        </span>

      </div>

    </div>
  );
}