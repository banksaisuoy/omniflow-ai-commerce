import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:8080',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function requireAdmin(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.claims.sub).maybeSingle();
  if (!profile || profile.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const authError = await requireAdmin(req);
  if (authError) return authError;


  try {
    const { salesData, inventoryData, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "sales_forecast") {
      systemPrompt = `You are an AI sales analyst. Analyze the sales data and provide forecasting insights.
Return a JSON object with:
- forecast: array of next 7 days predicted sales
- trend: "increasing", "decreasing", or "stable"
- confidence: percentage 0-100
- insights: array of 3-5 key observations
- recommendations: array of 2-3 actionable recommendations`;
      
      userPrompt = `Analyze this sales data and forecast the next 7 days:
${JSON.stringify(salesData, null, 2)}

Respond with ONLY a valid JSON object, no markdown.`;
    } else if (type === "inventory_optimization") {
      systemPrompt = `You are an AI inventory optimization specialist. Analyze inventory levels and sales patterns.
Return a JSON object with:
- lowStockAlerts: array of products needing restock with urgency level
- reorderSuggestions: array of products to reorder with quantities
- overstock: array of overstocked items
- optimizations: array of inventory optimization suggestions`;
      
      userPrompt = `Analyze this inventory and sales data to optimize stock levels:
Inventory: ${JSON.stringify(inventoryData, null, 2)}
Recent Sales: ${JSON.stringify(salesData, null, 2)}

Respond with ONLY a valid JSON object, no markdown.`;
    } else if (type === "trend_analysis") {
      systemPrompt = `You are an AI trend analyst for e-commerce. Identify patterns and trends in sales data.
Return a JSON object with:
- peakHours: array of best selling hours
- peakDays: array of best selling days
- seasonalTrends: observations about seasonal patterns
- categoryPerformance: analysis of product categories
- growthRate: percentage growth compared to previous period`;
      
      userPrompt = `Analyze these trends in the sales data:
${JSON.stringify(salesData, null, 2)}

Respond with ONLY a valid JSON object, no markdown.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Parse the JSON response
    let parsedContent;
    try {
      // Clean up the response if it has markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsedContent = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("AI forecast error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
