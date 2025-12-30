import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  longestStreak: number;
}

const StreakCounter = ({ streak, longestStreak }: StreakCounterProps) => {
  return (
    <div className="glass-card p-6 text-center">
      <div className="relative inline-flex items-center justify-center mb-4">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center ${streak > 0 ? 'streak-glow animate-pulse-glow' : ''}`}>
          <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center">
            <div className="text-center">
              <Flame className={`w-8 h-8 mx-auto mb-1 ${streak > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-display text-4xl text-gradient-fire">{streak}</span>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="font-display text-xl tracking-wider text-foreground mb-1">
        {streak === 0 ? 'COMECE AGORA' : streak === 1 ? 'DIA' : 'DIAS'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {streak > 0 ? 'de constância' : 'Seu primeiro dia te espera'}
      </p>
      
      {longestStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Recorde pessoal: <span className="text-primary font-semibold">{longestStreak} dias</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
