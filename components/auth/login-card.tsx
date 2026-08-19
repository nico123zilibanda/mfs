"use client";

import LoginForm from "./login-form";
import LoginHeader from "./login-header";

export default function LoginCard() {
  return (
    <div className="relative w-full max-w-md">

      {/* Decorative Glow */}
      <div
        className="
          absolute -inset-1 rounded-[2rem]
          bg-linear-to-br
          from-emerald-300/40
          via-transparent
          to-yellow-300/30
          blur-2xl
          opacity-80
          dark:from-emerald-500/20
          dark:to-yellow-500/10
        "
      />

      {/* Card */}
      <div
        className="
          relative
          rounded-[2rem]
          border
          border-slate-200/70
          bg-white/90
          p-8
          shadow-2xl
          shadow-emerald-950/10
          backdrop-blur-xl

          dark:border-white/10
          dark:bg-slate-900/80
          dark:shadow-black/40

          sm:p-10
        "
      >

        <LoginHeader />

        {/* Divider */}
        <div
          className="
            my-8
            h-px
            bg-linear-to-r
            from-transparent
            via-slate-200
            to-transparent

            dark:via-slate-700
          "
        />

        {/* Form */}
        <div className="mt-8">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}