import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, TouchableWithoutFeedback, Modal } from 'react-native';
import { Text, useTheme, IconButton, Button, Dialog, TextInput, Portal } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeWithSeconds, formatPomodoroTime } from '../utils/timeFormat';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  ZoomIn,
  ZoomOut,
  FadeOut,
  SlideInDown,
  SlideInUp,
  withTiming
} from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingProgress from '../components/FloatingProgress';
import SessionSave from '../components/SessionSave';

const { width, height } = Dimensions.get('window');

// Tempo necessário para a conquista "Mestre Zen" (1 hora em ms)
const ZEN_MODE_REQUIREMENT = 3600000;

interface FullscreenTimerScreenProps {
  onClose: () => void;
}

const FullscreenTimerScreen: React.FC<FullscreenTimerScreenProps> = React.memo(({ onClose }) => {
  const {
    totalStudyTime,
    isRunning,
    isPomodoroActive,
    timerMode,
    timeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    saveSession,
    isZenModeActive,
    toggleZenMode,
    zenModeAccumulatedTime
  } = useTimer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Estado para o modal de salvar sessão
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [sessionName, setSessionName] = useState('');
  
  // Para detectar duplo toque
  const [lastTap, setLastTap] = useState<number | null>(null);
  
  // Para rastrear o tempo atual no modo zen
  const [currentZenTime, setCurrentZenTime] = useState(zenModeAccumulatedTime);
  const [zenStartTime, setZenStartTime] = useState<number | null>(null);
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Atualizar o tempo do modo zen
  useEffect(() => {
    // Quando o modo zen é ativado, guardar o tempo inicial
    if (isZenModeActive && !zenStartTime) {
      setZenStartTime(Date.now());
    }
    
    // Quando o modo zen é desativado, resetar o tempo inicial
    if (!isZenModeActive) {
      setZenStartTime(null);
    }
    
    // Intervalo para atualizar o tempo atual do modo zen
    let interval: NodeJS.Timeout | null = null;
    
    if (isZenModeActive && zenStartTime) {
      interval = setInterval(() => {
        const elapsedTime = Date.now() - zenStartTime;
        setCurrentZenTime(zenModeAccumulatedTime + elapsedTime);
      }, 1000);
    } else {
      setCurrentZenTime(zenModeAccumulatedTime);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isZenModeActive, zenStartTime, zenModeAccumulatedTime]);
  
  // Configurar orientação da tela para paisagem e ocultar barra de status
  useEffect(() => {
    let isMounted = true;
    let orientationSubscription: any = null;
    
    const setupScreen = async () => {
      try {
        // Armazenar orientação atual antes de mudar
        const currentOrientation = await ScreenOrientation.getOrientationAsync();
        
        // Bloquear orientação em paisagem apenas se o componente ainda estiver montado
        if (isMounted) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
          // Ocultar barra de status
          StatusBar.setHidden(true, 'fade');
          
          // Acompanhar mudanças de orientação para evitar problemas
          orientationSubscription = ScreenOrientation.addOrientationChangeListener(() => {
            if (isMounted) {
              // Reforçar a orientação paisagem se houver alguma tentativa de mudança
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            }
          });
        }
      } catch (error) {
        console.error('Erro ao configurar orientação da tela:', error);
      }
    };
    
    setupScreen();
    
    // Cleanup ao desmontar
    return () => {
      isMounted = false;
      
      // Remover o listener de orientação
      if (orientationSubscription) {
        ScreenOrientation.removeOrientationChangeListener(orientationSubscription);
      }
      
      // Desativar o modo zen ao sair da tela cheia
      if (isZenModeActive) {
        toggleZenMode();
      }
      
      // Restaurar a configuração da tela ao sair de forma controlada para evitar flickering
      const restoreScreen = async () => {
        try {
          // Voltar para a orientação padrão de forma controlada
          await StatusBar.setHidden(false, 'fade');
          await ScreenOrientation.unlockAsync();
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          
          // Desbloquear após a transição para evitar problemas
          setTimeout(() => {
            ScreenOrientation.unlockAsync();
          }, 100);
        } catch (error) {
          console.error('Erro ao restaurar orientação da tela:', error);
          // Garantir que a tela esteja desbloqueada mesmo em caso de erro
          ScreenOrientation.unlockAsync();
        }
      };
      
      restoreScreen();
    };
  }, [isZenModeActive, toggleZenMode]);
  
  // Animar o timer quando estiver rodando
  useEffect(() => {
    if (isRunning) {
      scale.value = withSpring(1.05, { damping: 12, stiffness: 90 });
      opacity.value = withSpring(1, { damping: 12, stiffness: 90 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 90 });
      opacity.value = withSpring(0.9, { damping: 12, stiffness: 90 });
    }
  }, [isRunning, scale, opacity]);
  
  // Atualizar a opacidade dos controles quando o modo zen é ativado/desativado
  useEffect(() => {
    controlsOpacity.value = withTiming(isZenModeActive ? 0 : 1, { duration: 500 });
  }, [isZenModeActive, controlsOpacity]);
  
  // Estilo animado para o timer
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));
  
  // Estilo animado para os controles
  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    // Para garantir que os controles não interfiram quando invisíveis
    pointerEvents: controlsOpacity.value === 0 ? 'none' : 'auto' as any,
  }));
  
  // Formatar o tempo para exibição
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
  
  // Obter cor de modo baseada no modo do timer
  const getModeColor = useCallback(() => {
    if (!isPomodoroActive) return theme.colors.primary;
    
    switch(timerMode) {
      case 'focus': return theme.colors.primary;
      case 'shortBreak': return theme.colors.secondary;
      case 'longBreak': return theme.colors.tertiary;
      default: return theme.colors.primary;
    }
  }, [isPomodoroActive, timerMode, theme.colors]);
  
  // Salvar sessão e fechar modal
  const handleSaveSession = () => {
    saveSession(sessionName || 'Sessão de Estudo');
    setSaveDialogVisible(false);
    setSessionName('');
  };
  
  // Detectar duplo toque para ativar/desativar o modo zen
  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) { // Duplo toque detectado (menos de 300ms entre toques)
      toggleZenMode();
      setLastTap(null);
    } else {
      setLastTap(now);
    }
  };
  
  // Lidar com o fechamento da tela cheia
  const handleClose = useCallback(() => {
    // Garantir que a barra de status seja restaurada
    StatusBar.setHidden(false, 'fade');
    
    // Chamar o callback de fechamento
    onClose();
  }, [onClose]);

  // Verificar se o indicador de progresso do modo zen deve ser mostrado
  const shouldShowZenProgress = isZenModeActive && 
                               (currentZenTime > 300000 || zenModeAccumulatedTime > 300000); // Mostrar após 5 minutos
  
  // Handle opening the save modal
  const handleOpenSaveModal = () => {
    setShowSaveModal(true);
  };
  
  // Handle closing the save modal
  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };
  
  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View 
        style={[styles.container, { 
          backgroundColor: theme.dark ? '#000000' : '#FFFFFF' 
        }]}
      >
        <StatusBar hidden={true} />
        
        {/* Botão de voltar discreto */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(400)}
          style={[{ position: 'absolute', left: 10, top: insets.top, zIndex: 10 }, controlsAnimatedStyle]}
        >
          <IconButton
            icon="arrow-left"
            iconColor={theme.dark ? '#FFFFFF' : theme.colors.primary}
            size={32}
            onPress={handleClose}
          />
        </Animated.View>
        
        {/* Indicador de progresso do modo zen */}
        {shouldShowZenProgress && (
          <FloatingProgress 
            visible={shouldShowZenProgress}
            zenTime={currentZenTime}
            requiredTime={ZEN_MODE_REQUIREMENT}
          />
        )}
        
        {/* Timer minimalista */}
        <Animated.View 
          style={[styles.timerContainer, animatedStyle]}
          entering={ZoomIn.duration(600).springify().delay(200)}
          exiting={ZoomOut.duration(400).springify()}
        >
          {isPomodoroActive && !isZenModeActive && (
            <Animated.Text 
              entering={SlideInUp.duration(500).springify()}
              style={[
                styles.modeTitle, 
                { color: getModeColor() }
              ]}
            >
              {timerMode === 'focus' ? 'FOCO' : timerMode === 'shortBreak' ? 'PAUSA CURTA' : 'PAUSA LONGA'}
            </Animated.Text>
          )}
          
          <Animated.Text 
            style={[
              styles.timerText, 
              { 
                color: getModeColor(),
                fontSize: isZenModeActive ? 120 : 100, // Aumentar o tamanho no modo zen
              }
            ]}
          >
            {formatDisplayTime()}
          </Animated.Text>
          
          {isZenModeActive && (
            <Animated.Text 
              style={styles.zenModeHint}
              entering={FadeIn.duration(500).delay(2000)}
              exiting={FadeOut.duration(300)}
            >
              Toque duas vezes para mostrar controles
            </Animated.Text>
          )}
        </Animated.View>
        
        {/* Controles minimalistas */}
        <Animated.View 
          entering={SlideInDown.duration(600).springify().delay(300)}
          style={[styles.controlsRow, { bottom: insets.bottom + 20 }, controlsAnimatedStyle]}
        >
          <IconButton
            icon="content-save-outline"
            iconColor={theme.dark ? '#FFFFFF' : theme.colors.primary}
            size={32}
            style={styles.controlButton}
            onPress={() => setSaveDialogVisible(true)}
          />
          
          <IconButton
            icon={isRunning ? "pause" : "play"}
            iconColor={theme.dark ? '#FFFFFF' : theme.colors.primary}
            size={54}
            style={[styles.controlButton, styles.mainButton]}
            onPress={isRunning ? pauseTimer : startTimer}
          />
          
          <IconButton
            icon="refresh"
            iconColor={theme.dark ? '#FFFFFF' : theme.colors.primary}
            size={32}
            style={styles.controlButton}
            onPress={resetTimer}
          />
        </Animated.View>
        
        {/* Dialog para salvar sessão */}
        <Portal>
          <Dialog 
            visible={saveDialogVisible} 
            onDismiss={() => setSaveDialogVisible(false)}
            style={{ backgroundColor: theme.dark ? '#1A1A1A' : '#FFFFFF' }}
          >
            <Dialog.Title style={{ color: theme.dark ? '#FFFFFF' : theme.colors.primary }}>
              Salvar Sessão
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nome da sessão"
                value={sessionName}
                onChangeText={setSessionName}
                mode="outlined"
                style={{ backgroundColor: 'transparent' }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setSaveDialogVisible(false)}>Cancelar</Button>
              <Button onPress={handleSaveSession}>Salvar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Save Button */}
        {!isRunning && Math.abs(totalStudyTime) > 0 && !isZenModeActive && (
          <Animated.View 
            style={[styles.saveButtonContainer, { opacity: controlsOpacity }]}
            entering={FadeIn.duration(500).delay(200)}
          >
            <IconButton
              icon="content-save"
              mode="contained"
              size={28}
              onPress={handleOpenSaveModal}
              style={[
                styles.iconButton,
                { backgroundColor: theme.colors.secondary }
              ]}
              iconColor={theme.colors.onSecondary}
            />
          </Animated.View>
        )}
        
        {/* Save Session Modal */}
        <Modal
          visible={showSaveModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseSaveModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface }
            ]}>
              <SessionSave onClose={handleCloseSaveModal} />
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
});

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
  modeTitle: {
    fontSize: 20,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 10,
    opacity: 0.9,
  },
  timerText: {
    fontSize: 100,
    fontWeight: '200',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  controlsRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    margin: 10,
  },
  mainButton: {
    borderWidth: 1,
    borderRadius: 40,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  zenModeHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.5,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  iconButton: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});

export default FullscreenTimerScreen;