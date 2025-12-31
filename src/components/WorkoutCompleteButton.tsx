import { useState } from 'react';
import { Check, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStreak } from '@/hooks/useStreak';
import { useProfile, useAddWorkout, useAddDailyCheckin, useLastWorkoutDate } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface WorkoutCompleteButtonProps {
  workoutType: string;
  durationSeconds: number;
  exercisesCompleted: number;
  onComplete?: () => void;
  className?: string;
  disabled?: boolean;
}

const WorkoutCompleteButton = ({
  workoutType,
  durationSeconds,
  exercisesCompleted,
  onComplete,
  className,
  disabled
}: WorkoutCompleteButtonProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: profile, refetch: refetchProfile } = useProfile();
  const { data: lastWorkoutDate } = useLastWorkoutDate();
  const addWorkout = useAddWorkout();
  const addCheckin = useAddDailyCheckin();

  const { updateStreakAfterWorkout, isUpdating } = useStreak(
    profile?.current_streak || 0,
    lastWorkoutDate || null,
    profile?.longest_streak || 0,
    () => refetchProfile()
  );

  const handleComplete = async () => {
    if (isCompleting || isCompleted || disabled) return;

    setIsCompleting(true);

    try {
      // 1. Salva o treino no banco
      const workout = await addWorkout.mutateAsync({
        workout_type: workoutType,
        duration_seconds: durationSeconds,
        exercises_completed: exercisesCompleted
      });

      // 2. Registra o checkin diário (ignora erro se já existir)
      const today = new Date().toISOString().split('T')[0];
      try {
        await addCheckin.mutateAsync({
          checkin_date: today,
          workout_id: workout.id
        });
      } catch {
        // Checkin já existe para hoje - ok, continua
      }

      // 3. Atualiza o streak com a nova lógica
      await updateStreakAfterWorkout();

      setIsCompleted(true);

      // Callback opcional
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao completar treino:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isLoading = isCompleting || isUpdating || addWorkout.isPending || addCheckin.isPending;

  if (isCompleted) {
    return (
      <Button
        variant="default"
        className={cn(
          'bg-green-600 hover:bg-green-600 cursor-default',
          className
        )}
        disabled
      >
        <Trophy className="w-5 h-5 mr-2" />
        Treino Concluído!
      </Button>
    );
  }

  return (
    <Button
      variant="fire"
      onClick={handleComplete}
      disabled={isLoading || disabled}
      className={cn('min-w-[200px]', className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <Check className="w-5 h-5 mr-2" />
          Treino Concluído
        </>
      )}
    </Button>
  );
};

export default WorkoutCompleteButton;
