import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTime } from '../utils/timeFormat';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface FullscreenTimerScreenProps {
  onClose: () => void;
}

const FullscreenTimerScreen: React.FC<FullscreenTimerScreenProps> = ({ onClose }) => {
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
      scale.value = withSpring(1.05, { damping: 10, stiffness: 100 });
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    }
  }, [isRunning]);
  
  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  // Formatar minutos e segundos do Pomodoro
  const formatPomodoroTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Obter mensagem motivacional com base no modo do timer
  const getMotivationalMessage = () => {
    if (!isRunning) return "Pronto para começar?";
    
    switch (timerMode) {
      case 'focus':
        return "Concentre-se no que importa!";
      case 'shortBreak':
        return "Um momento para respirar...";
      case 'longBreak':
        return "Descanse bem, você merece!";
      default:
        return "Você está indo muito bem!";
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
  
  // Formatar tempo para o timer padrão
  const formatStandardTime = (ms: number) => {
    if (ms < 0) {
      return formatTime(Math.abs(ms));
    } else {
      return formatTime(ms);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar hidden={true} />
      
      {/* Conteúdo do Timer */}
      <Animated.View 
        style={[styles.timerContainer, animatedStyle]}
        entering={FadeIn.duration(500)}
      >
        {isPomodoroActive ? (
          <View style={styles.pomodoroContainer}>
            <Text style={[styles.modeTitle, { color: theme.colors.primary }]}>
              {getTimerModeTitle()}
            </Text>
            <Text style={[styles.timerText, { color: theme.colors.primary }]}>
              {formatPomodoroTime(timeLeft)}
            </Text>
          </View>
        ) : (
          <View style={styles.standardContainer}>
            <Text style={[styles.timerText, { color: theme.colors.primary }]}>
              {formatStandardTime(totalStudyTime)}
            </Text>
          </View>
        )}
        
        <Text style={[styles.motivationalText, { color: theme.colors.secondary }]}>
          {getMotivationalMessage()}
        </Text>
      </Animated.View>
      
      {/* Controles */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 10 }]}>
        <IconButton
          icon={isRunning ? "pause" : "play"}
          iconColor={theme.colors.primary}
          size={48}
          onPress={isRunning ? pauseTimer : startTimer}
          style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
        />
        <IconButton
          icon="refresh"
          iconColor={theme.colors.primary}
          size={48}
          onPress={resetTimer}
          style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
        />
        <IconButton
          icon="fullscreen-exit"
          iconColor={theme.colors.primary}
          size={48}
          onPress={onClose}
          style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
        />
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
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timerText: {
    fontSize: 120,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  motivationalText: {
    fontSize: 24,
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
  controls: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    margin: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default FullscreenTimerScreen;