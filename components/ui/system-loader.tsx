"use client";

import React from "react";
import {Spinner} from "./spinner"; // existing spinner component at components/ui/spinner.tsx

export default function SystemLoader() {
  return (
    <div
      aria-hidden={false}
      role="status"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 p-4 rounded-md">
        <div className="p-3 bg-white rounded-full shadow">
          <Spinner className="w-12 h-12 text-emerald-600" />
        </div>
        <span className="text-sm font-medium text-slate-700">Loading…</span>
      </div>
    </div>
  );
}