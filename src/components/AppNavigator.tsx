import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import TimerScreen from '../screens/TimerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import { useTimer } from '../contexts/TimerContext';

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
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isSaving } = useTimer();
  
  const [routes] = useState<Route[]>([
    { 
      key: 'timer', 
      title: 'Cronômetro',
      focusedIcon: 'timer',
      unfocusedIcon: 'timer-outline',
      color: theme.colors.primary,
    },
    { 
      key: 'history', 
      title: 'Histórico',
      focusedIcon: 'history',
      unfocusedIcon: 'history',
      color: theme.colors.primary,
    },
    { 
      key: 'stats', 
      title: 'Estatísticas',
      focusedIcon: 'chart-bar',
      unfocusedIcon: 'chart-bar',
      color: theme.colors.primary,
    },
    { 
      key: 'settings', 
      title: 'Configurações',
      focusedIcon: 'cog',
      unfocusedIcon: 'cog-outline',
      color: theme.colors.primary,
    },
  ]);

  // Memorize cada cena para evitar re-renderizações desnecessárias
  const renderScene = useCallback(({ route, jumpTo }: SceneProps) => {
    switch (route.key) {
      case 'timer':
        return <TimerScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'stats':
        return <StatsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  }, []);

  // Lidar com mudança de índice, bloqueando durante salvamento
  const handleIndexChange = (newIndex: number) => {
    if (!isSaving) {
      setIndex(newIndex);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <NavigationContainer>
          <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={handleIndexChange}
            renderScene={renderScene}
            shifting={true}
            labeled={true}
            sceneAnimationType="shifting"
            barStyle={{ 
              backgroundColor: theme.colors.surface,
              height: 60 + Math.min(20, insets.bottom),
              borderTopWidth: 0.5,
              borderTopColor: theme.colors.surfaceVariant,
              elevation: 4,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: -1 },
              shadowRadius: 8,
              shadowOpacity: 0.1,
            }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.outline}
            theme={{ 
              ...theme, 
              colors: {
                ...theme.colors,
                secondaryContainer: 'transparent', // Remove o fundo dos ícones selecionados
              }
            }}
          />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});

export default AppNavigator;