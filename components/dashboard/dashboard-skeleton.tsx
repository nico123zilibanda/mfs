import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="
              overflow-hidden
              rounded-2xl
              border-slate-200
              shadow-sm
              dark:border-slate-800
            "
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24" />

                  <Skeleton className="h-8 w-16" />
                </div>

                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* =====================================================
          DASHBOARD CONTENT
      ====================================================== */}
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card
            key={index}
            className="
              overflow-hidden
              rounded-2xl
              border-slate-200
              shadow-sm
              dark:border-slate-800
            "
          >
            {/* Header */}
            <CardHeader
              className="
                border-b
                border-slate-100
                px-5
                py-5
                dark:border-slate-800
                sm:px-6
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />

                    <Skeleton className="h-3 w-52" />
                  </div>
                </div>

                <Skeleton className="h-8 w-14 rounded-lg" />
              </div>
            </CardHeader>

            {/* Chart / Content */}
            <CardContent className="p-5 sm:p-6">
              <div
                className="
                  flex
                  h-60
                  items-end
                  gap-3
                  sm:h-68
                "
              >
                {Array.from({ length: 7 }).map(
                  (_, barIndex) => (
                    <Skeleton
                      key={barIndex}
                      className="flex-1 rounded-t-lg"
                      style={{
                        height: `${35 + ((barIndex * 17) % 55)}%`,
                      }}
                    />
                  )
                )}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Skeleton className="h-3 w-24" />

                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
