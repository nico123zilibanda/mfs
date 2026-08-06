import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export default function PageSection({
  children,
  className,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "space-y-4",
        className,
      )}
    >
      {children}
    </section>
  );
}
