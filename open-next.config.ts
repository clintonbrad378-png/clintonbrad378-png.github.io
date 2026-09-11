import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Defaults del adaptador (caché regional + revalidación on-demand).
  // Sin R2/KV extra por ahora: el catálogo usa Supabase directo.
});
