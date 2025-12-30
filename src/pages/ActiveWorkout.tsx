import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseGuide from '@/components/ExerciseGuide';
import RestTimer from '@/components/RestTimer';
import { workouts, WorkoutType } from '@/data/workouts';
import { useAddWorkout } from '@/hooks/useProfile';
import { toast } from 'sonner';

type WorkoutPhase = 'ready' | 'exercise' | 'rest' | 'complete';

const ActiveWorkout = () => {
  const { type } = useParams<{ type: WorkoutType }>();
  const navigate = useNavigate();
  const addWorkout = useAddWorkout();

  const workout = type ? workouts[type] : null;
  
  const [phase, setPhase] = useState<WorkoutPhase>('ready');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);

  const currentExercise = workout?.exercises[currentExerciseIndex];

  useEffect(() => {
    if (phase === 'exercise' && startTime === 0) {
      setStartTime(Date.now());
    }
  }, [phase, startTime]);

  if (!workout || !currentExercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Treino não encontrado</p>
      </div>
    );
  }

  const handleStartWorkout = () => {
    setPhase('exercise');
    setStartTime(Date.now());
  };

  const handleSetComplete = () => {
    if (currentSet < currentExercise.sets) {
      setPhase('rest');
    } else {
      // Exercise complete
      setExercisesCompleted((prev) => prev + 1);
      moveToNextExercise();
    }
  };

  const handleRestComplete = () => {
    setCurrentSet((prev) => prev + 1);
    setPhase('exercise');
  };

  const handleSkipRest = () => {
    handleRestComplete();
  };

  const moveToNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setCurrentSet(1);
      setPhase('exercise');
    } else {
      completeWorkout();
    }
  };

  const handleSkipExercise = () => {
    moveToNextExercise();
  };

  const completeWorkout = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await addWorkout.mutateAsync({
        workout_type: workout.type,
        duration_seconds: duration,
        exercises_completed: exercisesCompleted + 1,
      });
      setPhase('complete');
      toast.success('Treino concluído! 🔥');
    } catch (error) {
      toast.error('Erro ao salvar treino');
    }
  };

  const handleExit = () => {
    if (phase !== 'ready' && phase !== 'complete') {
      if (confirm('Sair do treino? Seu progresso será perdido.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const progress = ((currentExerciseIndex + (currentSet - 1) / currentExercise.sets) / workout.exercises.length) * 100;

  // Ready screen
  if (phase === 'ready') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between p-4 safe-top">
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="w-6 h-6" />
          </Button>
          <span className="font-display text-lg tracking-wider">{workout.name}</span>
          <div className="w-11" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-7xl mb-6">{workout.emoji}</div>
          <h1 className="font-display text-4xl tracking-wider mb-2">{workout.name}</h1>
          <p className="text-muted-foreground mb-2">{workout.description}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {workout.exercises.length} exercícios • ~{workout.estimatedMinutes} min
          </p>

          <div className="glass-card p-4 mb-8 w-full max-w-xs">
            <p className="text-sm text-muted-foreground mb-2">Músculos Alvo</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {workout.targetMuscles.map((muscle) => (
                <span key={muscle} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          <Button variant="fire" size="xl" onClick={handleStartWorkout}>
            COMEÇAR TREINO
            <ChevronRight className="w-6 h-6" />
          </Button>
        </main>
      </div>
    );
  }

  // Complete screen
  if (phase === 'complete') {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-6 streak-glow animate-pulse-glow">
          <Trophy className="w-12 h-12 text-primary-foreground" />
        </div>

        <h1 className="font-display text-4xl tracking-wider mb-2">TREINO COMPLETO!</h1>
        <p className="text-muted-foreground mb-8">Você mandou bem.</p>

        <div className="glass-card p-6 w-full max-w-xs mb-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-display text-3xl text-gradient-fire">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-muted-foreground">Duração</p>
            </div>
            <div>
              <p className="font-display text-3xl">{exercisesCompleted}</p>
              <p className="text-xs text-muted-foreground">Exercícios</p>
            </div>
          </div>
        </div>

        <Button variant="fire" size="lg" onClick={() => navigate('/')}>
          Voltar ao Início
        </Button>

        <p className="text-sm text-muted-foreground mt-8 italic">
          "Mais um dia. Mais uma vitória."
        </p>
      </div>
    );
  }

  // Exercise or Rest screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 safe-top">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {workout.name}
            </span>
            <p className="text-sm">
              {currentExerciseIndex + 1}/{workout.exercises.length}
            </p>
          </div>
          <div className="w-11" />
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        {phase === 'exercise' ? (
          <ExerciseGuide
            exercise={currentExercise}
            currentSet={currentSet}
            onSetComplete={handleSetComplete}
            onSkip={handleSkipExercise}
          />
        ) : (
          <RestTimer
            seconds={currentExercise.restSeconds}
            onComplete={handleRestComplete}
            onSkip={handleSkipRest}
          />
        )}
      </main>
    </div>
  );
};

export default ActiveWorkout;
