"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckSquare,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { FEEDBACK_STATUS } from "@/lib/constants/feedback-status";
import type { FeedbackStatus } from "@/lib/types/feedback";
import type { ReportsFilters } from "@/lib/types/report";

import {
  permanentlyDeleteManyFeedback,
} from "@/lib/actions/feedback-permanent-delete-many";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

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

  const [query, setQuery] = useState(
    filters?.search ?? "",
  );

  const [view, setView] = useState<"table" | "cards">(
    "table",
  );

  const [selectedIds, setSelectedIds] = useState<
    Set<string>
  >(() => new Set());

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [isDeleting, startDeleteTransition] =
    useTransition();

  /*
   * Keep local search input synchronized with URL filters.
   */
  useEffect(() => {
    setQuery(filters?.search ?? "");
  }, [filters?.search]);

  /*
   * IDs currently visible on the current page.
   *
   * Because the reports table uses server-side pagination,
   * "Select All" intentionally means all rows visible on
   * the current page.
   */
  const currentPageIds = useMemo(
    () => reports.map((report) => report.id),
    [reports],
  );

  const selectedCount = selectedIds.size;

  const selectedOnCurrentPage = useMemo(
    () =>
      currentPageIds.filter((id) =>
        selectedIds.has(id),
      ).length,
    [currentPageIds, selectedIds],
  );

  const allCurrentPageSelected =
    reports.length > 0 &&
    selectedOnCurrentPage === reports.length;

  const someCurrentPageSelected =
    selectedOnCurrentPage > 0 &&
    !allCurrentPageSelected;

  /*
   * Update URL filters while preserving the existing
   * search params and pagination behavior.
   */
  const updateParams = useCallback(
    (updates: Partial<ReportsFilters>) => {
      const params = new URLSearchParams(
        searchParams.toString(),
      );

      if (updates.search !== undefined) {
        if (updates.search.trim()) {
          params.set(
            "search",
            updates.search.trim(),
          );
        } else {
          params.delete("search");
        }
      }

      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status");
        } else {
          params.set("status", updates.status);
        }
      }

      if (updates.page !== undefined) {
        params.set(
          "page",
          String(updates.page),
        );
      } else if (
        updates.search !== undefined ||
        updates.status !== undefined
      ) {
        params.set("page", "1");
      }

      startTransition(() =>
        router.push(
          `${pathname}${
            params.size ? `?${params}` : ""
          }`,
          {
            scroll: false,
          },
        ),
      );
    },
    [pathname, router, searchParams],
  );

  /*
   * Toggle a single report selection.
   */
  const toggleRowSelection = useCallback(
    (id: string) => {
      setSelectedIds((current) => {
        const next = new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      });
    },
    [],
  );

  /*
   * Select/unselect all reports visible on the
   * current page.
   */
  const toggleSelectAll = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allCurrentPageSelected) {
        currentPageIds.forEach((id) => {
          next.delete(id);
        });
      } else {
        currentPageIds.forEach((id) => {
          next.add(id);
        });
      }

      return next;
    });
  }, [
    allCurrentPageSelected,
    currentPageIds,
  ]);

  /*
   * Clear every selected report.
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /*
   * Switching to card view clears table selection.
   * This prevents an invisible selection state from
   * remaining active while the table itself is hidden.
   */
  const handleViewChange = useCallback(
    (nextView: "table" | "cards") => {
      setView(nextView);

      if (nextView === "cards") {
        clearSelection();
      }
    },
    [clearSelection],
  );

  /*
   * Reset selected rows whenever the server-side dataset
   * changes because of search, filtering or pagination.
   */
  useEffect(() => {
    clearSelection();
  }, [
    filters?.search,
    filters?.status,
    pagination?.page,
    clearSelection,
  ]);

  /*
   * Permanently delete all selected reports.
   *
   * The actual database operation happens inside the
   * server action/repository layer.
   */
  const handlePermanentDelete = useCallback(() => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) {
      return;
    }

    startDeleteTransition(async () => {
      const result =
        await permanentlyDeleteManyFeedback({
          ids,
        });

      if (!result.success) {
        toast.error(
          result.message ||
            "Imeshindikana kufuta taarifa.",
        );

        return;
      }

      toast.success(
        ids.length === 1
          ? "Taarifa imefutwa kabisa."
          : `Taarifa ${ids.length} zimefutwa kabisa.`,
      );

      setSelectedIds(new Set());
      setDeleteDialogOpen(false);

      router.refresh();
    });
  }, [selectedIds, router]);

  /*
   * Selection actions displayed only when one or more
   * rows have been selected.
   */
  const selectionToolbar =
    selectedCount > 0 ? (
      <SelectionToolbar
        selectedCount={selectedCount}
        onDelete={() =>
          setDeleteDialogOpen(true)
        }
        onClear={clearSelection}
        isDeleting={isDeleting}
      />
    ) : null;

  /*
   * Main table toolbar.
   */
  const toolbar =
    filters && searchable ? (
      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3
          shadow-sm
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <form
          className="
            flex
            w-full
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
          onSubmit={(event) => {
            event.preventDefault();

            updateParams({
              search: query,
            });
          }}
        >
          <div
            className="
              flex
              w-full
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
            "
          >
            <div
              className="
                min-w-0
                flex-1
                lg:max-w-md
              "
            >
              <TableSearch
                value={query}
                onChange={setQuery}
                disabled={isPending}
                placeholder="Tafuta namba, jina, simu, kijiji au kata..."
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="
                rounded-xl
                bg-[#6d28d9]
                px-5
                font-semibold
                text-white
                shadow-sm
                hover:bg-[#4c1d95]
              "
            >
              Tafuta
            </Button>

            <Select
              value={filters.status}
              disabled={isPending}
              onValueChange={(status) =>
                updateParams({
                  status:
                    status as ReportsFilters["status"],
                })
              }
            >
              <SelectTrigger
                className="
                  w-full
                  rounded-xl
                  border-slate-200
                  bg-slate-50
                  sm:w-48
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              >
                <SlidersHorizontal className="mr-2 h-4 w-4 text-slate-500" />

                <SelectValue placeholder="Hali" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Hali zote
                </SelectItem>

                {Object.entries(FEEDBACK_STATUS).map(
                  ([value, config]) => (
                    <SelectItem
                      key={value}
                      value={value}
                    >
                      {config.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {(filters.search ||
              filters.status !== "all") && (
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                className="
                  rounded-xl
                  text-slate-600
                  hover:bg-slate-100
                  hover:text-slate-900
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
                onClick={() => {
                  setQuery("");

                  updateParams({
                    search: "",
                    status: "all",
                  });
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Weka upya
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {view === "table" &&
              selectionToolbar}

            <ViewSwitch
              view={view}
              onChange={handleViewChange}
            />
          </div>
        </form>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {view === "table" &&
          selectionToolbar}

        <ViewSwitch
          view={view}
          onChange={handleViewChange}
        />
      </div>
    );

  /*
   * Loading state.
   */
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
            {toolbar}

            <ReportCardsSkeleton />
          </section>
        )}
      </>
    );
  }

  /*
   * Empty state.
   */
  if (reports.length === 0) {
    const filtered =
      Boolean(filters?.search) ||
      Boolean(
        filters?.status &&
          filters.status !== "all",
      );

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
              onPageChange={(page) =>
                updateParams({ page })
              }
              totalItems={
                pagination.totalItems
              }
              pageSize={pagination.pageSize}
            />
          ) : null
        }
      >
        <tbody>
          <tr>
            <td
              colSpan={7}
              className="p-6"
            >
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
      {/* =========================================================
          TABLE VIEW
      ========================================================== */}
      <div
        className={
          view === "table"
            ? "block"
            : "hidden"
        }
      >
        <DataTable
          title={title}
          description={description}
          toolbar={toolbar}
          pagination={
            pagination ? (
              <Pagination
                page={pagination.page}
                totalPages={
                  pagination.totalPages
                }
                onPageChange={(page) =>
                  updateParams({ page })
                }
                totalItems={
                  pagination.totalItems
                }
                pageSize={pagination.pageSize}
              />
            ) : null
          }
        >
          <thead>
            <tr
              className="
                border-b
                border-slate-200
                bg-slate-50/80
                text-left
                dark:border-slate-800
                dark:bg-slate-900/70
              "
            >
              {/* Select all */}
              <th
                className="
                  w-12
                  px-4
                  py-4
                "
              >
                <SelectionCheckbox
                  checked={
                    allCurrentPageSelected
                  }
                  indeterminate={
                    someCurrentPageSelected
                  }
                  onChange={
                    toggleSelectAll
                  }
                  aria-label="Chagua taarifa zote"
                />
              </th>

              {/* Reference */}
              <th
                className="
                  px-6
                  py-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Kumbukumbu
              </th>

              {/* Citizen */}
              <th
                className="
                  px-6
                  py-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Mwananchi
              </th>

              {/* Location */}
              <th
                className="
                  px-6
                  py-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Eneo
              </th>

              {/* Status */}
              <th
                className="
                  px-6
                  py-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Hali
              </th>

              {/* Date */}
              <th
                className="
                  px-6
                  py-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Tarehe
              </th>

              {/* Actions */}
              <th
                className="
                  px-6
                  py-4
                  text-right
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Kitendo
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <ReportTableRow
                key={report.id}
                report={report}
                detailBasePath={
                  detailBasePath
                }
                selected={selectedIds.has(
                  report.id,
                )}
                onToggle={() =>
                  toggleRowSelection(
                    report.id,
                  )
                }
              />
            ))}
          </tbody>
        </DataTable>
      </div>

      {/* =========================================================
          CARD / GRID VIEW
      ========================================================== */}
      <section
        className={
          view === "cards"
            ? "block"
            : "hidden"
        }
        aria-label={`${title} card view`}
      >
        {toolbar}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              detailBasePath={
                detailBasePath
              }
            />
          ))}
        </div>

        {pagination && (
          <div className="mt-6">
            <Pagination
              page={pagination.page}
              totalPages={
                pagination.totalPages
              }
              onPageChange={(page) =>
                updateParams({ page })
              }
              totalItems={
                pagination.totalItems
              }
              pageSize={
                pagination.pageSize
              }
            />
          </div>
        )}
      </section>

      {/* =========================================================
          PERMANENT DELETE CONFIRMATION
      ========================================================== */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent
          className="
            max-w-md
            rounded-2xl
          "
        >
          <AlertDialogHeader>
            <div
              className="
                mb-2
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
                dark:bg-red-950/40
                dark:text-red-400
              "
            >
              <Trash2 className="h-5 w-5" />
            </div>

            <AlertDialogTitle>
              Futa taarifa kabisa?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Umechagua{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {selectedCount}
              </strong>{" "}
              {selectedCount === 1
                ? "taarifa"
                : "taarifa"}.
              <br />
              <br />
              Kitendo hiki kitafuta taarifa
              kabisa na hakiwezi kurejeshwa.
              Tafadhali hakikisha umechagua
              taarifa sahihi kabla ya kuendelea.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl"
            >
              Ghairi
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handlePermanentDelete();
              }}
              className="
                rounded-xl
                bg-red-600
                font-semibold
                text-white
                hover:bg-red-700
                focus:ring-red-500
              "
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isDeleting
                ? "Inafuta..."
                : "Futa kabisa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* =========================================================
   SELECTION TOOLBAR
========================================================= */

function SelectionToolbar({
  selectedCount,
  onDelete,
  onClear,
  isDeleting,
}: {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-purple-200
        bg-purple-50
        px-3
        py-2
        dark:border-purple-900/60
        dark:bg-purple-950/30
      "
    >
      <div
        className="
          flex
          h-7
          min-w-7
          items-center
          justify-center
          rounded-lg
          bg-[#6d28d9]
          px-2
          text-xs
          font-bold
          text-white
        "
      >
        {selectedCount}
      </div>

      <span
        className="
          hidden
          text-sm
          font-semibold
          text-purple-900
          sm:block
          dark:text-purple-200
        "
      >
        {selectedCount === 1
          ? "Taarifa imechaguliwa"
          : "Taarifa zimechaguliwa"}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={isDeleting}
        className="
          h-8
          rounded-lg
          px-2
          text-slate-500
          hover:bg-white
          hover:text-slate-900
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
        aria-label="Ondoa chaguo"
      >
        <X className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        onClick={onDelete}
        disabled={isDeleting}
        className="
          h-8
          rounded-lg
          bg-red-600
          px-3
          font-semibold
          text-white
          shadow-sm
          hover:bg-red-700
        "
      >
        {isDeleting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="mr-2 h-4 w-4" />
        )}

        Futa kabisa
      </Button>
    </div>
  );
}

/* =========================================================
   SELECTION CHECKBOX
========================================================= */

function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={
        indeterminate ? "mixed" : checked
      }
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className="
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-lg
        text-slate-400
        transition-colors
        hover:bg-purple-50
        hover:text-[#6d28d9]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-purple-500
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        dark:hover:bg-purple-950/40
      "
    >
      {indeterminate ? (
        <span
          className="
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded
            bg-[#6d28d9]
          "
        >
          <span className="h-0.5 w-2 bg-white" />
        </span>
      ) : checked ? (
        <CheckSquare className="h-4.5 w-4.5 text-[#6d28d9]" />
      ) : (
        <Square className="h-4.5 w-4.5" />
      )}
    </button>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function ReportTableRow({
  report,
  detailBasePath,
  selected,
  onToggle,
}: {
  report: ReportRow;
  detailBasePath: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      className={cn(
        `
          group
          border-b
          transition-colors
          dark:border-slate-800
        `,
        selected
          ? `
              border-purple-100
              bg-purple-50/60
              hover:bg-purple-50
              dark:border-purple-900/40
              dark:bg-purple-950/20
              dark:hover:bg-purple-950/30
            `
          : `
              border-slate-100
              hover:bg-purple-50/40
              dark:hover:bg-purple-950/20
            `,
      )}
    >
      {/* Selection */}
      <td className="w-12 px-4 py-5">
        <SelectionCheckbox
          checked={selected}
          onChange={onToggle}
          aria-label={`Chagua taarifa ${report.referenceNumber}`}
        />
      </td>

      {/* Reference */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-purple-50
              text-[#6d28d9]
              dark:bg-purple-950/40
              dark:text-purple-300
            "
          >
            <span className="text-xs font-bold">
              #
            </span>
          </div>

          <div>
            <p
              className="
                font-mono
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {report.referenceNumber}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Kumbukumbu
            </p>
          </div>
        </div>
      </td>

      {/* Citizen */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-sm
              font-bold
              text-slate-600
              ring-4
              ring-slate-50
              dark:bg-slate-800
              dark:text-slate-300
              dark:ring-slate-900
            "
          >
            {getInitials(report.fullName)}
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                font-semibold
                text-slate-900
                dark:text-slate-100
              "
            >
              {report.fullName ||
                "Bila jina"}
            </p>

            {report.phone && (
              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                <Phone className="h-3 w-3" />

                {report.phone}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Ward */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />

          <span
            className="
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-300
            "
          >
            {report.ward}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        <FeedbackStatusBadge
          status={report.status}
        />
      </td>

      {/* Date */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />

          <span
            className="
              whitespace-nowrap
              text-sm
              text-slate-600
              dark:text-slate-400
            "
          >
            {formatDate(report.createdAt)}
          </span>
        </div>
      </td>

      {/* Action */}
      <td className="px-6 py-5 text-right">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="
            rounded-xl
            border-slate-200
            bg-white
            px-4
            font-semibold
            text-slate-700
            shadow-sm
            transition-all
            hover:border-purple-200
            hover:bg-purple-50
            hover:text-[#6d28d9]
            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-200
            dark:hover:border-purple-800
            dark:hover:bg-purple-950/40
            dark:hover:text-purple-300
          "
        >
          <Link
            href={`${detailBasePath}/${report.id}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Angalia
          </Link>
        </Button>
      </td>
    </tr>
  );
}

/* =========================================================
   CARD VIEW
========================================================= */

function ReportCard({
  report,
  detailBasePath,
}: {
  report: ReportRow;
  detailBasePath: string;
}) {
  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-purple-200
        hover:shadow-xl
        dark:border-slate-800
        dark:bg-slate-900
        dark:hover:border-purple-900
      "
    >
      {/* Accent */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-1
          bg-linear-to-r
          from-purple-500
          via-[#6d28d9]
          to-indigo-500
        "
      />

      <div className="p-5">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-purple-50
                text-[#6d28d9]
                dark:bg-purple-950/40
                dark:text-purple-300
              "
            >
              <FileIcon />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  font-mono
                  text-sm
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {report.referenceNumber}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Kumbukumbu
              </p>
            </div>
          </div>

          <FeedbackStatusBadge
            status={report.status}
          />
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-slate-100 dark:bg-slate-800" />

        {/* Citizen */}
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Mwananchi
          </p>

          <div className="mt-2 flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-slate-100
                text-sm
                font-bold
                text-slate-600
                dark:bg-slate-800
                dark:text-slate-300
              "
            >
              {getInitials(report.fullName)}
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  font-semibold
                  text-slate-900
                  dark:text-slate-100
                "
              >
                {report.fullName ||
                  "Bila jina"}
              </p>

              {report.phone && (
                <p
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  <Phone className="h-3 w-3" />

                  {report.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div
            className="
              rounded-xl
              bg-slate-50
              p-3
              dark:bg-slate-800/60
            "
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Kata
              </p>
            </div>

            <p
              className="
                mt-1.5
                truncate
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
              "
            >
              {report.ward}
            </p>
          </div>

          <div
            className="
              rounded-xl
              bg-slate-50
              p-3
              dark:bg-slate-800/60
            "
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Imetumwa
              </p>
            </div>

            <p
              className="
                mt-1.5
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
              "
            >
              {formatDate(report.createdAt)}
            </p>
          </div>
        </div>

        {/* Action */}
        <Button
          asChild
          className="
            mt-5
            w-full
            rounded-xl
            bg-[#6d28d9]
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-[#4c1d95]
            hover:shadow-md
          "
        >
          <Link
            href={`${detailBasePath}/${report.id}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Angalia Taarifa
          </Link>
        </Button>
      </div>
    </article>
  );
}

/* =========================================================
   VIEW SWITCH
========================================================= */

function ViewSwitch({
  view,
  onChange,
}: {
  view: "table" | "cards";
  onChange: (view: "table" | "cards") => void;
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        rounded-xl
        border
        border-slate-200
        bg-slate-100
        p-1
        shadow-inner
        dark:border-slate-700
        dark:bg-slate-800
      "
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cnView(
          view === "table",
        )}
        onClick={() =>
          onChange("table")
        }
        aria-label="Mwonekano wa jedwali"
        aria-pressed={
          view === "table"
        }
      >
        <List className="h-4 w-4" />

        <span className="sr-only">
          Jedwali
        </span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cnView(
          view === "cards",
        )}
        onClick={() =>
          onChange("cards")
        }
        aria-label="Mwonekano wa kadi"
        aria-pressed={
          view === "cards"
        }
      >
        <LayoutGrid className="h-4 w-4" />

        <span className="sr-only">
          Grid
        </span>
      </Button>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function cnView(active: boolean) {
  return active
    ? `
        rounded-lg
        bg-white
        text-[#6d28d9]
        shadow-sm
        hover:bg-white
        dark:bg-slate-900
        dark:text-purple-300
        dark:hover:bg-slate-900
      `
    : `
        rounded-lg
        text-slate-500
        hover:bg-white/70
        hover:text-slate-700
        dark:text-slate-400
        dark:hover:bg-slate-700
        dark:hover:text-slate-200
      `;
}

function getInitials(
  name: string | null,
) {
  if (!name) {
    return "—";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "sw-TZ",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14 2v6h6M8 13h8M8 17h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}