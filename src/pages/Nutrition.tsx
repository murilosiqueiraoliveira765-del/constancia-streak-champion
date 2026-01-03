import { Sparkles, BookOpen, CalendarDays } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import NutritionAI from '@/components/NutritionAI';
import FoodDiary from '@/components/FoodDiary';
import { nutritionTips } from '@/data/workouts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <h1 className="font-display text-3xl tracking-wider">NUTRIÇÃO</h1>
        <p className="text-muted-foreground mt-1">IA + Diário + Guia</p>
      </header>

      <main className="px-6 space-y-6">
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              NutriIA
            </TabsTrigger>
            <TabsTrigger value="diary" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Diário
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Guia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-0">
            <NutritionAI />
          </TabsContent>

          <TabsContent value="diary" className="mt-0">
            <FoodDiary />
          </TabsContent>

          <TabsContent value="guide" className="mt-0 space-y-6">
            {/* Intro */}
            <div className="glass-card p-5">
              <p className="text-sm text-muted-foreground">
                Não complicamos. Sem dietas malucas. Apenas princípios que funcionam.
                Siga 80% do tempo e verá resultados.
              </p>
            </div>

            {/* Tips Grid */}
            <section>
              <h2 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
                PRINCÍPIOS BÁSICOS
              </h2>
              <div className="grid gap-4">
                {nutritionTips.map((tip, i) => (
                  <div key={i} className="glass-card p-5">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{tip.icon}</span>
                      <div>
                        <h3 className="font-medium mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pre/Post Workout */}
            <section className="glass-card p-5">
              <h3 className="font-display text-lg tracking-wider mb-4">PRÉ E PÓS TREINO</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-primary mb-2">Antes do Treino</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>- Carboidrato leve 1-2h antes (banana, aveia)</li>
                    <li>- Café se preferir (melhora performance)</li>
                    <li>- Evite treinar de estômago cheio</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium text-primary mb-2">Depois do Treino</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>- Proteína em até 2h (ovos, frango, whey)</li>
                    <li>- Carboidrato para repor energia</li>
                    <li>- Hidratação extra</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Water reminder */}
            <section className="glass-card p-5 text-center">
              <span className="text-4xl mb-3 block">💧</span>
              <h3 className="font-display text-lg tracking-wider mb-2">HIDRATAÇÃO</h3>
              <p className="text-sm text-muted-foreground">
                Beba água ao acordar, antes e depois do treino, 
                e ao longo do dia. Meta: 35ml por kg de peso.
              </p>
            </section>

            {/* Simple rule */}
            <div className="text-center py-4">
              <p className="font-display text-xl tracking-wider text-gradient-fire mb-2">
                REGRA DE OURO
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Se não existia há 100 anos, provavelmente não deveria ser sua base alimentar."
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Nutrition;
