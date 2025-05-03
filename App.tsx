import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { TimerProvider, useTimer } from './src/contexts/TimerContext';
import AppNavigator from './src/components/AppNavigator';
import { getThemeForMode } from './src/utils/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import { ScheduleProvider } from './src/contexts/ScheduleContext';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Image, StyleSheet, Animated, Platform } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { registerForPushNotificationsAsync } from './src/services/NotificationService';
import AchievementNotification from './src/components/AchievementNotification';

// Manter a splash screen visível até que o app esteja pronto
SplashScreen.preventAutoHideAsync();

// ThemeWrapper para aplicar o tema conforme as configurações
const ThemeWrapper = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const [mountedWithTheme, setMountedWithTheme] = useState(settings.theme);
  const theme = useMemo(() => getThemeForMode(settings.theme), [settings.theme]);
  
  // Controle para evitar problemas de animação durante mudança de tema
  useEffect(() => {
    if (mountedWithTheme !== settings.theme) {
      // Pequeno delay para evitar conflitos com as animações
      const timeout = setTimeout(() => {
        setMountedWithTheme(settings.theme);
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [settings.theme, mountedWithTheme]);
  
  return (
    <>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </>
  );
};

// Componente para mostrar notificações de conquistas
const AchievementNotifier = () => {
  const { newAchievement, clearNewAchievement } = useTimer();
  
  if (!newAchievement) return null;
  
  return (
    <AchievementNotification 
      achievement={newAchievement.achievement}
      xpEarned={newAchievement.xpEarned}
      onClose={clearNewAchievement}
    />
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Carregamento das fontes
        await Font.loadAsync({
          'Montserrat-Thin': require('./assets/fonts/static/Montserrat-Thin.ttf'),
          'Montserrat-ThinItalic': require('./assets/fonts/static/Montserrat-ThinItalic.ttf'),
          'Montserrat-Regular': require('./assets/fonts/static/Montserrat-Regular.ttf'),
          'Montserrat-Bold': require('./assets/fonts/static/Montserrat-Bold.ttf'),
        });
        
        // Inicializar o serviço de notificações (agora com stub)
        await registerForPushNotificationsAsync();
        console.log('Sistema de notificação inicializado (modo stub)');
        
        // Simulação de carregamento para dar tempo de visualizar o splash
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Animação de fade out para o splash screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      });
    }
  }, [appIsReady, fadeAnim]);

  if (!appIsReady || showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <Image 
          source={require('./assets/gifentrada.gif')} 
          style={styles.splashGif}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <ThemeWrapper>
          <TimerProvider>
            <ScheduleProvider>
              <View style={{ flex: 1 }}>
                <AppNavigator />
                <AchievementNotifier />
              </View>
            </ScheduleProvider>
          </TimerProvider>
        </ThemeWrapper>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#2D3047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashGif: {
    width: '80%',
    height: '80%',
  },
});
