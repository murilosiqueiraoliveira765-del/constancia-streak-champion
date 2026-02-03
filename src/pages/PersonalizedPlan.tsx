import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PersonalizedPlanForm from '@/components/PersonalizedPlanForm';
import PersonalizedPlanView from '@/components/PersonalizedPlanView';
import { useActivePlan, useGeneratedPlans } from '@/hooks/usePersonalizedPlan';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, History, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const PersonalizedPlan = () => {
  const [showForm, setShowForm] = useState(false);
  const { data: activePlan, isLoading: loadingActive } = useActivePlan();
  const { data: allPlans, isLoading: loadingPlans } = useGeneratedPlans();

  const handlePlanGenerated = () => {
    setShowForm(false);
  };

  const isLoading = loadingActive || loadingPlans;

  // Show form if no active plan or user wants to create new
  if (showForm || (!isLoading && !activePlan)) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="p-6 safe-top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-wider">MEU PLANO</h1>
              <p className="text-muted-foreground mt-1">Configure seu treino personalizado</p>
            </div>
            {activePlan && (
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </header>

        <main className="px-6">
          <PersonalizedPlanForm onPlanGenerated={handlePlanGenerated} />
        </main>

        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wider">MEU PLANO</h1>
            <p className="text-muted-foreground mt-1">Treino personalizado com IA</p>
          </div>
          <Button size="icon" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-6">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="current" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Atual
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {activePlan && (
              <PersonalizedPlanView 
                plan={activePlan} 
                onRegeneratePlan={() => setShowForm(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            {allPlans && allPlans.length > 0 ? (
              <div className="space-y-3">
                {allPlans.map(plan => (
                  <div 
                    key={plan.id}
                    className={cn(
                      'glass-card p-4',
                      plan.is_active && 'border-primary'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{plan.plan_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(plan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      {plan.is_active && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum plano gerado ainda</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default PersonalizedPlan;
