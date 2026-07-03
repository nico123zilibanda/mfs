import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
}

export default function Section({
  children,
}: SectionProps) {
  return (
    <section className="py-12">
      {children}
    </section>
  );
}