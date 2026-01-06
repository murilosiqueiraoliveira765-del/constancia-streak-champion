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
      // Busca os dados mais recentes do banco
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, total_workouts')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Busca a data do último checkin ANTES de hoje
      const today = new Date().toISOString().split('T')[0];
      
      const { data: lastCheckin } = await supabase
        .from('daily_checkins')
        .select('checkin_date')
        .eq('user_id', user.id)
        .lt('checkin_date', today) // Busca apenas checkins ANTES de hoje
        .order('checkin_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Verifica se já treinou hoje
      const { data: todayCheckin } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .maybeSingle();

      const currentStreak = profile?.current_streak || 0;
      const longestStreak = profile?.longest_streak || 0;
      const lastWorkoutDate = lastCheckin?.checkin_date || null;

      // Se já treinou hoje, apenas mantém o streak
      if (todayCheckin) {
        const result: StreakResult = {
          newStreak: currentStreak,
          lastWorkoutDate: today,
          status: 'maintained',
          message: '✅ Streak mantido! Você já treinou hoje.'
        };
        toast.info(result.message, { duration: 3000 });
        return result;
      }

      // Calcula o novo streak
      const result = calculateStreak(currentStreak, lastWorkoutDate);

      // Determina o novo longest streak
      const newLongestStreak = Math.max(longestStreak, result.newStreak);

      // Atualiza no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak: result.newStreak,
          longest_streak: newLongestStreak,
          total_workouts: (profile?.total_workouts || 0) + 1
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

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
  }, [user, onStreakUpdated]);

  /**
   * Verifica o status atual do streak
   */
  const checkStreakStatus = useCallback(() => {
    // Esta função agora precisa buscar dados frescos
    // Retorna valores padrão - use updateStreakAfterWorkout para dados precisos
    return { atRisk: false, trainedToday: false };
  }, []);

  return {
    updateStreakAfterWorkout,
    checkStreakStatus,
    isUpdating
  };
}

/**
 * Hook para verificar status do streak de forma assíncrona
 */
export function useStreakStatus() {
  const { user } = useAuth();

  const checkStatus = useCallback(async () => {
    if (!user) return { atRisk: false, trainedToday: false, currentStreak: 0 };

    const today = new Date().toISOString().split('T')[0];

    // Busca dados do profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', user.id)
      .single();

    // Verifica se treinou hoje
    const { data: todayCheckin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle();

    // Busca último checkin
    const { data: lastCheckin } = await supabase
      .from('daily_checkins')
      .select('checkin_date')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const trainedToday = !!todayCheckin;
    const atRisk = !trainedToday && isStreakAtRisk(lastCheckin?.checkin_date || null);
    const currentStreak = profile?.current_streak || 0;

    // Se o streak está em risco, envia notificação
    if (atRisk && currentStreak > 0) {
      sendStreakAtRiskNotification(currentStreak);
    }

    return { atRisk, trainedToday, currentStreak };
  }, [user]);

  return { checkStatus };
}
