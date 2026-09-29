"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createSupabaseBrowserClient,
} from "@/lib/auth/client";

import {
  SESSION_ACTIVITY_THROTTLE_MS,
  SESSION_TIMEOUT_MS,
  SESSION_WARNING_SECONDS,
} from "@/lib/auth/session-config";

import {
  SessionExpiredDialog,
} from "./session-expired-dialog";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({
  children,
}: SessionProviderProps) {
  const router = useRouter();

  const supabaseRef = useRef(
    createSupabaseBrowserClient(),
  );

  const inactivityTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const countdownTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

  const lastActivityRef = useRef(0);

  const isExpiredRef = useRef(false);

  const [sessionExpired, setSessionExpired] =
    useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState(SESSION_WARNING_SECONDS);

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(
        inactivityTimerRef.current,
      );

      inactivityTimerRef.current = null;
    }

    if (countdownTimerRef.current) {
      clearInterval(
        countdownTimerRef.current,
      );

      countdownTimerRef.current = null;
    }
  }, []);

  const redirectToLogin =
    useCallback(async () => {
      clearTimers();

      isExpiredRef.current = true;

      try {
        await supabaseRef.current.auth.signOut();
      } finally {
        router.replace("/login");
      }
    }, [clearTimers, router]);

  const showSessionExpired =
    useCallback(() => {
      if (isExpiredRef.current) {
        return;
      }

      clearTimers();

      isExpiredRef.current = true;

      setRemainingSeconds(
        SESSION_WARNING_SECONDS,
      );

      setSessionExpired(true);

      let seconds =
        SESSION_WARNING_SECONDS;

      countdownTimerRef.current =
        setInterval(() => {
          seconds -= 1;

          if (seconds <= 0) {
            if (
              countdownTimerRef.current
            ) {
              clearInterval(
                countdownTimerRef.current,
              );

              countdownTimerRef.current =
                null;
            }

            setRemainingSeconds(0);

            void redirectToLogin();

            return;
          }

          setRemainingSeconds(seconds);
        }, 1000);
    }, [
      clearTimers,
      redirectToLogin,
    ]);

  const scheduleTimeout =
    useCallback(() => {
      if (isExpiredRef.current) {
        return;
      }

      if (inactivityTimerRef.current) {
        clearTimeout(
          inactivityTimerRef.current,
        );
      }

      inactivityTimerRef.current =
        setTimeout(
          showSessionExpired,
          SESSION_TIMEOUT_MS,
        );
    }, [showSessionExpired]);

  const registerActivity =
    useCallback(() => {
      if (isExpiredRef.current) {
        return;
      }

      const now = Date.now();

      /*
       * Avoid resetting the timeout on every mousemove.
       */
      if (
        now - lastActivityRef.current <
        SESSION_ACTIVITY_THROTTLE_MS
      ) {
        return;
      }

      lastActivityRef.current = now;

      scheduleTimeout();
    }, [scheduleTimeout]);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      const {
        data: { session },
      } =
        await supabaseRef.current.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        return;
      }

      isExpiredRef.current = false;
      lastActivityRef.current =
        Date.now();

      scheduleTimeout();
    }

    void initializeSession();

    return () => {
      mounted = false;
      clearTimers();
    };
  }, [clearTimers, scheduleTimeout]);

  useEffect(() => {
    const events = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(
        event,
        registerActivity,
        {
          passive: true,
        },
      );
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(
          event,
          registerActivity,
        );
      });
    };
  }, [registerActivity]);

  useEffect(() => {
    const {
      data: { subscription },
    } =
      supabaseRef.current.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_OUT") {
            clearTimers();

            isExpiredRef.current = true;

            setSessionExpired(false);

            return;
          }

          if (
            session &&
            (event === "SIGNED_IN" ||
              event === "TOKEN_REFRESHED")
          ) {
            /*
             * Do not restore the inactivity timer
             * while the restore dialog is still open.
             */
            if (sessionExpired) {
              return;
            }

            isExpiredRef.current = false;
            lastActivityRef.current =
              Date.now();

            scheduleTimeout();
          }
        },
      );

    return () => {
      subscription.unsubscribe();
    };
  }, [
    clearTimers,
    scheduleTimeout,
    sessionExpired,
  ]);

  const handleRestore = useCallback(
    async (password: string) => {
      const supabase =
        supabaseRef.current;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        throw new Error(
          "Session ya mtumiaji haipatikani. Tafadhali login tena.",
        );
      }

      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword(
        {
          email: user.email,
          password,
        },
      );

      if (
        error ||
        !data.session
      ) {
        throw new Error(
          "Password si sahihi. Tafadhali jaribu tena.",
        );
      }

      clearTimers();

      isExpiredRef.current = false;

      lastActivityRef.current =
        Date.now();

      setRemainingSeconds(
        SESSION_WARNING_SECONDS,
      );

      setSessionExpired(false);

      scheduleTimeout();

      toast.success(
        "Session imerejeshwa.",
        {
          description:
            "Unaweza kuendelea kutumia mfumo.",
        },
      );
    },
    [
      clearTimers,
      scheduleTimeout,
    ],
  );

  const handleLogout = useCallback(
    async () => {
      await supabaseRef.current.auth.signOut();

      clearTimers();

      isExpiredRef.current = true;

      setSessionExpired(false);

      router.replace("/login");
    },
    [clearTimers, router],
  );

  return (
    <>
      {children}

      <SessionExpiredDialog
        open={sessionExpired}
        remainingSeconds={
          remainingSeconds
        }
        onRestore={handleRestore}
        onLogout={handleLogout}
      />
    </>
  );
}