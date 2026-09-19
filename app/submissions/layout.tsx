import { AppHeader } from "@/app/app-header";

export default function SubmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppHeader />
      {children}
    </div>
  );
}
