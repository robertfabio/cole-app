import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StyleSheet, View, BackHandler } from 'react-native';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import TimerScreen from '../screens/TimerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import MoreScreen from '../screens/MoreScreen';
import { useTimer } from '../contexts/TimerContext';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

// Criar uma referência global para a navegação
export const navigationRef = createNavigationContainerRef();

// Definir tipo de navegação
export type NavigationParams = {
  home: undefined;
  timer: undefined;
  achievements: undefined;
  schedule: undefined;
  more: undefined;
  settings: undefined;
  history: undefined;
  stats: undefined;
};

// Função de navegação global para ser usada fora de componentes React
export function navigate(name: keyof NavigationParams) {
  if (navigationRef.isReady()) {
    if (name === 'settings' || name === 'history' || name === 'stats') {
      // Abrir a tela sem usar as tabs
      navigationRef.navigate(name as never);
    } else {
      // Para as telas com tabs, verificar se já está na tab e apenas navegar para ela
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name !== name) {
        navigationRef.navigate(name as never);
      }
    }
  }
}

// Criar uma função para abrir telas em modal (como configurações)
export function openSettingsScreen() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('settings' as never);
  }
}

// Função para voltar à tela anterior
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

type Route = {
  key: string;
  title: string;
  focusedIcon: string;
  unfocusedIcon: string;
  color?: string;
};

type SceneProps = {
  route: Route;
  jumpTo: (key: string) => void;
};

const AppNavigator: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isSaving } = useTimer();
  
  // Valor animado para o indicador da tab
  const indicatorPosition = useSharedValue(0);
  
  // Inicializar o valor correto para o indicador
  useEffect(() => {
    if (!isInitialized) {
      // Garantir que o indicador esteja na posição correta desde o início
      indicatorPosition.value = 0;
      setIsInitialized(true);
    }
  }, [isInitialized, indicatorPosition]);
  
  // Capturar o botão de voltar global
  useEffect(() => {
    const handleBackPress = () => {
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  // Use useMemo para evitar recriação das rotas em cada renderização
  const routes = useMemo<Route[]>(() => [
    { 
      key: 'home', 
      title: 'Início',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
      color: theme.colors.primary,
    },
    { 
      key: 'timer', 
      title: 'Cronômetro',
      focusedIcon: 'timer',
      unfocusedIcon: 'timer-outline',
      color: theme.colors.primary,
    },
    { 
      key: 'achievements', 
      title: 'Conquistas',
      focusedIcon: 'trophy',
      unfocusedIcon: 'trophy-outline',
      color: theme.colors.primary,
    },
    { 
      key: 'schedule', 
      title: 'Agenda',
      focusedIcon: 'calendar',
      unfocusedIcon: 'calendar-outline',
      color: theme.colors.primary,
    },
    { 
      key: 'more', 
      title: 'Mais',
      focusedIcon: 'dots-horizontal',
      unfocusedIcon: 'dots-horizontal',
      color: theme.colors.primary,
    },
  ], [theme.colors.primary]);

  // Estilo animado para o indicador da tab
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: `${100 / routes.length}%`,
      position: 'absolute',
      bottom: 0,
      left: `${indicatorPosition.value * (100 / routes.length)}%`,
      height: 3,
      backgroundColor: theme.colors.primary,
      borderRadius: 1.5,
    };
  });
  
  // Determinar a direção da animação com base no índice
  const getAnimations = useCallback((routeKey: string) => {
    const isMovingForward = index > prevIndex;
    
    if (routes[index].key === routeKey) {
      return {
        entering: isMovingForward 
          ? SlideInRight.duration(300).springify()
          : FadeIn.duration(300).delay(50),
        exiting: FadeOut.duration(200)
      };
    }
    
    return {
      entering: FadeIn.duration(300),
      exiting: isMovingForward 
        ? SlideOutLeft.duration(300).springify()
        : FadeOut.duration(200)
    };
  }, [index, prevIndex, routes]);

  // Criar componentes com memo para evitar rerenderizações
  const HomeMemo = useMemo(() => <HomeScreen />, []);
  const TimerMemo = useMemo(() => <TimerScreen />, []);
  const AchievementsMemo = useMemo(() => <AchievementsScreen />, []);
  const ScheduleMemo = useMemo(() => <ScheduleScreen />, []);
  const MoreMemo = useMemo(() => <MoreScreen />, []);

  // Renderizar as telas sob demanda
  const renderScene = useCallback(({ route }: SceneProps) => {
    let ScreenComponent = null;
    
    switch (route.key) {
      case 'home':
        ScreenComponent = HomeMemo;
        break;
      case 'timer':
        ScreenComponent = TimerMemo;
        break;
      case 'achievements':
        ScreenComponent = AchievementsMemo;
        break;
      case 'schedule':
        ScreenComponent = ScheduleMemo;
        break;
      case 'more':
        ScreenComponent = MoreMemo;
        break;
      default:
        return null;
    }
    
    const animations = getAnimations(route.key);
    
    return (
      <Animated.View
        key={route.key}
        entering={animations.entering}
        exiting={animations.exiting}
        style={styles.sceneContainer}
      >
        {ScreenComponent}
      </Animated.View>
    );
  }, [getAnimations, HomeMemo, TimerMemo, AchievementsMemo, ScheduleMemo, MoreMemo]);

  // Lidar com mudança de índice, bloqueando durante salvamento
  const handleIndexChange = useCallback((newIndex: number) => {
    if (!isSaving) {
      setPrevIndex(index);
      setIndex(newIndex);
      
      // Animar o indicador
      indicatorPosition.value = withTiming(newIndex, {
        duration: 250,
      });
    }
  }, [isSaving, index, indicatorPosition]);

  // Otimização do barStyle com useMemo
  const barStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    height: 60 + Math.min(20, insets.bottom),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.surfaceVariant,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
  }), [theme.colors, insets.bottom]);

  // Otimização do theme com useMemo
  const navigationTheme = useMemo(() => ({ 
    ...theme, 
    colors: {
      ...theme.colors,
      secondaryContainer: 'transparent',
    }
  }), [theme]);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <NavigationContainer ref={navigationRef}>
          <View style={{ flex: 1, position: 'relative' }}>
            <BottomNavigation
              navigationState={{ index, routes }}
              onIndexChange={handleIndexChange}
              renderScene={renderScene}
              shifting={false}
              compact={true}
              labeled={true}
              sceneAnimationType="opacity"
              barStyle={barStyle}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.outline}
              theme={navigationTheme}
              keyboardHidesNavigationBar={false}
            />
            <Animated.View style={indicatorStyle} />
          </View>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sceneContainer: {
    flex: 1,
    overflow: 'hidden',
  }
});

export default AppNavigator;