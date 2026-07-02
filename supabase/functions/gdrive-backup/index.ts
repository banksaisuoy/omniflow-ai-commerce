import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { gzip } from "https://deno.land/x/compress@v0.4.5/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") || "http://localhost:5173",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UPLOAD_URL = "https://connector-gateway.lovable.dev/google_drive/upload/drive/v3/files";

const DEFAULT_TABLES = [
  "products", "inventory", "orders", "order_items", "profiles",
  "loyalty_accounts", "loyalty_transactions", "referrals",
  "flash_sales", "flash_sale_items", "bundles", "bundle_items",
  "gift_cards", "gift_card_redemptions", "wishlists",
  "pos_transactions", "pos_transaction_items", "pos_payments",
  "pos_shifts", "pos_cash_movements", "reviews",
];

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data } = await supa.auth.getUser(token);
  if (!data.user) return null;
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: role } = await admin.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
  return role ? { userId: data.user.id, admin } : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // Allow either admin JWT or cron trigger with service role
    const cronKey = req.headers.get("x-cron-key");
    let admin;
    let userId: string | null = null;
    if (cronKey && cronKey === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
      admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    } else {
      const ctx = await requireAdmin(req);
      if (!ctx) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      admin = ctx.admin;
      userId = ctx.userId;
    }

    const body = await req.json().catch(() => ({}));
    const tables: string[] = body.tables?.length ? body.tables : DEFAULT_TABLES;

    // resolve backup folder id
    const { data: setting } = await admin.from("gdrive_settings").select("value").eq("key", "backup_folder_id").maybeSingle();
    const folderId: string | null = setting?.value?.folder_id ?? null;

    const dump: Record<string, any[]> = {};
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const { data, error } = await admin.from(t).select("*").limit(10000);
      if (error) { counts[t] = -1; dump[t] = []; continue; }
      dump[t] = data || [];
      counts[t] = data?.length || 0;
    }

    const json = JSON.stringify({ generated_at: new Date().toISOString(), tables: dump }, null, 2);
    const gzipped = gzip(new TextEncoder().encode(json));
    const fileName = `khanom-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json.gz`;

    // Upload to Google Drive via multipart
    const boundary = "----lovable-" + crypto.randomUUID();
    const metadata: Record<string, unknown> = { name: fileName, mimeType: "application/gzip" };
    if (folderId) metadata.parents = [folderId];

    const meta = new TextEncoder().encode(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/gzip\r\n\r\n`,
    );
    const closing = new TextEncoder().encode(`\r\n--${boundary}--`);
    const combined = new Uint8Array(meta.length + gzipped.length + closing.length);
    combined.set(meta, 0);
    combined.set(gzipped, meta.length);
    combined.set(closing, meta.length + gzipped.length);

    const upRes = await fetch(`${UPLOAD_URL}?uploadType=multipart&fields=id,name,webViewLink,size`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "X-Connection-Api-Key": Deno.env.get("GOOGLE_DRIVE_API_KEY")!,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    });
    const upTxt = await upRes.text();
    if (!upRes.ok) throw new Error(`Upload failed: ${upRes.status} ${upTxt}`);
    const uploaded = JSON.parse(upTxt);

    await admin.from("gdrive_backups").insert({
      file_id: uploaded.id,
      file_name: uploaded.name,
      file_url: uploaded.webViewLink,
      size_bytes: gzipped.length,
      tables,
      row_counts: counts,
      status: "success",
      created_by: userId,
    });

    return new Response(JSON.stringify({ ok: true, file: uploaded, counts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
