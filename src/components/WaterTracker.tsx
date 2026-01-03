import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Target, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfDay, endOfDay } from 'date-fns';

interface WaterIntake {
  id: string;
  amount_ml: number;
  logged_at: string;
}

const WaterTracker = () => {
  const { user } = useAuth();
  const [intakes, setIntakes] = useState<WaterIntake[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [isLoading, setIsLoading] = useState(false);

  const totalToday = intakes.reduce((sum, i) => sum + i.amount_ml, 0);
  const progressPercent = Math.min((totalToday / dailyGoal) * 100, 100);
  const glassesCount = Math.floor(totalToday / 250);

  useEffect(() => {
    if (user) {
      loadTodayIntake();
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('reminder_settings')
      .select('daily_water_goal_ml')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setDailyGoal(data.daily_water_goal_ml);
    }
  };

  const loadTodayIntake = async () => {
    if (!user) return;

    const today = new Date();
    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startOfDay(today).toISOString())
      .lte('logged_at', endOfDay(today).toISOString())
      .order('logged_at', { ascending: false });

    if (!error && data) {
      setIntakes(data);
    }
  };

  const addWater = async (amount: number) => {
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('water_intake')
      .insert({
        user_id: user.id,
        amount_ml: amount
      });

    if (error) {
      toast.error('Erro ao registrar água');
    } else {
      const newTotal = totalToday + amount;
      if (newTotal >= dailyGoal && totalToday < dailyGoal) {
        toast.success('Meta diária de água atingida! 💧🎉');
      } else {
        toast.success(`+${amount}ml registrado`);
      }
      loadTodayIntake();
    }
    setIsLoading(false);
  };

  const removeLastIntake = async () => {
    if (!user || intakes.length === 0) return;

    const lastIntake = intakes[0];
    const { error } = await supabase
      .from('water_intake')
      .delete()
      .eq('id', lastIntake.id);

    if (error) {
      toast.error('Erro ao remover');
    } else {
      toast.info(`-${lastIntake.amount_ml}ml removido`);
      loadTodayIntake();
    }
  };

  const waterAmounts = [150, 250, 350, 500];

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-display tracking-wider">Água</h3>
            <p className="text-xs text-muted-foreground">Hidratação diária</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-500">{totalToday}ml</p>
          <p className="text-xs text-muted-foreground">de {dailyGoal}ml</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progressPercent} className="h-3 bg-blue-500/20" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{glassesCount} copos (250ml)</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Visual Glasses */}
      <div className="flex flex-wrap gap-1 justify-center py-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-8 rounded-b-lg border-2 transition-all ${
              i < glassesCount
                ? 'bg-blue-500 border-blue-600'
                : 'bg-muted/30 border-muted'
            }`}
          />
        ))}
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {waterAmounts.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => addWater(amount)}
            disabled={isLoading}
            className="text-xs"
          >
            +{amount}ml
          </Button>
        ))}
      </div>

      {/* Remove Last */}
      {intakes.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={removeLastIntake}
          className="w-full text-muted-foreground"
        >
          <Minus className="w-4 h-4 mr-1" />
          Remover último ({intakes[0]?.amount_ml}ml)
        </Button>
      )}
    </div>
  );
};

export default WaterTracker;
