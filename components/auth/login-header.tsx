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
            bg-purple-200/40
            blur-xl
            transition-all
            duration-300

            group-hover:bg-purple-300/60

            dark:bg-purple-500/20
            dark:group-hover:bg-purple-400/30
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
            border-purple-100
            bg-white
            shadow-xl
            ring-8
            ring-purple-50

            dark:border-purple-500/20
            dark:bg-slate-800
            dark:ring-purple-500/10
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
            bg-[#6d28d9]

            shadow-sm
            shadow-purple-500/30
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
          border-purple-200
          bg-purple-50

          px-5
          py-2.5

          shadow-sm


          dark:border-purple-500/20
          dark:bg-purple-500/10
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

            bg-purple-100

            dark:bg-purple-500/20
          "
        >
          <ShieldCheck
            className="
              h-4
              w-4

              text-[#6d28d9]

              dark:text-purple-400
            "
          />
        </div>


        <span
          className="
            text-xs
            font-bold
            uppercase
            tracking-widest

            text-[#6d28d9]

            dark:text-purple-400
          "
        >
          Msimamizi Salama
        </span>

      </div>

    </div>
  );
}