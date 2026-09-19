import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/app/sign-out-button";

export default async function CompetenciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already redirects an unauthenticated request before this
  // ever renders — this is just for the header, not access control.
  const session = await getServerSession(authOptions);

  return (
    <div>
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <span className="font-serif text-sm font-semibold">
          Agentic Engineering
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-500">{session?.user?.email}</span>
          {session?.user?.role === "facilitator" && (
            <a href="/admin" className="font-medium hover:underline">
              Admin
            </a>
          )}
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
