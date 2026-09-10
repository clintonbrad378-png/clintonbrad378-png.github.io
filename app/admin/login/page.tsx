import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Admin login · Rosas LS",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <p className="text-center text-xs uppercase tracking-[0.3em] text-gold-500">Zona privada</p>
      <h1 className="font-display mt-2 text-center text-4xl">Panel admin</h1>
      <div className="mt-6">
        <LoginForm />
      </div>
    </main>
  );
}
