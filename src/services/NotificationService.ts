import { Platform, Vibration } from 'react-native';

// Tipos para manter a compatibilidade de assinatura nas funções stub
type StubNotificationHandler = {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
};

// Stub para notificações já que expo-notifications foi removido na SDK 53
// Esta é uma implementação temporária que apenas registra as notificações 
// no console e vibra o dispositivo
const notificationStub = {
  // Mock das funções originais que apenas loga e retorna sucesso
  setNotificationHandler: (handlers: {handleNotification: () => Promise<StubNotificationHandler>}) => {
    console.log('NotificationService: setNotificationHandler chamado (stub)');
  },
  getPermissionsAsync: async () => {
    console.log('NotificationService: getPermissionsAsync chamado (stub)');
    return { status: 'granted' };
  },
  requestPermissionsAsync: async () => {
    console.log('NotificationService: requestPermissionsAsync chamado (stub)');
    return { status: 'granted' };
  },
  setNotificationChannelAsync: async (channelId: string, channelOptions: any) => {
    console.log(`NotificationService: setNotificationChannelAsync chamado (stub) para canal ${channelId}`);
    return true;
  },
  scheduleNotificationAsync: async (options: any) => {
    console.log('NotificationService: scheduleNotificationAsync chamado (stub)');
    return "notification-id-mock";
  },
  cancelAllScheduledNotificationsAsync: async () => {
    console.log('NotificationService: cancelAllScheduledNotificationsAsync chamado (stub)');
  },
  cancelScheduledNotificationAsync: async (notificationId: string) => {
    console.log(`NotificationService: cancelScheduledNotificationAsync chamado (stub) para ${notificationId}`);
  },
};

// Configurar as notificações
notificationStub.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  })
});

// Inicializar as permissões de notificação
export const initializeNotifications = async () => {
  if (Platform.OS === 'android') {
    await notificationStub.setNotificationChannelAsync('timer', {
      name: 'Timer Cole',
      importance: 'high',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: true,
    });
  }

  const { status: existingStatus } = await notificationStub.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Se não temos permissão ainda, solicitar ao usuário
  if (existingStatus !== 'granted') {
    const { status } = await notificationStub.requestPermissionsAsync();
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

  console.log(`NotificationService: NOTIFICAÇÃO - ${title}`, body);

  // Programar a notificação
  await notificationStub.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: 'max',
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
    await notificationStub.setNotificationChannelAsync('timer', {
      name: 'Timer Cole',
      importance: 'max',
      vibrationPattern: [0, 250, 250, 250, 250, 250],
      lightColor: '#6200EE',
      sound: true,
    });
  }

  console.log('NotificationService: Inicializado como stub (expo-notifications foi removido na SDK 53)');
  
  return true;
};

// Enviar notificação para o modo Pomodoro
export const sendPomodoroNotification = async (mode: string, timeSpent?: number) => {
  let title = '';
  let body = '';
  let data: {mode: string; timeSpent?: number} = { mode };
  
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
  
  await notificationStub.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: 'default',
    },
    trigger: {
      seconds: minutesAway * 60, // Converter minutos para segundos
    },
  });
};

// Cancelar todas as notificações agendadas
export const cancelAllScheduledNotifications = async () => {
  await notificationStub.cancelAllScheduledNotificationsAsync();
};

// Cancelar uma notificação específica pelo identificador
export const cancelNotification = async (notificationId: string) => {
  await notificationStub.cancelScheduledNotificationAsync(notificationId);
};