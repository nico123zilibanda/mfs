import PublicFooter from "@/components/public/public-footer";
import PublicHome from "@/components/public/public-home";
import PublicNavbar from "@/components/public/public-navbar";

export default function HomePage() {
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
        <PublicHome />
      </main>

      <PublicFooter />
    </div>
  );
}