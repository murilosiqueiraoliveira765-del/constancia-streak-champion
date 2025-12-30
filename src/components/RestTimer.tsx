import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

const RestTimer = ({ seconds, onComplete, onSkip }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete, timeLeft]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [seconds]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">Descanso</p>
      
      <div className="relative w-40 h-40 mx-auto mb-6">
        {/* Progress ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * progress) / 100}
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-5xl">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="fire"
          size="lg"
          onClick={toggleTimer}
          className="min-w-[120px]"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isRunning ? 'Pausar' : 'Continuar'}</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onSkip}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RestTimer;
