import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a Brazilian CNH (Carteira Nacional de Habilitação) OCR specialist. Extract the following fields from the CNH image. Return ONLY a JSON object with these exact keys:
- nome: full name of the holder (string)
- numero: CNH registration number / "Nº Registro" (string, digits only)
- validade: expiration date in YYYY-MM-DD format (string)
- categoria: license category like "A", "B", "AB", "C", "D", "E" etc (string, uppercase)

If a field cannot be read, use null for that field. Do NOT include any other text, only the JSON object.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract the data from this Brazilian CNH (driver's license) image:",
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_cnh_data",
                description: "Extract structured data from a Brazilian CNH",
                parameters: {
                  type: "object",
                  properties: {
                    nome: {
                      type: "string",
                      description: "Full name of the CNH holder",
                    },
                    numero: {
                      type: "string",
                      description: "CNH registration number (digits only)",
                    },
                    validade: {
                      type: "string",
                      description: "Expiration date in YYYY-MM-DD format",
                    },
                    categoria: {
                      type: "string",
                      description: "License category (A, B, AB, C, D, E, etc.)",
                    },
                  },
                  required: ["nome", "numero", "validade", "categoria"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_cnh_data" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const cnhData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(cnhData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content as JSON
    const content = result.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return new Response(jsonMatch[0], {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Could not extract CNH data" }),
      { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ocr-cnh error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
