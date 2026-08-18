"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start gap-3 rounded-xl"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Washa mandhari meupe" : "Washa mandhari meusi"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {isDark ? "Giza" : "Mwanga"}
    </Button>
  );
}
