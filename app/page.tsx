import PublicFooter from "@/components/public/public-footer";
import PublicHome from "@/components/public/public-home";
import PublicNavbar from "@/components/public/public-navbar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicNavbar />
      <main className="flex-1">
        <PublicHome />
      </main>
      <PublicFooter />
    </div>
  );
}
