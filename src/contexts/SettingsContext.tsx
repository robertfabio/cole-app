import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';
type TimerType = 'standard' | 'pomodoro';

interface Settings {
  theme: Theme;
  timerType: TimerType;
  pomodoroSettings: {
    focusTime: number; // minutes
    shortBreak: number; // minutes
    longBreak: number; // minutes
    sessionsBeforeLongBreak: number;
  };
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  dailyGoal: number; // minutes
}

interface SettingsContextProps {
  settings: Settings;
  updateTheme: (theme: Theme) => void;
  updateTimerType: (timerType: TimerType) => void;
  updatePomodoroSettings: (settings: Settings['pomodoroSettings']) => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
  updateDailyGoal: (minutes: number) => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  timerType: 'standard',
  pomodoroSettings: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
  },
  soundEnabled: true,
  notificationsEnabled: true,
  dailyGoal: 120, // 2 hours default
};

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [settings]);

  const updateTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateTimerType = (timerType: TimerType) => {
    setSettings(prev => ({ ...prev, timerType }));
  };

  const updatePomodoroSettings = (pomodoroSettings: Settings['pomodoroSettings']) => {
    setSettings(prev => ({ ...prev, pomodoroSettings }));
  };

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  };

  const updateDailyGoal = (dailyGoal: number) => {
    setSettings(prev => ({ ...prev, dailyGoal }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTheme,
        updateTimerType,
        updatePomodoroSettings,
        toggleSound,
        toggleNotifications,
        updateDailyGoal,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextProps => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 