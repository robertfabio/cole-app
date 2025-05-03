import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerMode } from './TimerContext';

// Types
export interface ScheduleSession {
  id: string;
  name: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "HH:MM" format
  duration: number; // in minutes
  mode: TimerMode;
  isEnabled: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  tags?: string[];
  color?: string;
}

export interface ScheduleState {
  sessions: ScheduleSession[];
  nextSession: ScheduleSession | null;
  isLoading: boolean;
  lastCalculated: number | null;
}

// Initial state
const initialState: ScheduleState = {
  sessions: [],
  nextSession: null,
  isLoading: true,
  lastCalculated: null
};

// Actions
type ScheduleAction =
  | { type: 'ADD_SESSION'; session: ScheduleSession }
  | { type: 'UPDATE_SESSION'; id: string; session: Partial<ScheduleSession> }
  | { type: 'DELETE_SESSION'; id: string }
  | { type: 'SET_SESSIONS'; sessions: ScheduleSession[] }
  | { type: 'SET_NEXT_SESSION'; session: ScheduleSession | null }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_LAST_CALCULATED'; timestamp: number };

// Storage key
const STORAGE_KEY = 'cole_schedule_sessions';

// Reducer
function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.session]
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session => 
          session.id === action.id ? { ...session, ...action.session } : session
        )
      };
    
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.id)
      };
    
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.sessions
      };
    
    case 'SET_NEXT_SESSION':
      return {
        ...state,
        nextSession: action.session
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading
      };
      
    case 'SET_LAST_CALCULATED':
      return {
        ...state,
        lastCalculated: action.timestamp
      };
    
    default:
      return state;
  }
}

// Context type
type ScheduleContextType = {
  sessions: ScheduleSession[];
  nextSession: ScheduleSession | null;
  isLoading: boolean;
  addSession: (session: Omit<ScheduleSession, 'id'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<ScheduleSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  calculateNextSession: () => Promise<void>;
};

// Create context
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Provider component
export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);
  
  // Load data from storage
  useEffect(() => {
    loadSessions();
  }, []);
  
  // Calculate next session whenever sessions change
  useEffect(() => {
    if (!state.isLoading) {
      // Evita cálculos repetidos em rápida sucessão
      const now = Date.now();
      if (!state.lastCalculated || now - state.lastCalculated > 5000) {
        calculateNextSession();
      }
    }
  }, [state.sessions, state.isLoading]);
  
  // Load sessions from storage
  const loadSessions = async () => {
    try {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      const sessionsJSON = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (sessionsJSON) {
        const sessions = JSON.parse(sessionsJSON);
        dispatch({ type: 'SET_SESSIONS', sessions });
      }
    } catch (error) {
      console.error('Failed to load schedule sessions:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };
  
  // Save sessions to storage
  const saveSessions = async (sessions: ScheduleSession[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save schedule sessions:', error);
    }
  };
  
  // Add a new session
  const addSession = async (sessionData: Omit<ScheduleSession, 'id'>) => {
    const newSession: ScheduleSession = {
      ...sessionData,
      id: Date.now().toString()
    };
    
    dispatch({ type: 'ADD_SESSION', session: newSession });
    await saveSessions([...state.sessions, newSession]);
  };
  
  // Update an existing session
  const updateSession = async (id: string, updates: Partial<ScheduleSession>) => {
    dispatch({ type: 'UPDATE_SESSION', id, session: updates });
    
    const updatedSessions = state.sessions.map(session => 
      session.id === id ? { ...session, ...updates } : session
    );
    
    await saveSessions(updatedSessions);
  };
  
  // Delete a session
  const deleteSession = async (id: string) => {
    dispatch({ type: 'DELETE_SESSION', id });
    
    const filteredSessions = state.sessions.filter(session => session.id !== id);
    await saveSessions(filteredSessions);
  };
  
  // Calculate the next upcoming session
  const calculateNextSession = useCallback(async () => {
    if (state.sessions.length === 0) {
      dispatch({ type: 'SET_NEXT_SESSION', session: null });
      dispatch({ type: 'SET_LAST_CALCULATED', timestamp: Date.now() });
      return;
    }
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Filter to only enabled sessions
    const enabledSessions = state.sessions.filter(session => session.isEnabled);
    
    if (enabledSessions.length === 0) {
      dispatch({ type: 'SET_NEXT_SESSION', session: null });
      dispatch({ type: 'SET_LAST_CALCULATED', timestamp: Date.now() });
      return;
    }
    
    // Find sessions today that haven't started yet
    const todaySessions = enabledSessions
      .filter(session => session.dayOfWeek === currentDay && session.startTime > currentTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    if (todaySessions.length > 0) {
      dispatch({ type: 'SET_NEXT_SESSION', session: todaySessions[0] });
      dispatch({ type: 'SET_LAST_CALCULATED', timestamp: Date.now() });
      return;
    }
    
    // Find the next session in upcoming days
    const futureSessions = [];
    
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const futureDay = (currentDay + dayOffset) % 7;
      const sessionsOnFutureDay = enabledSessions
        .filter(session => session.dayOfWeek === futureDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      if (sessionsOnFutureDay.length > 0) {
        futureSessions.push(sessionsOnFutureDay[0]);
        break;
      }
    }
    
    if (futureSessions.length > 0) {
      dispatch({ type: 'SET_NEXT_SESSION', session: futureSessions[0] });
    } else {
      // If no future sessions, take the earliest one from any day
      const allSortedByDay = [...enabledSessions]
        .sort((a, b) => {
          // Sort by day of week, with the current day being last
          const adjustedDayA = (a.dayOfWeek - currentDay + 7) % 7;
          const adjustedDayB = (b.dayOfWeek - currentDay + 7) % 7;
          
          if (adjustedDayA !== adjustedDayB) {
            return adjustedDayA - adjustedDayB;
          }
          
          // If same day, sort by time
          return a.startTime.localeCompare(b.startTime);
        });
      
      dispatch({ type: 'SET_NEXT_SESSION', session: allSortedByDay[0] || null });
    }
    
    dispatch({ type: 'SET_LAST_CALCULATED', timestamp: Date.now() });
  }, [state.sessions]);
  
  return (
    <ScheduleContext.Provider
      value={{
        sessions: state.sessions,
        nextSession: state.nextSession,
        isLoading: state.isLoading,
        addSession,
        updateSession,
        deleteSession,
        calculateNextSession
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

// Hook to use the Schedule context
export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}; 