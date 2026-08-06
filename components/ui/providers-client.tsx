"use client";

import { ReactNode } from "react";
import { LoadingProvider, useLoading } from "./loading-context";
import SystemLoader from "./system-loader";

function InnerProviders({ children }: { children: ReactNode }) {
  const { loading } = useLoading();
  return (
    <>
      {loading && <SystemLoader />}
      {children}
    </>
  );
}

export default function ProvidersClient({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <InnerProviders>{children}</InnerProviders>
    </LoadingProvider>
  );
}