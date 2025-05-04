import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudySession } from '../contexts/TimerContext';

// Estrutura para uma conquista
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;  // Requisito numérico para desbloquear (ex: horas estudadas, sessões concluídas)
  currentProgress: number;
  isCompleted: boolean;
  category: 'tempo' | 'sessões' | 'consistência' | 'pomodoros' | 'especial';
  dateCompleted?: string;
  xpReward: number;
}

export interface UserAchievementProfile {
  achievements: Achievement[];
  dailyAchievements: DailyAchievement[];
  totalXp: number;
  level: number;
  lastStudyDates: string[]; // Datas dos últimos 30 dias em que o usuário estudou
  longestStreak: number;
  currentStreak: number;
  zenModeTimeUsed: number;
  scheduledSessionsCompleted: number;
  uniqueScheduledSessions: string[];
}

// Conquistas padrão (estado inicial)
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Conquistas de tempo
  {
    id: 'time_1',
    title: 'Primeiro Passo',
    description: 'Complete 1 hora de estudo.',
    icon: 'clock-outline',
    requirement: 3600000, // 1 hora em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'tempo',
    xpReward: 100
  },
  {
    id: 'time_2',
    title: 'Dedicação Iniciante',
    description: 'Complete 5 horas de estudo.',
    icon: 'clock-outline',
    requirement: 18000000, // 5 horas em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'tempo',
    xpReward: 200
  },
  {
    id: 'time_3',
    title: 'Estudante Dedicado',
    description: 'Complete 10 horas de estudo.',
    icon: 'clock-check',
    requirement: 36000000, // 10 horas em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'tempo',
    xpReward: 300
  },
  {
    id: 'time_4',
    title: 'Mestre do Conhecimento',
    description: 'Complete 50 horas de estudo.',
    icon: 'star-circle-outline',
    requirement: 180000000, // 50 horas em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'tempo',
    xpReward: 500
  },
  {
    id: 'time_5',
    title: 'Erudito',
    description: 'Complete 100 horas de estudo.',
    icon: 'star-circle',
    requirement: 360000000, // 100 horas em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'tempo',
    xpReward: 1000
  },
  
  // Conquistas de sessões
  {
    id: 'sessions_1',
    title: 'Primeira Sessão',
    description: 'Complete sua primeira sessão de estudo.',
    icon: 'bookmark-outline',
    requirement: 1,
    currentProgress: 0,
    isCompleted: false,
    category: 'sessões',
    xpReward: 50
  },
  {
    id: 'sessions_2',
    title: 'Rotina de Estudos',
    description: 'Complete 10 sessões de estudo.',
    icon: 'bookmark-multiple',
    requirement: 10,
    currentProgress: 0,
    isCompleted: false,
    category: 'sessões',
    xpReward: 150
  },
  {
    id: 'sessions_3',
    title: 'Estudante Frequente',
    description: 'Complete 50 sessões de estudo.',
    icon: 'bookmark-check',
    requirement: 50,
    currentProgress: 0,
    isCompleted: false,
    category: 'sessões',
    xpReward: 300
  },
  {
    id: 'sessions_4',
    title: 'Veterano de Estudos',
    description: 'Complete 100 sessões de estudo.',
    icon: 'bookmark-plus',
    requirement: 100,
    currentProgress: 0,
    isCompleted: false,
    category: 'sessões',
    xpReward: 500
  },
  
  // Conquistas de consistência
  {
    id: 'streak_1',
    title: 'Consistência Inicial',
    description: 'Estude por 3 dias consecutivos.',
    icon: 'calendar-check',
    requirement: 3,
    currentProgress: 0,
    isCompleted: false,
    category: 'consistência',
    xpReward: 150
  },
  {
    id: 'streak_2',
    title: 'Rotina Semanal',
    description: 'Estude por 7 dias consecutivos.',
    icon: 'calendar-week',
    requirement: 7,
    currentProgress: 0,
    isCompleted: false,
    category: 'consistência',
    xpReward: 300
  },
  {
    id: 'streak_3',
    title: 'Dedicação Quinzenal',
    description: 'Estude por 15 dias consecutivos.',
    icon: 'calendar-star',
    requirement: 15,
    currentProgress: 0,
    isCompleted: false,
    category: 'consistência',
    xpReward: 500
  },
  {
    id: 'streak_4',
    title: 'Mestre da Consistência',
    description: 'Estude por 30 dias consecutivos.',
    icon: 'calendar-month',
    requirement: 30,
    currentProgress: 0,
    isCompleted: false,
    category: 'consistência',
    xpReward: 1000
  },
  
  // Conquistas de pomodoro
  {
    id: 'pomodoro_1',
    title: 'Técnica Pomodoro',
    description: 'Complete 5 ciclos de pomodoro.',
    icon: 'timer-sand',
    requirement: 5,
    currentProgress: 0,
    isCompleted: false,
    category: 'pomodoros',
    xpReward: 100
  },
  {
    id: 'pomodoro_2',
    title: 'Mestre do Pomodoro',
    description: 'Complete 25 ciclos de pomodoro.',
    icon: 'timer-sand-complete',
    requirement: 25,
    currentProgress: 0,
    isCompleted: false,
    category: 'pomodoros',
    xpReward: 300
  },
  {
    id: 'pomodoro_3',
    title: 'Guru do Pomodoro',
    description: 'Complete 100 ciclos de pomodoro.',
    icon: 'timer-sand',
    requirement: 100,
    currentProgress: 0,
    isCompleted: false,
    category: 'pomodoros',
    xpReward: 500
  },
  
  // Conquistas especiais
  {
    id: 'special_1',
    title: 'Madrugador',
    description: 'Complete uma sessão antes das 8h da manhã.',
    icon: 'weather-sunny',
    requirement: 1,
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 150
  },
  {
    id: 'special_2',
    title: 'Coruja da Noite',
    description: 'Complete uma sessão depois das 22h.',
    icon: 'weather-night',
    requirement: 1,
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 150
  },
  {
    id: 'special_3',
    title: 'Maratonista',
    description: 'Complete uma sessão com mais de 2 horas seguidas.',
    icon: 'run-fast',
    requirement: 7200000, // 2 horas em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 200
  },
  {
    id: 'special_4',
    title: 'Fim de Semana Produtivo',
    description: 'Estude no sábado e no domingo da mesma semana.',
    icon: 'calendar-weekend',
    requirement: 1,
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 250
  },
  {
    id: 'special_5',
    title: 'Feriado Produtivo',
    description: 'Estude por mais de 1 hora em um dia de feriado nacional.',
    icon: 'calendar-star',
    requirement: 3600000, // 1 hora em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 300
  },
  {
    id: 'special_6',
    title: 'Mestre Zen',
    description: 'Use o modo zen por mais de 1 hora acumulada.',
    icon: 'meditation',
    requirement: 3600000, // 1 hora em ms
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 200
  },
  
  // Novas conquistas de agenda
  {
    id: 'schedule_1',
    title: 'Planejador Iniciante',
    description: 'Complete sua primeira sessão agendada.',
    icon: 'calendar-check',
    requirement: 1,
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 100
  },
  {
    id: 'schedule_2',
    title: 'Planejamento Estratégico',
    description: 'Crie 5 sessões diferentes na sua agenda de estudos.',
    icon: 'calendar-edit',
    requirement: 5,
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 150
  },
  {
    id: 'schedule_3',
    title: 'Mestre da Organização',
    description: 'Complete 10 sessões agendadas.',
    icon: 'calendar-clock',
    requirement: 10,
    currentProgress: 0,
    isCompleted: false,
    category: 'especial',
    xpReward: 300
  }
];

// Interface para conquistas diárias (podem ser completadas todos os dias)
export interface DailyAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  xpReward: number;
  lastCompletedDate?: string; // Data em que foi completada pela última vez
}

// Conquistas diárias disponíveis
export const DAILY_ACHIEVEMENTS: DailyAchievement[] = [
  {
    id: 'daily_1',
    title: 'Estudante Dedicado do Dia',
    description: 'Estude pelo menos 30 minutos hoje.',
    icon: 'calendar-today',
    requirement: 1800000, // 30 minutos em ms
    xpReward: 50
  },
  {
    id: 'daily_2',
    title: 'Disciplina Diária',
    description: 'Complete 3 sessões de estudo hoje.',
    icon: 'check-circle-outline',
    requirement: 3, // 3 sessões
    xpReward: 75
  },
  {
    id: 'daily_3',
    title: 'Madrugador do Dia',
    description: 'Estude antes das 9h da manhã hoje.',
    icon: 'weather-sunset-up',
    requirement: 1,
    xpReward: 40
  }
];

// Perfil padrão de conquistas do usuário
const DEFAULT_PROFILE: UserAchievementProfile = {
  achievements: DEFAULT_ACHIEVEMENTS,
  dailyAchievements: DAILY_ACHIEVEMENTS.map(achievement => ({...achievement})),
  totalXp: 0,
  level: 1,
  lastStudyDates: [],
  longestStreak: 0,
  currentStreak: 0,
  zenModeTimeUsed: 0,
  scheduledSessionsCompleted: 0,
  uniqueScheduledSessions: []
};

// Chave de armazenamento
const STORAGE_KEY = 'cole_achievement_profile';

// Calcular nível com base em XP (cada nível requer 20% mais XP)
export const calculateLevel = (xp: number): number => {
  let level = 0;
  let xpThreshold = 1000; // XP necessário para o nível 1
  let totalXpRequired = 0;
  
  while (totalXpRequired <= xp) {
    level++;
    totalXpRequired += xpThreshold;
    xpThreshold = Math.floor(xpThreshold * 1.2); // 20% mais XP para o próximo nível
  }
  
  return Math.max(1, level);
};

// Carregar perfil de conquistas
export const loadAchievementProfile = async (): Promise<UserAchievementProfile> => {
  try {
    const profileJSON = await AsyncStorage.getItem(STORAGE_KEY);
    if (profileJSON) {
      return JSON.parse(profileJSON);
    }
    return DEFAULT_PROFILE;
  } catch (error) {
    console.log('Erro ao carregar perfil de conquistas:', error);
    return DEFAULT_PROFILE;
  }
};

// Salvar perfil de conquistas
export const saveAchievementProfile = async (profile: UserAchievementProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.log('Erro ao salvar perfil de conquistas:', error);
  }
};

// Função para verificar se é final de semana
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = domingo, 6 = sábado
};

// Lista de feriados nacionais brasileiros (YYYY-MM-DD)
const brazilianHolidays2025_2026 = [
  '2025-01-01', // Ano Novo
  '2025-02-20', // Carnaval
  '2025-02-21', // Carnaval
  '2025-04-07', // Sexta-feira Santa
  '2025-04-21', // Tiradentes
  '2025-05-01', // Dia do Trabalho
  '2025-06-08', // Corpus Christi
  '2025-09-07', // Independência
  '2025-10-12', // Nossa Senhora Aparecida
  '2025-11-02', // Finados
  '2025-11-15', // Proclamação da República
  '2025-12-25', // Natal
  '2026-01-01', // Ano Novo
  '2026-02-12', // Carnaval
  '2026-02-13', // Carnaval
  '2026-03-29', // Sexta-feira Santa
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-05-30', // Corpus Christi
  '2026-09-07', // Independência
  '2026-10-12', // Nossa Senhora Aparecida
  '2026-11-02', // Finados
  '2026-11-15', // Proclamação da República
  '2026-12-25'  // Natal
];

// Verificar se uma data é feriado
const isHoliday = (date: Date): boolean => {
  const dateStr = date.toISOString().split('T')[0];
  return brazilianHolidays2025_2026.includes(dateStr);
};

// Verificar e atualizar conquistas com base em nova sessão
export const updateAchievements = async (
  session: StudySession, 
  zenModeDuration: number = 0,
  isScheduledSession: boolean = false,
  scheduledSessionId?: string
): Promise<{
  updatedProfile: UserAchievementProfile,
  newlyCompletedAchievements: Achievement[] | DailyAchievement[]
}> => {
  const profile = await loadAchievementProfile();
  const newlyCompletedAchievements: (Achievement | DailyAchievement)[] = [];
  
  // Atualizar tempo em modo zen
  if (zenModeDuration > 0) {
    profile.zenModeTimeUsed += zenModeDuration;
  }
  
  // Atualizar contagem de sessões agendadas
  if (isScheduledSession) {
    profile.scheduledSessionsCompleted += 1;
    
    // Adicionar à lista de sessões únicas se tiver ID e não existir ainda
    if (scheduledSessionId && !profile.uniqueScheduledSessions.includes(scheduledSessionId)) {
      profile.uniqueScheduledSessions.push(scheduledSessionId);
    }
  }
  
  // Extrair data da sessão para formato YYYY-MM-DD
  const sessionDate = session.date.split('T')[0];
  const sessionDateTime = new Date(session.date);
  
  // 1. Atualizar datas de estudo para streak
  if (!profile.lastStudyDates.includes(sessionDate)) {
    profile.lastStudyDates.unshift(sessionDate);
    // Manter apenas os últimos 60 dias para limitar o tamanho
    if (profile.lastStudyDates.length > 60) {
      profile.lastStudyDates = profile.lastStudyDates.slice(0, 60);
    }
    
    // Ordenar datas em ordem decrescente
    profile.lastStudyDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Calcular streak atual
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Resetar ou incrementar streak
    if (profile.lastStudyDates[0] === todayStr) {
      if (profile.lastStudyDates.includes(yesterdayStr)) {
        profile.currentStreak += 1;
      } else {
        profile.currentStreak = 1;
      }
    }
    
    // Atualizar streak mais longa
    if (profile.currentStreak > profile.longestStreak) {
      profile.longestStreak = profile.currentStreak;
    }
  }
  
  // 2. Atualizar progresso de conquistas regulares
  let totalXpEarned = 0;
  
  profile.achievements.forEach(achievement => {
    if (achievement.isCompleted) return;
    
    switch (achievement.category) {
      case 'tempo':
        // Somar tempo de estudo
        achievement.currentProgress += session.duration;
        if (achievement.currentProgress >= achievement.requirement && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        break;
        
      case 'sessões':
        // Incrementar contagem de sessões
        achievement.currentProgress += 1;
        if (achievement.currentProgress >= achievement.requirement && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        break;
        
      case 'consistência':
        // Atualizar progresso de streak
        achievement.currentProgress = profile.currentStreak;
        if (achievement.currentProgress >= achievement.requirement && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        break;
        
      case 'especial':
        // Verificar conquistas especiais
        const sessionHour = new Date(session.date).getHours();
        
        // Madrugador
        if (achievement.id === 'special_1' && sessionHour < 8 && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.currentProgress = 1;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        
        // Coruja da Noite
        if (achievement.id === 'special_2' && sessionHour >= 22 && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.currentProgress = 1;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        
        // Maratonista
        if (achievement.id === 'special_3' && session.duration >= achievement.requirement && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.currentProgress = session.duration;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        
        // Fim de semana produtivo
        if (achievement.id === 'special_4' && isWeekend(sessionDateTime) && !achievement.isCompleted) {
          // Verificar se estudou no outro dia do final de semana
          const isSaturday = sessionDateTime.getDay() === 6;
          const otherWeekendDay = new Date(sessionDateTime);
          
          if (isSaturday) {
            otherWeekendDay.setDate(otherWeekendDay.getDate() + 1); // Domingo
          } else {
            otherWeekendDay.setDate(otherWeekendDay.getDate() - 1); // Sábado
          }
          
          const otherDayStr = otherWeekendDay.toISOString().split('T')[0];
          
          if (profile.lastStudyDates.includes(otherDayStr)) {
            achievement.isCompleted = true;
            achievement.currentProgress = 1;
            achievement.dateCompleted = new Date().toISOString();
            totalXpEarned += achievement.xpReward;
            newlyCompletedAchievements.push(achievement);
          }
        }
        
        // Feriado produtivo
        if (achievement.id === 'special_5' && isHoliday(sessionDateTime) && session.duration >= achievement.requirement && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.currentProgress = session.duration;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        
        // Mestre Zen
        if (achievement.id === 'special_6' && !achievement.isCompleted) {
          if (zenModeDuration > 0) {
            achievement.currentProgress += zenModeDuration;
          }
          
          if (achievement.currentProgress >= achievement.requirement) {
            achievement.isCompleted = true;
            achievement.dateCompleted = new Date().toISOString();
            totalXpEarned += achievement.xpReward;
            newlyCompletedAchievements.push(achievement);
          }
        }
        
        // Verificar conquistas de agenda
        if (achievement.id === 'schedule_1' && isScheduledSession && !achievement.isCompleted) {
          achievement.isCompleted = true;
          achievement.currentProgress = 1;
          achievement.dateCompleted = new Date().toISOString();
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        
        if (achievement.id === 'schedule_2' && !achievement.isCompleted) {
          achievement.currentProgress = profile.uniqueScheduledSessions.length;
          if (achievement.currentProgress >= achievement.requirement) {
            achievement.isCompleted = true;
            achievement.dateCompleted = new Date().toISOString();
            totalXpEarned += achievement.xpReward;
            newlyCompletedAchievements.push(achievement);
          }
        }
        
        if (achievement.id === 'schedule_3' && !achievement.isCompleted) {
          achievement.currentProgress = profile.scheduledSessionsCompleted;
          if (achievement.currentProgress >= achievement.requirement) {
            achievement.isCompleted = true;
            achievement.dateCompleted = new Date().toISOString();
            totalXpEarned += achievement.xpReward;
            newlyCompletedAchievements.push(achievement);
          }
        }
        
        break;
        
      default:
        break;
    }
  });
  
  // 3. Verificar conquistas diárias
  const today = new Date().toISOString().split('T')[0];
  
  profile.dailyAchievements.forEach(achievement => {
    // Pular se já completada hoje
    if (achievement.lastCompletedDate === today) return;
    
    switch (achievement.id) {
      case 'daily_1': // Estudar 30 minutos
        if (session.duration >= achievement.requirement) {
          achievement.lastCompletedDate = today;
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        break;
        
      case 'daily_2': // 3 sessões no dia
        // Contar quantas sessões foram feitas hoje incluindo a atual
        const sessionCount = 1; // Contar a sessão atual
        
        // Lógica simplificada - na implementação real teríamos que contar todas as sessões do dia
        if (sessionCount >= achievement.requirement) {
          achievement.lastCompletedDate = today;
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        break;
        
      case 'daily_3': // Estudar antes das 9h
        if (sessionDateTime.getHours() < 9) {
          achievement.lastCompletedDate = today;
          totalXpEarned += achievement.xpReward;
          newlyCompletedAchievements.push(achievement);
        }
        break;
    }
  });
  
  // 4. Atualizar XP total e nível
  profile.totalXp += totalXpEarned;
  const newLevel = calculateLevel(profile.totalXp);
  
  // Verificar se subiu de nível
  if (newLevel > profile.level) {
    profile.level = newLevel;
  }
  
  // Salvar perfil atualizado
  await saveAchievementProfile(profile);
  
  return {
    updatedProfile: profile,
    newlyCompletedAchievements
  };
};

// Funções auxiliares para estatísticas de conquistas
export const getCompletedAchievementCount = (profile: UserAchievementProfile): number => {
  return profile.achievements.filter(a => a.isCompleted).length;
};

export const getTotalAchievementCount = (profile: UserAchievementProfile): number => {
  return profile.achievements.length;
};

export const getCompletionPercentage = (profile: UserAchievementProfile): number => {
  const completed = getCompletedAchievementCount(profile);
  const total = getTotalAchievementCount(profile);
  return Math.round((completed / total) * 100);
};

// Calcular XP para próximo nível
export const getXpForNextLevel = (profile: UserAchievementProfile): { current: number, required: number } => {
  const level = profile.level;
  let xpThreshold = 1000; // XP inicial necessário para o nível 1
  let totalXpRequired = 0;
  
  for (let i = 1; i <= level; i++) {
    totalXpRequired += xpThreshold;
    xpThreshold = Math.floor(xpThreshold * 1.2);
  }
  
  return {
    current: profile.totalXp - (totalXpRequired - xpThreshold),
    required: xpThreshold
  };
}; 