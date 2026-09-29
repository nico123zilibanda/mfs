import AdminLayout from "@/components/dashboard/layout";
import { SessionProvider } from "@/components/auth/session-provider";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  );
}