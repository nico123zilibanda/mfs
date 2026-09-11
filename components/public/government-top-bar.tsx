import {
  Building2,
  MapPin,
} from "lucide-react";

import Container from "@/components/layout/Container";

export default function GovernmentTopBar() {
  return (
    <div
      className="
        border-b
        border-purple-900/20
        bg-purple-800
        text-purple-50

        dark:border-purple-700/30
        dark:bg-slate-950
        dark:text-purple-200
      "
    >
      <Container className="flex h-10 items-center justify-between py-0 text-xs sm:text-sm">

        <div className="flex min-w-0 items-center gap-2">

          <Building2
            className="
              h-3.5
              w-3.5
              shrink-0
              text-purple-200
              dark:text-purple-400
            "
          />

          <span className="truncate font-medium tracking-wide">
            Serikali ya Jamhuri ya Muungano wa Tanzania
          </span>

        </div>

        <div
          className="
            hidden
            items-center
            gap-2
            text-purple-100/90
            sm:flex

            dark:text-slate-300
          "
        >

          <MapPin
            className="
              h-3.5
              w-3.5
              text-amber-300
              dark:text-amber-400
            "
          />

          <span>
            Halmashauri ya Wilaya ya Mlele • Mkoa wa Katavi
          </span>

        </div>

      </Container>
    </div>
  );
}