import { Skeleton } from "@/components/ui/skeleton";

type DataTableLoadingProps = {
  rows?: number;
  columns?: number;
};

export default function DataTableLoading({
  rows = 8,
  columns = 6,
}: DataTableLoadingProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="divide-y">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid min-h-16 items-center gap-4 px-5"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))`,
            }}
          >
            {Array.from({
              length: columns,
            }).map((_, column) => (
              <Skeleton
                key={column}
                className="h-4 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
