"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const slides = [
  {
    image: "/images/mkurugenzi-na-watu.jpeg",
    title: "Uongozi wenye uwajibikaji",
    description:
      "Tunapokea, kuchambua na kufanyia kazi maoni ya wananchi kwa uwazi na ufanisi.",
  },
  {
    image: "/images/mkurugenzi-kikaoni.jpeg",
    title: "Maamuzi kwa maendeleo ya wananchi",
    description:
      "Kila taarifa inayowasilishwa ni sehemu ya kuboresha utoaji wa huduma katika Halmashauri.",
  },
  {
    image: "/images/mlele-ded.png",
    title: "Karibu kwenye Mfumo wa Usimamizi",
    description:
      "Mfumo salama kwa wasimamizi wa Halmashauri ya Wilaya ya Mlele.",
  },
];

export default function LoginImageSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div
      className="
        relative
        h-full
        min-h-170
        overflow-hidden
        rounded-3xl

        border
        border-white/10

        shadow-2xl
        shadow-black/20
      "
    >
      {/* Images */}
      {slides.map((item, index) => (
        <Image
          key={item.image}
          aria-setsize={20}
          src={item.image}
          alt={item.title}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className={[
            "absolute inset-0 object-cover",
            "transition-all duration-1000 ease-out",

            current === index ? "scale-105 opacity-100" : "scale-100 opacity-0",
          ].join(" ")}
        />
      ))}

      {/* Premium Overlay */}
      <div
        className="
          absolute inset-0

          bg-linear-to-t
          from-[#001b10]
          via-[#00351f]/75
          to-[#004b2a]/30

          dark:from-black/90
          dark:via-emerald-950/80
          dark:to-black/40
        "
      />

      {/* Glass Color Layer */}
      <div
        className="
          absolute inset-0

          bg-emerald-950/10

          dark:bg-emerald-900/20
        "
      />

      {/* Decorative Glow */}
      <div
        className="
          absolute
          -left-24
          top-20

          h-72
          w-72

          rounded-full

          bg-yellow-400/10

          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-24
          -right-20

          h-80
          w-80

          rounded-full

          bg-emerald-300/10

          blur-3xl
        "
      />

      {/* Content */}
      <div
        className="
          relative
          flex
          h-full
          min-h-170
          flex-col
          justify-between

          p-8

          text-white

          sm:p-10
        "
      >
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div
            className="
              relative
              h-11
              w-11
              overflow-hidden
              rounded-full

              border
              border-white/30

              bg-white/10

              shadow-lg

              backdrop-blur-md
            "
          >
            <Image
              src="/images/logo.jpeg"
              alt="Nembo ya Halmashauri ya Wilaya ya Mlele"
              fill
              sizes="44"
              className="object-cover"
            />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
                tracking-wide
                text-white
              "
            >
              Halmashauri ya Wilaya ya Mlele
            </p>

            <p
              className="
                text-xs
                text-emerald-100/80
              "
            >
              Mkoa wa Katavi
            </p>
          </div>
        </div>

        {/* Slide Content */}
        <div className="max-w-lg">
          {/* Security Badge */}
          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-white/20

              bg-black/20

              px-4
              py-2

              shadow-lg

              backdrop-blur-md

              dark:bg-black/40
            "
          >
            <ShieldCheck
              className="
                h-4
                w-4

                text-yellow-300
              "
            />

            <span
              className="
                text-xs
                font-semibold
                tracking-wide
                text-white
              "
            >
              Mfumo Salama wa Wasimamizi
            </span>
          </div>

          <h2
            className="
              text-3xl
              font-bold
              leading-tight
              tracking-tight

              text-white

              sm:text-4xl
            "
          >
            {slide.title}
          </h2>

          <p
            className="
              mt-4
              max-w-md

              text-sm
              leading-7

              text-emerald-50/90

              sm:text-base
            "
          >
            {slide.description}
          </p>

          {/* Slider Controls */}
          <div className="mt-7 flex items-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Onyesha picha ${index + 1}`}
                aria-current={current === index}
                className={[
                  "h-1.5 rounded-full transition-all duration-500",

                  current === index
                    ? "w-10 bg-yellow-400 shadow-lg shadow-yellow-400/30"
                    : "w-5 bg-white/40 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            flex-col
            gap-2

            border-t
            border-white/15

            pt-5

            text-xs
            text-emerald-50/70

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>Uwazi • Uwajibikaji • Huduma Bora</span>

          <span>
            © {new Date().getFullYear()} Halmashauri ya Wilaya ya Mlele
          </span>
        </div>
      </div>
    </div>
  );
}
