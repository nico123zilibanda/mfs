import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

import { ArrowRight, CheckCircle2, Search, ShieldCheck } from "lucide-react";

import { SITE } from "@/lib/constants/site";

export default function PublicHero() {
  return (
    <section className="relative overflow-hidden bg-blue-300">
      <div className="relative h-162.5 md:h-190">
        <Image
          src="/images/mkurugenzi_banner.png"
          alt="Mfumo wa Kupokea Maoni"
          fill
          priority
          className="object-contain object-center"
        />
        <div className="absolute inset-0 bg-slate-950/65" />

        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#003d24] via-[#004b2a]/90 to-[#003d24]/35" />
        <div className="absolute -bottom-32 -right-24 -z-10 h-96 w-96 rounded-full bg-[#d4a017]/20 blur-3xl" />
        <Container className="relative flex min-h-136 items-center py-18 sm:min-h-152 sm:py-24">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-[#f5cc53]" />
              Mfumo Rasmi wa Kupokea Maoni na Malalamiko
            </div>
            <div className="mt-6 space-y-5">
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
                {SITE.portal}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
                Tunakupa njia rahisi, salama na ya moja kwa moja ya kuwasilisha
                maoni, malalamiko na taarifa kwa Halmashauri ya Wilaya ya Mlele.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[#d4a017] text-[#17220d] hover:bg-[#e6b629]"
              >
                <Link href="#feedback-form">
                  Toa Taarifa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/35 bg-white/10 text-white hover:border-white hover:bg-white hover:text-[#004b2a]"
              >
                <Link href="/public/tracking">
                  <Search className="mr-2 h-5 w-5" />
                  Fuatilia Taarifa
                </Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm text-emerald-50">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#f5cc53]" /> Rahisi
                kutumia
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#f5cc53]" /> Taarifa zako
                zinalindwa
              </span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
