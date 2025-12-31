/**
 * Sistema de Notificações Push para o app Constância
 * 
 * Funcionalidades:
 * - Solicitar permissão para notificações
 * - Lembrete diário de treino
 * - Alerta de streak em risco
 * - Mensagens de disciplina
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Verifica se o navegador suporta notificações
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Solicita permissão para enviar notificações
 * @returns Status da permissão
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notificações não são suportadas neste navegador');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Verifica se as notificações estão permitidas
 */
export function isNotificationPermitted(): boolean {
  if (!isNotificationSupported()) return false;
  return Notification.permission === 'granted';
}

/**
 * Envia uma notificação local
 */
export async function sendNotification(options: NotificationOptions): Promise<void> {
  if (!isNotificationPermitted()) {
    console.warn('Permissão para notificações não concedida');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false
    });
  } catch (error) {
    // Fallback para Notification API básica
    new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      tag: options.tag
    });
  }
}

/**
 * Mensagens motivacionais para notificações
 */
const MOTIVATIONAL_MESSAGES = [
  'A disciplina é a ponte entre metas e conquistas.',
  'Não espere motivação. Seja disciplinado.',
  'Cada repetição te aproxima do seu objetivo.',
  'O corpo alcança o que a mente acredita.',
  'Consistência supera intensidade.',
  'Treine hoje para ser forte amanhã.',
  'A dor do treino é temporária. O orgulho é permanente.',
  'Você é mais forte do que pensa.',
  'O único treino ruim é o que não acontece.',
  'Discipline sua mente, transforme seu corpo.'
];

/**
 * Obtém uma mensagem motivacional aleatória
 */
export function getRandomMotivationalMessage(): string {
  const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
  return MOTIVATIONAL_MESSAGES[index];
}

/**
 * Notificação de lembrete diário de treino
 */
export async function sendDailyReminderNotification(): Promise<void> {
  await sendNotification({
    title: '🏋️ Hora do Treino!',
    body: getRandomMotivationalMessage(),
    tag: 'daily-reminder',
    requireInteraction: true
  });
}

/**
 * Notificação de streak em risco
 */
export async function sendStreakAtRiskNotification(currentStreak: number): Promise<void> {
  await sendNotification({
    title: '⚠️ Streak em Risco!',
    body: `Você tem ${currentStreak} dias de streak. Não perca sua sequência!`,
    tag: 'streak-risk',
    requireInteraction: true
  });
}

/**
 * Notificação de conquista de streak
 */
export async function sendStreakAchievementNotification(streak: number): Promise<void> {
  let message = '';
  
  if (streak === 7) {
    message = '🎉 Uma semana completa! Você está imparável!';
  } else if (streak === 14) {
    message = '🏆 Duas semanas! A disciplina virou hábito!';
  } else if (streak === 30) {
    message = '🔥 Um mês inteiro! Você é uma máquina!';
  } else if (streak === 90) {
    message = '💎 90 dias! Transformação completa!';
  } else if (streak % 100 === 0) {
    message = `🌟 ${streak} dias! Você é uma lenda!`;
  } else {
    return; // Não envia notificação para outros valores
  }
  
  await sendNotification({
    title: '🎯 Nova Conquista!',
    body: message,
    tag: 'streak-achievement'
  });
}

/**
 * Agenda notificações diárias (usando localStorage para simulação)
 * Em produção, isso seria feito via Service Worker
 */
export function scheduleDailyNotification(hour: number = 18, minute: number = 0): void {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);
  
  // Se já passou do horário hoje, agenda para amanhã
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime.getTime() - now.getTime();
  
  // Salva configuração no localStorage
  localStorage.setItem('notificationSchedule', JSON.stringify({
    hour,
    minute,
    enabled: true
  }));
  
  // Agenda a notificação (em produção usaria Service Worker)
  setTimeout(() => {
    sendDailyReminderNotification();
    // Re-agenda para o próximo dia
    scheduleDailyNotification(hour, minute);
  }, delay);
}

/**
 * Obtém configuração de notificações
 */
export function getNotificationSchedule(): { hour: number; minute: number; enabled: boolean } | null {
  const saved = localStorage.getItem('notificationSchedule');
  return saved ? JSON.parse(saved) : null;
}

/**
 * Desativa notificações agendadas
 */
export function disableScheduledNotifications(): void {
  localStorage.setItem('notificationSchedule', JSON.stringify({
    hour: 18,
    minute: 0,
    enabled: false
  }));
}
