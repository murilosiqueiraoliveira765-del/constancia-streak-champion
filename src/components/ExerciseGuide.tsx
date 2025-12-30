import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/data/workouts';

interface ExerciseGuideProps {
  exercise: Exercise;
  currentSet: number;
  onSetComplete: () => void;
  onSkip: () => void;
}

const ExerciseGuide = ({ exercise, currentSet, onSetComplete, onSkip }: ExerciseGuideProps) => {
  const [showTips, setShowTips] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  return (
    <div className="slide-up">
      {/* Exercise header */}
      <div className="text-center mb-8">
        {exercise.isWarmup && (
          <span className="inline-block text-xs bg-warning/20 text-warning px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            Aquecimento
          </span>
        )}
        <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-2">
          {exercise.name}
        </h2>
        <p className="text-muted-foreground text-lg">
          Série {currentSet} de {exercise.sets}
        </p>
      </div>

      {/* Sets and reps */}
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Repetições</p>
            <p className="font-display text-3xl text-gradient-fire">{exercise.reps}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">Descanso</p>
            <p className="font-display text-3xl">{exercise.restSeconds}s</p>
          </div>
        </div>
      </div>

      {/* Set progress */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: exercise.sets }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < currentSet - 1
                ? 'bg-primary'
                : i === currentSet - 1
                ? 'bg-primary animate-pulse'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Tips section */}
      <button
        onClick={() => setShowTips(!showTips)}
        className="w-full glass-card p-4 mb-3 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-warning" />
          <span className="font-medium">Dicas de Execução</span>
        </div>
        {showTips ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {showTips && (
        <div className="glass-card p-4 mb-3 fade-in">
          <ul className="space-y-2">
            {exercise.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternatives section */}
      {exercise.alternatives && exercise.alternatives.length > 0 && (
        <>
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full glass-card p-4 mb-6 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Alternativas</span>
            </div>
            {showAlternatives ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {showAlternatives && (
            <div className="glass-card p-4 mb-6 fade-in">
              <ul className="space-y-2">
                {exercise.alternatives.map((alt, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    → {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onSkip}
        >
          Pular
        </Button>
        <Button
          variant="fire"
          className="flex-1"
          onClick={onSetComplete}
        >
          <Check className="w-5 h-5" />
          Série Concluída
        </Button>
      </div>
    </div>
  );
};

export default ExerciseGuide;
