import { Check, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { plans } from '@/data/workouts';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const Plans = () => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <h1 className="font-display text-3xl tracking-wider">PLANOS</h1>
        <p className="text-muted-foreground mt-1">Escolha sua jornada</p>
      </header>

      <main className="px-6 space-y-4">
        {plans.map((plan) => {
          const isActive = profile?.current_plan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`glass-card p-6 transition-all ${
                isActive ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-display text-2xl tracking-wider">{plan.name}</span>
                  </div>
                  <h3 className="font-display text-xl text-gradient-fire mt-1">{plan.title}</h3>
                </div>
                {isActive && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    ATIVO
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

              <div className="space-y-2 mb-4">
                {plan.goals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>

              {!isActive && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={updateProfile.isPending}
                >
                  Selecionar Plano
                </Button>
              )}
            </div>
          );
        })}

        {/* Plan progress */}
        {profile?.current_plan && profile?.plan_start_date && (
          <div className="glass-card p-5">
            <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
              SEU PROGRESSO
            </h3>
            {(() => {
              const plan = plans.find(p => p.id === profile.current_plan);
              if (!plan) return null;
              
              const startDate = new Date(profile.plan_start_date);
              const today = new Date();
              const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const progress = Math.min((daysPassed / plan.duration) * 100, 100);

              return (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Dia {daysPassed} de {plan.duration}</span>
                    <span className="text-primary">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Plans;
