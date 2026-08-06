"use client";

import { MoonStar } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 rounded-xl"
    >
      <MoonStar className="h-5 w-5" />
      Theme
    </Button>
  );
}
