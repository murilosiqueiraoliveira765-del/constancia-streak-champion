import { useNavigate } from 'react-router-dom';
import { Play, Zap, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StreakCounter from '@/components/StreakCounter';
import WorkoutCard from '@/components/WorkoutCard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { workouts, weeklySchedule, WorkoutType } from '@/data/workouts';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

  // Get today's workout based on day of week
  const today = new Date().getDay();
  const todaySchedule = weeklySchedule[today === 0 ? 6 : today - 1];
  const todayWorkout = todaySchedule.type ? workouts[todaySchedule.type] : null;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Até logo! Volte para manter o streak.');
  };

  const handleStartWorkout = (type: WorkoutType) => {
    navigate(`/workout/${type}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="font-display text-2xl tracking-wider">
              {profile?.name || user?.email?.split('@')[0] || 'Atleta'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 space-y-6">
        {/* Streak Counter */}
        <StreakCounter 
          streak={profile?.current_streak || 0} 
          longestStreak={profile?.longest_streak || 0}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {todayWorkout && (
            <Button
              variant="fire"
              size="lg"
              className="flex-col h-auto py-4"
              onClick={() => handleStartWorkout(todayWorkout.type)}
            >
              <Play className="w-6 h-6 mb-1" />
              <span className="text-xs font-normal opacity-90">Treino de hoje</span>
              <span className="font-display text-lg">{todayWorkout.name}</span>
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="lg"
            className="flex-col h-auto py-4"
            onClick={() => handleStartWorkout('bad_day')}
          >
            <Zap className="w-6 h-6 mb-1" />
            <span className="text-xs font-normal opacity-90">Dia difícil?</span>
            <span className="font-display text-lg">5 MIN</span>
          </Button>
        </div>

        {/* Today's Focus */}
        {todayWorkout && (
          <section>
            <h2 className="font-display text-lg tracking-wider mb-3 text-muted-foreground">
              FOCO DE HOJE
            </h2>
            <WorkoutCard
              workout={todayWorkout}
              onClick={() => handleStartWorkout(todayWorkout.type)}
              isToday
            />
          </section>
        )}

        {/* Quick Stats */}
        <section className="glass-card p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            ESTATÍSTICAS
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl text-gradient-fire">
                {profile?.total_workouts || 0}
              </p>
              <p className="text-xs text-muted-foreground">Treinos</p>
            </div>
            <div>
              <p className="font-display text-2xl">
                {profile?.current_streak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Streak Atual</p>
            </div>
            <div>
              <p className="font-display text-2xl">
                {profile?.longest_streak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Recorde</p>
            </div>
          </div>
        </section>

        {/* Motivation */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground italic">
            "Você não precisa de motivação. Precisa de disciplina."
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
