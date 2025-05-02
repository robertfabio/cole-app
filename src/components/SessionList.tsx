import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDescription } from '../utils/timeFormat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SessionList: React.FC = () => {
  const { studySessions } = useTimer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Formatar data simples para evitar erros
  const formatSimpleDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data desconhecida';
    }
  };

  if (!studySessions || studySessions.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingBottom: insets.bottom }]}>
        <Text 
          style={[styles.emptyText, { color: theme.colors.secondary }]}
        >
          Nenhuma sessão de estudo registrada.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.heading, { color: theme.colors.primary }]}>
        Histórico de Estudos
      </Text>
      <Divider style={styles.divider} />
      
      <FlatList
        data={studySessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sessionName, { color: theme.colors.primary }]}>
                {item.name || 'Sessão sem nome'}
              </Text>
              <View style={styles.sessionDetails}>
                <Text style={[styles.sessionTime, { color: theme.colors.secondary }]}>
                  {formatTimeDescription(item.duration)}
                </Text>
                <Text style={[styles.sessionDate, { color: theme.colors.secondary }]}>
                  {formatSimpleDate(item.date)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(80, insets.bottom + 20) }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  divider: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 2,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sessionTime: {
    fontSize: 14,
  },
  sessionDate: {
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SessionList; 