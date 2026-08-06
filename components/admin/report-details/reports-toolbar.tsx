"use client";

import { RotateCcw, Search } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FEEDBACK_STATUS,
  FEEDBACK_STATUS_LABELS,
} from "@/lib/types/feedback";

type ReportsToolbarProps = {
  defaultSearch?: string;
  defaultStatus?: string;
};

export default function ReportsToolbar({
  defaultSearch = "",
  defaultStatus = "all",
}: ReportsToolbarProps) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(defaultSearch);

  const [status, setStatus] = useState(defaultStatus);

  function updateURL(params: { search?: string; status?: string }) {
    const current = new URLSearchParams(searchParams.toString());

    if (params.search !== undefined) {
      if (params.search) {
        current.set("search", params.search);
      } else {
        current.delete("search");
      }
    }

    if (params.status !== undefined) {
      if (params.status === "all") {
        current.delete("status");
      } else {
        current.set("status", params.status);
      }
    }

    current.set("page", "1");

    startTransition(() => {
      router.push(`/reports?${current.toString()}`);
    });
  }

  function resetFilters() {
    setSearch("");

    setStatus("all");

    router.push("/reports");
  }

  return (
    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
      {/* Search */}

      <div className="relative w-full lg:w-80">
        <Search
          className="
            absolute
            left-3
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <Input
          value={search}
          disabled={isPending}
          placeholder="Search reports..."
          className="pl-9"
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateURL({
                search,
              });
            }
          }}
        />
      </div>

      {/* Status */}

      <Select
        value={status}
        disabled={isPending}
        onValueChange={(value) => {
          setStatus(value);

          updateURL({
            status: value,
          });
        }}
      >
        <SelectTrigger className="w-full lg:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {FEEDBACK_STATUS.map((item) => (
            <SelectItem
              key={item}
              value={item}
            >
              {FEEDBACK_STATUS_LABELS[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}

      <Button variant="outline" disabled={isPending} onClick={resetFilters}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
