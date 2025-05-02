import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, useTheme, Button, IconButton, Surface, Portal } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTime } from '../utils/timeFormat';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import FullscreenTimerScreen from '../screens/FullscreenTimerScreen';
import MinimalTimerScreen from '../screens/MinimalTimerScreen';

const { width, height } = Dimensions.get('window');

const TimerDisplay: React.FC = () => {
  const { 
    totalStudyTime, 
    isRunning, 
    isPomodoroActive, 
    timerMode, 
    timeLeft,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    updateTimeDuration,
    switchTimerMode
  } = useTimer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Estados para controlar os modais de tela cheia
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [minimalMode, setMinimalMode] = useState(false);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  
  // Não precisamos mais gerenciar a orientação da tela aqui, pois isso será feito no FullscreenTimerScreen
  
  // Atualizar o modo de tela cheia com base no estado de execução do timer
  useEffect(() => {
    // Se o timer parar, automaticamente sair do modo de tela cheia
    if (!isRunning) {
      if (fullscreenMode) setFullscreenMode(false);
      if (minimalMode) setMinimalMode(false);
    }
  }, [isRunning]);
  
  // Estado para o modal de pré-definição de tempo
  const [timeSetModalVisible, setTimeSetModalVisible] = useState(false);
  const [presetMinutes, setPresetMinutes] = useState('25');
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue('0deg');
  
  // Update animations based on timer state
  useEffect(() => {
    if (isRunning) {
      scale.value = withSpring(1.05, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 500 });
      rotate.value = withTiming('0deg');
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(0.95, { duration: 500 });
      rotate.value = withTiming('0deg');
    }
  }, [isRunning]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: rotate.value }
    ],
    opacity: opacity.value,
  }));

  // Formatar minutos e segundos do Pomodoro
  const formatPomodoroTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get timer mode title
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

  // Obter um valor seguro para o progresso
  const safeProgressValue = () => {
    // Não acessamos diretamente progress.value durante a renderização
    // Em vez disso, usamos uma função de callback dentro de useAnimatedStyle
    return 0; // Este valor será ignorado, usando aproximação para o valor visual
  };

  // Define um estilo animado para o progress
  const progressAnimatedStyle = useAnimatedStyle(() => {
    // Aqui é seguro acessar o valor do SharedValue
    const progressValue = 1 - progress.value;
    const safeProgress = Math.max(0, Math.min(100, progressValue * 100));
    return {
      width: `${safeProgress}%`,
    };
  });

  // Calculate safe radius to ensure timer fits on screen
  const getCircleRadius = (isFullscreen = false) => {
    if (isFullscreen) {
      // Em tela cheia, usar uma proporção maior da tela
      const smallerDimension = Math.min(
        Dimensions.get('window').width, 
        Dimensions.get('window').height
      );
      return smallerDimension * 0.3;
    }
    
    // Em modo normal
    const screenWidth = width - (insets.left + insets.right) - 40;
    return Math.min(screenWidth * 0.35, 130);
  };

  // Get motivational message based on timer mode
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
  
  // Lidar com o envio do tempo personalizado
  const handlePresetTime = () => {
    const minutes = parseInt(presetMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 120) {
      // Converter minutos para milissegundos
      const ms = minutes * 60 * 1000;
      setCustomDuration(ms);
      updateTimeDuration(ms);
      setTimeSetModalVisible(false);
    }
  };
  
  // Função para entrar em modo de tela cheia padrão com animação suave
  const enterFullscreen = async () => {
    // Iniciar o timer se não estiver rodando e ativar a tela cheia
    if (!isRunning) {
      startTimer();
    }
    // Aplicar animação ao entrar no modo fullscreen
    scale.value = withSpring(1.1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(0.8, { duration: 300 });
    
    // Pequeno atraso para a animação ser percebida antes de entrar em fullscreen
    setTimeout(() => {
      setFullscreenMode(true);
    }, 100);
  };
  
  // Função para entrar em modo minimalista com animação suave
  const enterMinimalMode = async () => {
    // Iniciar o timer se não estiver rodando e ativar o modo minimalista
    if (!isRunning) {
      startTimer();
    }
    // Aplicar animação ao entrar no modo minimalista
    scale.value = withSpring(1.2, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(0.7, { duration: 300 });
    
    // Pequeno atraso para a animação ser percebida antes de entrar em modo minimalista
    setTimeout(() => {
      setMinimalMode(true);
    }, 100);
  };
  
  // Exibir componente do Pomodoro (reutilizável para normal e fullscreen)
  const renderPomodoroTimer = (isFullscreen = false) => {
    return (
      <Animated.View 
        style={[
          styles.pomodoroContainer, 
          isFullscreen ? styles.fullscreenContainer : animatedStyle,
          { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          }
        ]}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
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
                fontSize: isFullscreen ? 28 : 22,
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
                fontSize: isFullscreen ? 120 : 48
              }
            ]}
          >
            {formatPomodoroTime(timeLeft)}
          </Text>
        </View>
        
        {!isFullscreen && (
          <View style={styles.circleProgressContainer}>
            <CircularProgress
              value={safeProgressValue()}
              radius={getCircleRadius(isFullscreen)}
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
        )}
        
        {!isFullscreen && (
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
        )}
        
        {isFullscreen && (
          <Animated.View 
            style={[styles.fullscreenControls, {
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: 10,
            }]}
            entering={FadeIn.duration(400).delay(200)}
          >
            <IconButton
              icon="play-pause"
              iconColor={theme.colors.onPrimary}
              size={42}
              onPress={isRunning ? pauseTimer : startTimer}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
            <IconButton
              icon="refresh"
              iconColor={theme.colors.onPrimary}
              size={42}
              onPress={resetTimer}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
            <IconButton
              icon="fullscreen-exit"
              iconColor={theme.colors.onPrimary}
              size={42}
              onPress={() => setFullscreenMode(false)}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
          </Animated.View>
        )}
      </Animated.View>
    );
  };

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

  // Visual indicator for countdown mode
  const isCountdownMode = totalStudyTime < 0 && !isPomodoroActive;

  const renderStandardTimer = (isFullscreen = false) => {
    return (
      <View style={isFullscreen ? styles.fullscreenStandardTimer : {}}>
        <Animated.View style={!isFullscreen ? animatedStyle : {}}>
          <Text 
            style={[
              isFullscreen ? styles.fullscreenStandardTimerText : styles.timerText,
              { 
                color: theme.colors.primary,
              }
            ]}
          >
            {formatStandardTime(totalStudyTime)}
          </Text>
          
          {isCountdownMode && (
            <Text style={[styles.countdownIndicator, { color: theme.colors.secondary }]}>
              ⏱️ Contagem regressiva
            </Text>
          )}
          
          {isFullscreen && (
            <Animated.Text 
              style={[styles.fullscreenMotivationalText, { color: '#FFFFFF' }]}
              entering={FadeIn.duration(800).delay(300)}
            >
              {getMotivationalMessage()}
            </Animated.Text>
          )}
        </Animated.View>

        {isFullscreen && (
          <Animated.View 
            style={[styles.fullscreenControls, {
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: 10,
            }]}
            entering={FadeIn.duration(400).delay(200)}
          >
            <IconButton
              icon="play-pause"
              iconColor={theme.colors.primary}
              size={42}
              onPress={isRunning ? pauseTimer : startTimer}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
            <IconButton
              icon="refresh"
              iconColor={theme.colors.primary}
              size={42}
              onPress={resetTimer}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
            <IconButton
              icon="fullscreen-exit"
              iconColor={theme.colors.primary}
              size={42}
              onPress={() => setFullscreenMode(false)}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
            <IconButton
              icon="eye-outline"
              iconColor={theme.colors.primary}
              size={42}
              onPress={() => {
                setFullscreenMode(false);
                setTimeout(() => enterMinimalMode(), 300);
              }}
              style={[styles.fullscreenButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Modais de tela cheia */}
      <Modal
        visible={fullscreenMode}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFullscreenMode(false)}
      >
        <FullscreenTimerScreen onClose={() => setFullscreenMode(false)} />
      </Modal>
      
      <Modal
        visible={minimalMode}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMinimalMode(false)}
      >
        <MinimalTimerScreen onClose={() => setMinimalMode(false)} />
      </Modal>
      
      {/* Modal para definir o tempo personalizado */}
      <Portal>
        <Modal
          visible={timeSetModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTimeSetModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Surface style={[styles.modalContent, { 
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              elevation: 6,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }]}>
              <Text style={[styles.modalTitle, { 
                color: theme.colors.primary,
              }]}>
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
                  onPress={() => setTimeSetModalVisible(false)}
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
      
      {/* Timer display principal */}
      {isPomodoroActive ? (
        <View style={styles.timerWrapper}>
          {renderPomodoroTimer(false)}
          <View style={styles.timerActionButtons}>
            <IconButton
              icon="clock-edit-outline"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => setTimeSetModalVisible(true)}
            />
            <IconButton
              icon="fullscreen"
              iconColor={theme.colors.primary}
              size={24}
              onPress={enterFullscreen}
            />
          </View>
        </View>
      ) : (
        <View style={styles.timerWrapper}>
          {renderStandardTimer(false)}
          <View style={styles.timerActionButtons}>
            <IconButton
              icon="clock-edit-outline"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => setTimeSetModalVisible(true)}
            />
            <IconButton
              icon="fullscreen"
              iconColor={theme.colors.primary}
              size={24}
              onPress={enterFullscreen}
            />
          </View>
          {customDuration && (
            <Text style={[styles.customDurationText, { color: theme.colors.secondary }]}>
              Tempo definido: {Math.floor(customDuration / 60000)} min
            </Text>
          )}
        </View>
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
  fullscreenMotivationalText: {
    fontSize: 24,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 30,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
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
  fullscreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    backdropFilter: 'blur(8px)',
  },
  fullscreenContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fullscreenControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  fullscreenButton: {
    marginHorizontal: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fullscreenStandardTimer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  fullscreenStandardTimerText: {
    fontSize: 130,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    width: '85%',
    maxWidth: 340,
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
  fullscreenSetTime: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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

export default TimerDisplay;