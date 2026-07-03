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
  title = "No Feedback Found",
  description = "We couldn't find any feedback matching the reference number you entered. Please check the reference number and try again.",
}: TrackingEmptyStateProps) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>

        <CardTitle>{title}</CardTitle>

        <CardDescription className="max-w-md">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center text-sm text-muted-foreground">
        Hakikisha kwamba:
        <ul className="mt-3 list-disc space-y-1 pl-5 text-left">
          <li>Namba ya marejeleo ulioweka ni sahihi.</li>
          <li>Hakuna nafasi ya ziada.</li>
          <li>Mrejesho umetumwa kikamilifu.</li>
        </ul>
      </CardContent>
    </Card>
  );
}