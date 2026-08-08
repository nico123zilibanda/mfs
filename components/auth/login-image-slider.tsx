"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { ShieldCheck } from "lucide-react";

const slides = [
  {
    image: "/images/mkurugenzi-na-watu.jpeg",
    title: "Uongozi wenye uwajibikaji",
    description:
      "Tunapokea, kuchambua na kufanyia kazi maoni ya wananchi kwa uwazi na ufanisi.",
  },
  {
    image: "/images/mkurugenzi_kikaoni.jpeg",
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
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative hidden h-screen overflow-hidden lg:block">

      {/* Images */}
      {slides.map((slide, index) => (
        <Image
          key={slide.image}
          src={slide.image}
          alt={slide.title}
          fill
          priority={index === 0}
          sizes="50vw"
          className={[
            "absolute inset-0 object-cover",
            "transition-all duration-1000 ease-in-out",
            current === index
              ? "scale-105 opacity-100"
              : "scale-100 opacity-0",
          ].join(" ")}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-[#003d24]/85 via-[#004b2a]/75 to-[#001e12]/95" />

      {/* Decorative */}
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="absolute bottom-0 -right-15 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-14">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Image
            src="/images/logo.jpeg"
            alt="Nembo ya Mlele"
            width={56}
            height={56}
            className="rounded-full border border-white/30"
          />

          <div>
            <h2 className="font-bold tracking-wide text-white">
              Halmashauri ya Wilaya ya Mlele
            </h2>

            <p className="text-sm text-emerald-100">
              Mkoa wa Katavi
            </p>
          </div>
        </div>

        {/* Caption */}
        <div className="max-w-xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-yellow-300" />

            <span className="text-sm font-medium text-white">
              Mfumo Salama wa Wasimamizi
            </span>
          </div>

          <h1 className="mt-7 text-5xl font-bold leading-tight text-white">
            {slides[current].title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-emerald-50/90">
            {slides[current].description}
          </p>

          {/* Dots */}
          <div className="mt-10 flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`Slide ${index + 1}`}
                className={[
                  "h-3 rounded-full transition-all duration-300",
                  current === index
                    ? "w-10 bg-yellow-400"
                    : "w-3 bg-white/40 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-emerald-100/80">

          <span>
            © {new Date().getFullYear()} Halmashauri ya Wilaya ya Mlele
          </span>

          <span>
            Uwazi • Uwajibikaji • Huduma Bora
          </span>

        </div>

      </div>

    </section>
  );
}