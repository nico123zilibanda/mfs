import { Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/constants/site";
export default function FeedbackFooter() {
  return (
    <footer className="mt-10 space-y-6 text-center">
      <Separator />

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-4 w-4" />

        <span>
        Piga <strong className="text-lg text-indigo-900 font-medium">{SITE.phone}</strong> kuongea na
          Mkurugenzi Mtendaji wa Halmashauri ya Wilaya
          ya Mlele.
        </span>
      </div>
    </footer>
  );
}