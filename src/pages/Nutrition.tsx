import { Sparkles, BookOpen, CalendarDays, Droplets, Bell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import NutritionAI from '@/components/NutritionAI';
import FoodDiary from '@/components/FoodDiary';
import WaterTracker from '@/components/WaterTracker';
import MealReminders from '@/components/MealReminders';
import { nutritionTips } from '@/data/workouts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <h1 className="font-display text-3xl tracking-wider">NUTRIÇÃO</h1>
        <p className="text-muted-foreground mt-1">IA + Água + Diário + Lembretes</p>
      </header>

      <main className="px-6 space-y-6">
        <Tabs defaultValue="water" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="water" className="gap-1 text-xs px-2">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Água</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1 text-xs px-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="diary" className="gap-1 text-xs px-2">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Diário</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-1 text-xs px-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="water" className="mt-0 space-y-4">
            <WaterTracker />
            
            {/* Quick Tips */}
            <div className="glass-card p-4">
              <h4 className="font-display text-sm tracking-wider mb-3">DICAS DE HIDRATAÇÃO</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>- Beba 1 copo ao acordar</li>
                <li>- 500ml antes do treino</li>
                <li>- 35ml por kg de peso corporal/dia</li>
                <li>- Urina clara = boa hidratação</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-0">
            <NutritionAI />
          </TabsContent>

          <TabsContent value="diary" className="mt-0">
            <FoodDiary />
          </TabsContent>

          <TabsContent value="reminders" className="mt-0">
            <MealReminders />
            
            {/* Guide */}
            <div className="mt-6 space-y-4">
              <h3 className="font-display text-sm tracking-wider text-muted-foreground">
                GUIA RÁPIDO
              </h3>
              
              <div className="glass-card p-5">
                <h4 className="font-display tracking-wider mb-4">PRÉ E PÓS TREINO</h4>
                
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
              </div>

              {/* Tips Grid */}
              <div className="grid gap-4">
                {nutritionTips.slice(0, 3).map((tip, i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h3 className="font-medium text-sm mb-1">{tip.title}</h3>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Nutrition;
