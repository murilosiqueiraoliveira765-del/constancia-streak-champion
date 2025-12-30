import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkoutCard from '@/components/WorkoutCard';
import BottomNav from '@/components/BottomNav';
import { workouts, weeklySchedule, WorkoutType } from '@/data/workouts';

const Workouts = () => {
  const navigate = useNavigate();

  const handleStartWorkout = (type: WorkoutType) => {
    navigate(`/workout/${type}`);
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <h1 className="font-display text-3xl tracking-wider">TREINOS</h1>
        <p className="text-muted-foreground mt-1">Escolha seu treino</p>
      </header>

      <main className="px-6 space-y-6">
        {/* Weekly Schedule */}
        <section>
          <h2 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            PROGRAMAÇÃO SEMANAL
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weeklySchedule.map((schedule, i) => (
              <div
                key={schedule.day}
                className={`flex-shrink-0 w-16 p-3 rounded-xl text-center transition-all ${
                  i === todayIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                <p className="text-xs opacity-70">{schedule.day.slice(0, 3)}</p>
                <p className="font-display text-lg mt-1">
                  {schedule.type ? workouts[schedule.type].emoji : '😴'}
                </p>
                <p className="text-xs mt-1">
                  {schedule.type ? workouts[schedule.type].name : 'REST'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* All Workouts */}
        <section>
          <h2 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            TODOS OS TREINOS
          </h2>
          <div className="space-y-3">
            {Object.values(workouts).map((workout) => (
              <WorkoutCard
                key={workout.type}
                workout={workout}
                onClick={() => handleStartWorkout(workout.type)}
              />
            ))}
          </div>
        </section>

        {/* Target muscles info */}
        <section className="glass-card p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            DIVISÃO PPL
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <p className="font-medium">PULL</p>
                <p className="text-muted-foreground">Costas, Bíceps, Antebraços</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">PUSH</p>
                <p className="text-muted-foreground">Peito, Ombros, Tríceps</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🦵</span>
              <div>
                <p className="font-medium">PERNAS + CORE</p>
                <p className="text-muted-foreground">Quadríceps, Glúteos, Abdômen</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Workouts;
