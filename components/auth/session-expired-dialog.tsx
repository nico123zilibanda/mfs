"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SessionExpiredDialogProps {
  open: boolean;
  remainingSeconds: number;
  onRestore: (password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export function SessionExpiredDialog({
  open,
  remainingSeconds,
  onRestore,
  onLogout,
}: SessionExpiredDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      setShowPassword(false);
      setIsRestoring(false);
      setIsLoggingOut(false);
    }
  }, [open]);

  async function handleRestore(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!password.trim()) {
      setError("Tafadhali weka password yako.");
      return;
    }

    setError("");
    setIsRestoring(true);

    try {
      await onRestore(password);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Imeshindikana kurejesha session.";

      setError(message);
      setIsRestoring(false);
    }
  }

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      await onLogout();
    } catch {
      setIsLoggingOut(false);
      setError(
        "Imeshindikana kutoka. Tafadhali jaribu tena.",
      );
    }
  }

  const isBusy =
    isRestoring || isLoggingOut;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-0
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        {/* Top accent */}
        <div className="h-1.5 bg-linear-to-r from-purple-700 via-purple-500 to-indigo-500" />

        <div className="p-6 sm:p-7">
          {/* Icon */}
          <div className="flex items-start justify-between gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-amber-50
                text-amber-600
                ring-8
                ring-amber-50/60
                dark:bg-amber-950/40
                dark:text-amber-400
                dark:ring-amber-950/20
              "
            >
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div
              className="
                rounded-full
                border
                border-red-200
                bg-red-50
                px-3
                py-1.5
                text-xs
                font-bold
                tabular-nums
                text-red-600
                dark:border-red-900/60
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {remainingSeconds}s
            </div>
          </div>

          <AlertDialogTitle className="mt-6 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Session yako imeisha
          </AlertDialogTitle>

          {/* <AlertDialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Umekuwa bila kufanya shughuli kwa muda.
            Kwa usalama wa mfumo, thibitisha password yako
            ili uendelee bila ku-login tena.
          </AlertDialogDescription> */}

          {/* Restore form */}
          <form
            onSubmit={handleRestore}
            className="mt-6 space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="session-restore-password"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Password
              </Label>

              <div className="relative">
                <LockKeyhole
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  id="session-restore-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    );
                    setError("");
                  }}
                  placeholder="Weka password yako"
                  autoComplete="current-password"
                  disabled={isBusy}
                  autoFocus
                  className="
                    h-11
                    rounded-xl
                    border-slate-200
                    pl-10
                    pr-10
                    dark:border-slate-700
                    dark:bg-slate-900
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  disabled={isBusy}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    transition-colors
                    hover:text-slate-700
                    disabled:opacity-50
                    dark:hover:text-slate-200
                  "
                  aria-label={
                    showPassword
                      ? "Ficha password"
                      : "Onyesha password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-2
                    text-xs
                    font-medium
                    leading-5
                    text-red-600
                    dark:border-red-900/50
                    dark:bg-red-950/30
                    dark:text-red-400
                  "
                >
                  {error}
                </p>
              )}
            </div>

            {/* <div
              className="
                flex
                items-start
                gap-2.5
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-3
                dark:border-slate-800
                dark:bg-slate-900/70
              "
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />

              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Password yako haitahifadhiwa. Inatumika
                kuthibitisha tu kuwa bado wewe ndiye
                mtumiaji wa account hii.
              </p>
            </div> */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={isBusy}
                className="
                  h-11
                  rounded-xl
                  border-slate-200
                  font-semibold
                  dark:border-slate-700
                "
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}

                Logout
              </Button>

              <Button
                type="submit"
                disabled={
                  isBusy ||
                  !password.trim()
                }
                className="
                  h-11
                  rounded-xl
                  bg-[#6d28d9]
                  font-semibold
                  text-white
                  shadow-sm
                  hover:bg-[#4c1d95]
                "
              >
                {isRestoring ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}

                {isRestoring
                  ? "Inarejesha..."
                  : "Restore Session"}
              </Button>
            </div>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}