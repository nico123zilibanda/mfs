import { Skeleton } from "@/components/ui/skeleton";

export function ReportTableSkeleton() {
  return (
    <>
      <thead className="border-b bg-slate-50 dark:bg-slate-900">
        <tr>
          <th className="px-5 py-4 text-left">Kumbukumbu no</th>
          <th className="px-5 py-4 text-left">Mwananchi</th>
          <th className="px-5 py-4 text-left">Kata</th>
          <th className="px-5 py-4 text-left">Hali</th>
          <th className="px-5 py-4 text-left">Imetuma</th>
          <th className="px-5 py-4 text-right">Kitendo</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index} className="border-b last:border-0">
            <td className="px-5 py-4">
              <Skeleton className="h-4 w-28" />
            </td>

            <td className="px-5 py-4 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </td>

            <td className="px-5 py-4">
              <Skeleton className="h-4 w-24" />
            </td>

            <td className="px-5 py-4">
              <Skeleton className="h-7 w-24 rounded-full" />
            </td>

            <td className="px-5 py-4">
              <Skeleton className="h-4 w-28" />
            </td>

            <td className="px-5 py-4 text-right">
              <Skeleton className="ml-auto h-9 w-24 rounded-md" />
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
