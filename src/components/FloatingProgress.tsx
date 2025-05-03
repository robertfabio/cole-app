import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SlideInRight,
  SlideOutRight,
  interpolateColor
} from 'react-native-reanimated';
import { formatTimeWithSeconds } from '../utils/timeFormat';

interface FloatingProgressProps {
  visible: boolean;
  zenTime: number;
  requiredTime: number;
}

const FloatingProgress: React.FC<FloatingProgressProps> = ({ 
  visible, 
  zenTime, 
  requiredTime 
}) => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  
  // Calcular progresso atual
  useEffect(() => {
    const progressValue = Math.min(zenTime / requiredTime, 1);
    progress.value = withTiming(progressValue, { duration: 500 });
  }, [zenTime, requiredTime, progress]);
  
  // Estilos animados
  const progressStyle = useAnimatedStyle(() => {
    // Interpolar cores de acordo com o progresso
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [
        theme.dark ? '#3D4164' : '#FFCDD2', // Início
        theme.dark ? '#5A6194' : '#EF9A9A', // Meio
        theme.dark ? '#7B82C5' : '#E53935'  // Completo
      ]
    );
    
    return {
      width: `${progress.value * 100}%`,
      backgroundColor
    };
  });
  
  if (!visible) return null;
  
  // Formatar tempo em minutos para exibição
  const formatDisplayTime = () => {
    return formatTimeWithSeconds(zenTime).split(':').slice(0, 2).join(':');
  };
  
  // Calcular porcentagem
  const getPercentage = () => {
    const percentage = Math.min(Math.round((zenTime / requiredTime) * 100), 100);
    return `${percentage}%`;
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant }
      ]}
      entering={SlideInRight.duration(400).springify()}
      exiting={SlideOutRight.duration(300).springify()}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="meditation" 
          size={24} 
          color={theme.colors.primary}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
            Modo Zen
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatDisplayTime()} ({getPercentage()})
          </Text>
        </View>
        
        <View style={[styles.progressBackground, { backgroundColor: theme.colors.background }]}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 180,
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBackground: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  }
});

export default React.memo(FloatingProgress); 