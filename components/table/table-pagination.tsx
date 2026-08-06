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
}: PaginationProps) {
  return (
    <div
      className="
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      {/* PAGE INFO */}
      <div className="text-sm text-muted-foreground">
        Ukurasa {" "}
        <span className="font-semibold text-foreground">
          {page}
        </span>{" "}
        kati ya {" "}
        <span className="font-semibold text-foreground">
          {totalPages}
        </span>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          Iliyotangulia
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
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
