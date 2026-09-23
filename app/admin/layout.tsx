import { forbidden } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { SignOutButton } from "@/app/sign-out-button";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { CompanySwitcher } from "@/app/admin/CompanySwitcher";
import { MenuToggleButton, MobileNavProvider, MobileSidebarFrame } from "@/app/mobile-nav";
import { RoleViewSwitcher } from "@/app/role-view-switcher";

const SHELL_TITLE: Record<string, string> = {
  facilitator: "Agentic Engineering — Reviewer",
  company_admin: "Agentic Engineering — Admin",
  super_admin: "Agentic Engineering — Platform Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already guarantees a session exists here — this only
  // decides whether *this* session is allowed past the role gate. The
  // clean split (facilitator reviews, company_admin manages, super_admin
  // does both across every company) is enforced per-page/per-action, not
  // here — this gate is just "some kind of admin," matching how every
  // other /admin/** page already trusts this layout for that much. A
  // multi-role account (docs/features/0019-multi-role.md) passes if
  // *any* of its roles qualifies.
  const user = await requireCurrentUser();
  const isSomeKindOfAdmin =
    user.roles.includes("facilitator") ||
    user.roles.includes("company_admin") ||
    user.roles.includes("super_admin");
  if (!isSomeKindOfAdmin) {
    forbidden();
  }
  const companies = user.roles.includes("super_admin")
    ? await prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
    : [];

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-canvas-subtle px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <MenuToggleButton />
            <a href="/admin/roster" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="truncate text-sm font-semibold text-fg">
                {SHELL_TITLE[user.role] ?? "Agentic Engineering"}
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
            {user.roles.includes("super_admin") && (
              <CompanySwitcher companies={companies} defaultCompanyId={user.companyId} />
            )}
            <RoleViewSwitcher roles={user.roles} />
            <SignOutButton />
          </div>
        </header>
        <div className="flex flex-1">
          <MobileSidebarFrame>
            <AdminSidebar roles={user.roles} />
          </MobileSidebarFrame>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
