import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, useTheme, Button, IconButton, Surface, Portal } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTime, formatPomodoroTime } from '../utils/timeFormat';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import FullscreenTimerScreen from '../screens/FullscreenTimerScreen';
import MinimalTimerScreen from '../screens/MinimalTimerScreen';

const { width, height } = Dimensions.get('window');

// Componente para o modal de definição de tempo
const TimeSetModal = React.memo(({ 
  visible, 
  onClose, 
  onSubmit 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (minutes: number) => void;
}) => {
  const [presetMinutes, setPresetMinutes] = useState('25');
  const theme = useTheme();

  const handlePresetTime = () => {
    const minutes = parseInt(presetMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 120) {
      onSubmit(minutes);
      setPresetMinutes('25'); // Reset para o valor padrão
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Surface style={[styles.modalContent, { 
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
          }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
              Definir Tempo Personalizado
            </Text>
            <TextInput
              style={[styles.timeInput, { 
                borderColor: theme.colors.outline,
                color: theme.colors.onSurface,
                backgroundColor: theme.colors.background,
              }]}
              keyboardType="number-pad"
              placeholder="Minutos (1-120)"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={presetMinutes}
              onChangeText={setPresetMinutes}
              maxLength={3}
            />
            <View style={styles.modalButtonContainer}>
              <Button 
                mode="outlined" 
                onPress={onClose}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handlePresetTime}
                style={styles.modalButton}
              >
                Definir
              </Button>
            </View>
          </Surface>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
});

// Componente para o Timer do Pomodoro
const PomodoroTimer = React.memo(({ 
  timeLeft, 
  timerMode, 
  isRunning, 
  animatedStyle,
  onFullscreen,
  onOpenTimeModal
}: {
  timeLeft: number;
  timerMode: string;
  isRunning: boolean;
  animatedStyle: any;
  onFullscreen: () => void;
  onOpenTimeModal: () => void;
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Get timer mode title
  const getTimerModeTitle = () => {
    switch (timerMode) {
      case 'focus': return 'Foco';
      case 'shortBreak': return 'Pausa Curta';
      case 'longBreak': return 'Pausa Longa';
      default: return 'Foco';
    }
  };

  // Get motivational message based on timer mode
  const getMotivationalMessage = () => {
    if (!isRunning) return "Pronto para começar?";
    
    switch (timerMode) {
      case 'focus': return "Concentre-se no que importa!";
      case 'shortBreak': return "Um momento para respirar...";
      case 'longBreak': return "Descanse bem, você merece!";
      default: return "Você está indo muito bem!";
    }
  };

  // Calculate safe radius to ensure timer fits on screen
  const getCircleRadius = () => {
    const screenWidth = width - (insets.left + insets.right) - 40;
    return Math.min(screenWidth * 0.35, 130);
  };

  return (
    <View style={styles.timerWrapper}>
      <Animated.View 
        style={[
          styles.pomodoroContainer, 
          animatedStyle,
          { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          }
        ]}
        entering={FadeIn.duration(500)}
      >
        <View style={styles.timerModeContainer}>
          <Text 
            style={[
              styles.timerModeTitle, 
              { 
                color: theme.colors.onPrimary,
                textShadowColor: 'rgba(0,0,0,0.2)', 
                textShadowOffset: {width: 1, height: 1}, 
                textShadowRadius: 2,
              }
            ]}
          >
            {getTimerModeTitle()}
          </Text>
          <Text 
            style={[
              styles.timerTimeLeft, 
              { 
                color: theme.colors.onPrimary,
                textShadowColor: 'rgba(0,0,0,0.2)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 3,
              }
            ]}
          >
            {formatPomodoroTime(timeLeft)}
          </Text>
        </View>
        
        <View style={styles.circleProgressContainer}>
          <CircularProgress
            value={0}
            radius={getCircleRadius()}
            duration={800}
            progressValueColor={'transparent'}
            activeStrokeColor={theme.colors.onPrimary}
            inActiveStrokeColor={'rgba(255,255,255,0.3)'}
            inActiveStrokeOpacity={0.5}
            activeStrokeWidth={12}
            inActiveStrokeWidth={12}
            maxValue={100}
          />
        </View>
        
        <Text style={[
          styles.motivationalText, 
          { 
            color: theme.colors.onPrimary,
            fontSize: 18,
            marginTop: 20,
          }
        ]}>
          {getMotivationalMessage()}
        </Text>
      </Animated.View>
      
      <View style={styles.timerActionButtons}>
        <IconButton
          icon="clock-edit-outline"
          iconColor={theme.colors.primary}
          size={24}
          onPress={onOpenTimeModal}
        />
        <IconButton
          icon="fullscreen"
          iconColor={theme.colors.primary}
          size={24}
          onPress={onFullscreen}
        />
      </View>
    </View>
  );
});

// Componente para o Timer Padrão
const StandardTimer = React.memo(({ 
  totalStudyTime,
  customTimerDuration,
  isRunning,
  animatedStyle,
  onFullscreen,
  onOpenTimeModal
}: {
  totalStudyTime: number;
  customTimerDuration: number | null;
  isRunning: boolean;
  animatedStyle: any;
  onFullscreen: () => void;
  onOpenTimeModal: () => void;
}) => {
  const theme = useTheme();
  const isCountdownMode = totalStudyTime < 0;

  // Handle custom duration display for standard timer 
  const formatStandardTime = (ms: number) => {
    // Se o valor for negativo, significa que é uma contagem regressiva
    if (ms < 0) {
      // Converter o valor negativo para positivo para mostrar o tempo restante
      const remainingTime = Math.abs(ms);
      return formatTime(remainingTime);
    } else {
      // Caso contrário, é o tempo acumulado de estudo
      return formatTime(ms);
    }
  };

  return (
    <View style={styles.timerWrapper}>
      <Animated.View style={animatedStyle}>
        <Text 
          style={[
            styles.timerText,
            { color: theme.colors.primary }
          ]}
        >
          {formatStandardTime(totalStudyTime)}
        </Text>
        
        {isCountdownMode && (
          <Text style={[styles.countdownIndicator, { color: theme.colors.secondary }]}>
            ⏱️ Contagem regressiva
          </Text>
        )}
      </Animated.View>
      
      <View style={styles.timerActionButtons}>
        <IconButton
          icon="clock-edit-outline"
          iconColor={theme.colors.primary}
          size={24}
          onPress={onOpenTimeModal}
        />
        <IconButton
          icon="fullscreen"
          iconColor={theme.colors.primary}
          size={24}
          onPress={onFullscreen}
        />
      </View>
      
      {customTimerDuration && (
        <Text style={[styles.customDurationText, { color: theme.colors.secondary }]}>
          Tempo definido: {Math.floor(customTimerDuration / 60000)} min
        </Text>
      )}
    </View>
  );
});

// Componente principal
const TimerDisplay: React.FC = () => {
  const { 
    totalStudyTime, 
    isRunning, 
    isPomodoroActive, 
    timerMode, 
    timeLeft,
    progressAnimation,
    updateTimeDuration,
    startTimer,
    customTimerDuration
  } = useTimer();
  const theme = useTheme();
  
  // Estados para os modais
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [minimalMode, setMinimalMode] = useState(false);
  const [timeSetModalVisible, setTimeSetModalVisible] = useState(false);
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Atualizar animações com base no estado do timer
  useEffect(() => {
    if (isRunning) {
      scale.value = withSpring(1.05, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 500 });
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(0.95, { duration: 500 });
    }
  }, [isRunning, scale, opacity]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Handlers
  const handleTimeSet = useCallback((minutes: number) => {
    const ms = minutes * 60 * 1000;
    updateTimeDuration(ms);
    setTimeSetModalVisible(false);
  }, [updateTimeDuration]);

  const enterFullscreen = useCallback(() => {
    if (!isRunning) {
      startTimer();
    }
    scale.value = withSpring(1.1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(0.8, { duration: 300 });
    setTimeout(() => {
      setFullscreenMode(true);
    }, 100);
  }, [isRunning, startTimer, scale, opacity]);

  const enterMinimalMode = useCallback(() => {
    if (!isRunning) {
      startTimer();
    }
    scale.value = withSpring(1.2, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(0.7, { duration: 300 });
    setTimeout(() => {
      setMinimalMode(true);
    }, 100);
  }, [isRunning, startTimer, scale, opacity]);

  // Atualizar o tempo exibido
  const [displayTime, setDisplayTime] = useState('00:00');
  
  // Atualizar o valor de progresso a cada 100ms
  const [progressValue, setProgressValue] = useState(1);
  
  // Atualizar o tempo exibido
  useEffect(() => {
    if (isPomodoroActive) {
      setDisplayTime(formatPomodoroTime(timeLeft));
    } else {
      const absTime = Math.abs(totalStudyTime);
      setDisplayTime(formatTime(absTime));
    }
  }, [isPomodoroActive, timeLeft, totalStudyTime]);
  
  // Atualizar o valor de progresso
  useEffect(() => {
    const updateProgress = () => {
      // Usar um método seguro para acessar o valor atual
      if (isPomodoroActive) {
        // Aqui usamos um valor próximo ao real em vez de acessar .value diretamente
        setProgressValue(isPomodoroActive ? 1 : 0);
      }
    };
    
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [isPomodoroActive]);
  
  // Obter cor com base no modo do timer
  const getTimerColor = () => {
    if (!isPomodoroActive) return theme.colors.primary;
    
    switch (timerMode) {
      case 'focus':
        return theme.colors.primary;
      case 'shortBreak':
        return theme.colors.secondary;
      case 'longBreak':
        return theme.colors.tertiary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Timer Set Modal */}
      <TimeSetModal
        visible={timeSetModalVisible}
        onClose={() => setTimeSetModalVisible(false)}
        onSubmit={handleTimeSet}
      />
      
      {/* Fullscreen Mode */}
      <Modal
        visible={fullscreenMode}
        animationType="fade"
        transparent={false}
        statusBarTranslucent={true}
        onRequestClose={() => setFullscreenMode(false)}
        presentationStyle="fullScreen"
      >
        <Animated.View
          entering={ZoomIn.duration(400)}
          exiting={ZoomOut.duration(400)}
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
          <FullscreenTimerScreen onClose={() => setFullscreenMode(false)} />
        </Animated.View>
      </Modal>
      
      {/* Minimal Mode */}
      <Modal
        visible={minimalMode}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setMinimalMode(false)}
        presentationStyle="overFullScreen"
      >
        <MinimalTimerScreen onClose={() => setMinimalMode(false)} />
      </Modal>
      
      {/* Main Timer Display */}
      {isPomodoroActive ? (
        <PomodoroTimer 
          timeLeft={timeLeft}
          timerMode={timerMode}
          isRunning={isRunning}
          animatedStyle={animatedStyle}
          onFullscreen={enterFullscreen}
          onOpenTimeModal={() => setTimeSetModalVisible(true)}
        />
      ) : (
        <StandardTimer 
          totalStudyTime={totalStudyTime}
          customTimerDuration={customTimerDuration}
          isRunning={isRunning}
          animatedStyle={animatedStyle}
          onFullscreen={enterFullscreen}
          onOpenTimeModal={() => setTimeSetModalVisible(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    fontSize: 48,
    textAlign: 'center',
  },
  pomodoroContainer: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    width: '95%',
    maxWidth: 340,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  timerModeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerModeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timerTimeLeft: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 2,
  },
  circleProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  motivationalText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timerActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 24,
    width: '85%',
    maxWidth: 340,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  timeInput: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '45%',
    borderRadius: 8,
  },
  customDurationText: {
    marginTop: 10,
    fontSize: 14,
  },
  countdownIndicator: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default React.memo(TimerDisplay);