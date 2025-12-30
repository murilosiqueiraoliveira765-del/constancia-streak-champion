import BottomNav from '@/components/BottomNav';
import { useProfile, useWorkouts, useExerciseProgress } from '@/hooks/useProfile';
import { resultsTimeline } from '@/data/workouts';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Results = () => {
  const { data: profile } = useProfile();
  const { data: workouts } = useWorkouts();

  // Calculate last 7 days workout data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayWorkouts = workouts?.filter(
      (w) => startOfDay(new Date(w.created_at)).getTime() === startOfDay(date).getTime()
    ) || [];
    
    return {
      day: format(date, 'EEE', { locale: ptBR }),
      treinos: dayWorkouts.length,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <h1 className="font-display text-3xl tracking-wider">PROGRESSO</h1>
        <p className="text-muted-foreground mt-1">Acompanhe sua evolução</p>
      </header>

      <main className="px-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <p className="font-display text-2xl text-gradient-fire">
              {profile?.total_workouts || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="font-display text-2xl">
              {profile?.current_streak || 0}
            </p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="font-display text-2xl">
              {profile?.longest_streak || 0}
            </p>
            <p className="text-xs text-muted-foreground">Recorde</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm tracking-wider text-muted-foreground">
              ÚLTIMOS 7 DIAS
            </h3>
          </div>
          
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="treinos" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Results Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm tracking-wider text-muted-foreground">
              O QUE ESPERAR
            </h3>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {resultsTimeline.map((milestone, i) => {
                const weeksPassed = profile?.plan_start_date 
                  ? Math.floor((Date.now() - new Date(profile.plan_start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
                  : 0;
                const isReached = weeksPassed >= milestone.week;
                
                return (
                  <div key={i} className="flex gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isReached 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className="text-xs font-medium">{milestone.week}s</span>
                    </div>
                    <div className={`glass-card p-4 flex-1 ${isReached ? 'border-primary/30' : ''}`}>
                      <h4 className="font-medium mb-1">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Workouts */}
        {workouts && workouts.length > 0 && (
          <section className="glass-card p-5">
            <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
              HISTÓRICO RECENTE
            </h3>
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout) => (
                <div key={workout.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium uppercase">{workout.workout_type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground ml-2">
                      • {workout.exercises_completed} exercícios
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(workout.created_at), 'dd/MM', { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Motivation */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground italic">
            "Resultados acontecem quando você para de contar os dias e faz os dias contarem."
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Results;
