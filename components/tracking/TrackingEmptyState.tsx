import { SearchX } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type TrackingEmptyStateProps = {
  title?: string;
  description?: string;
};

export default function TrackingEmptyState({
  title = "Taarifa haijapatikana",
  description = "Hatukupata taarifa yenye namba ya kumbukumbu uliyoweka. Tafadhali hakikisha namba hiyo kisha ujaribu tena.",
}: TrackingEmptyStateProps) {
  return (
    <Card
      className="
        overflow-hidden
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        dark:border-slate-800
        dark:bg-slate-950
      "
    >
      <CardHeader
        className="
          items-center
          border-b
          border-slate-100
          bg-slate-50/70
          py-8
          text-center
          dark:border-slate-800
          dark:bg-slate-900/40
        "
      >
        <div
          className="
            mb-5
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            border
            border-purple-900/10
            bg-purple-50
            shadow-sm
            dark:border-purple-400/20
            dark:bg-purple-950/40
          "
        >
          <SearchX
            className="
              h-10
              w-10
              text-[#6d28d9]
              dark:text-purple-400
            "
          />
        </div>

        <CardTitle
          className="
            text-xl
            font-bold
            text-slate-950
            dark:text-white
          "
        >
          {title}
        </CardTitle>

        <CardDescription
          className="
            mt-2
            max-w-md
            leading-6
            text-slate-600
            dark:text-slate-400
          "
        >
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent
        className="
          p-6
          text-sm
          text-slate-600
          dark:text-slate-400
        "
      >
        <div
          className="
            rounded-xl
            border
            border-purple-900/10
            bg-purple-50/50
            p-5
            dark:border-purple-400/10
            dark:bg-purple-950/20
          "
        >
          <p
            className="
              font-semibold
              text-slate-800
              dark:text-slate-200
            "
          >
            Hakikisha kwamba:
          </p>

          <ul
            className="
              mt-3
              list-disc
              space-y-2
              pl-5
              leading-6
            "
          >
            <li>
              Namba ya marejeleo ulioweka ni sahihi.
            </li>

            <li>
              Hakuna nafasi ya ziada kwenye namba.
            </li>

            <li>
              Taarifa ilitumwa kikamilifu.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}