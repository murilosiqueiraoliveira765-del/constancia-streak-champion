import { useProfile, useUpdateProfile, useDailyCheckins } from './useProfile';
import { plans } from '@/data/workouts';
import { toast } from 'sonner';

interface PlanProgress {
  currentPlan: typeof plans[0] | null;
  daysPassed: number; // Dias de treino realizados no plano atual
  daysRemaining: number;
  progress: number;
  isCompleted: boolean;
  loadMultiplier: number;
}

export const usePlanProgress = () => {
  const { data: profile } = useProfile();
  const { data: checkins } = useDailyCheckins();
  const updateProfile = useUpdateProfile();

  const getPlanProgress = (): PlanProgress => {
    if (!profile?.current_plan || !profile?.plan_start_date) {
      return {
        currentPlan: null,
        daysPassed: 0,
        daysRemaining: 0,
        progress: 0,
        isCompleted: false,
        loadMultiplier: 1.0,
      };
    }

    const plan = plans.find(p => p.id === profile.current_plan);
    if (!plan) {
      return {
        currentPlan: null,
        daysPassed: 0,
        daysRemaining: 0,
        progress: 0,
        isCompleted: false,
        loadMultiplier: 1.0,
      };
    }

    // Conta os treinos realizados DESDE o início do plano
    const planStartDate = new Date(profile.plan_start_date);
    planStartDate.setHours(0, 0, 0, 0);

    const workoutDays = checkins?.filter(checkin => {
      const checkinDate = new Date(checkin.checkin_date);
      checkinDate.setHours(0, 0, 0, 0);
      return checkinDate >= planStartDate;
    }).length || 0;

    const daysPassed = workoutDays;
    const daysRemaining = Math.max(plan.duration - daysPassed, 0);
    const progress = Math.min((daysPassed / plan.duration) * 100, 100);
    const isCompleted = daysPassed >= plan.duration;

    return {
      currentPlan: plan,
      daysPassed,
      daysRemaining,
      progress,
      isCompleted,
      loadMultiplier: plan.loadMultiplier,
    };
  };

  const advanceToNextPlan = async () => {
    const { currentPlan, isCompleted } = getPlanProgress();
    
    if (!currentPlan || !isCompleted || !currentPlan.nextPlanId) {
      return false;
    }

    const nextPlan = plans.find(p => p.id === currentPlan.nextPlanId);
    if (!nextPlan) return false;

    try {
      await updateProfile.mutateAsync({
        current_plan: nextPlan.id,
        plan_start_date: new Date().toISOString().split('T')[0],
      });

      toast.success(`🎉 Parabéns! Você avançou para: ${nextPlan.title}`, {
        description: `Carga aumentada em ${Math.round((nextPlan.loadMultiplier - 1) * 100)}%!`,
        duration: 5000,
      });

      return true;
    } catch (error) {
      toast.error('Erro ao avançar de plano');
      return false;
    }
  };

  const checkAndAdvancePlan = async () => {
    const { isCompleted, currentPlan } = getPlanProgress();
    
    if (isCompleted && currentPlan?.nextPlanId) {
      return await advanceToNextPlan();
    }
    
    return false;
  };

  return {
    ...getPlanProgress(),
    advanceToNextPlan,
    checkAndAdvancePlan,
    isAdvancing: updateProfile.isPending,
  };
};

// Função para calcular reps/sets com multiplicador de carga
export const applyLoadMultiplier = (
  baseValue: string | number,
  multiplier: number
): string => {
  // Se for string com range (ex: "6-10 reps")
  if (typeof baseValue === 'string') {
    const match = baseValue.match(/(\d+)-(\d+)/);
    if (match) {
      const min = Math.round(parseInt(match[1]) * multiplier);
      const max = Math.round(parseInt(match[2]) * multiplier);
      return baseValue.replace(/\d+-\d+/, `${min}-${max}`);
    }
    
    // Se for string com número único (ex: "15 reps")
    const singleMatch = baseValue.match(/^(\d+)/);
    if (singleMatch) {
      const value = Math.round(parseInt(singleMatch[1]) * multiplier);
      return baseValue.replace(/^\d+/, value.toString());
    }
    
    return baseValue;
  }
  
  return Math.round(baseValue * multiplier).toString();
};
