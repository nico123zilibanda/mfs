"use client";

import { useId } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface SystemLoaderProps {
  /** Status line under the title. */
  message?: string;
  title?: string;
  subtitle?: string;
  /** Cover the whole screen (default). Set false to render inside a container. */
  fullScreen?: boolean;
}

/* Ring geometry (viewBox 0 0 192 192) */
const RINGS = [
  { r: 90, width: 5, speed: "1.8s", reverse: false, from: "#fcd116", to: "#f59e0b", arc: 0.34 },
  { r: 74, width: 5, speed: "2.6s", reverse: true, from: "#a855f7", to: "#6d28d9", arc: 0.38 },
  { r: 58, width: 5, speed: "1.4s", reverse: false, from: "#38bdf8", to: "#0284c7", arc: 0.32 },
] as const;

const FLAG = ["#1eb53a", "#fcd116", "#000000", "#00a3dd"] as const;

export default function SystemLoader({
  message = "Mfumo unaandaliwa...",
  title = "ONGEA NA DC MLELE",
  subtitle = "Halmashauri ya Wilaya ya Mlele",
  fullScreen = true,
}: SystemLoaderProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "relative isolate overflow-hidden",
        fullScreen ? "fixed inset-0 z-50" : "min-h-[60vh] w-full rounded-2xl",
      )}
    >
      <span className="sr-only">{message}</span>

      {/* Scoped keyframes (no tailwind config needed) */}
      <style>{`
        @keyframes sl-spin { to { transform: rotate(360deg) } }
        @keyframes sl-progress { 0% { transform: translateX(-110%) } 100% { transform: translateX(290%) } }
        @keyframes sl-halo { 0%,100% { opacity:.35; transform: scale(.92) } 50% { opacity:.7; transform: scale(1.06) } }
        @keyframes sl-rise { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform: none } }
        @keyframes sl-dot { 0%,80%,100% { opacity:.25; transform: translateY(0) } 40% { opacity:1; transform: translateY(-3px) } }
        @media (prefers-reduced-motion: reduce) {
          .sl-anim, .sl-anim * { animation: none !important; }
        }
      `}</style>

      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-slate-950 dark:via-purple-950/50 dark:to-slate-950"
      />

      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(109,40,217,0.35) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Flag-inspired diagonal watermark (pure CSS, no extra image) */}
      <div
        aria-hidden="true"
        className="absolute -z-10 h-[220%] w-[26%] rotate-[-28deg] opacity-[0.07] dark:opacity-[0.10]"
        style={{
          left: "58%",
          top: "-60%",
          background:
            "linear-gradient(90deg, #fcd116 0 12%, #000 12% 88%, #fcd116 88% 100%)",
        }}
      />

      {/* Glows */}
      <div aria-hidden="true" className="absolute -left-24 top-1/3 -z-10 size-72 rounded-full bg-purple-500/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-20 bottom-20 -z-10 size-80 rounded-full bg-yellow-400/15 blur-3xl" />

      {/* Content */}
      <div className="sl-anim relative flex h-full min-h-[inherit] flex-col items-center justify-center px-6">
        {/* Orbit */}
        <div
          className="relative flex size-48 items-center justify-center"
          style={{ animation: "sl-rise .6s ease-out both" }}
        >
          {/* Pulsing halo */}
          <div
            aria-hidden="true"
            className="absolute size-36 rounded-full bg-purple-500/25 blur-xl"
            style={{ animation: "sl-halo 2.4s ease-in-out infinite" }}
          />

          {RINGS.map((ring, index) => {
            const circumference = 2 * Math.PI * ring.r;
            const gradientId = `${uid}-g${index}`;
            return (
              <svg
                key={ring.r}
                aria-hidden="true"
                viewBox="0 0 192 192"
                className="absolute inset-0 size-full"
                style={{
                  animation: `sl-spin ${ring.speed} linear infinite ${ring.reverse ? "reverse" : "normal"}`,
                }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={ring.from} />
                    <stop offset="1" stopColor={ring.to} />
                  </linearGradient>
                </defs>
                {/* faint track */}
                <circle
                  cx="96"
                  cy="96"
                  r={ring.r}
                  fill="none"
                  stroke={ring.to}
                  strokeOpacity="0.12"
                  strokeWidth={ring.width}
                />
                {/* moving arc */}
                <circle
                  cx="96"
                  cy="96"
                  r={ring.r}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth={ring.width}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference * ring.arc} ${circumference}`}
                />
              </svg>
            );
          })}

          {/* Coat of arms */}
          <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl shadow-purple-900/20 ring-4 ring-white dark:ring-white/90">
            <Image
              src="/images/tanzania-logo.png"
              alt="Nembo ya Taifa"
              fill
              priority
              sizes="96px"
              className="object-contain p-2.5"
            />
          </div>
        </div>

        {/* Text */}
        <div
          className="mt-9 text-center"
          style={{ animation: "sl-rise .7s .15s ease-out both" }}
        >
          <h1 className="text-balance text-2xl font-extrabold tracking-[0.12em] text-purple-800 sm:text-3xl dark:text-purple-200">
            {title}
          </h1>

          <div aria-hidden="true" className="mx-auto mt-3 flex h-1 w-20 overflow-hidden rounded-full">
            {FLAG.map((color) => (
              <span key={color} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>

          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>

        {/* Progress */}
        <div
          className="mt-8 w-full max-w-xs"
          style={{ animation: "sl-rise .7s .3s ease-out both" }}
        >
          <div
            aria-hidden="true"
            className="relative h-1.5 w-full overflow-hidden rounded-full bg-purple-600/15 dark:bg-white/10"
          >
            <span
              className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-linear-to-r from-purple-500 via-purple-600 to-yellow-400"
              style={{ animation: "sl-progress 1.6s ease-in-out infinite" }}
            />
          </div>

          <p className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-purple-700 dark:text-purple-300">
            {message.replace(/\.{2,}$|…$/, "")}
            <span aria-hidden="true" className="ml-0.5 inline-flex gap-0.5">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="inline-block size-1 rounded-full bg-current"
                  style={{ animation: `sl-dot 1.2s ${dot * 0.18}s ease-in-out infinite` }}
                />
              ))}
            </span>
          </p>
        </div>

        <p className="absolute bottom-6 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Jamhuri ya Muungano wa Tanzania
        </p>
      </div>

      {/* Tanzanian flag colours */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1.5">
        {FLAG.map((color) => (
          <span key={color} className="flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>
  );
}
