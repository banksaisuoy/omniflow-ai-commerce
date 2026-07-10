import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error("imageBase64 required");

    // 1) Vision → describe the image (thai dessert focus)
    const visionRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "อธิบายรูปนี้ในบริบทของขนมไทย/ของหวาน สั้นๆ 1-2 ประโยค ระบุลักษณะ สี วัตถุดิบเด่น เพื่อใช้ค้นหาสินค้าใกล้เคียง" },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        }],
      }),
    });
    if (!visionRes.ok) throw new Error(`vision ${visionRes.status}: ${await visionRes.text()}`);
    const visionJson = await visionRes.json();
    const description: string = visionJson.choices?.[0]?.message?.content ?? "";

    // 2) Embed the description
    const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: description, dimensions: 768 }),
    });

    let matches: any[] = [];
    if (embedRes.ok) {
      const embedJson = await embedRes.json();
      const embedding = embedJson.data?.[0]?.embedding;
      if (embedding) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const { data } = await supabase.rpc("search_products_by_embedding", {
          query_embedding: embedding,
          match_threshold: 0.3,
          match_count: 12,
        });
        matches = data ?? [];
      }
    }

    return new Response(JSON.stringify({ description, matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
