"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export type TableAction = {
  label: string;

  icon: LucideIcon;

  onClick: () => void;

  disabled?: boolean;

  variant?: "default" | "primary" | "success" | "warning" | "destructive";
};

type ActionButtonsProps = {
  actions: TableAction[];
};

const variants = {
  default:
    "text-muted-foreground hover:bg-muted hover:text-foreground",

  primary:
    "text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",

  success:
    "text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300",

  warning:
    "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",

  destructive:
    "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
};

export default function ActionButtons({
  actions,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.label}
            size="icon-sm"
            variant="ghost"
            disabled={action.disabled}
            onClick={action.onClick}
            title={action.label}
            className={cn(
              variants[action.variant ?? "default"]
            )}
          >
            <Icon className="size-4" />
          </Button>
        );
      })}
    </div>
  );
}