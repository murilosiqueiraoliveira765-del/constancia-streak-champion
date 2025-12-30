import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Target, Utensils, TrendingUp } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/workouts', icon: Dumbbell, label: 'Treinos' },
  { path: '/plans', icon: Target, label: 'Planos' },
  { path: '/nutrition', icon: Utensils, label: 'Nutrição' },
  { path: '/results', icon: TrendingUp, label: 'Progresso' },
];

const BottomNav = () => {
  const location = useLocation();

  // Hide nav during active workout
  if (location.pathname.startsWith('/workout/')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
