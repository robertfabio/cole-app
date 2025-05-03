import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeWithSeconds, formatPomodoroTime } from '../utils/timeFormat';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface MinimalTimerScreenProps {
  onClose: () => void;
}

const MinimalTimerScreen: React.FC<MinimalTimerScreenProps> = React.memo(({ onClose }) => {
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.8);
  
  // Configurar efeito de entrada
  useEffect(() => {
    opacity.value = withTiming(0.9, { duration: 500 });
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, []);
  
  // Animar o timer quando estiver rodando
  useEffect(() => {
    if (isRunning) {
      scale.value = withTiming(1.05, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.9, { duration: 300 });
    }
  }, [isRunning]);
  
  // Configurar gesto de arrastar
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      // Aumentar opacidade ao arrastar
      opacity.value = withTiming(1, { duration: 100 });
    })
    .onEnd((e) => {
      // Verificar limites da tela
      const maxX = width - 150;
      const maxY = height - 150;
      
      // Calcular posição final com limites
      const finalX = Math.min(Math.max(translateX.value, -width/2 + 75), maxX/2);
      const finalY = Math.min(Math.max(translateY.value, -height/2 + 75 + insets.top), maxY/2 - insets.bottom);
      
      // Aplicar animação spring para a posição final
      translateX.value = withSpring(finalX, { damping: 15 });
      translateY.value = withSpring(finalY, { damping: 15 });
      
      // Reduzir opacidade após soltar
      opacity.value = withTiming(0.9, { duration: 300 });
    });
  
  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value
  }));
  
  // Formatação do tempo
  const formatDisplayTime = useCallback(() => {
    if (isPomodoroActive) {
      return formatPomodoroTime(timeLeft);
    } else {
      if (totalStudyTime < 0) {
        return formatTimeWithSeconds(Math.abs(totalStudyTime));
      } else {
        return formatTimeWithSeconds(totalStudyTime);
      }
    }
  }, [isPomodoroActive, timeLeft, totalStudyTime]);

  // Obter o título do modo
  const getModeTitle = useCallback(() => {
    if (!isPomodoroActive) return "Timer";
    
    switch (timerMode) {
      case 'focus': return "Foco";
      case 'shortBreak': return "Pausa";
      case 'longBreak': return "Descanso";
      default: return "Timer";
    }
  }, [isPomodoroActive, timerMode]);
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          style={[
            styles.floatingTimer, 
            animatedStyle,
            { 
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            }
          ]}
          entering={FadeIn.duration(500)}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.modeTitle, { color: theme.colors.onPrimary }]}>
              {getModeTitle()}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconButton 
                icon="close" 
                size={16} 
                iconColor={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.timerText, { color: theme.colors.onPrimary }]}>
            {formatDisplayTime()}
          </Text>
          
          <View style={styles.controls}>
            <IconButton
              icon={isRunning ? "pause" : "play"}
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={isRunning ? pauseTimer : startTimer}
              style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            />
            <IconButton
              icon="refresh"
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={resetTimer}
              style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  floatingTimer: {
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    width: 180,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    marginRight: -4,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginVertical: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    margin: 4,
    borderRadius: 20,
  },
});

export default MinimalTimerScreen;