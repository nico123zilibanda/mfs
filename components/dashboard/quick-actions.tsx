import Link from "next/link";

import { ArrowRight, FileText, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Action = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

const actions: Action[] = [
  {
    title: "View Reports",
    description: "Browse all citizen feedback reports.",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Track Feedback",
    description: "Search feedback using reference number.",
    href: "/trackings",
    icon: Search,
  },
];

export default function QuickActions() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          Quick Actions
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <CardTitle className="pt-4">
                    {action.title}
                  </CardTitle>

                  <CardDescription>
                    {action.description}
                  </CardDescription>
                </CardHeader>

                <CardContent />
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}