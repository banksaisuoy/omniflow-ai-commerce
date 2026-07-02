import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") || "http://localhost:5173",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

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

async function gdrive(path: string, qs: Record<string, string> = {}) {
  const url = new URL(`${GATEWAY}${path}`);
  Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "X-Connection-Api-Key": Deno.env.get("GOOGLE_DRIVE_API_KEY")!,
    },
  });
  if (!res.ok) throw new Error(`GDrive ${path}: ${res.status} ${await res.text()}`);
  return res;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ctx = await requireAdmin(req);
    if (!ctx) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { folder_id, create_products = false } = await req.json();
    if (!folder_id) throw new Error("folder_id required");

    // list images in folder
    const listRes = await gdrive("/files", {
      q: `'${folder_id}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: "files(id,name,mimeType,size,webViewLink,thumbnailLink,createdTime)",
      pageSize: "100",
    });
    const { files = [] } = await listRes.json();

    const results: any[] = [];
    for (const f of files) {
      // download to blob then upload to product-images bucket
      const dl = await gdrive(`/files/${f.id}`, { alt: "media" });
      const bytes = new Uint8Array(await dl.arrayBuffer());
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const key = `gdrive/${f.id}-${Date.now()}.${ext}`;

      const { error: upErr } = await ctx.admin.storage.from("product-images").upload(key, bytes, {
        contentType: f.mimeType,
        upsert: true,
      });
      if (upErr) { results.push({ name: f.name, error: upErr.message }); continue; }
      const { data: { publicUrl } } = ctx.admin.storage.from("product-images").getPublicUrl(key);

      let productId: string | null = null;
      if (create_products) {
        const nameOnly = f.name.replace(/\.[^.]+$/, "");
        const slug = nameOnly.toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]+/gi, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
        const { data: prod, error: prodErr } = await ctx.admin.from("products").insert({
          name: nameOnly,
          slug,
          description: `นำเข้าจาก Google Drive: ${f.name}`,
          price: 0,
          status: "draft",
          images: [publicUrl],
          thumbnail_url: publicUrl,
          category: "imported",
        }).select("id").single();
        if (prodErr) { results.push({ name: f.name, url: publicUrl, error: prodErr.message }); continue; }
        productId = prod.id;
      }

      results.push({ name: f.name, url: publicUrl, drive_id: f.id, product_id: productId });
    }

    return new Response(JSON.stringify({ imported: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
