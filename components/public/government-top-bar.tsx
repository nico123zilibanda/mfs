import { Building2, MapPin } from "lucide-react";

import Container from "@/components/layout/Container";

export default function GovernmentTopBar() {
  return (
    <div className="border-b border-white/10 bg-[#004b2a] text-emerald-50">
      <Container className="flex h-10 items-center justify-between py-0 text-xs sm:text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate font-medium">
            Serikali ya Jamhuri ya Muungano wa Tanzania
          </span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <MapPin className="h-3.5 w-3.5" />
          <span>Halmashauri ya Wilaya ya Mlele • Mkoa wa Katavi</span>
        </div>
      </Container>
    </div>
  );
}
