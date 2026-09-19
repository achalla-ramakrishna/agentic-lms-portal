import { AppHeader } from "@/app/app-header";

export default function ProfileLayout({
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
