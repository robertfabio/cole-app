import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './SettingsContext';
import * as Animatable from 'react-native-animatable';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { sendPomodoroNotification, sendStandardTimerNotification } from '../services/NotificationService';

// Timer modes
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

// Define types for our context
type TimerContextType = {
  isRunning: boolean;
  startTime: number | null;
  pausedTime: number;
  totalStudyTime: number;
  studySessions: StudySession[];
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  saveSession: (name: string) => void;
  timerMode: TimerMode;
  pomodoroCount: number;
  switchTimerMode: (mode: TimerMode) => void;
  progress: SharedValue<number>;
  progressAnimation: SharedValue<number>;
  timeLeft: number;
  goalProgress: number;
  isPomodoroActive: boolean;
  togglePomodoroTimer: () => void;
  updateTimeDuration: (duration: number) => void;
  customTimerDuration: number | null;
  isSaving: boolean;
};

export type StudySession = {
  id: string;
  name: string;
  duration: number; // Duration in milliseconds
  date: string;
  tags?: string[];
  category?: string;
};

// Create the context with default values
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  TIMER_STATE: 'cole_timer_state',
  STUDY_SESSIONS: 'cole_study_sessions',
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const timerModeRef = useRef<TimerMode>('focus');
  
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [customTimerDuration, setCustomTimerDuration] = useState<number | null>(null);
  
  // Para armazenar durações personalizadas
  const [customDurations, setCustomDurations] = useState<Record<TimerMode, number | null>>({
    focus: null,
    shortBreak: null,
    longBreak: null
  });
  
  // Animation values
  const progress = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const [goalProgress, setGoalProgress] = useState(0);

  // Update reference when timerMode changes
  useEffect(() => {
    timerModeRef.current = timerMode;
  }, [timerMode]);

  // Get current timer duration based on settings and mode
  const getCurrentModeDuration = (mode: TimerMode = timerMode): number => {
    // Se existir uma duração personalizada para este modo, use-a
    if (customDurations[mode] !== null) {
      return customDurations[mode] as number;
    }
    
    // Caso contrário, use as configurações padrão
    const { pomodoroSettings } = settings;
    switch (mode) {
      case 'focus':
        return pomodoroSettings.focusTime * 60 * 1000; // convert minutes to ms
      case 'shortBreak':
        return pomodoroSettings.shortBreak * 60 * 1000;
      case 'longBreak':
        return pomodoroSettings.longBreak * 60 * 1000;
      default:
        return pomodoroSettings.focusTime * 60 * 1000;
    }
  };

  // Load saved data when the app starts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const timerStateJSON = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
        const sessionsJSON = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);

        if (timerStateJSON) {
          const timerState = JSON.parse(timerStateJSON);
          setPausedTime(timerState.pausedTime || 0);
          setTotalStudyTime(timerState.totalStudyTime || 0);
          
          // Carregar o modo do timer
          const savedMode = timerState.timerMode || 'focus';
          setTimerMode(savedMode);
          timerModeRef.current = savedMode;
          
          setPomodoroCount(timerState.pomodoroCount || 0);
          
          // Carregar o estado ativo do Pomodoro e inicializar o tempo restante
          const isPomodoro = timerState.isPomodoroActive || false;
          setIsPomodoroActive(isPomodoro);
          
          // Carregar durações personalizadas, se existirem
          if (timerState.customDurations) {
            setCustomDurations(timerState.customDurations);
          }
          
          if (timerState.customTimerDuration) {
            setCustomTimerDuration(timerState.customTimerDuration);
          }
          
          if (isPomodoro) {
            const duration = getCurrentModeDuration(savedMode);
            setTimeLeft(duration);
            // Também atualizar o progresso visual para combinar
            progress.value = 0;
            progressAnimation.value = 0;
          }
        }

        if (sessionsJSON) {
          setStudySessions(JSON.parse(sessionsJSON));
        }
      } catch (error) {
        console.error('Error loading saved timer data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save timer state when it changes
  useEffect(() => {
    const saveTimerState = async () => {
      try {
        const timerState = {
          pausedTime,
          totalStudyTime,
          timerMode,
          pomodoroCount,
          isPomodoroActive,
          customDurations,
          customTimerDuration,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(timerState));
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    };

    saveTimerState();
  }, [pausedTime, totalStudyTime, timerMode, pomodoroCount, isPomodoroActive, customDurations, customTimerDuration]);

  // Save study sessions when they change
  useEffect(() => {
    const saveStudySessions = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(studySessions));
      } catch (error) {
        console.error('Error saving study sessions:', error);
      }
    };

    saveStudySessions();
  }, [studySessions]);

  // Update time and progress when timer is running
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime + pausedTime;
        
        // Para o timer do pomodoro
        if (isPomodoroActive) {
          const currentModeDuration = getCurrentModeDuration(timerModeRef.current);
          const remaining = Math.max(0, currentModeDuration - elapsedTime);
          setTimeLeft(remaining);
          
          // Update progress animation
          const newProgress = 1 - (remaining / currentModeDuration);
          progress.value = newProgress;
          progressAnimation.value = newProgress;
          
          // Auto-switch to next mode when timer finishes
          if (remaining <= 0) {
            // Pause the timer
            pauseTimer();
            
            // Switch to next mode
            if (timerModeRef.current === 'focus') {
              // If we were in focus mode, count a completed pomodoro
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              
              // Track study time when focus session is completed
              if (elapsedTime > 0) {
                setTotalStudyTime(totalStudyTime + elapsedTime);
              }
              
              // Check if it's time for a long break
              const nextMode = newCount % settings.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
              
              // Enviar notificação se estiver habilitado
              if (settings.notificationsEnabled) {
                // Passar o tempo de estudo para a notificação
                sendPomodoroNotification(nextMode, totalStudyTime);
              }
              
              switchTimerMode(nextMode);
            } else {
              // After any break, go back to focus
              
              // Enviar notificação se estiver habilitado
              if (settings.notificationsEnabled) {
                // Passar o tempo de estudo para a notificação
                sendPomodoroNotification('focus', totalStudyTime);
              }
              
              switchTimerMode('focus');
          }
        } 
        // Timer padrão
        else {
          // Se temos um timer personalizado definido, comportamento de contagem regressiva
          if (customTimerDuration !== null) {
            const remaining = Math.max(0, customTimerDuration - elapsedTime);
            setTotalStudyTime(-remaining); // Mantemos o valor negativo para indicar contagem regressiva
            
            // Se o timer chegou a zero
            if (remaining <= 0) {
              pauseTimer();
              setTotalStudyTime(elapsedTime); // Registrar o tempo total de estudo
              setCustomTimerDuration(null);   // Limpar a duração personalizada
              
              // Enviar notificação se estiver habilitado
              if (settings.notificationsEnabled) {
                // Passar o tempo de estudo para a notificação
                sendStandardTimerNotification(elapsedTime);
              }
            }
          } 
          // Timer padrão normal (progressivo)
          else {
            setTotalStudyTime(elapsedTime);
          }

          // Calcular progresso diário, independente do modo
          const dailyGoalMs = settings.dailyGoal * 60 * 1000;
          const newGoalProgress = Math.min(elapsedTime / dailyGoalMs, 1);
          setGoalProgress(newGoalProgress);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, startTime, pausedTime, isPomodoroActive, timerMode, settings, totalStudyTime, pomodoroCount, customTimerDuration]);

  // Função para permitir ao usuário definir manualmente a duração do timer
  const updateTimeDuration = (duration: number) => {
    if (duration <= 0) return;
    
    // Pausar o timer se estiver rodando
    if (isRunning) {
      pauseTimer();
    }
    
    if (isPomodoroActive) {
      // Atualizar a duração personalizada para o modo atual
      setCustomDurations({
        ...customDurations,
        [timerMode]: duration
      });
      
      // Atualizar o tempo restante
      setTimeLeft(duration);
      progress.value = 0;
      progressAnimation.value = 0;
    } else {
      // No modo padrão, reiniciar o contador e armazenar a duração
      resetTimer();
      
      // Armazenar a duração personalizada para o timer padrão
      setCustomTimerDuration(duration);
      
      // Inicializar a contagem regressiva
      setTotalStudyTime(-duration); // Valor negativo para contagem regressiva
    }
  };

  // Handle switching between timer modes
  const switchTimerMode = (mode: TimerMode) => {
    setTimerMode(mode);
    timerModeRef.current = mode;
    resetTimer();
    
    // Ao mudar o modo, definir imediatamente o tempo restante para o novo modo
    if (isPomodoroActive) {
      const duration = getCurrentModeDuration(mode);
      setTimeLeft(duration);
      progress.value = 0;
      progressAnimation.value = 0;
    }
  };

  // Toggle between standard and pomodoro timers
  const togglePomodoroTimer = () => {
    const newPomodoroActive = !isPomodoroActive;
    setIsPomodoroActive(newPomodoroActive);
    
    // Redefinir o modo para foco ao alternar
    setTimerMode('focus');
    timerModeRef.current = 'focus';
    
    // Limpar timer personalizado ao alternar
    setCustomTimerDuration(null);
    
    // Reiniciar o timer
    resetTimer();
    
    // Se estiver ativando o pomodoro, inicializar o tempo restante
    if (newPomodoroActive) {
      const duration = getCurrentModeDuration('focus');
      setTimeLeft(duration);
      progress.value = 0;
      progressAnimation.value = 0;
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    
    // Se estiver no modo Pomodoro e o tempo restante ainda não foi definido,
    // inicialize-o com a duração correta do modo atual
    if (isPomodoroActive && timeLeft <= 0) {
      const duration = getCurrentModeDuration(timerModeRef.current);
      setTimeLeft(duration);
      progress.value = 0;
      progressAnimation.value = 0;
    } else if (!isPomodoroActive && customTimerDuration) {
      // Iniciar a contagem regressiva do timer personalizado
      setTotalStudyTime(-customTimerDuration);
    }
  };

  const pauseTimer = () => {
    if (isRunning && startTime) {
      const currentTime = Date.now();
      const newPausedTime = pausedTime + (currentTime - startTime);
      setPausedTime(newPausedTime);
      setIsRunning(false);
      setStartTime(null);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setPausedTime(0);
    
    if (isPomodoroActive) {
      // Atualizar o timeLeft com base no modo atual
      const duration = getCurrentModeDuration(timerModeRef.current);
      setTimeLeft(duration);
      progress.value = 0;
      progressAnimation.value = 0;
    } else if (customTimerDuration) {
      // Resetar para o tempo personalizado como contagem regressiva
      setTotalStudyTime(-customTimerDuration);
    } else {
      // Timer padrão normal
      setTotalStudyTime(0);
    }
  };

  const saveSession = async (name: string) => {
    if (totalStudyTime > 0) {
      try {
        setIsSaving(true);
        
        // Criar a nova sessão
        const newSession: StudySession = {
          id: Date.now().toString(),
          name: name || "Sessão de Estudo",
          duration: Math.abs(totalStudyTime), // Sempre usar valor positivo
          date: new Date().toISOString(),
        };

        // Atualizar o estado
        const updatedSessions = [newSession, ...studySessions];
        setStudySessions(updatedSessions);
        
        // Salvar no armazenamento de forma síncrona
        try {
          await AsyncStorage.setItem(
            STORAGE_KEYS.STUDY_SESSIONS, 
            JSON.stringify(updatedSessions)
          );
        } catch (storageError) {
          console.error('Erro ao salvar sessões:', storageError);
        }
        
        // Resetar o timer depois de salvar
        resetTimer();
        
        // Limpar qualquer timer personalizado
        setCustomTimerDuration(null);
      } catch (error) {
        console.error('Erro ao salvar sessão:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        startTime,
        pausedTime,
        totalStudyTime,
        studySessions,
        startTimer,
        pauseTimer,
        resetTimer,
        saveSession,
        timerMode,
        pomodoroCount,
        switchTimerMode,
        progress,
        progressAnimation,
        timeLeft,
        goalProgress,
        isPomodoroActive,
        togglePomodoroTimer,
        updateTimeDuration,
        customTimerDuration,
        isSaving,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

// Custom hook to use the timer context
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};