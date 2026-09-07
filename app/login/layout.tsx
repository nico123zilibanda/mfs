// app/public/layout.tsx

import PublicNavbar from "@/components/public/public-navbar";
import PublicFooter from "@/components/public/public-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="
        flex
        min-h-screen
        flex-col
        bg-slate-50
        text-slate-900
        transition-colors
        duration-300
        dark:bg-slate-950
        dark:text-slate-100
      "
    >
      <PublicNavbar />

      <main
        className="
          flex-1
          bg-transparent
        "
      >
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}