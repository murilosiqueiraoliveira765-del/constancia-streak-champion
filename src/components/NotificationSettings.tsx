import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  isNotificationSupported,
  isNotificationPermitted,
  requestNotificationPermission,
  scheduleDailyNotification,
  getNotificationSchedule,
  disableScheduledNotifications
} from '@/lib/notifications';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(18);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    
    if (isNotificationPermitted()) {
      const schedule = getNotificationSchedule();
      if (schedule) {
        setNotificationsEnabled(schedule.enabled);
        setReminderHour(schedule.hour);
      }
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Ativar notificações
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        scheduleDailyNotification(reminderHour, 0);
        toast.success('Notificações ativadas! Você receberá lembretes diários.');
      } else if (permission === 'denied') {
        toast.error('Permissão negada. Ative nas configurações do navegador.');
      }
    } else {
      // Desativar notificações
      setNotificationsEnabled(false);
      disableScheduledNotifications();
      toast.info('Notificações desativadas.');
    }
  };

  const handleChangeHour = (hour: number) => {
    setReminderHour(hour);
    if (notificationsEnabled) {
      scheduleDailyNotification(hour, 0);
      toast.success(`Lembrete atualizado para ${hour}:00`);
    }
  };

  if (!isSupported) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="w-5 h-5" />
          <span className="text-sm">Notificações não são suportadas neste navegador</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <div>
            <Label htmlFor="notifications" className="text-base font-medium">
              Notificações Push
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba lembretes diários de treino
            </p>
          </div>
        </div>
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={handleToggleNotifications}
        />
      </div>

      {notificationsEnabled && (
        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <Label className="text-sm">Horário do lembrete</Label>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[6, 7, 8, 9, 12, 17, 18, 19, 20, 21].map((hour) => (
              <Button
                key={hour}
                variant={reminderHour === hour ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChangeHour(hour)}
                className="text-xs"
              >
                {hour}:00
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Você receberá um lembrete às {reminderHour}:00 se ainda não tiver treinado.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
