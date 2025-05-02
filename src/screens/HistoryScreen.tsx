import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDescription } from '../utils/timeFormat';
import SessionList from '../components/SessionList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerText, { color: theme.colors.primary }]}
        >
          Histórico de Estudos
        </Text>
      </View>
      
      <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.primary }]}>
          Resumo de Estudos
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {studySessions.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
              Sessões
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {formatTimeDescription(totalTime)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
              Tempo Total
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.listContainer}>
        <SessionList />
      </View>
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
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 8,
  },
  statValue: {
    fontSize: 22,
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