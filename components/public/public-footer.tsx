import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { SITE } from "@/lib/constants/site";


export default function PublicFooter() {
  return (
    <footer className="mt-18 bg-slate-950 text-slate-200 sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div className="flex items-start gap-4">
          <Image src="/images/mlele-logos.jpeg" alt="Nembo ya Halmashauri ya Wilaya ya Mlele" width={56} height={56} className="rounded-full" />
          <div>
            <p className="font-semibold text-white">{SITE.council}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Njia salama ya kuwasilisha maoni, malalamiko na taarifa kwa urahisi.</p>
          </div>
        </div>
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <Link href="/public/tracking" className="transition-colors hover:text-[#f5cc53]">Fuatilia taarifa yako</Link>
          <p className="flex items-center gap-2 text-slate-400"><Phone className="h-4 w-4 text-[#f5cc53]" /> {SITE.phone}</p>
          <p className="flex items-center gap-2 text-slate-400"><MapPin className="h-4 w-4 text-[#f5cc53]" /> {SITE.location}</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} {SITE.council}. Haki zote zimehifadhiwa.</div>
    </footer>
  );
}
