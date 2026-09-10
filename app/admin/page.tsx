import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getSessionUser } from "@/lib/supabase-server";

export const metadata = {
  title: "Admin · Rosas LS",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Guard server-side: sin sesión verificada no se renderiza nada del panel.
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return <AdminDashboard />;
}
