import { TriangleAlert } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type DataTableErrorProps = {
  title?: string;
  description?: string;
};

export default function DataTableError({
  title = "Data haikuweza kupakiwa",
  description = "Hitilafu imetokea wakati wa kupakia jedwali.",
}: DataTableErrorProps) {
  return (
    <Card className="border-destructive/20 shadow-none">
      <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {title}
          </h3>

          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
