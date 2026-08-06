"use client";

import { Menu, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl lg:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Fungua menyu"><Menu className="h-5 w-5" /></Button><div><p className="text-sm font-bold text-slate-950">Kituo cha usimamizi</p><p className="text-xs text-slate-500">Halmashauri ya Wilaya ya Mlele</p></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 sm:flex"><ShieldCheck className="h-4 w-4" /> Akaunti salama</div><Avatar className="h-9 w-9 border border-slate-200"><AvatarFallback className="bg-slate-950 text-xs font-bold text-white">ADM</AvatarFallback></Avatar></div></header>;
}
