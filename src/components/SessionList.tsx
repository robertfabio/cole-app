import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Divider, Text, useTheme, Surface } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDescription } from '../utils/timeFormat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
          style={[styles.emptyText, { color: theme.dark ? 'rgba(255,255,255,0.7)' : theme.colors.secondary }]}
        >
          Nenhuma sessão de estudo registrada.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.heading, { color: theme.dark ? '#FFFFFF' : theme.colors.primary }]}>
        Sessões Registradas
      </Text>
      <Divider style={[styles.divider, { 
        backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : theme.colors.outlineVariant 
      }]} />
      
      <FlatList
        data={studySessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
            <Card 
              style={[styles.card, { 
                backgroundColor: theme.dark ? theme.colors.surfaceVariant : theme.colors.surface,
                borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderWidth: theme.dark ? 1 : 0,
              }]}
              mode="outlined"
            >
              <Card.Content>
                <Text style={[styles.sessionName, { color: theme.dark ? '#FFFFFF' : theme.colors.primary }]}>
                  {item.name || 'Sessão sem nome'}
                </Text>
                <View style={styles.sessionDetails}>
                  <Surface style={[styles.sessionTimeBadge, {
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : theme.colors.primaryContainer,
                    elevation: 0
                  }]}>
                    <Text style={[styles.sessionTime, { 
                      color: theme.dark ? 'rgba(255,255,255,0.9)' : theme.colors.primary
                    }]}>
                      {formatTimeDescription(item.duration)}
                    </Text>
                  </Surface>
                  <Text style={[styles.sessionDate, { 
                    color: theme.dark ? 'rgba(255,255,255,0.7)' : theme.colors.secondary 
                  }]}>
                    {formatSimpleDate(item.date)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  divider: {
    marginBottom: 16,
    marginHorizontal: 16,
    height: 1,
  },
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4,
    borderRadius: 12,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sessionTimeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
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