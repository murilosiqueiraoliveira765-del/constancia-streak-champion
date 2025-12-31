import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateStreak, StreakResult, isStreakAtRisk, hasTrainedToday } from '@/lib/streakCalculator';
import { sendStreakAchievementNotification, sendStreakAtRiskNotification } from '@/lib/notifications';
import { toast } from 'sonner';

interface UseStreakReturn {
  updateStreakAfterWorkout: () => Promise<StreakResult | null>;
  checkStreakStatus: () => { atRisk: boolean; trainedToday: boolean };
  isUpdating: boolean;
}

/**
 * Hook para gerenciar o streak do usuário
 */
export function useStreak(
  currentStreak: number,
  lastWorkoutDate: string | null,
  longestStreak: number,
  onStreakUpdated?: () => void
): UseStreakReturn {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Atualiza o streak após um treino ser concluído
   */
  const updateStreakAfterWorkout = useCallback(async (): Promise<StreakResult | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para registrar treinos');
      return null;
    }

    setIsUpdating(true);

    try {
      // Calcula o novo streak
      const result = calculateStreak(currentStreak, lastWorkoutDate);

      // Busca o total de workouts atual
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('total_workouts')
        .eq('id', user.id)
        .single();

      const currentTotal = currentProfile?.total_workouts || 0;

      // Determina o novo longest streak
      const newLongestStreak = Math.max(longestStreak, result.newStreak);

      // Atualiza no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({
          current_streak: result.newStreak,
          longest_streak: newLongestStreak,
          total_workouts: currentTotal + 1
        })
        .eq('id', user.id);

      if (error) throw error;

      // Exibe mensagem contextual
      switch (result.status) {
        case 'first':
          toast.success(result.message, { duration: 5000 });
          break;
        case 'increased':
          toast.success(result.message, { duration: 5000 });
          // Verifica conquistas de streak
          sendStreakAchievementNotification(result.newStreak);
          break;
        case 'maintained':
          toast.info(result.message, { duration: 3000 });
          break;
        case 'reset':
          toast.warning(result.message, { duration: 5000 });
          break;
      }

      // Callback para atualizar dados
      if (onStreakUpdated) {
        onStreakUpdated();
      }

      return result;
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
      toast.error('Erro ao atualizar seu streak. Tente novamente.');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [user, currentStreak, lastWorkoutDate, longestStreak, onStreakUpdated]);

  /**
   * Verifica o status atual do streak
   */
  const checkStreakStatus = useCallback(() => {
    const atRisk = isStreakAtRisk(lastWorkoutDate);
    const trainedToday = hasTrainedToday(lastWorkoutDate);

    // Se o streak está em risco, pode enviar notificação
    if (atRisk && currentStreak > 0) {
      sendStreakAtRiskNotification(currentStreak);
    }

    return { atRisk, trainedToday };
  }, [lastWorkoutDate, currentStreak]);

  return {
    updateStreakAfterWorkout,
    checkStreakStatus,
    isUpdating
  };
}
