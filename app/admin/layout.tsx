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
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <span className="font-serif text-sm font-semibold">
          Agentic Engineering — Admin
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-500">{session.user.email}</span>
          <a href="/competencies" className="font-medium hover:underline">
            Learner view
          </a>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
