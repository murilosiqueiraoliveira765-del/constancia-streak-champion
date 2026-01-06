import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isNotificationSupported, 
  isNotificationPermitted, 
  requestNotificationPermission,
  sendNotification 
} from '@/lib/notifications';

interface PendingNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setIsEnabled(isNotificationPermitted());
  }, []);

  // Busca notificações pendentes ao carregar
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('pending_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false);

      if (!error && data) {
        setNotifications(data as PendingNotification[]);
        
        // Envia notificação push para cada nova
        if (isNotificationPermitted()) {
          for (const notification of data as PendingNotification[]) {
            await sendNotification({
              title: '🔔 Constância',
              body: notification.message,
              tag: notification.type
            });
          }
        }
      }
    };

    fetchNotifications();
  }, [user]);

  // Escuta notificações em tempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const newNotification = payload.new as PendingNotification;
          setNotifications(prev => [...prev, newNotification]);
          
          // Envia notificação push
          if (isNotificationPermitted()) {
            await sendNotification({
              title: '🔔 Constância',
              body: newNotification.message,
              tag: newNotification.type
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const enableNotifications = async () => {
    const permission = await requestNotificationPermission();
    const enabled = permission === 'granted';
    setIsEnabled(enabled);
    return enabled;
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('pending_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = async () => {
    if (!user) return;
    
    await supabase
      .from('pending_notifications')
      .delete()
      .eq('user_id', user.id);

    setNotifications([]);
  };

  return {
    notifications,
    isSupported,
    isEnabled,
    enableNotifications,
    markAsRead,
    clearAll
  };
}
