import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface WorkoutPreferences {
  goal: string;
  fitness_level: string;
  available_days: number;
  session_duration: number;
  equipment: string[];
  health_conditions?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json() as { preferences: WorkoutPreferences };
    
    console.log("Generating workout plan for preferences:", preferences);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const goalTranslation: Record<string, string> = {
      'muscle_gain': 'ganho de massa muscular',
      'weight_loss': 'perda de peso e emagrecimento',
      'endurance': 'resistência e condicionamento cardiovascular',
      'flexibility': 'flexibilidade e mobilidade',
      'general_fitness': 'condicionamento físico geral'
    };

    const levelTranslation: Record<string, string> = {
      'beginner': 'iniciante',
      'intermediate': 'intermediário',
      'advanced': 'avançado'
    };

    const equipmentList = preferences.equipment.length > 0 
      ? preferences.equipment.join(', ') 
      : 'apenas peso corporal (sem equipamentos)';

    const systemPrompt = `Você é um personal trainer especializado em criar planos de treino personalizados. 
Crie planos de treino detalhados, seguros e eficazes baseados nas preferências do usuário.
Sempre responda em português brasileiro.
Retorne APENAS o JSON válido sem markdown ou texto adicional.`;

    const userPrompt = `Crie um plano de treino semanal personalizado com as seguintes especificações:

- Objetivo: ${goalTranslation[preferences.goal] || preferences.goal}
- Nível de condicionamento: ${levelTranslation[preferences.fitness_level] || preferences.fitness_level}
- Dias disponíveis por semana: ${preferences.available_days}
- Duração de cada sessão: ${preferences.session_duration} minutos
- Equipamentos disponíveis: ${equipmentList}
${preferences.health_conditions ? `- Condições de saúde/limitações: ${preferences.health_conditions}` : ''}

Retorne um JSON com a seguinte estrutura:
{
  "plan_name": "Nome criativo para o plano",
  "description": "Descrição breve do plano e seus benefícios",
  "weekly_schedule": [
    {
      "day": "Dia 1",
      "focus": "Foco do treino (ex: Peito e Tríceps)",
      "warmup": "Descrição do aquecimento (5-10 min)",
      "exercises": [
        {
          "name": "Nome do exercício",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "notes": "Dicas de execução"
        }
      ],
      "cooldown": "Descrição do alongamento/desaquecimento"
    }
  ],
  "tips": ["Dica 1", "Dica 2", "Dica 3"],
  "progression": "Como progredir após 4-6 semanas"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para gerar o plano." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar plano de treino" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let planData;
    try {
      // Try to extract JSON from the response (in case there's markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        planData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Failed to parse workout plan");
    }

    return new Response(JSON.stringify({ plan: planData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating workout plan:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido ao gerar plano" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
