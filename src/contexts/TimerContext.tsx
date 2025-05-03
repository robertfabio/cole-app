import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './SettingsContext';
import { useSharedValue, SharedValue, withTiming } from 'react-native-reanimated';
import { sendPomodoroNotification, sendStandardTimerNotification } from '../services/NotificationService';
import { AppState, AppStateStatus } from 'react-native';
import { Achievement, updateAchievements } from '../utils/achievementSystem';

// Tipos
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type StudySession = {
  id: string;
  name: string;
  duration: number; // Duração em milissegundos
  date: string;
  tags?: string[];
  category?: string;
  isScheduledSession?: boolean;
  scheduledSessionId?: string;
};

// Estado do timer
interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  pausedTime: number;
  totalStudyTime: number;
  studySessions: StudySession[];
  timerMode: TimerMode;
  pomodoroCount: number;
  isPomodoroActive: boolean;
  timeLeft: number;
  customTimerDuration: number | null;
  isSaving: boolean;
  customDurations: Record<TimerMode, number | null>;
  isZenModeActive: boolean;
  zenModeStartTime: number | null;
  zenModeAccumulatedTime: number;
}

// Para notificações de conquistas
interface NewAchievementNotification {
  achievement: Achievement;
  xpEarned: number;
}

// Ações para o reducer
type TimerAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'SAVE_SESSION'; name: string }
  | { type: 'SWITCH_MODE'; mode: TimerMode }
  | { type: 'TOGGLE_POMODORO' }
  | { type: 'UPDATE_TIME_DURATION'; duration: number }
  | { type: 'UPDATE_TIME_LEFT'; remaining: number }
  | { type: 'UPDATE_TOTAL_TIME'; time: number }
  | { type: 'INCREMENT_POMODORO' }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'LOAD_STATE'; state: Partial<TimerState> }
  | { type: 'TOGGLE_ZEN_MODE' }
  | { type: 'UPDATE_ZEN_MODE_TIME'; time: number };

// Chaves de armazenamento
const STORAGE_KEYS = {
  TIMER_STATE: 'cole_timer_state',
  STUDY_SESSIONS: 'cole_study_sessions',
};

// Estado inicial
const initialState: TimerState = {
  isRunning: false,
  startTime: null,
  pausedTime: 0,
  totalStudyTime: 0,
  studySessions: [],
  timerMode: 'focus',
  pomodoroCount: 0,
  isPomodoroActive: false,
  timeLeft: 0,
  customTimerDuration: null,
  isSaving: false,
  customDurations: {
    focus: null,
    shortBreak: null,
    longBreak: null
  },
  isZenModeActive: false,
  zenModeStartTime: null,
  zenModeAccumulatedTime: 0
};

// Reducer para gerenciar o estado do timer
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        isRunning: true,
        startTime: Date.now()
      };

    case 'PAUSE_TIMER':
      return {
        ...state,
        isRunning: false,
        pausedTime: state.startTime 
          ? state.pausedTime + (Date.now() - state.startTime) 
          : state.pausedTime,
        startTime: null
      };

    case 'RESET_TIMER':
      return {
        ...state,
        isRunning: false,
        startTime: null,
        pausedTime: 0,
        totalStudyTime: state.customTimerDuration ? -state.customTimerDuration : 0,
      };

    case 'SAVE_SESSION':
      if (state.totalStudyTime <= 0) return state;
      
      const newSession: StudySession = {
        id: Date.now().toString(),
        name: action.name || "Sessão de Estudo",
        duration: Math.abs(state.totalStudyTime),
        date: new Date().toISOString(),
      };
      
      return {
        ...state,
        studySessions: [newSession, ...state.studySessions],
        isRunning: false,
        startTime: null,
        pausedTime: 0,
        totalStudyTime: 0,
        customTimerDuration: null
      };

    case 'SWITCH_MODE':
      return {
        ...state,
        timerMode: action.mode,
        isRunning: false,
        startTime: null,
        pausedTime: 0
      };

    case 'TOGGLE_POMODORO':
      return {
        ...state,
        isPomodoroActive: !state.isPomodoroActive,
        timerMode: 'focus',
        isRunning: false,
        startTime: null,
        pausedTime: 0,
        customTimerDuration: null
      };

    case 'UPDATE_TIME_DURATION':
      if (action.duration <= 0) return state;
      
      if (state.isPomodoroActive) {
        return {
          ...state,
          customDurations: {
            ...state.customDurations,
            [state.timerMode]: action.duration
          },
          timeLeft: action.duration,
          isRunning: false,
          startTime: null,
          pausedTime: 0
        };
      } else {
        return {
          ...state,
          customTimerDuration: action.duration,
          totalStudyTime: -action.duration,
          isRunning: false,
          startTime: null,
          pausedTime: 0
        };
      }

    case 'UPDATE_TIME_LEFT':
      return {
        ...state,
        timeLeft: action.remaining
      };

    case 'UPDATE_TOTAL_TIME':
      return {
        ...state,
        totalStudyTime: action.time
      };

    case 'INCREMENT_POMODORO':
      return {
        ...state,
        pomodoroCount: state.pomodoroCount + 1
      };

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.isSaving
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state
      };

    case 'TOGGLE_ZEN_MODE':
      if (state.isZenModeActive) {
        // Calcular o tempo acumulado ao desativar
        const additionalTime = state.zenModeStartTime 
          ? Date.now() - state.zenModeStartTime 
          : 0;
        return {
          ...state,
          isZenModeActive: false,
          zenModeStartTime: null,
          zenModeAccumulatedTime: state.zenModeAccumulatedTime + additionalTime
        };
      } else {
        return {
          ...state,
          isZenModeActive: true,
          zenModeStartTime: Date.now()
        };
      }
      
    case 'UPDATE_ZEN_MODE_TIME':
      return {
        ...state,
        zenModeAccumulatedTime: action.time
      };

    default:
      return state;
  }
}

type TimerContextType = TimerState & {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  saveSession: (name: string, isScheduledSession?: boolean, scheduledSessionId?: string) => void;
  switchTimerMode: (mode: TimerMode) => void;
  togglePomodoroTimer: () => void;
  updateTimeDuration: (duration: number) => void;
  progress: SharedValue<number>;
  progressAnimation: SharedValue<number>;
  goalProgress: number;
  newAchievement: NewAchievementNotification | null;
  clearNewAchievement: () => void;
  toggleZenMode: () => void;
};

// Criar contexto
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Provider
export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const { settings } = useSettings();
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const goalTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Estado para as notificações de conquistas
  const [newAchievement, setNewAchievement] = useState<NewAchievementNotification | null>(null);
  
  // Limpar a notificação de nova conquista
  const clearNewAchievement = () => {
    setNewAchievement(null);
  };
  
  // Compartilhar valor para animações
  const progress = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  
  // Cálculo para progresso
  const goalProgress = Math.min(
    Math.abs(state.totalStudyTime) / (settings.dailyGoal * 60 * 1000), 
    1
  );
  
  // Obter duração do modo atual
  const getCurrentModeDuration = (mode: TimerMode = state.timerMode): number => {
    // Se há uma duração personalizada para este modo, use-a
    if (state.customDurations[mode] !== null) {
      return state.customDurations[mode] as number;
    }
    
    // Caso contrário, use a duração das configurações
    if (mode === 'focus') {
      return settings.pomodoroSettings.focusTime * 60 * 1000;
    } else if (mode === 'shortBreak') {
      return settings.pomodoroSettings.shortBreak * 60 * 1000;
    } else {
      return settings.pomodoroSettings.longBreak * 60 * 1000;
    }
  };
  
  // Carregar dados salvos
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Carregar estado do timer
        const savedTimerState = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
        if (savedTimerState) {
          const parsedState = JSON.parse(savedTimerState);
          
          // Se o timer estava rodando quando o app foi fechado, calcular tempo adicional
          if (parsedState.isRunning && parsedState.startTime) {
            const timeElapsed = Date.now() - parsedState.startTime;
            parsedState.pausedTime += timeElapsed;
            parsedState.isRunning = false;
            parsedState.startTime = null;
          }
          
          dispatch({ type: 'LOAD_STATE', state: parsedState });
        }
        
        // Carregar sessões de estudo
        const savedSessions = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
        if (savedSessions) {
          dispatch({ 
            type: 'LOAD_STATE', 
            state: { studySessions: JSON.parse(savedSessions) } 
          });
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      }
    };
    
    loadSavedData();
    
    // Configurar listener para mudanças de estado do app
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Iniciar timer de atualização se o timer estiver em execução
    if (state.isRunning && state.startTime) {
      startTimerInterval();
    }
    
    return () => {
      subscription.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (goalTimer.current) {
        clearTimeout(goalTimer.current);
      }
    };
  }, []);
  
  // Salvar estado do timer
  useEffect(() => {
    const saveTimerState = async () => {
      try {
        // Salvar apenas os estados relevantes (evitar dados temporários)
        const stateToSave = {
          isRunning: state.isRunning,
          startTime: state.startTime,
          pausedTime: state.pausedTime,
          totalStudyTime: state.totalStudyTime,
          timerMode: state.timerMode,
          pomodoroCount: state.pomodoroCount,
          isPomodoroActive: state.isPomodoroActive,
          timeLeft: state.timeLeft,
          customTimerDuration: state.customTimerDuration,
          customDurations: state.customDurations
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(stateToSave));
      } catch (error) {
        console.log('Erro ao salvar estado do timer:', error);
      }
    };
    
    saveTimerState();
  }, [state]);
  
  // Salvar sessões de estudo
  useEffect(() => {
    const saveStudySessions = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.STUDY_SESSIONS, 
          JSON.stringify(state.studySessions)
        );
      } catch (error) {
        console.log('Erro ao salvar sessões de estudo:', error);
      }
    };
    
    if (state.studySessions.length > 0) {
      saveStudySessions();
    }
  }, [state.studySessions]);
  
  // Lidar com mudanças de estado do app (background/foreground)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Se o app vai para background e o timer está rodando
    if (
      appState.current === 'active' && 
      nextAppState.match(/inactive|background/) && 
      state.isRunning
    ) {
      // Pausar o timer e salvar o tempo atual
      const now = Date.now();
      const elapsedTime = now - (state.startTime || now);
      
      dispatch({ 
        type: 'PAUSE_TIMER'
      });
      
      // Se o modo Pomodoro estiver ativo, configurar notificação
      if (state.isPomodoroActive) {
        sendPomodoroNotification(state.timerMode, state.timeLeft - elapsedTime);
      } else {
        sendStandardTimerNotification();
      }
    }
    
    // Se o app volta ao foreground
    if (
      appState.current.match(/inactive|background/) && 
      nextAppState === 'active'
    ) {
      // Reiniciar o timer se necessário
      if (intervalRef.current === null && state.isRunning) {
        startTimerInterval();
      }
    }
    
    appState.current = nextAppState;
  };
  
  // Configurar intervalo para atualizar o timer
  const startTimerInterval = () => {
    // Limpar qualquer intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Criar novo intervalo
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      
      // Calcular o tempo decorrido desde o início do timer
      const elapsedTime = state.startTime ? now - state.startTime : 0;
      
      // Atualizar tempo baseado no tipo de timer
      if (state.isPomodoroActive) {
        // Modo Pomodoro
        const currentModeDuration = getCurrentModeDuration();
        let timeRemaining = currentModeDuration - (elapsedTime + state.pausedTime);
        
        // Verificar se o timer chegou a zero
        if (timeRemaining <= 0) {
          clearInterval(intervalRef.current as NodeJS.Timeout);
          intervalRef.current = null;
          
          // Mudar modo automaticamente
          handlePomodoroComplete();
          return;
        }
        
        // Atualizar tempo restante
        dispatch({ type: 'UPDATE_TIME_LEFT', remaining: timeRemaining });
        updateTimerAnimation(timeRemaining, currentModeDuration);
      } else {
        // Modo Standard
        const newTotalTime = state.totalStudyTime + elapsedTime;
        dispatch({ type: 'UPDATE_TOTAL_TIME', time: newTotalTime });
        
        // Verificar se chegou a um timer preset contagem regressiva
        if (state.customTimerDuration && state.totalStudyTime >= 0) {
          // Timer completado
          clearInterval(intervalRef.current as NodeJS.Timeout);
          intervalRef.current = null;
          
          // Parar o timer
          dispatch({ type: 'PAUSE_TIMER' });
          // Opcional: Notificar o usuário
        }
      }
    }, 100); // Atualizar a cada 100ms para maior precisão
  };
  
  // Lidar com a conclusão do Pomodoro
  const handlePomodoroComplete = () => {
    // Parar o timer
    dispatch({ type: 'PAUSE_TIMER' });
    
    const nextMode = getNextPomodoroMode();
    
    // Incrementar contador de pomodoros se um ciclo de foco foi completado
    if (state.timerMode === 'focus') {
      dispatch({ type: 'INCREMENT_POMODORO' });
    }
    
    // Mudar para o próximo modo
    dispatch({ type: 'SWITCH_MODE', mode: nextMode });
    
    // Atualizar o tempo restante para o novo modo
    const nextModeDuration = getCurrentModeDuration(nextMode);
    dispatch({ type: 'UPDATE_TIME_LEFT', remaining: nextModeDuration });
    
    // Tocar som de notificação ou vibrar
    // Aqui você pode adicionar a lógica de notificação
  };
  
  // Determinar o próximo modo do Pomodoro
  const getNextPomodoroMode = (): TimerMode => {
    if (state.timerMode === 'focus') {
      // Após 'focus', verificar se deve ser pausa longa ou curta
      const isLongBreakTime = (state.pomodoroCount + 1) % settings.pomodoroSettings.sessionsBeforeLongBreak === 0;
      return isLongBreakTime ? 'longBreak' : 'shortBreak';
    } else {
      // Após qualquer pausa, voltar ao foco
      return 'focus';
    }
  };
  
  // Atualizar animação do timer
  const updateTimerAnimation = (timeRemaining: number, total: number) => {
    progress.value = Math.max(0, timeRemaining / total);
    progressAnimation.value = withTiming(progress.value, { duration: 200 });
  };
  
  // Ações do timer
  const startTimer = () => {
    if (!state.isRunning) {
      dispatch({ type: 'START_TIMER' });
      
      // Configurar timer no modo Pomodoro se necessário
      if (state.isPomodoroActive && state.timeLeft <= 0) {
        const currentModeDuration = getCurrentModeDuration();
        dispatch({ type: 'UPDATE_TIME_LEFT', remaining: currentModeDuration });
      }
      
      startTimerInterval();
    }
  };
  
  const pauseTimer = () => {
    if (state.isRunning) {
      dispatch({ type: 'PAUSE_TIMER' });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };
  
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    dispatch({ type: 'RESET_TIMER' });
    
    // Reiniciar o timer do Pomodoro se necessário
    if (state.isPomodoroActive) {
      const currentModeDuration = getCurrentModeDuration();
      dispatch({ type: 'UPDATE_TIME_LEFT', remaining: currentModeDuration });
      
      // Resetar a animação
      progress.value = 1;
      progressAnimation.value = withTiming(1, { duration: 300 });
    }
  };
  
  const saveSession = async (name: string, isScheduledSession = false, scheduledSessionId?: string) => {
    try {
      dispatch({ type: 'SET_SAVING', isSaving: true });
      
      // Create session with relevant data
      const newSession: StudySession = {
        id: Date.now().toString(),
        name: name || "Sessão de Estudo",
        duration: Math.abs(state.totalStudyTime),
        date: new Date().toISOString(),
        isScheduledSession,
        scheduledSessionId
      };
      
      // Update achievements
      const achievementResult = await updateAchievements(
        newSession, 
        state.zenModeAccumulatedTime,
        isScheduledSession,
        scheduledSessionId
      );
      
      // Set new achievement notification if any
      if (achievementResult.newlyCompletedAchievements.length > 0) {
        const firstAchievement = achievementResult.newlyCompletedAchievements[0];
        setNewAchievement({
          achievement: firstAchievement as Achievement,
          xpEarned: firstAchievement.xpReward
        });
      }
      
      // Save and update state
      await AsyncStorage.setItem(
        STORAGE_KEYS.STUDY_SESSIONS,
        JSON.stringify([newSession, ...state.studySessions])
      );
      
      dispatch({ type: 'SAVE_SESSION', name });
      
      // Reset zen mode accumulated time
      if (state.zenModeAccumulatedTime > 0) {
        dispatch({ type: 'UPDATE_ZEN_MODE_TIME', time: -state.zenModeAccumulatedTime });
      }
      
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      dispatch({ type: 'SET_SAVING', isSaving: false });
    }
  };
  
  const switchTimerMode = (mode: TimerMode) => {
    if (state.timerMode !== mode) {
      dispatch({ type: 'SWITCH_MODE', mode });
      
      // Atualizar tempo restante para o novo modo se estiver no Pomodoro
      if (state.isPomodoroActive) {
        const newModeDuration = getCurrentModeDuration(mode);
        dispatch({ type: 'UPDATE_TIME_LEFT', remaining: newModeDuration });
      }
    }
  };
  
  const togglePomodoroTimer = () => {
    dispatch({ type: 'TOGGLE_POMODORO' });
    
    if (!state.isPomodoroActive) {
      // Mudando para modo Pomodoro
      const focusDuration = getCurrentModeDuration('focus');
      dispatch({ type: 'UPDATE_TIME_LEFT', remaining: focusDuration });
    }
  };
  
  const updateTimeDuration = (duration: number) => {
    // Converter minutos para milisegundos
    const durationMs = duration * 60 * 1000;
    dispatch({ type: 'UPDATE_TIME_DURATION', duration: durationMs });
    
    // Atualizar valores de animação
    if (state.isPomodoroActive) {
      progress.value = 1;
      progressAnimation.value = withTiming(1, { duration: 300 });
    }
  };
  
  // Toggle modo zen
  const toggleZenMode = () => {
    dispatch({ type: 'TOGGLE_ZEN_MODE' });
  };
  
  // Retornar o contexto
  return (
    <TimerContext.Provider
      value={{
        ...state,
        startTimer,
        pauseTimer,
        resetTimer,
        saveSession,
        switchTimerMode,
        togglePomodoroTimer,
        updateTimeDuration,
        progress,
        progressAnimation,
        goalProgress,
        newAchievement,
        clearNewAchievement,
        toggleZenMode
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

// Hook para acessar o contexto
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer deve ser usado dentro de um TimerProvider');
  }
  return context;
};