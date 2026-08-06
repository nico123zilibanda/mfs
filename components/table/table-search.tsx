"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;

  placeholder?: string;

  className?: string;

  disabled?: boolean;
};

export default function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
  disabled = false,
}: TableSearchProps) {
  return (
    <div
      className={cn(
        "relative w-full sm:max-w-sm",
        className
      )}
    >
      <Search
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          size-4
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <Input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-10
          rounded-xl

          pl-10

          border-border/60

          shadow-sm

          transition-all

          focus-visible:ring-2
          focus-visible:ring-primary/20
        "
      />
    </div>
  );
}