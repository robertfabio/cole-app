import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import Constants from 'expo-constants';

// Configurar as notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Inicializar as permissões de notificação
export const initializeNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'Timer Cole',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Se não temos permissão ainda, solicitar ao usuário
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

// Enviar notificação quando o timer terminar
export const sendTimerCompletedNotification = async (title: string, body: string, data?: Record<string, any>) => {
  // Vibrar o dispositivo para chamar atenção
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 250, 250, 250, 250, 250]);
  }

  // Programar a notificação
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 250, 250, 250, 250, 250],
      data: data || {},
      color: '#6200EE', // Cor primária do tema
      badge: 1,
    },
    trigger: null, // Enviar imediatamente
  });
};

// Registrar um listener para notificações
export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'Timer Cole',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250, 250, 250],
      lightColor: '#6200EE',
      sound: true,
    });
  }

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações não concedida!');
      return false;
    }
    
    return true;
  } else {
    console.log('Notificações push só funcionam em dispositivos físicos');
    return false;
  }
};

// Enviar notificação para o modo Pomodoro
export const sendPomodoroNotification = async (mode: string, timeSpent?: number) => {
  let title = '';
  let body = '';
  let data = { mode };
  
  if (timeSpent) {
    data.timeSpent = timeSpent;
  }

  switch (mode) {
    case 'focus':
      title = '🎯 Hora de Focar!';
      body = 'Seu período de foco começou. Concentre-se na sua tarefa.';
      break;
    case 'shortBreak':
      title = '☕ Pausa Curta!';
      body = 'Hora de uma pequena pausa. Descanse um pouco e prepare-se para o próximo ciclo.';
      break;
    case 'longBreak':
      title = '🌴 Pausa Longa!';
      body = 'Você merece uma pausa mais longa. Aproveite para relaxar completamente.';
      break;
    case 'completed':
      title = '🎉 Ciclo Pomodoro Concluído!';
      body = timeSpent ? `Você completou ${Math.floor(timeSpent / (1000 * 60))} minutos de estudo focado!` : 'Seu ciclo Pomodoro foi concluído com sucesso!';
      break;
    default:
      title = '⏰ Timer Concluído!';
      body = 'Seu timer foi concluído.';
  }

  await sendTimerCompletedNotification(title, body, data);
};

// Enviar notificação para o timer padrão
export const sendStandardTimerNotification = async (timeSpent?: number) => {
  const title = '⏰ Timer Concluído!';
  let body = 'Seu tempo de estudo foi concluído.';
  
  if (timeSpent) {
    const minutes = Math.floor(timeSpent / (1000 * 60));
    const seconds = Math.floor((timeSpent % (1000 * 60)) / 1000);
    
    body = `Você estudou por ${minutes} minutos e ${seconds} segundos. Ótimo trabalho!`;
  }
  
  await sendTimerCompletedNotification(
    title,
    body,
    { type: 'standard', timeSpent }
  );
};

// Enviar notificação de lembrete para voltar ao estudo
export const sendReminderNotification = async (minutesAway: number = 30) => {
  const title = '📚 Lembrete de Estudo';
  const body = `Já se passaram ${minutesAway} minutos desde sua última sessão. Que tal voltar aos estudos?`;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      seconds: minutesAway * 60, // Converter minutos para segundos
    },
  });
};

// Cancelar todas as notificações agendadas
export const cancelAllScheduledNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Cancelar uma notificação específica pelo identificador
export const cancelNotification = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};