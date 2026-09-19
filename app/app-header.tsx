import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/app/sign-out-button";

// Shared shell for every session-protected page (/dashboard,
// /competencies/**, /submissions/**). proxy.ts already guarantees a
// session exists before any of these render — this is display only.
export async function AppHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
      <a href="/dashboard" className="font-serif text-sm font-semibold">
        Agentic Engineering
      </a>
      <div className="flex items-center gap-4 text-sm">
        <a href="/dashboard" className="font-medium hover:underline">
          Dashboard
        </a>
        <span className="text-neutral-500">{session?.user?.email}</span>
        {session?.user?.role === "facilitator" && (
          <a href="/admin" className="font-medium hover:underline">
            Admin
          </a>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}
