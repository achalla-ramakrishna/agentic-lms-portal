"use client"; // error boundaries must be Client Components

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-fg">Something went wrong</h1>
      <p className="text-fg-muted">
        That&apos;s on us, not something you did. Try again.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
      >
        Try again
      </button>
    </main>
  );
}
