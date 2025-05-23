import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Button, useTheme, Text, IconButton } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming
} from 'react-native-reanimated';

const AnimatedButton = Animated.createAnimatedComponent(Pressable);

// Componente para o botão de Modo Pomodoro
const PomodoroModeButtons = React.memo(({ 
  timerMode, 
  switchTimerMode 
}: { 
  timerMode: string, 
  switchTimerMode: (mode: any) => void 
}) => {
  const theme = useTheme();
  
  return (
    <View style={[
      styles.modeSelector,
      {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderColor: theme.colors.outline,
        borderWidth: 1,
      }
    ]}>
      <Button
        mode={timerMode === 'focus' ? 'contained' : 'outlined'}
        onPress={() => switchTimerMode('focus')}
        style={[
          styles.modeButton,
          timerMode === 'focus' ? { backgroundColor: theme.colors.primary } : null
        ]}
        labelStyle={{ 
          color: timerMode === 'focus' ? theme.colors.onPrimary : theme.colors.primary,
        }}
        compact
      >
        Foco
      </Button>
      <Button
        mode={timerMode === 'shortBreak' ? 'contained' : 'outlined'}
        onPress={() => switchTimerMode('shortBreak')}
        style={[
          styles.modeButton,
          timerMode === 'shortBreak' ? { backgroundColor: theme.colors.primary } : null
        ]}
        labelStyle={{ 
          color: timerMode === 'shortBreak' ? theme.colors.onPrimary : theme.colors.primary,
        }}
        compact
      >
        Pausa Curta
      </Button>
      <Button
        mode={timerMode === 'longBreak' ? 'contained' : 'outlined'}
        onPress={() => switchTimerMode('longBreak')}
        style={[
          styles.modeButton,
          timerMode === 'longBreak' ? { backgroundColor: theme.colors.primary } : null
        ]}
        labelStyle={{ 
          color: timerMode === 'longBreak' ? theme.colors.onPrimary : theme.colors.primary,
        }}
        compact
      >
        Pausa Longa
      </Button>
    </View>
  );
});

// Componente para botões de ação secundários
const ActionButtons = React.memo(({ 
  resetTimer, 
  togglePomodoroTimer, 
  isPomodoroActive,
  buttonAnimStyle
}: { 
  resetTimer: () => void,
  togglePomodoroTimer: () => void,
  isPomodoroActive: boolean,
  buttonAnimStyle: any
}) => {
  const theme = useTheme();
  
  // Button press animation
  const animatePress = useCallback(() => {
    // Esta função é implementada fora, aqui apenas um placeholder
  }, []);
  
  return (
    <View style={styles.controlsRow}>
      {/* Reset button */}
      <AnimatedButton
        style={[
          styles.iconButtonContainer,
          buttonAnimStyle,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderWidth: 1
          }
        ]}
        onPress={resetTimer}
      >
        <IconButton
          icon="refresh"
          size={24}
          iconColor={theme.colors.primary}
        />
        <Text style={[
          styles.iconButtonLabel, 
          { color: theme.colors.primary }
        ]}>
          Reiniciar
        </Text>
      </AnimatedButton>

      {/* Timer mode toggle */}
      <AnimatedButton
        style={[
          styles.iconButtonContainer,
          buttonAnimStyle,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderWidth: 1
          }
        ]}
        onPress={togglePomodoroTimer}
      >
        <IconButton
          icon={isPomodoroActive ? "timer" : "timer-sand"}
          size={24}
          iconColor={theme.colors.primary}
        />
        <Text style={[
          styles.iconButtonLabel, 
          { color: theme.colors.primary }
        ]}>
          {isPomodoroActive ? "Normal" : "Pomodoro"}
        </Text>
      </AnimatedButton>
    </View>
  );
});

// Componente principal
const TimerControls: React.FC = () => {
  const { 
    isRunning, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    timerMode,
    switchTimerMode,
    isPomodoroActive,
    togglePomodoroTimer
  } = useTimer();
  const theme = useTheme();

  // Animation values
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const actionButtonScale = useSharedValue(1);
  
  // Button press animation
  const animatePress = useCallback(() => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  }, [buttonScale]);
  
  // Start/pause button animation
  const playButtonAnimation = useCallback(() => {
    actionButtonScale.value = withSequence(
      withSpring(1.15, { damping: 4 }),
      withSpring(1, { damping: 10 })
    );
  }, [actionButtonScale]);

  // Animated styles
  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  }, [buttonScale, buttonOpacity]);
  
  const actionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: actionButtonScale.value }],
    };
  }, [actionButtonScale]);

  // Handlers
  const handleTogglePomodoroMode = useCallback(() => {
    animatePress();
    togglePomodoroTimer();
  }, [animatePress, togglePomodoroTimer]);
  
  const handleReset = useCallback(() => {
    resetTimer();
    animatePress();
  }, [resetTimer, animatePress]);
  
  const handlePause = useCallback(() => {
    pauseTimer();
    playButtonAnimation();
  }, [pauseTimer, playButtonAnimation]);
  
  const handleStart = useCallback(() => {
    startTimer();
    playButtonAnimation();
  }, [startTimer, playButtonAnimation]);

  return (
    <View style={styles.container}>
      {/* Main play/pause button */}
      <Animated.View style={[styles.mainButtonContainer, actionButtonStyle]}>
        {isRunning ? (
          <Button
            mode="contained"
            onPress={handlePause}
            style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
            icon="pause"
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          >
            Pausar
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleStart}
            style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
            icon="play"
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          >
            Iniciar
          </Button>
        )}
      </Animated.View>

      {/* Action buttons (reset and toggle mode) */}
      <ActionButtons 
        resetTimer={handleReset}
        togglePomodoroTimer={handleTogglePomodoroMode}
        isPomodoroActive={isPomodoroActive}
        buttonAnimStyle={buttonAnimStyle}
      />

      {/* Timer mode selection for Pomodoro */}
      {isPomodoroActive && (
        <PomodoroModeButtons 
          timerMode={timerMode} 
          switchTimerMode={switchTimerMode} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  mainButtonContainer: {
    marginBottom: 20,
  },
  mainButton: {
    borderRadius: 30,
    minWidth: 160,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    height: 50,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  iconButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    margin: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconButtonLabel: {
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
    fontWeight: '500',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 8,
    elevation: 1,
    width: '95%',
    maxWidth: 380,
  },
  modeButton: {
    marginHorizontal: 4,
    borderRadius: 20,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});

export default React.memo(TimerControls); 