
"use client";

import { ArrowLeft, Headset, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ChatHeader() {
  return (
    <header className="relative overflow-hidden bg-linear-to-r from-violet-700 via-violet-600 to-indigo-600 px-5 py-5 text-white sm:px-7">
      <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <Link
          href="/"
          aria-label="Rudi ukurasa wa mwanzo"
          className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg"
        >
          <Headset className="h-6 w-6" />

          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-violet-600 bg-emerald-400" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
            Mlele DC — Admin Support
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-violet-100 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Chat ya msaada
            </span>

            <span className="text-white/40">•</span>

            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Mazungumzo binafsi
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
