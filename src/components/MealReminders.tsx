import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Droplets, Coffee, Utensils, Moon, Apple, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  isNotificationSupported,
  isNotificationPermitted,
  requestNotificationPermission,
  sendNotification
} from '@/lib/notifications';

interface ReminderSettings {
  daily_water_goal_ml: number;
  water_reminder_enabled: boolean;
  water_reminder_interval_minutes: number;
  water_reminder_start_hour: number;
  water_reminder_end_hour: number;
  meal_reminder_enabled: boolean;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
  snack_time: string;
}

const defaultSettings: ReminderSettings = {
  daily_water_goal_ml: 2000,
  water_reminder_enabled: false,
  water_reminder_interval_minutes: 60,
  water_reminder_start_hour: 7,
  water_reminder_end_hour: 22,
  meal_reminder_enabled: false,
  breakfast_time: '07:00',
  lunch_time: '12:00',
  dinner_time: '19:00',
  snack_time: '15:00'
};

const mealTypes = [
  { key: 'breakfast_time', label: 'Café da manhã', icon: Coffee },
  { key: 'lunch_time', label: 'Almoço', icon: Utensils },
  { key: 'snack_time', label: 'Lanche', icon: Apple },
  { key: 'dinner_time', label: 'Jantar', icon: Moon }
];

let reminderIntervals: NodeJS.Timeout[] = [];

const MealReminders = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [pendingReminders, setPendingReminders] = useState<string[]>([]);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    if (user) {
      loadSettings();
    }
  }, [user]);

  useEffect(() => {
    // Limpar intervalos anteriores
    reminderIntervals.forEach(clearInterval);
    reminderIntervals = [];

    if (settings.water_reminder_enabled || settings.meal_reminder_enabled) {
      setupReminders();
    }

    return () => {
      reminderIntervals.forEach(clearInterval);
    };
  }, [settings]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        daily_water_goal_ml: data.daily_water_goal_ml,
        water_reminder_enabled: data.water_reminder_enabled,
        water_reminder_interval_minutes: data.water_reminder_interval_minutes,
        water_reminder_start_hour: data.water_reminder_start_hour,
        water_reminder_end_hour: data.water_reminder_end_hour,
        meal_reminder_enabled: data.meal_reminder_enabled,
        breakfast_time: data.breakfast_time || '07:00',
        lunch_time: data.lunch_time || '12:00',
        dinner_time: data.dinner_time || '19:00',
        snack_time: data.snack_time || '15:00'
      });
    }
  };

  const saveSettings = async (newSettings: Partial<ReminderSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    const { error } = await supabase
      .from('reminder_settings')
      .upsert({
        user_id: user.id,
        ...updatedSettings
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const setupReminders = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Lembretes de água
    if (settings.water_reminder_enabled) {
      const intervalMs = settings.water_reminder_interval_minutes * 60 * 1000;
      
      const waterInterval = setInterval(() => {
        const checkHour = new Date().getHours();
        if (checkHour >= settings.water_reminder_start_hour && 
            checkHour < settings.water_reminder_end_hour) {
          sendWaterReminder();
        }
      }, intervalMs);
      
      reminderIntervals.push(waterInterval);
    }

    // Lembretes de refeição
    if (settings.meal_reminder_enabled) {
      mealTypes.forEach(({ key, label }) => {
        const timeStr = settings[key as keyof ReminderSettings] as string;
        if (timeStr) {
          scheduleMealReminder(key, label, timeStr);
        }
      });
    }
  };

  const sendWaterReminder = () => {
    if (!isNotificationPermitted()) return;

    const id = `water-${Date.now()}`;
    setPendingReminders(prev => [...prev, id]);

    sendNotification({
      title: '💧 Hora de beber água!',
      body: 'Mantenha-se hidratado. Beba um copo de água agora!',
      tag: id,
      requireInteraction: true
    });

    // Se não confirmar em 5 minutos, lembrar novamente
    const repeatInterval = setInterval(() => {
      if (pendingReminders.includes(id)) {
        sendNotification({
          title: '💧 Lembrete: Beba água!',
          body: 'Você ainda não confirmou. Beba água para sua saúde!',
          tag: id,
          requireInteraction: true
        });
      } else {
        clearInterval(repeatInterval);
      }
    }, 5 * 60 * 1000);

    reminderIntervals.push(repeatInterval);
  };

  const scheduleMealReminder = (key: string, label: string, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      sendMealReminder(key, label);
      // Re-agendar para o próximo dia
      scheduleMealReminder(key, label, timeStr);
    }, delay);

    reminderIntervals.push(timeout as unknown as NodeJS.Timeout);
  };

  const sendMealReminder = (key: string, label: string) => {
    if (!isNotificationPermitted()) return;

    const id = `meal-${key}-${Date.now()}`;
    setPendingReminders(prev => [...prev, id]);

    const suggestions = getMealSuggestion(key);

    sendNotification({
      title: `🍽️ Hora do ${label}!`,
      body: suggestions,
      tag: id,
      requireInteraction: true
    });

    // Repetir a cada 5 minutos até confirmar
    const repeatInterval = setInterval(() => {
      if (pendingReminders.includes(id)) {
        sendNotification({
          title: `⏰ Lembrete: ${label}`,
          body: 'Você ainda não se alimentou! Cuide da sua nutrição.',
          tag: id,
          requireInteraction: true
        });
      } else {
        clearInterval(repeatInterval);
      }
    }, 5 * 60 * 1000);

    reminderIntervals.push(repeatInterval);
  };

  const getMealSuggestion = (mealKey: string): string => {
    const suggestions: Record<string, string[]> = {
      breakfast_time: [
        'Sugestão: Ovos + aveia + fruta',
        'Sugestão: Tapioca + queijo + café',
        'Sugestão: Vitamina de banana + pão integral',
        'Sugestão: Iogurte + granola + mel'
      ],
      lunch_time: [
        'Sugestão: Arroz + feijão + frango + salada',
        'Sugestão: Macarrão integral + carne + legumes',
        'Sugestão: Peixe + batata doce + brócolis',
        'Sugestão: Strogonoff + arroz + salada verde'
      ],
      snack_time: [
        'Sugestão: Frutas + castanhas',
        'Sugestão: Sanduíche natural + suco',
        'Sugestão: Iogurte + banana',
        'Sugestão: Mix de oleaginosas'
      ],
      dinner_time: [
        'Sugestão: Sopa de legumes + frango',
        'Sugestão: Omelete + salada',
        'Sugestão: Peixe grelhado + legumes',
        'Sugestão: Frango + purê + verduras'
      ]
    };

    const mealSuggestions = suggestions[mealKey] || suggestions.lunch_time;
    return mealSuggestions[Math.floor(Math.random() * mealSuggestions.length)];
  };

  const confirmReminder = async (type: string) => {
    if (!user) return;

    // Remover dos pendentes
    setPendingReminders(prev => prev.filter(id => !id.startsWith(type)));

    // Salvar confirmação
    await supabase.from('reminder_confirmations').insert({
      user_id: user.id,
      reminder_type: type === 'water' ? 'water' : type.replace('meal-', '').replace('_time', ''),
      scheduled_for: new Date().toISOString()
    });

    toast.success('Confirmado! Continue assim 💪');
  };

  const handleEnableReminders = async (type: 'water' | 'meal', enabled: boolean) => {
    if (enabled && !isNotificationPermitted()) {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        toast.error('Permita notificações para receber lembretes');
        return;
      }
    }

    if (type === 'water') {
      saveSettings({ water_reminder_enabled: enabled });
    } else {
      saveSettings({ meal_reminder_enabled: enabled });
    }

    toast.success(enabled ? 'Lembretes ativados!' : 'Lembretes desativados');
  };

  if (!isSupported) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="w-5 h-5" />
          <span className="text-sm">Notificações não são suportadas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lembretes de Água */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <Label className="text-base font-medium">Lembretes de Água</Label>
              <p className="text-xs text-muted-foreground">
                Receba alertas para beber água
              </p>
            </div>
          </div>
          <Switch
            checked={settings.water_reminder_enabled}
            onCheckedChange={(v) => handleEnableReminders('water', v)}
          />
        </div>

        {settings.water_reminder_enabled && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <Label className="text-sm">Meta diária (ml)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[settings.daily_water_goal_ml]}
                  onValueChange={([v]) => saveSettings({ daily_water_goal_ml: v })}
                  min={1000}
                  max={4000}
                  step={250}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">
                  {settings.daily_water_goal_ml}ml
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm">Intervalo entre lembretes</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[30, 60, 90, 120].map((min) => (
                  <Button
                    key={min}
                    variant={settings.water_reminder_interval_minutes === min ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => saveSettings({ water_reminder_interval_minutes: min })}
                  >
                    {min}min
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm">Início</Label>
                <Input
                  type="time"
                  value={`${settings.water_reminder_start_hour.toString().padStart(2, '0')}:00`}
                  onChange={(e) => {
                    const hour = parseInt(e.target.value.split(':')[0]);
                    saveSettings({ water_reminder_start_hour: hour });
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">Fim</Label>
                <Input
                  type="time"
                  value={`${settings.water_reminder_end_hour.toString().padStart(2, '0')}:00`}
                  onChange={(e) => {
                    const hour = parseInt(e.target.value.split(':')[0]);
                    saveSettings({ water_reminder_end_hour: hour });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lembretes de Refeição */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className="w-5 h-5 text-primary" />
            <div>
              <Label className="text-base font-medium">Lembretes de Refeição</Label>
              <p className="text-xs text-muted-foreground">
                Horários para se alimentar + sugestões
              </p>
            </div>
          </div>
          <Switch
            checked={settings.meal_reminder_enabled}
            onCheckedChange={(v) => handleEnableReminders('meal', v)}
          />
        </div>

        {settings.meal_reminder_enabled && (
          <div className="space-y-3 pt-4 border-t border-border">
            {mealTypes.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <Label className="flex-1 text-sm">{label}</Label>
                <Input
                  type="time"
                  value={settings[key as keyof ReminderSettings] as string}
                  onChange={(e) => saveSettings({ [key]: e.target.value })}
                  className="w-24"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Se não confirmar, você receberá lembretes a cada 5 minutos
            </p>
          </div>
        )}
      </div>

      {/* Confirmar Lembrete Pendente */}
      {pendingReminders.length > 0 && (
        <div className="glass-card p-4 border-2 border-primary animate-pulse">
          <p className="text-sm font-medium mb-3">Lembretes pendentes:</p>
          <div className="space-y-2">
            {pendingReminders.some(id => id.startsWith('water')) && (
              <Button
                onClick={() => confirmReminder('water')}
                className="w-full gap-2"
                variant="outline"
              >
                <Check className="w-4 h-4" />
                Confirmar que bebi água
              </Button>
            )}
            {mealTypes.map(({ key, label }) => (
              pendingReminders.some(id => id.includes(key)) && (
                <Button
                  key={key}
                  onClick={() => confirmReminder(`meal-${key}`)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Check className="w-4 h-4" />
                  Confirmar {label}
                </Button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealReminders;
