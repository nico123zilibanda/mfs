"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
};

export default function ReportsPagination({
  page,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(newPage: number) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(newPage));

    router.push(
      `/reports?${params.toString()}`
    );
  }

  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      
      {/* PREV */}
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        Previous
      </Button>

      {/* PAGE NUMBERS */}
      <div className="flex items-center gap-2">
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* NEXT */}
      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}