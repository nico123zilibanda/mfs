import {
  FileText,
  Search,
  MessageCircleMore,
} from "lucide-react";

import Container from "@/components/layout/Container";

const steps = [
  {
    number: "01",
    title: "Jaza Taarifa",
    description:
      "Weka taarifa zako na maelezo ya malalamiko au maoni kupitia fomu ya mfumo.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Pokea Namba ya Kumbukumbu",
    description:
      "Baada ya kutuma taarifa utapatiwa namba ya kumbukumbu kwa ajili ya ufuatiliaji.",
    icon: Search,
  },
  {
    number: "03",
    title: "Fuatilia Maendeleo",
    description:
      "Tumia namba hiyo kufuatilia maendeleo ya uchakataji wa taarifa yako wakati wowote.",
    icon: MessageCircleMore,
  },
];

export default function PublicProcess() {
  return (
    <section className="py-18 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-emerald-900/10 px-4 py-1.5 text-sm font-semibold text-[#006b3c]">
            Jinsi Mfumo Unavyofanya Kazi
          </span>

          <h2 className="mt-5 text-3xl font-bold text-slate-950 md:text-4xl">
            Hatua 3 Rahisi za Kuwasilisha Taarifa
          </h2>

          <p className="mt-4 text-muted-foreground">
            Mchakato umeboreshwa ili uwe rahisi kwa kila mwananchi.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-emerald-800/35 hover:shadow-lg"
              >
                <span className="absolute right-6 top-6 text-5xl font-bold text-primary/10">
                  {step.number}
                </span>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-900/10 text-[#006b3c]">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
