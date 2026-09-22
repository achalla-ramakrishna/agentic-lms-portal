import { AppHeader } from "@/app/app-header";
import { AppSidebar } from "@/app/app-sidebar";
import { MobileNavProvider, MobileSidebarFrame } from "@/app/mobile-nav";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <MobileSidebarFrame>
            <AppSidebar />
          </MobileSidebarFrame>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
