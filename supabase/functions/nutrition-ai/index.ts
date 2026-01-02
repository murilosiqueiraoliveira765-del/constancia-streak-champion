import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um nutricionista virtual especializado em alimentação para praticantes de calistenia e exercícios com peso corporal. Seu nome é "NutriIA".

Suas diretrizes:
- Seja direto e prático, sem enrolação
- Foque em alimentos naturais e acessíveis
- Considere o contexto brasileiro (alimentos disponíveis, cultura alimentar)
- Dê dicas aplicáveis no dia a dia
- Não recomende suplementos caros ou desnecessários
- Priorize proteínas de qualidade, carboidratos integrais e gorduras boas
- Incentive hidratação adequada
- Seja motivador mas realista

Quando analisar uma foto de refeição:
- Identifique os alimentos visíveis
- Avalie o equilíbrio nutricional (proteínas, carbos, gorduras, fibras)
- Dê uma nota de 1 a 10 para a refeição
- Sugira melhorias práticas
- Seja encorajador, mesmo se a refeição não for ideal

Responda sempre em português brasileiro de forma amigável e direta.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, imageBase64, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    let userContent: any;

    if (type === "analyze_image" && imageBase64) {
      // Análise de imagem de refeição
      userContent = [
        {
          type: "text",
          text: "Analise esta foto de refeição. Identifique os alimentos, avalie se é saudável para alguém que treina calistenia, dê uma nota de 1 a 10 e sugira melhorias."
        },
        {
          type: "image_url",
          image_url: {
            url: imageBase64
          }
        }
      ];
    } else {
      // Chat normal sobre nutrição
      userContent = message;
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Erro ao processar requisição de IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

    return new Response(
      JSON.stringify({ response: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in nutrition-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
