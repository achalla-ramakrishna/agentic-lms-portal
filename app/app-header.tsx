import { requireCurrentUser } from "@/lib/current-user";
import { SignOutButton } from "@/app/sign-out-button";
import { CodewalnutLogo } from "@/app/codewalnut-logo";
import { MenuToggleButton } from "@/app/mobile-nav";

// Shared shell for every session-protected page (/dashboard,
// /competencies/**, /submissions/**). proxy.ts already guarantees a
// session exists before any of these render — this is display only.
// Reads the user fresh from the DB (not the JWT session snapshot) so an
// account/page.tsx edit shows up immediately, not just after re-login.
//
// The nav links here duplicate AppSidebar's, so below md they're hidden
// entirely rather than squeezed/wrapped — MenuToggleButton opens the
// sidebar as a drawer instead, which already has every one of these
// links plus the competency list. Only the logo, menu button, and sign
// out stay visible on mobile.
export async function AppHeader() {
  const user = await requireCurrentUser();

  return (
    <header className="flex items-center justify-between gap-2 border-b border-line bg-canvas-subtle px-3 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-1 sm:gap-3">
        <MenuToggleButton />
        <a href="/dashboard" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <CodewalnutLogo height={22} />
          <span className="hidden truncate text-sm font-semibold text-fg sm:inline">
            Agentic Engineering
          </span>
        </a>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
        <div className="hidden items-center gap-4 md:flex">
          <a href="/dashboard" className="font-medium text-fg hover:text-accent">
            Dashboard
          </a>
          <a href="/profile" className="font-medium text-fg hover:text-accent">
            My Progress
          </a>
          <a href="/account" className="font-medium text-fg hover:text-accent">
            Profile
          </a>
          <span className="text-fg-muted">{user.email}</span>
          {user.role === "facilitator" && (
            <a href="/admin" className="font-medium text-fg hover:text-accent">
              Admin
            </a>
          )}
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
