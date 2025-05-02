import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import SessionSave from '../components/SessionSave';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TimerScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Estilos para os textos do cabeçalho
  const titleStyle = {
    ...styles.headerText,
    color: theme.colors.primary,
    fontFamily: 'Montserrat-Thin',
    letterSpacing: 1.2,
    fontSize: 38,
  };

  const subtitleStyle = {
    ...styles.subHeaderText,
    color: theme.colors.secondary,
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(20, insets.top),
          paddingBottom: Math.max(20, insets.bottom)
        }
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <View style={styles.header}>
        <Text style={titleStyle}>
          Cole
        </Text>
        <Text 
          variant="titleMedium"
          style={subtitleStyle}
        >
          Cronômetro de Estudos
        </Text>
      </View>
      
      <Surface style={[styles.timerContainer, { 
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.primary,
      }]}>
        <TimerDisplay />
        <TimerControls />
        <SessionSave />
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
  },
  subHeaderText: {
    marginTop: 8,
    textAlign: 'center',
  },
  timerContainer: {
    borderRadius: 24,
    padding: 24,
    elevation: 2,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
});

export default TimerScreen;