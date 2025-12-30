import { Clock, ChevronRight } from 'lucide-react';
import { Workout } from '@/data/workouts';

interface WorkoutCardProps {
  workout: Workout;
  onClick: () => void;
  isToday?: boolean;
}

const WorkoutCard = ({ workout, onClick, isToday }: WorkoutCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full glass-card p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 group ${
        isToday ? 'border-primary/30 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{workout.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl tracking-wider">{workout.name}</h3>
              {isToday && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  HOJE
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{workout.description}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>~{workout.estimatedMinutes} min</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
};

export default WorkoutCard;
