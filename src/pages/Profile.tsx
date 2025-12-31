import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { plans } from '@/data/workouts';
import NotificationSettings from '@/components/NotificationSettings';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const currentPlan = plans.find(p => p.id === profile?.current_plan);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 safe-top">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl tracking-wider">PERFIL</h1>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* User Info */}
        <div className="glass-card p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            {(profile?.name || 'A')[0].toUpperCase()}
          </div>
          <h2 className="font-display text-2xl tracking-wider">
            {profile?.name || 'Atleta'}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            ESTATÍSTICAS
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Treinos</span>
              <span className="font-medium">{profile?.total_workouts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Streak Atual</span>
              <span className="font-medium text-primary">{profile?.current_streak || 0} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maior Streak</span>
              <span className="font-medium">{profile?.longest_streak || 0} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plano Atual</span>
              <span className="font-medium">{currentPlan?.name || 'Nenhum'}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            NOTIFICAÇÕES
          </h3>
          <NotificationSettings />
        </div>

        {/* Account Info */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
            CONTA
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="font-medium">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </main>
    </div>
  );
};

export default Profile;
