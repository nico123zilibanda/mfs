"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FeedbackStatus } from "@/lib/types/feedback";

type Props = {
  defaultSearch?: string;
  defaultStatus?: string;
};

export default function ReportsToolbar({
  defaultSearch = "",
  defaultStatus = "all",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(defaultSearch);
  const [status, setStatus] = useState(defaultStatus);

  function updateURL(params: {
    search?: string;
    status?: string;
  }) {
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

    current.set("page", "1"); // reset pagination

    startTransition(() => {
      router.push(`/reports?${current.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      
      {/* SEARCH */}
      <Input
        placeholder="Search by name, phone, or reference..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateURL({ search });
          }
        }}
        className="max-w-sm"
      />

      <div className="flex items-center gap-2">
        
        {/* STATUS FILTER */}
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            updateURL({ status: value });
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="received">
              Received
            </SelectItem>
            <SelectItem value="in_review">
              In Review
            </SelectItem>
            <SelectItem value="resolved">
              Resolved
            </SelectItem>
          </SelectContent>
        </Select>

        {/* RESET */}
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setStatus("all");
            router.push("/reports");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}