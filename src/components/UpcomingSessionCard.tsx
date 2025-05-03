import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSchedule, ScheduleSession } from '../contexts/ScheduleContext';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface UpcomingSessionCardProps {
  onStartNow?: () => void;
}

// Helper to format time from "HH:MM" to "HH:MM AM/PM"
const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Day names
const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const UpcomingSessionCard: React.FC<UpcomingSessionCardProps> = React.memo(({ onStartNow }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { nextSession, isLoading } = useSchedule();
  
  // Handle navigation to schedule screen
  const handleViewSchedule = () => {
    // @ts-ignore - Navigate to the schedule tab (index 3)
    navigation.navigate('schedule');
  };
  
  // Calculate time remaining
  const timeInfo = useMemo(() => {
    if (!nextSession) return null;
    
    const now = new Date();
    const currentDay = now.getDay();
    const sessionDay = nextSession.dayOfWeek;
    
    // Calculate days until the session
    let daysUntil = sessionDay - currentDay;
    if (daysUntil < 0) daysUntil += 7; // Wrap around to next week
    
    // Format the day
    let dayLabel = '';
    if (daysUntil === 0) {
      dayLabel = 'Hoje';
    } else if (daysUntil === 1) {
      dayLabel = 'Amanhã';
    } else {
      dayLabel = DAYS_OF_WEEK[sessionDay];
    }
    
    return {
      dayLabel,
      formattedTime: formatTime(nextSession.startTime)
    };
  }, [nextSession]);
  
  // Get mode icon based on timer mode
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'focus':
        return 'timer-outline';
      case 'shortBreak':
        return 'coffee-outline';
      case 'longBreak':
        return 'sleep';
      default:
        return 'timer-outline';
    }
  };
  
  // If loading, return null to avoid flickering
  if (isLoading) {
    return null;
  }
  
  // If no session, show empty state
  if (!nextSession) {
    return (
      <Animated.View entering={FadeIn.duration(800)}>
        <Surface style={[styles.noSessionCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <Text style={[styles.noSessionText, { color: theme.colors.onSurfaceVariant }]}>
            Sem sessões agendadas
          </Text>
          <Button 
            mode="contained" 
            onPress={handleViewSchedule}
            style={{ marginTop: 12 }}
          >
            Criar Agenda
          </Button>
        </Surface>
      </Animated.View>
    );
  }
  
  // Get safe values to prevent errors
  const sessionName = nextSession.name || 'Sessão';
  const sessionMode = nextSession.mode || 'focus';
  const sessionDuration = nextSession.duration || 25;
  const sessionColor = nextSession.color || theme.colors.surfaceVariant;
  
  return (
    <Animated.View entering={FadeIn.duration(800)}>
      <Surface 
        style={[
          styles.card, 
          { 
            backgroundColor: sessionColor,
            borderColor: theme.colors.outline
          }
        ]} 
        elevation={2}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Próxima Sessão
          </Text>
          <IconButton 
            icon="dots-vertical" 
            size={20} 
            onPress={handleViewSchedule}
            style={styles.optionsButton}
          />
        </View>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={getModeIcon(sessionMode)} 
              size={32} 
              color={theme.colors.onSurface} 
            />
          </View>
          
          <View style={styles.detailsContainer}>
            <Text variant="titleMedium" style={styles.sessionName}>
              {sessionName}
            </Text>
            
            {timeInfo && (
              <View style={styles.timeRow}>
                <MaterialCommunityIcons 
                  name="calendar-clock" 
                  size={18} 
                  color={theme.colors.onSurfaceVariant} 
                  style={styles.timeIcon} 
                />
                <Text variant="bodyMedium" style={styles.timeText}>
                  {timeInfo.dayLabel} às {timeInfo.formattedTime}
                </Text>
              </View>
            )}
            
            <View style={styles.timeRow}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={18} 
                color={theme.colors.onSurfaceVariant} 
                style={styles.timeIcon} 
              />
              <Text variant="bodyMedium" style={styles.timeText}>
                {sessionDuration} minutos
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={onStartNow}
            style={styles.startButton}
            icon="play"
          >
            Começar Agora
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleViewSchedule}
            style={styles.viewButton}
          >
            Ver Agenda
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  optionsButton: {
    margin: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  sessionName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeIcon: {
    marginRight: 6,
  },
  timeText: {
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  startButton: {
    flex: 1,
    marginRight: 8,
  },
  viewButton: {
    flex: 1,
    marginLeft: 8,
  },
  noSessionCard: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSessionText: {
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
});

export default UpcomingSessionCard; 