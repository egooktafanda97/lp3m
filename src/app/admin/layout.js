import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Admin - LP3M UNIKS",
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/user");

  return (
    <DashboardShell role="admin" user={user}>
      {children}
    </DashboardShell>
  );
}
