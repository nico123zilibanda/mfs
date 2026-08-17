// ================================
// components/table/Pagination.tsx
// ================================

"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems = 0,
  pageSize = 0,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className="
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      {/* PAGE INFO */}
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 && <span className="mr-3">{start}–{end} kati ya {totalItems}</span>}
        Ukurasa {" "}
        <span className="font-semibold text-foreground">
          {page}
        </span>{" "}
        kati ya {" "}
        <span className="font-semibold text-foreground">
          {safeTotalPages}
        </span>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          Iliyotangulia
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="gap-1"
        >
          Inayofuata
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
