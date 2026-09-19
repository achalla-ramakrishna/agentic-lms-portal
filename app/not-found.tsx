import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-fg">Page not found</h1>
      <p className="text-fg-muted">
        That competency, exercise, or submission doesn&apos;t exist.
      </p>
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        Back home
      </Link>
    </main>
  );
}
