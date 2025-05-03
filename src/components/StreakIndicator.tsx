import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FlipInXUp
} from 'react-native-reanimated';

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
  daysThisWeek: number;
  onPress?: () => void;
}

const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  currentStreak,
  longestStreak,
  daysThisWeek,
  onPress
}) => {
  const theme = useTheme();
  const fireScale = useSharedValue(1);
  const dayDotsOpacity = useSharedValue(0.6);
  
  // Animar o ícone de fogo quando a sequência é grande
  useEffect(() => {
    if (currentStreak >= 3) {
      fireScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1, // Repetir infinitamente
        true // Reversível
      );
    } else {
      fireScale.value = 1;
    }
    
    // Animar os pontos dos dias da semana
    dayDotsOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 })
      ),
      -1,
      true
    );
  }, [currentStreak, fireScale, dayDotsOpacity]);
  
  // Estilo animado para o ícone de fogo
  const fireIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }]
  }));
  
  // Estilo animado para os pontos dos dias da semana
  const dayDotsStyle = useAnimatedStyle(() => ({
    opacity: dayDotsOpacity.value
  }));
  
  // Determinar a cor do ícone de fogo conforme a sequência
  const getFireColor = () => {
    if (currentStreak >= 30) return '#FF1744'; // Vermelho intenso para 30+ dias
    if (currentStreak >= 15) return '#FF5722'; // Laranja para 15+ dias
    if (currentStreak >= 7) return '#FFA000';  // Amarelo/laranja para 7+ dias
    if (currentStreak >= 3) return '#FFD600';  // Amarelo para 3+ dias
    return theme.colors.outline;                // Cor neutra para menos de 3 dias
  };
  
  // Renderizar os pontos dos dias da semana
  const renderDayDots = () => {
    // Dias da semana (domingo a sábado)
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    
    return (
      <View style={styles.daysContainer}>
        {days.map((day, index) => {
          // Lógica simplificada: consideramos que os primeiros "daysThisWeek" dias estão completos
          const isCompleted = index < daysThisWeek;
          
          return (
            <View key={index} style={styles.dayDotContainer}>
              <View 
                style={[
                  styles.dayDot, 
                  { 
                    backgroundColor: isCompleted ? theme.colors.primary : theme.colors.surfaceVariant,
                  }
                ]} 
              />
              <Text 
                style={[
                  styles.dayLabel, 
                  { 
                    color: isCompleted ? theme.colors.primary : theme.colors.outline,
                    fontWeight: isCompleted ? 'bold' : 'normal'
                  }
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Animated.View entering={FlipInXUp.duration(800)}>
        <Surface 
          style={[
            styles.container, 
            { 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.outline,
            }
          ]}
        >
          <View style={styles.streakHeader}>
            <Animated.View style={fireIconStyle}>
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color={getFireColor()}
              />
            </Animated.View>
            
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>{currentStreak}</Text> dias seguidos
            </Text>
          </View>
          
          <Animated.View style={dayDotsStyle}>
            {renderDayDots()}
          </Animated.View>
          
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            Recorde: <Text style={{ fontWeight: 'bold' }}>{longestStreak}</Text> dias
          </Text>
        </Surface>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    margin: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dayDotContainer: {
    alignItems: 'center',
    width: 20,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 10,
  }
});

export default React.memo(StreakIndicator); 