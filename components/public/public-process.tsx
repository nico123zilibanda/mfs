import {
  ChevronDown,
  ChevronRight,
  FileText,
  MessageCircleMore,
  Search,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/layout/Container";

type Step = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  {
    number: "01",
    title: "Jaza Taarifa",
    description:
      "Weka taarifa zako na maelezo ya malalamiko kupitia fomu ya mfumo.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Pokea Namba ya Kumbukumbu",
    description:
      "Baada ya kutuma taarifa utapokea namba ya kumbukumbu kwa ajili ya ufuatiliaji.",
    icon: Search,
  },
  {
    number: "03",
    title: "Fuatilia Maendeleo",
    description:
      "Tumia namba hiyo kufuatilia maendeleo au hali ya uchakataji wa taarifa yako wakati wowote.",
    icon: MessageCircleMore,
  },
];

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  const Icon = step.icon;

  return (
    <li className="relative">
      <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-purple-600/40 hover:shadow-xl hover:shadow-purple-600/5 motion-safe:hover:-translate-y-1 sm:p-7 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500/40 dark:hover:shadow-purple-500/10">
        {/* Accent line that draws in on hover */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-purple-600 to-[#d4a017] transition-transform duration-500 group-hover:scale-x-100 motion-reduce:scale-x-100 motion-reduce:opacity-60"
        />

        {/* Large decorative number */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 -top-3 select-none text-8xl font-black leading-none tracking-tighter text-purple-600/[0.07] transition-colors duration-300 group-hover:text-[#d4a017]/20 dark:text-purple-400/8"
        >
          {step.number}
        </span>

        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600/15 to-purple-600/5 text-purple-700 ring-1 ring-purple-600/15 transition-all duration-300 group-hover:bg-purple-600 group-hover:from-purple-600 group-hover:to-purple-600 group-hover:text-white group-hover:ring-purple-600 dark:from-purple-400/15 dark:to-purple-400/5 dark:text-purple-400 dark:ring-purple-400/20 dark:group-hover:text-white">
            <Icon className="size-7" aria-hidden="true" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-purple-700 dark:text-purple-400">
            Hatua {step.number}
          </p>

          <h3 className="mt-1.5 text-balance text-xl font-semibold leading-snug text-slate-950 dark:text-white">
            {step.title}
          </h3>

          <p className="mt-3 text-pretty leading-7 text-slate-600 dark:text-slate-400">
            {step.description}
          </p>
        </div>
      </div>

      {/* Connector to the next step: down on mobile, right on desktop */}
      {!isLast && (
        <>
          <span
            aria-hidden="true"
            className="absolute -bottom-8 left-1/2 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-purple-700 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-purple-400"
          >
            <ChevronDown className="size-4" />
          </span>
          <span
            aria-hidden="true"
            className="absolute -right-9 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-purple-700 shadow-sm lg:flex dark:border-slate-700 dark:bg-slate-900 dark:text-purple-400"
          >
            <ChevronRight className="size-4" />
          </span>
        </>
      )}
    </li>
  );
}

export default function PublicProcess() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-24 dark:bg-slate-950">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl dark:bg-purple-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 -z-10 size-80 rounded-full bg-[#d4a017]/10 blur-3xl"
      />

      <Container>
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-600/15 bg-purple-600/10 px-4 py-1.5 text-sm font-semibold text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-400">
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            Jinsi Mfumo Unavyofanya Kazi
          </span>

          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            <span className="text-purple-700 dark:text-purple-400">Hatua tatu rahisi</span>{" "}
            za kuwasilisha taarifa
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
            Mchakato ni mfupi na wazi: tuma taarifa, pokea namba ya kumbukumbu, kisha
            fuatilia maendeleo yake.
          </p>

          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-1 w-16 rounded-full bg-linear-to-r from-purple-600 to-[#d4a017]"
          />
        </div>

        {/* Steps */}
        <ol className="mt-12 grid gap-8 sm:mt-14 lg:grid-cols-3 lg:gap-18">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} isLast={index === steps.length - 1} />
          ))}
        </ol>
      </Container>
    </section>
  );
}
