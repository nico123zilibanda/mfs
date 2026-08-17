"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataTableProps {
  title: string;
  description?: string;

  toolbar?: ReactNode;
  pagination?: ReactNode;

  children: ReactNode;

  className?: string;
}

export default function DataTable({
  title,
  description,
  toolbar,
  pagination,
  children,
  className,
}: DataTableProps) {
  return (
    <div
      className={cn(
        `
        overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900
        `,
        className
      )}
    >
      {/* Header */}
      <div className="space-y-5 border-b border-slate-200 p-5 sm:p-6 dark:border-slate-800">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {toolbar && (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {toolbar}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="
            w-full
            min-w-200 border-collapse
            text-sm
          "
        >
          {children}
        </table>
      </div>

      {/* Footer */}
      {pagination && (
        <div className="border-t p-4">
          {pagination}
        </div>
      )}
    </div>
  );
}
