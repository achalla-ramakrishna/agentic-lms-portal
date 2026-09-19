import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-fg">403 — Not available to you</h1>
      <p className="text-fg-muted">
        This area is for facilitators only.
      </p>
      <Link href="/competencies" className="text-sm font-medium text-accent hover:underline">
        Back to competencies
      </Link>
    </main>
  );
}
