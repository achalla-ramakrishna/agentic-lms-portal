import { AppHeader } from "@/app/app-header";

export default function DashboardLayout({
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
