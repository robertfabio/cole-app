import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTime } from '../utils/timeFormat';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface MinimalTimerScreenProps {
  onClose: () => void;
}

const MinimalTimerScreen: React.FC<MinimalTimerScreenProps> = ({ onClose }) => {
  const {
    totalStudyTime,
    isRunning,
    isPomodoroActive,
    timerMode,
    timeLeft,
    startTimer,
    pauseTimer,
    resetTimer
  } = useTimer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.6);
  
  // Configurar orientação da tela para paisagem
  useEffect(() => {
    const setupOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    
    setupOrientation();
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  
  // Animar o timer quando estiver rodando
  useEffect(() => {
    if (isRunning) {
      scale.value = withSpring(1.05, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 500 });
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.6, { duration: 1000 })
        ),
        -1, // Repetir infinitamente
        true // Reverter
      );
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(0.8, { duration: 500 });
      pulseOpacity.value = 0.6;
    }
  }, [isRunning]);
  
  // Estilo animado para o timer
  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  // Estilo animado para o pulso
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));
  
  // Formatar minutos e segundos do Pomodoro
  const formatPomodoroTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Formatar tempo para o timer padrão
  const formatStandardTime = (ms: number) => {
    if (ms < 0) {
      return formatTime(Math.abs(ms));
    } else {
      return formatTime(ms);
    }
  };
  
  // Obter título do modo do timer
  const getTimerModeTitle = () => {
    switch (timerMode) {
      case 'focus':
        return 'Foco';
      case 'shortBreak':
        return 'Pausa Curta';
      case 'longBreak':
        return 'Pausa Longa';
      default:
        return 'Foco';
    }
  };
  
  // Obter cor baseada no modo do timer
  const getTimerModeColor = () => {
    switch (timerMode) {
      case 'focus':
        return theme.colors.primary;
      case 'shortBreak':
        return theme.colors.tertiary;
      case 'longBreak':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      <StatusBar hidden={true} />
      
      {/* Pulso de fundo */}
      <Animated.View 
        style={[styles.pulseBackground, pulseAnimatedStyle, { 
          backgroundColor: getTimerModeColor(),
        }]}
      />
      
      {/* Conteúdo do Timer */}
      <Animated.View 
        style={[styles.timerContainer, timerAnimatedStyle]}
        entering={FadeIn.duration(800)}
        exiting={FadeOut.duration(300)}
      >
        {isPomodoroActive ? (
          <View style={styles.pomodoroContainer}>
            <Text style={[styles.modeTitle, { color: '#FFFFFF' }]}>
              {getTimerModeTitle()}
            </Text>
            <Text style={[styles.timerText, { color: '#FFFFFF' }]}>
              {formatPomodoroTime(timeLeft)}
            </Text>
          </View>
        ) : (
          <View style={styles.standardContainer}>
            <Text style={[styles.timerText, { color: '#FFFFFF' }]}>
              {formatStandardTime(totalStudyTime)}
            </Text>
          </View>
        )}
      </Animated.View>
      
      {/* Controles minimalistas */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={isRunning ? pauseTimer : startTimer}
        >
          <MaterialCommunityIcons 
            name={isRunning ? "pause" : "play"} 
            size={36} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={resetTimer}
        >
          <MaterialCommunityIcons 
            name="refresh" 
            size={36} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={onClose}
        >
          <MaterialCommunityIcons 
            name="fullscreen-exit" 
            size={36} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 0,
    opacity: 0.2,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pomodoroContainer: {
    alignItems: 'center',
  },
  standardContainer: {
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  timerText: {
    fontSize: 140,
    fontWeight: '200', // Mais fino para um visual minimalista
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

export default MinimalTimerScreen;