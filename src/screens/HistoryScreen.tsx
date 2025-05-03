import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDescription } from '../utils/timeFormat';
import SessionList from '../components/SessionList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

const HistoryScreen: React.FC = () => {
  const { studySessions } = useTimer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate total study time
  const totalTime = studySessions.reduce((total, session) => total + session.duration, 0);
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(16, insets.top)
        }
      ]}
    >
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.header}
      >
        <Text 
          variant="headlineMedium" 
          style={[styles.headerText, { color: theme.dark ? '#FFFFFF' : theme.colors.primary }]}
        >
          Histórico de Estudos
        </Text>
      </Animated.View>
      
      <Animated.View 
        entering={FadeIn.duration(500).delay(100)}
        style={[
          styles.summaryContainer, 
          { 
            backgroundColor: theme.dark ? theme.colors.surfaceVariant : theme.colors.surface,
            borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderWidth: theme.dark ? 1 : 0,
          }
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.dark ? '#FFFFFF' : theme.colors.primary }]}>
          Resumo de Estudos
        </Text>
        <View style={styles.statsContainer}>
          <Surface style={[styles.statItemSurface, { 
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : theme.colors.primaryContainer,
            elevation: 0
          }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.dark ? '#FFFFFF' : theme.colors.primary }]}>
                {studySessions.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? 'rgba(255,255,255,0.8)' : theme.colors.secondary }]}>
                Sessões
              </Text>
            </View>
          </Surface>
          
          <Surface style={[styles.statItemSurface, { 
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : theme.colors.primaryContainer,
            elevation: 0
          }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.dark ? '#FFFFFF' : theme.colors.primary }]}>
                {formatTimeDescription(totalTime)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? 'rgba(255,255,255,0.8)' : theme.colors.secondary }]}>
                Tempo Total
              </Text>
            </View>
          </Surface>
        </View>
      </Animated.View>
      
      <Animated.View 
        entering={FadeIn.duration(600).delay(200)}
        style={styles.listContainer}
      >
        <SessionList />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  summaryContainer: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItemSurface: {
    borderRadius: 8,
    marginHorizontal: 8,
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
});

export default HistoryScreen; 