import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ROLES } from "@/lib/constants";

export const metadata = {
  title: "Halaman User - LP3M UNIKS",
};

export default async function PesertaLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== ROLES.PESERTA) {
    redirect(user.role === ROLES.KEPALA_LP3M ? "/kepala" : "/admin");
  }

  return (
    <DashboardShell role="peserta" user={user}>
      {children}
    </DashboardShell>
  );
}
