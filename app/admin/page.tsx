import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin · Rosas LS",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  // Sitio estático: la verificación de sesión vive en el cliente
  // (AdminDashboard redirige a /admin/login sin sesión).
  // Los datos están protegidos por RLS en Supabase.
  return <AdminDashboard />;
}
