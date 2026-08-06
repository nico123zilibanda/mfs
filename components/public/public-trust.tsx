import {
  BadgeCheck,
  Building2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import Container from "@/components/layout/Container";

const items = [
  {
    title: "Mfumo Rasmi",
    description:
      "Mfumo huu unasimamiwa na Halmashauri ya Wilaya ya Mlele kwa ajili ya kupokea maoni, malalamiko na taarifa kutoka kwa wananchi.",
    icon: Building2,
  },
  {
    title: "Taarifa Zinalindwa",
    description:
      "Taarifa unazowasilisha zinapokelewa kwa usalama na kushughulikiwa kwa kuzingatia usiri unaostahili.",
    icon: ShieldCheck,
  },
  {
    title: "Ufuatiliaji Rahisi",
    description:
      "Baada ya kutuma taarifa utapewa namba ya kumbukumbu ya kufuatilia maendeleo ya uchakataji wake.",
    icon: BadgeCheck,
  },
  {
    title: "Huduma kwa Wakati",
    description:
      "Lengo la mfumo ni kurahisisha mawasiliano kati ya wananchi na Halmashauri kupitia huduma za kidigitali.",
    icon: Clock3,
  },
];

export default function PublicTrust() {
  return (
    <section className="py-18 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-emerald-900/10 px-4 py-1.5 text-sm font-semibold text-[#006b3c]">
            Kwa Nini Utumie Mfumo Huu
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Mfumo Unaolenga Uwazi, Usalama na Uwajibikaji
          </h2>

          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Tumekuwekea mazingira salama na rahisi ya kuwasilisha maoni,
            malalamiko na taarifa zako kwa Halmashauri ya Wilaya ya Mlele.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-800/35 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-900/10 text-[#006b3c]">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
