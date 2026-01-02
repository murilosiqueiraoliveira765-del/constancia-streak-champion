import { Check, Target, TrendingUp, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { plans } from '@/data/workouts';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { usePlanProgress } from '@/hooks/usePlanProgress';
import { toast } from 'sonner';

const Plans = () => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { 
    currentPlan, 
    daysPassed, 
    daysRemaining, 
    progress, 
    isCompleted, 
    loadMultiplier,
    advanceToNextPlan,
    isAdvancing 
  } = usePlanProgress();

  const handleSelectPlan = async (planId: string) => {
    try {
      await updateProfile.mutateAsync({
        current_plan: planId,
        plan_start_date: new Date().toISOString().split('T')[0],
      });
      toast.success('Plano selecionado! Bora começar.');
    } catch (error) {
      toast.error('Erro ao selecionar plano');
    }
  };

  const handleAdvancePlan = async () => {
    await advanceToNextPlan();
  };

  // Encontra o índice do plano atual para mostrar progressão
  const currentPlanIndex = plans.findIndex(p => p.id === profile?.current_plan);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <h1 className="font-display text-3xl tracking-wider">PLANOS</h1>
        <p className="text-muted-foreground mt-1">Sua jornada de evolução</p>
      </header>

      <main className="px-6 space-y-4">
        {/* Contador de Constância - Card destacado */}
        {currentPlan && (
          <div className="glass-card p-6 border-primary bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Dias de Constância</p>
                  <p className="font-display text-4xl text-gradient-fire">{daysPassed}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Carga atual</p>
                <p className="font-display text-xl text-primary">
                  {loadMultiplier === 1 ? 'Base' : `+${Math.round((loadMultiplier - 1) * 100)}%`}
                </p>
              </div>
            </div>

            {/* Barra de progresso do plano */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {currentPlan.title} • Dia {daysPassed} de {currentPlan.duration}
                </span>
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-orange-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {daysRemaining > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Faltam {daysRemaining} dias para completar
                </p>
              )}
            </div>

            {/* Botão de avançar quando completar */}
            {isCompleted && currentPlan.nextPlanId && (
              <Button
                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
                onClick={handleAdvancePlan}
                disabled={isAdvancing}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {isAdvancing ? 'Avançando...' : 'Avançar para próximo nível!'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {isCompleted && !currentPlan.nextPlanId && (
              <div className="text-center py-2">
                <p className="text-primary font-medium">🏆 Você completou todos os planos!</p>
                <p className="text-muted-foreground text-sm">Continue treinando para manter seu físico</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline de Planos */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            JORNADA DE EVOLUÇÃO
          </h3>
          
          <div className="relative">
            {/* Linha vertical conectora */}
            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-muted" />
            
            {plans.map((plan, index) => {
              const isActive = profile?.current_plan === plan.id;
              const isPast = currentPlanIndex > index;
              const isFuture = currentPlanIndex < index && currentPlanIndex !== -1;
              const isLocked = currentPlanIndex === -1 ? index > 0 : isFuture;
              
              return (
                <div key={plan.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
                  {/* Indicador circular */}
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${isPast ? 'bg-green-500 text-white' : ''}
                    ${isLocked ? 'bg-muted text-muted-foreground' : ''}
                    ${!isActive && !isPast && !isLocked ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {isPast ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="font-display text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Conteúdo do plano */}
                  <div className={`flex-1 ${isLocked ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-lg">{plan.name}</span>
                      {isActive && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          ATUAL
                        </span>
                      )}
                      {isPast && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          COMPLETO
                        </span>
                      )}
                    </div>
                    <h4 className={`font-medium ${isActive ? 'text-gradient-fire' : 'text-foreground'}`}>
                      {plan.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                    
                    {/* Info de carga */}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        Carga: {plan.loadMultiplier === 1 ? 'Base' : `+${Math.round((plan.loadMultiplier - 1) * 100)}%`}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.duration} dias
                      </span>
                    </div>

                    {/* Goals */}
                    <div className="mt-3 space-y-1">
                      {plan.goals.slice(0, 2).map((goal, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-primary" />
                          <span>{goal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Botão de selecionar (só se não tiver plano ativo) */}
                    {!profile?.current_plan && index === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={updateProfile.isPending}
                      >
                        Começar Jornada
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card de explicação de carga */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-3">
            SOBRE A CARGA
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs">1x</span>
              </div>
              <div>
                <p className="font-medium">30 Dias - Carga Base</p>
                <p className="text-muted-foreground text-xs">Foco em forma e consistência</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs text-primary">1.25x</span>
              </div>
              <div>
                <p className="font-medium">90 Dias - +25% Carga</p>
                <p className="text-muted-foreground text-xs">Mais reps e séries</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center shrink-0">
                <span className="text-xs text-orange-400">1.5x</span>
              </div>
              <div>
                <p className="font-medium">180 Dias - +50% Carga</p>
                <p className="text-muted-foreground text-xs">Volume máximo, skills avançadas</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Plans;
