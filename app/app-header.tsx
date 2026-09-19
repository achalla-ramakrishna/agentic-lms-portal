import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/app/sign-out-button";
import { CodewalnutLogo } from "@/app/codewalnut-logo";

// Shared shell for every session-protected page (/dashboard,
// /competencies/**, /submissions/**). proxy.ts already guarantees a
// session exists before any of these render — this is display only.
export async function AppHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex items-center justify-between border-b border-line bg-canvas-subtle px-6 py-3">
      <a href="/dashboard" className="flex items-center gap-3">
        <CodewalnutLogo height={22} />
        <span className="hidden text-sm font-semibold text-fg sm:inline">
          Agentic Engineering
        </span>
      </a>
      <div className="flex items-center gap-4 text-sm">
        <a href="/dashboard" className="font-medium text-fg hover:text-accent">
          Dashboard
        </a>
        <a href="/profile" className="font-medium text-fg hover:text-accent">
          Profile
        </a>
        <span className="text-fg-muted">{session?.user?.email}</span>
        {session?.user?.role === "facilitator" && (
          <a href="/admin" className="font-medium text-fg hover:text-accent">
            Admin
          </a>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}
