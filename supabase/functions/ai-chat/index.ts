import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") || "http://localhost:5173",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supa.auth.getUser(token);
    if (!userData.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { messages, session_id } = await req.json();
    if (!Array.isArray(messages)) throw new Error("messages required");

    // fetch a few products as context
    const { data: products } = await admin
      .from("products").select("name,description,price,category,slug")
      .eq("status", "active").limit(20);
    const catalog = (products || []).map(p =>
      `- ${p.name} (${p.category ?? "-"}) ราคา ${p.price}฿ [/product/${p.slug}] ${p.description?.slice(0, 80) ?? ""}`
    ).join("\n");

    const system = `คุณคือผู้ช่วยลูกค้าของร้านขนมไทย "Khanom House" ตอบเป็นภาษาไทยอย่างเป็นมิตร กระชับ
- แนะนำสินค้าจากรายการด้านล่างเท่านั้น (อย่าแต่งเพิ่ม)
- เมื่อแนะนำสินค้า ให้ใส่ลิงก์รูปแบบ [ชื่อสินค้า](/product/slug)
- ตอบคำถามเรื่องขนมไทย วิธีเก็บรักษา วิธีเสิร์ฟได้
- ถ้าไม่ทราบคำตอบ ให้บอกให้ติดต่อทางร้าน

รายการสินค้าปัจจุบัน:
${catalog}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: `AI: ${res.status} ${t}` }), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "ขออภัย ระบบไม่พร้อมใช้งานชั่วคราว";

    // persist
    let sid = session_id;
    if (!sid) {
      const { data: s } = await admin.from("ai_chat_sessions").insert({ user_id: userData.user.id }).select("id").single();
      sid = s?.id;
    }
    if (sid) {
      const last = messages[messages.length - 1];
      await admin.from("ai_chat_messages").insert([
        { session_id: sid, role: "user", content: last.content },
        { session_id: sid, role: "assistant", content: reply },
      ]);
    }

    return new Response(JSON.stringify({ reply, session_id: sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
