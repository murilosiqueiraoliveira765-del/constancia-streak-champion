export type WorkoutType = 'pull' | 'push' | 'legs_core' | 'bad_day';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tips: string[];
  isWarmup?: boolean;
  alternatives?: string[];
}

export interface Workout {
  type: WorkoutType;
  name: string;
  emoji: string;
  description: string;
  targetMuscles: string[];
  estimatedMinutes: number;
  exercises: Exercise[];
}

export const workouts: Record<WorkoutType, Workout> = {
  pull: {
    type: 'pull',
    name: 'PULL',
    emoji: '💪',
    description: 'Costas e Bíceps',
    targetMuscles: ['Dorsais', 'Bíceps', 'Antebraços', 'Romboides'],
    estimatedMinutes: 35,
    exercises: [
      {
        id: 'pull-warmup-1',
        name: 'Rotação de Ombros',
        sets: 2,
        reps: '15 cada lado',
        restSeconds: 30,
        tips: ['Movimentos amplos e controlados', 'Mantenha o core ativado'],
        isWarmup: true,
      },
      {
        id: 'pull-warmup-2',
        name: 'Prancha Escapular',
        sets: 2,
        reps: '10 reps',
        restSeconds: 30,
        tips: ['Empurre as escápulas para frente', 'Mantenha os braços retos'],
        isWarmup: true,
      },
      {
        id: 'pull-1',
        name: 'Barra Fixa (Pull-up)',
        sets: 4,
        reps: '6-10 reps',
        restSeconds: 90,
        tips: ['Desça completamente', 'Puxe os cotovelos para baixo', 'Ative as costas primeiro'],
        alternatives: ['Barra Australiana', 'Barra com Elástico'],
      },
      {
        id: 'pull-2',
        name: 'Barra Australiana',
        sets: 3,
        reps: '10-15 reps',
        restSeconds: 60,
        tips: ['Corpo reto como prancha', 'Toque o peito na barra'],
        alternatives: ['Remada Invertida na Mesa'],
      },
      {
        id: 'pull-3',
        name: 'Barra Supinada (Chin-up)',
        sets: 3,
        reps: '6-8 reps',
        restSeconds: 90,
        tips: ['Palmas voltadas para você', 'Foco no bíceps', 'Controle a descida'],
        alternatives: ['Rosca com Peso Corporal'],
      },
      {
        id: 'pull-4',
        name: 'Hang (Pendurado)',
        sets: 3,
        reps: '30-45 segundos',
        restSeconds: 60,
        tips: ['Ombros ativos', 'Não relaxe os ombros nas orelhas', 'Fortalece grip'],
      },
    ],
  },
  push: {
    type: 'push',
    name: 'PUSH',
    emoji: '🔥',
    description: 'Peito, Ombros e Tríceps',
    targetMuscles: ['Peitoral', 'Deltoides', 'Tríceps'],
    estimatedMinutes: 35,
    exercises: [
      {
        id: 'push-warmup-1',
        name: 'Círculos de Braço',
        sets: 2,
        reps: '15 cada direção',
        restSeconds: 30,
        tips: ['Aumente gradualmente a amplitude', 'Mantenha os braços retos'],
        isWarmup: true,
      },
      {
        id: 'push-warmup-2',
        name: 'Flexão Escapular',
        sets: 2,
        reps: '10 reps',
        restSeconds: 30,
        tips: ['Só movimento das escápulas', 'Corpo reto'],
        isWarmup: true,
      },
      {
        id: 'push-1',
        name: 'Flexão de Braço',
        sets: 4,
        reps: '10-15 reps',
        restSeconds: 60,
        tips: ['Corpo reto', 'Cotovelos a 45°', 'Peito quase toca o chão'],
        alternatives: ['Flexão de Joelhos', 'Flexão Inclinada'],
      },
      {
        id: 'push-2',
        name: 'Flexão Diamante',
        sets: 3,
        reps: '8-12 reps',
        restSeconds: 60,
        tips: ['Mãos formam diamante', 'Foco no tríceps', 'Cotovelos junto ao corpo'],
        alternatives: ['Flexão Fechada'],
      },
      {
        id: 'push-3',
        name: 'Pike Push-up',
        sets: 3,
        reps: '8-10 reps',
        restSeconds: 60,
        tips: ['Quadril alto', 'Cabeça entre os braços', 'Trabalha ombros'],
        alternatives: ['Flexão Declinada'],
      },
      {
        id: 'push-4',
        name: 'Flexão Archer',
        sets: 3,
        reps: '6-8 cada lado',
        restSeconds: 90,
        tips: ['Um braço estendido', 'Transição para one-arm push-up'],
        alternatives: ['Flexão Larga'],
      },
      {
        id: 'push-5',
        name: 'Dips (em cadeira/paralela)',
        sets: 3,
        reps: '10-12 reps',
        restSeconds: 60,
        tips: ['Desça até 90°', 'Não deixe ombros subir', 'Controle a subida'],
      },
    ],
  },
  legs_core: {
    type: 'legs_core',
    name: 'PERNAS + CORE',
    emoji: '🦵',
    description: 'Força e Estabilidade',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Core', 'Panturrilhas'],
    estimatedMinutes: 40,
    exercises: [
      {
        id: 'legs-warmup-1',
        name: 'Aquecimento Articular',
        sets: 1,
        reps: '10 cada movimento',
        restSeconds: 30,
        tips: ['Rotação de quadril', 'Círculos de tornozelo', 'Balanço de pernas'],
        isWarmup: true,
      },
      {
        id: 'legs-1',
        name: 'Agachamento',
        sets: 4,
        reps: '15-20 reps',
        restSeconds: 60,
        tips: ['Joelhos seguem os pés', 'Quadril abaixo do joelho', 'Peso nos calcanhares'],
        alternatives: ['Agachamento Assistido'],
      },
      {
        id: 'legs-2',
        name: 'Agachamento Búlgaro',
        sets: 3,
        reps: '10-12 cada perna',
        restSeconds: 60,
        tips: ['Pé de trás elevado', 'Joelho da frente não passa do pé', 'Tronco ereto'],
        alternatives: ['Afundo Estático'],
      },
      {
        id: 'legs-3',
        name: 'Pistol Squat (ou Progressão)',
        sets: 3,
        reps: '5-8 cada perna',
        restSeconds: 90,
        tips: ['Use apoio se necessário', 'Perna estendida à frente', 'Controle total'],
        alternatives: ['Box Pistol', 'Agachamento Uma Perna Assistido'],
      },
      {
        id: 'legs-4',
        name: 'Elevação de Panturrilha',
        sets: 3,
        reps: '20 reps',
        restSeconds: 45,
        tips: ['Subida máxima na ponta dos pés', 'Descida controlada', 'Uma perna para aumentar'],
      },
      {
        id: 'core-1',
        name: 'Prancha',
        sets: 3,
        reps: '45-60 segundos',
        restSeconds: 45,
        tips: ['Corpo reto', 'Core contraído', 'Não deixe quadril cair'],
      },
      {
        id: 'core-2',
        name: 'Hollow Body Hold',
        sets: 3,
        reps: '30 segundos',
        restSeconds: 45,
        tips: ['Lombar colada no chão', 'Braços e pernas estendidos', 'Base para skills'],
      },
      {
        id: 'core-3',
        name: 'L-Sit (no chão)',
        sets: 3,
        reps: '15-30 segundos',
        restSeconds: 60,
        tips: ['Pernas paralelas ao chão', 'Use parallettes se tiver', 'Compressão ativa'],
        alternatives: ['Tuck L-Sit', 'L-Sit com uma perna'],
      },
    ],
  },
  bad_day: {
    type: 'bad_day',
    name: 'DIA RUIM',
    emoji: '⚡',
    description: 'Mínimo para manter o streak',
    targetMuscles: ['Full Body'],
    estimatedMinutes: 5,
    exercises: [
      {
        id: 'bad-1',
        name: 'Polichinelos',
        sets: 1,
        reps: '30 segundos',
        restSeconds: 15,
        tips: ['Ative o corpo', 'Respire fundo'],
      },
      {
        id: 'bad-2',
        name: 'Flexões',
        sets: 2,
        reps: '10 reps',
        restSeconds: 30,
        tips: ['Qualquer variação', 'Mantenha a consistência'],
        alternatives: ['Flexão de joelhos'],
      },
      {
        id: 'bad-3',
        name: 'Agachamentos',
        sets: 2,
        reps: '15 reps',
        restSeconds: 30,
        tips: ['Profundo', 'Ative as pernas'],
      },
      {
        id: 'bad-4',
        name: 'Prancha',
        sets: 1,
        reps: '30 segundos',
        restSeconds: 0,
        tips: ['Termine forte', 'Você veio, isso importa'],
      },
    ],
  },
};

export const weeklySchedule = [
  { day: 'Segunda', type: 'push' as WorkoutType },
  { day: 'Terça', type: 'pull' as WorkoutType },
  { day: 'Quarta', type: 'legs_core' as WorkoutType },
  { day: 'Quinta', type: 'push' as WorkoutType },
  { day: 'Sexta', type: 'pull' as WorkoutType },
  { day: 'Sábado', type: 'legs_core' as WorkoutType },
  { day: 'Domingo', type: null }, // Rest day
];

export const plans = [
  {
    id: '30_days',
    name: '30 Dias',
    title: 'Constância',
    description: 'Construa o hábito. Treine mesmo nos dias difíceis.',
    duration: 30,
    goals: ['Estabelecer rotina', 'Dominar forma dos exercícios', 'Ganho de força inicial'],
  },
  {
    id: '90_days',
    name: '90 Dias',
    title: 'Transformação',
    description: 'Veja mudanças reais. Corpo e mente.',
    duration: 90,
    goals: ['Aumento visível de massa', 'Definição muscular', 'Progressão de exercícios'],
  },
  {
    id: '180_days',
    name: '180 Dias',
    title: 'Físico Calistênico',
    description: 'Domine seu corpo. Skills avançadas.',
    duration: 180,
    goals: ['Muscle-up', 'Pistol squat perfeito', 'L-sit avançado', 'Físico atlético'],
  },
];

export const nutritionTips = [
  {
    title: 'Proteína',
    description: 'Consuma proteína em cada refeição. Ovos, frango, peixe, leguminosas.',
    icon: '🥩',
  },
  {
    title: 'Hidratação',
    description: 'Beba água ao acordar e antes de treinar. 2-3 litros por dia.',
    icon: '💧',
  },
  {
    title: 'Carboidratos',
    description: 'Prefira integrais. Arroz, batata doce, aveia antes do treino.',
    icon: '🍚',
  },
  {
    title: 'Legumes e Verduras',
    description: 'Metade do prato com vegetais. Fibras e micronutrientes.',
    icon: '🥗',
  },
  {
    title: 'Evite Processados',
    description: 'Menos pacotes, mais comida de verdade. Simplifique.',
    icon: '🚫',
  },
  {
    title: 'Consistência',
    description: 'Não precisa ser perfeito. Só consistente. 80/20.',
    icon: '📈',
  },
];

export const resultsTimeline = [
  { week: 2, title: 'Força Inicial', description: 'Sente mais disposição e energia nos treinos.' },
  { week: 4, title: 'Primeiras Mudanças', description: 'Leve definição, roupas começam a caber diferente.' },
  { week: 8, title: 'Mudanças Visíveis', description: 'Outros começam a notar. Músculos mais definidos.' },
  { week: 12, title: 'Transformação', description: 'Corpo claramente diferente. Skills desbloqueadas.' },
  { week: 24, title: 'Físico Calistênico', description: 'Domínio do corpo. Estética atlética.' },
];
