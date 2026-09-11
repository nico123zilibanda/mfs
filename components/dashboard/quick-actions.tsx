import Link from "next/link";
import { ArrowRight, FileText, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Action = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
};

const actions: Action[] = [
  {
    title: "Angalia Taarifa",
    description:
      "kagua ripoti zote za maoni ya raia zinazowasilishwa kwenye mfumo.",
    href: "/reports",
    icon: FileText,
    color: "from-purple-500 via-purple-600 to-purple-800",
  },
  {
    title: "Fuatilia Taarifa",
    description:
      "Tafuta na ufuatilie maendeleo ya ripoti kwa kutumia namba ya marejeleo.",
    href: "/trackings",
    icon: Search,
    color: "from-sky-500 via-cyan-600 to-blue-700",
  },
];

export default function QuickActions() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vitendo vya Haraka
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Angalia Taarifa au Fuatilia Mrejesho
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.href} href={action.href} className="group">
              <Card
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-purple-300
                  hover:shadow-xl
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-purple-600 scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />

                <CardContent className="p-7">
                  <div className="flex items-start justify-between">
                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-2xl
                        bg-linear-to-br
                        ${action.color}
                        shadow-lg
                      `}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>

                    <ArrowRight
                      className="
                        h-6
                        w-6
                        text-slate-400
                        transition-all
                        duration-300
                        group-hover:translate-x-2
                        group-hover:text-purple-600
                      "
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {action.title}
                    </h3>

                    <p className="mt-2 leading-7 text-slate-500 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">
                      Fungua Moduli
                    </span>

                    <Button
                      size="sm"
                      className="
                        bg-purple-600
                        hover:bg-purple-700
                      "
                    >
                      Endelea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
