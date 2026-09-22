import { getServerSession } from "next-auth";
import { forbidden } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { requireCurrentUser } from "@/lib/current-user";
import { SignOutButton } from "@/app/sign-out-button";
import { AppSidebar } from "@/app/app-sidebar";
import { CodewalnutLogo } from "@/app/codewalnut-logo";
import { MenuToggleButton, MobileNavProvider, MobileSidebarFrame } from "@/app/mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already guarantees a session exists here — this only
  // decides whether *this* session is allowed past the role gate.
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "facilitator") {
    forbidden();
  }
  const user = await requireCurrentUser();

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-canvas-subtle px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <MenuToggleButton />
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <CodewalnutLogo height={22} />
              <span className="hidden truncate text-sm font-semibold text-fg sm:inline">
                Agentic Engineering — Admin
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <a href="/account" className="font-medium text-fg hover:text-accent">
                Profile
              </a>
              <span className="text-fg-muted">{user.email}</span>
              <a href="/competencies" className="font-medium text-fg hover:text-accent">
                Learner view
              </a>
            </div>
            <SignOutButton />
          </div>
        </header>
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
