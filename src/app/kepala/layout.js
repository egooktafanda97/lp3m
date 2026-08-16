import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ROLES } from "@/lib/constants";

export const metadata = {
  title: "Kepala LP3M - LP3M UNIKS",
};

export default async function KepalaLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== ROLES.KEPALA_LP3M) {
    redirect(user.role === ROLES.ADMIN ? "/admin" : "/user");
  }

  return (
    <DashboardShell role={ROLES.KEPALA_LP3M} user={user}>
      {children}
    </DashboardShell>
  );
}
