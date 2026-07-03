import { MessageSquareMore } from "lucide-react";
import { SITE } from "@/lib/constants/site";

export default function SiteLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-emerald-600 p-2 text-white">
        <MessageSquareMore className="h-5 w-5" />
      </div>

      <div>
        <h1 className="font-bold">{SITE.name}</h1>

        <p className="text-xs text-slate-500">
          Halmashauri ya Wilaya ya {SITE.district}
        </p>
      </div>
    </div>
  );
}