import { getServerSession } from "next-auth";
import { forbidden } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { requireCurrentUser } from "@/lib/current-user";
import { SignOutButton } from "@/app/sign-out-button";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { CodewalnutLogo } from "@/app/codewalnut-logo";
import { MenuToggleButton, MobileNavProvider, MobileSidebarFrame } from "@/app/mobile-nav";
import { RoleViewSwitcher } from "@/app/role-view-switcher";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already guarantees a session exists here — this only
  // decides whether *this* session is allowed past the role gate.
  // company_admin gets read/settings access to the shell (docs/features/
  // 0016-embed-widget.md, its first real use); mutating actions like
  // createUser/decideSubmission still call requireFacilitator() and
  // stay facilitator-only.
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "facilitator" && session?.user.role !== "company_admin") {
    forbidden();
  }
  const user = await requireCurrentUser();

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-canvas-subtle px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <MenuToggleButton />
            <a href="/admin/roster" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <CodewalnutLogo height={22} />
              <span className="hidden truncate text-sm font-semibold text-fg sm:inline">
                Agentic Engineering — Reviewer
              </span>
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <a href="/account" className="font-medium text-fg hover:text-accent">
                Profile
              </a>
              <span className="text-fg-muted">{user.email}</span>
            </div>
            {user.role === "facilitator" && <RoleViewSwitcher current="reviewer" />}
            <SignOutButton />
          </div>
        </header>
        <div className="flex flex-1">
          <MobileSidebarFrame>
            <AdminSidebar />
          </MobileSidebarFrame>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
