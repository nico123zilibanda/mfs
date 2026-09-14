"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  LayoutGrid,
  List,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { FEEDBACK_STATUS } from "@/lib/constants/feedback-status";
import type { FeedbackStatus } from "@/lib/types/feedback";
import type { ReportsFilters } from "@/lib/types/report";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "./data-table";
import DataTableEmpty from "./data-table-empty";
import Pagination from "./table-pagination";
import TableSearch from "./table-search";
import FeedbackStatusBadge from "../feedback/feedback-status-badge";
import { ReportCardsSkeleton } from "./card-skeletons";
import { ReportTableSkeleton } from "./table-skeletons";

type ReportRow = {
  id: string;
  referenceNumber: string;
  fullName: string | null;
  ward: string;
  phone?: string;
  status: FeedbackStatus;
  createdAt: string;
};

type ReportTableProps = {
  reports: ReportRow[];
  title: string;
  description: string;
  detailBasePath: string;
  filters?: ReportsFilters;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  searchable?: boolean;
  isLoading?: boolean;
};

export default function ReportTable({
  reports,
  title,
  description,
  detailBasePath,
  filters,
  pagination,
  searchable = true,
  isLoading = false,
}: ReportTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters?.search ?? "");
  const [view, setView] = useState<"table" | "cards">("table");

    useEffect(() => {
    setQuery(filters?.search ?? "");
  }, [filters?.search]);

  const updateParams = useCallback(
    (updates: Partial<ReportsFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.search !== undefined) {
        if (updates.search.trim()) params.set("search", updates.search.trim());
        else params.delete("search");
      }
      if (updates.status !== undefined) {
        if (updates.status === "all") params.delete("status");
        else params.set("status", updates.status);
      }
      if (updates.page !== undefined) params.set("page", String(updates.page));
      else if (updates.search !== undefined || updates.status !== undefined)
        params.set("page", "1");
      startTransition(() =>
        router.push(`${pathname}${params.size ? `?${params}` : ""}`, {
          scroll: false,
        }),
      );
    },
    [pathname, router, searchParams],
  );

  const toolbar =
    filters && searchable ? (
      <form
        className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ search: query });
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <TableSearch
            value={query}
            onChange={setQuery}
            disabled={isPending}
            placeholder="Tafuta kwa namba, jina, simu, kijiji au kata..."
          />
          <Button type="submit" variant="outline" disabled={isPending}>
            Tafuta
          </Button>
          <Select
            value={filters.status}
            disabled={isPending}
            onValueChange={(status) =>
              updateParams({ status: status as ReportsFilters["status"] })
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Hali" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hali zote</SelectItem>
              {Object.entries(FEEDBACK_STATUS).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filters.search || filters.status !== "all") && (
            <Button
              type="button"
              variant="ghost"
              className="text-slate-600"
              onClick={() => {
                setQuery("");
                updateParams({ search: "", status: "all" });
              }}
            >
              <RotateCcw className="mr-3 h-5 w-5" /> Weka upya
            </Button>
          )}
        </div>
        <ViewSwitch view={view} onChange={setView} />
      </form>
    ) : (
      <div className="flex justify-end">
        <ViewSwitch view={view} onChange={setView} />
      </div>
    );

    if (isLoading) {
  return (
    <>
      {view === "table" ? (
        <DataTable
          title={title}
          description={description}
          toolbar={toolbar}
        >
          <ReportTableSkeleton />
        </DataTable>
      ) : (
        <section
          className="space-y-6"
          aria-label={`${title} loading`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {toolbar}
          </div>

          <ReportCardsSkeleton />
        </section>
      )}
    </>
  );
}

  if (reports.length === 0) {
    const filtered =
      Boolean(filters?.search) ||
      Boolean(filters?.status && filters.status !== "all");
    return (
      <DataTable
        title={title}
        description={description}
        toolbar={toolbar}
        pagination={
          pagination ? (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateParams({ page })}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
            />
          ) : null
        }
      >
        <tbody>
          <tr>
            <td colSpan={6} className="p-5">
              <DataTableEmpty
                title={
                  filtered
                    ? "Hakuna taarifa zinazolingana"
                    : "Hakuna taarifa bado"
                }
                description={
                  filtered
                    ? "Jaribu kubadili maneno ya utafutaji au kichujio cha hali."
                    : "Taarifa za wananchi zitaonekana hapa zitakapowasilishwa."
                }
              />
            </td>
          </tr>
        </tbody>
      </DataTable>
    );
  }

  return (
    <>
      <DataTable
        title={title}
        description={description}
        toolbar={toolbar}
        pagination={
          pagination ? (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateParams({ page })}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
            />
          ) : null
        }
        className={view === "cards" ? "hidden" : ""}
      >
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <th className="px-5 py-3.5">Kumbukumbu</th>
            <th className="px-5 py-3.5">Mwananchi</th>
            <th className="px-5 py-3.5">Kata</th>
            <th className="px-5 py-3.5">Hali</th>
            <th className="px-5 py-3.5">Imetumwa</th>
            <th className="px-5 py-3.5 text-right">Kitendo</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              className="border-b border-slate-100 last:border-0 hover:bg-purple-50/40 dark:border-slate-800 dark:hover:bg-purple-950/30"
            >
              <td className="px-5 py-4 font-mono text-xs font-bold text-[#6d28d9]">
                {report.referenceNumber}
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {report.fullName || "Bila jina"}
                </p>
                {report.phone && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {report.phone}
                  </p>
                )}
              </td>
              <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{report.ward}</td>
              <td className="px-5 py-4">
                <FeedbackStatusBadge status={report.status} />
              </td>
              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(report.createdAt)}
              </td>
              <td className="px-5 py-4 text-right">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="
                    shrink-0
                    rounded-xl
                    border-cyan-300/40
                    bg-cyan-300
                    px-5
                    font-bold
                    text-purple-800

                    hover:border-cyan-400
                    hover:bg-cyan-400
                    hover:text-purple-950"
                >
                  <Link href={`${detailBasePath}/${report.id}`}>
                    <Eye className="mr-1.5 h-4 w-4" /> Angalia
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      <section
        className={view === "cards" ? "block" : "hidden"}
        aria-label={`${title} card view`}
      >
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {toolbar}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Header */}
              <div className="border-b bg-linear-to-r from-purple-600 to-purple-800 p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-purple-100">
                      Kumbukumbu No.
                    </p>

                    <h3 className="mt-1 font-mono text-lg font-bold">
                      {report.referenceNumber}
                    </h3>
                  </div>

                  <FeedbackStatusBadge status={report.status} />
                </div>
              </div>

              {/* Body */}
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Mwananchi
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {report.fullName || "Bila jina"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-slate-400">Kata</p>

                    <p className="font-medium text-slate-700 dark:text-slate-300">{report.ward}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      Imetumwa
                    </p>

                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>

                {report.phone && (
                  <div>
                    <p className="text-xs uppercase text-slate-400">Phone</p>

                    <p className="font-medium text-slate-700 dark:text-slate-300">{report.phone}</p>
                  </div>
                )}

                <Button
                  asChild
                  className="mt-3 w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link href={`${detailBasePath}/${report.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Angalia Taarifa
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ViewSwitch({
  view,
  onChange,
}: {
  view: "table" | "cards";
  onChange: (view: "table" | "cards") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={view === "table" ? "bg-slate-100 dark:bg-slate-700" : ""}
        onClick={() => onChange("table")}
        aria-label="Mwonekano wa jedwali"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={view === "cards" ? "bg-slate-100 dark:bg-slate-700" : ""}
        onClick={() => onChange("cards")}
        aria-label="Mwonekano wa kadi"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("sw-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

