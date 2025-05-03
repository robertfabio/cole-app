import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Achievement } from '../utils/achievementSystem';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  xpEarned: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onClose,
  xpEarned
}) => {
  const theme = useTheme();
  
  // Animação de entrada e saída
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const iconRotate = useSharedValue(0);
  const starScale = useSharedValue(0);
  
  // Auto-fechamento após 5 segundos
  useEffect(() => {
    // Animações de entrada
    translateY.value = withTiming(0, { 
      duration: 600,
      easing: Easing.bezier(0.25, 1, 0.5, 1)
    });
    
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, { duration: 400 });
    
    // Animação de rotação do ícone
    iconRotate.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 800, easing: Easing.elastic(1.5) })
    );
    
    // Animação das estrelas
    starScale.value = withDelay(400, withTiming(1, { 
      duration: 500,
      easing: Easing.elastic(1.5)
    }));
    
    // Auto-fechamento
    const closeTimer = setTimeout(() => {
      translateY.value = withTiming(-100, { 
        duration: 500, 
        easing: Easing.bezier(0.5, 0, 0.75, 0) 
      });
      opacity.value = withTiming(0, { 
        duration: 400 
      }, () => {
        runOnJS(onClose)();
      });
    }, 5000);
    
    return () => clearTimeout(closeTimer);
  }, [achievement, onClose, translateY, opacity, scale, iconRotate, starScale]);
  
  // Estilos animados
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value
  }));
  
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${iconRotate.value * 360}deg` },
      { scale: interpolate(iconRotate.value, [0, 0.5, 1], [1, 1.3, 1]) }
    ]
  }));
  
  const starAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
    opacity: starScale.value
  }));
  
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content style={styles.cardContent}>
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <MaterialCommunityIcons
              name={achievement.icon}
              size={36}
              color={theme.colors.primary}
            />
          </Animated.View>
          
          <View style={styles.textContainer}>
            <Text 
              variant="titleMedium" 
              style={{ 
                color: theme.colors.primary,
                fontWeight: 'bold'
              }}
            >
              Conquista Desbloqueada!
            </Text>
            <Text 
              variant="titleSmall" 
              style={{ 
                color: theme.colors.onPrimaryContainer,
                marginTop: 4
              }}
            >
              {achievement.title}
            </Text>
            <Text 
              variant="bodySmall" 
              style={{ 
                color: theme.colors.onSurfaceVariant,
                marginTop: 2
              }}
            >
              {achievement.description}
            </Text>
            
            <Animated.View style={[styles.xpContainer, starAnimationStyle]}>
              <MaterialCommunityIcons 
                name="star" 
                size={18} 
                color={theme.colors.secondary} 
              />
              <Text 
                variant="bodyMedium" 
                style={{ 
                  color: theme.colors.secondary,
                  fontWeight: 'bold',
                  marginLeft: 4
                }}
              >
                +{xpEarned} XP
              </Text>
            </Animated.View>
          </View>
          
          <IconButton
            icon="close"
            size={20}
            onPress={onClose}
            style={styles.closeButton}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    zIndex: 1000,
    width: width - 32,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  closeButton: {
    margin: 0,
    padding: 0,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default React.memo(AchievementNotification); 