"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  // Reloj para la cuenta regresiva del bloqueo (el intervalo es una
  // suscripción externa: actualizar estado en su callback está permitido).
  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [lockedUntil]);

  // Si ya hay sesión, ir directo al panel (sin setState: solo navegar).
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/admin");
      });
  }, [router]);

  const locked = lockedUntil > now;
  const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (locked) return;
    if (!isSupabaseConfigured()) {
      setErr("Falta configurar Supabase (.env). Ver README paso 2.");
      return;
    }
    setLoading(true);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        // Mensaje genérico: no revela si el email existe (anti-enumeración).
        // Nota: el bloqueo vive en memoria; Supabase además limita
        // intentos en servidor ("rate limit exceeded").
        const next = attempts + 1;
        setAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setErr(
            `Demasiados intentos. Espera ${LOCKOUT_MS / 1000} segundos e inténtalo de nuevo.`
          );
        } else {
          setErr(
            `Credenciales inválidas. Te quedan ${MAX_ATTEMPTS - next} intentos.`
          );
        }
      } else {
        setAttempts(0);
        setLockedUntil(0);
        router.push("/admin");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gold-500/25 bg-noir-900 p-8">
      <label className="block text-sm text-cream-100/70" htmlFor="admin-email">
        Email admin
      </label>
      <input
        id="admin-email"
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none focus:border-gold-500/60"
      />
      <label className="mt-4 block text-sm text-cream-100/70" htmlFor="admin-pass">
        Contraseña
      </label>
      <div className="relative">
        <input
          id="admin-pass"
          type={showPw ? "text" : "password"}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 pr-16 outline-none focus:border-gold-500/60"
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 pt-1 text-xs text-gold-300 hover:text-gold-200"
        >
          {showPw ? "Ocultar" : "Ver"}
        </button>
      </div>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      <button
        disabled={loading || locked}
        className="mt-6 w-full rounded-full bg-gold-500 py-3 font-semibold text-noir-950 hover:bg-gold-400 disabled:opacity-50"
      >
        {locked ? `Bloqueado · espera ${remaining}s` : loading ? "Entrando..." : "Entrar al panel"}
      </button>
      <p className="mt-4 text-xs leading-5 text-cream-100/40">
        Crea tu usuario en Supabase → Authentication → Add user con contraseña
        larga (12+ caracteres). Solo tú tendrás acceso. El panel no aparece en
        buscadores.
      </p>
    </form>
  );
}
