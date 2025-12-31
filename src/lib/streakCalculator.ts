/**
 * Calculadora de Streak para o app Constância
 * 
 * Regras:
 * 1. Cada treino só conta uma vez por dia
 * 2. Se treinar no dia seguinte, streak aumenta em 1
 * 3. Se pular um ou mais dias, streak reseta para 1
 * 4. Streak não aumenta se treino for no mesmo dia
 * 5. Considera hora local do usuário (apenas o dia importa)
 */

export interface StreakResult {
  newStreak: number;
  lastWorkoutDate: string;
  status: 'increased' | 'maintained' | 'reset' | 'first';
  message: string;
}

/**
 * Normaliza a data para considerar apenas o dia (sem horas/minutos/segundos)
 * @param date - Data a ser normalizada
 * @returns Data normalizada no formato YYYY-MM-DD
 */
function normalizeToLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula a diferença em dias entre duas datas (considerando apenas o dia)
 * @param date1 - Primeira data (mais recente)
 * @param date2 - Segunda data (mais antiga)
 * @returns Diferença em dias
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula o novo streak baseado nas regras do app Constância
 * 
 * @param currentStreak - Streak atual do usuário (0 se nunca treinou)
 * @param lastWorkoutDate - Data do último treino no formato YYYY-MM-DD (null se nunca treinou)
 * @returns Objeto com novo streak, data atualizada, status e mensagem
 */
export function calculateStreak(
  currentStreak: number,
  lastWorkoutDate: string | null
): StreakResult {
  // Data de hoje normalizada para hora local do usuário
  const today = normalizeToLocalDate(new Date());
  
  // Primeiro treino de todos
  if (!lastWorkoutDate || currentStreak === 0) {
    return {
      newStreak: 1,
      lastWorkoutDate: today,
      status: 'first',
      message: '🔥 Primeiro dia! Sua jornada começa agora!'
    };
  }
  
  // Calcula diferença em dias
  const daysDiff = getDaysDifference(today, lastWorkoutDate);
  
  // Mesmo dia - streak mantido (não aumenta)
  if (daysDiff === 0) {
    return {
      newStreak: currentStreak,
      lastWorkoutDate: lastWorkoutDate,
      status: 'maintained',
      message: '✅ Streak mantido! Você já treinou hoje.'
    };
  }
  
  // Dia seguinte - streak aumenta
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      lastWorkoutDate: today,
      status: 'increased',
      message: `🔥 ${newStreak} dias seguidos! Continue assim!`
    };
  }
  
  // Pulou um ou mais dias - streak reseta
  return {
    newStreak: 1,
    lastWorkoutDate: today,
    status: 'reset',
    message: '💪 Sequência reiniciada. Vamos começar de novo!'
  };
}

/**
 * Verifica se o streak está em risco (usuário não treinou hoje e última vez foi ontem)
 * @param lastWorkoutDate - Data do último treino
 * @returns true se o streak está em risco
 */
export function isStreakAtRisk(lastWorkoutDate: string | null): boolean {
  if (!lastWorkoutDate) return false;
  
  const today = normalizeToLocalDate(new Date());
  const daysDiff = getDaysDifference(today, lastWorkoutDate);
  
  return daysDiff === 1;
}

/**
 * Verifica se o usuário já treinou hoje
 * @param lastWorkoutDate - Data do último treino
 * @returns true se já treinou hoje
 */
export function hasTrainedToday(lastWorkoutDate: string | null): boolean {
  if (!lastWorkoutDate) return false;
  
  const today = normalizeToLocalDate(new Date());
  return today === lastWorkoutDate;
}
