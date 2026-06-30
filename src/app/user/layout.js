import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Halaman User - LP3M UNIKS",
};

export default async function PesertaLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "peserta") redirect("/admin");

  return (
    <DashboardShell role="peserta" user={user}>
      {children}
    </DashboardShell>
  );
}
