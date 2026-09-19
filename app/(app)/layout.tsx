import { AppHeader } from "@/app/app-header";
import { AppSidebar } from "@/app/app-sidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
