import { getServerSession } from "next-auth";
import { forbidden } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/app/sign-out-button";

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

  return (
    <div>
      <header className="flex items-center justify-between border-b border-line bg-canvas-subtle px-6 py-3">
        <span className="text-sm font-semibold text-fg">
          Agentic Engineering — Admin
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-fg-muted">{session.user.email}</span>
          <a href="/competencies" className="font-medium text-fg hover:text-accent">
            Learner view
          </a>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
