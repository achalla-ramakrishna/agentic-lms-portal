import { redirect } from "next/navigation";

// Same content as /submissions/:id (which already allows facilitator
// access and renders the decision control for one) — one source of
// truth, per docs/features/0005-facilitator-flow.md.
export default async function AdminSubmissionRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/submissions/${id}`);
}
