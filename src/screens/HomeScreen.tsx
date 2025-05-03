import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Surface, Button, Avatar, IconButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, SlideInUp, FadeInRight } from 'react-native-reanimated';
import StreakIndicator from '../components/StreakIndicator';
import UpcomingSessionCard from '../components/UpcomingSessionCard';
import { loadAchievementProfile, UserAchievementProfile, Achievement } from '../utils/achievementSystem';
import { useTimer } from '../contexts/TimerContext';
import { useSchedule } from '../contexts/ScheduleContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, openSettingsScreen } from '../components/AppNavigator';

const { width } = Dimensions.get('window');

// Function to ensure achievement icons are valid
const getValidIcon = (icon: string): string => {
  // Lista de ícones seguros do MaterialCommunityIcons
  const validIcons = [
    'clock-outline', 'clock-check', 'star-circle-outline', 'star-circle',
    'bookmark-outline', 'bookmark-multiple', 'bookmark-check', 'bookmark-plus',
    'calendar-check', 'calendar-week', 'calendar-star', 'calendar-month',
    'timer-sand', 'timer-sand-complete', 'calendar-weekend',
    'weather-sunny', 'weather-night', 'run-fast', 'meditation',
    'calendar-edit', 'calendar-clock', 'calendar-today', 'check-circle-outline'
  ];

  // Retornar o ícone se for válido, ou um ícone padrão se não for
  return validIcons.includes(icon) ? icon : 'star-outline';
};

// Frases motivacionais
const MOTIVATIONAL_QUOTES = [
  "A persistência é o caminho do êxito.",
  "O sucesso nasce do querer, da determinação e persistência.",
  "O conhecimento é a única coisa que ninguém pode tirar de você.",
  "Toda conquista começa com a decisão de tentar.",
  "Aprender é a única coisa que a mente nunca se cansa, nunca tem medo e nunca se arrepende."
];

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { totalStudyTime, startTimer, switchTimerMode, updateTimeDuration } = useTimer();
  const { nextSession, calculateNextSession } = useSchedule();
  
  const [profile, setProfile] = useState<UserAchievementProfile | null>(null);
  const [greeting, setGreeting] = useState('');
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    daysThisWeek: 0
  });
  
  // Escolher uma frase aleatória - use memo para evitar mudanças em cada render
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);
  
  // Definir saudação com base na hora do dia
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Bom dia';
    } else if (hour < 18) {
      newGreeting = 'Boa tarde';
    } else {
      newGreeting = 'Boa noite';
    }
    
    setGreeting(newGreeting);
  }, []);
  
  // Formatação do tempo de estudo total - memoize para evitar recálculos
  const formattedTotalTime = useMemo(() => {
    const totalHours = Math.floor(totalStudyTime / 3600000);
    return `${totalHours} horas`;
  }, [totalStudyTime]);
  
  // Carregar dados de conquistas e streak
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadAchievementProfile();
        if (!data) return;
        
        setProfile(data);
        
        // Calcular dias desta semana
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como primeiro dia da semana
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Filtrar dias de estudo desta semana
        const daysThisWeek = data.lastStudyDates.filter(dateStr => {
          const date = new Date(dateStr);
          return date >= startOfWeek;
        }).length;
        
        setStreakData({
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          daysThisWeek
        });
        
        // Calculate next session
        calculateNextSession();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, [calculateNextSession]);
  
  // Obter conquistas recentes (últimas 3 completadas)
  const recentAchievements = useMemo(() => {
    if (!profile) return [];
    
    return profile.achievements
      .filter(a => a.isCompleted && a.dateCompleted)
      .sort((a, b) => {
        // Ordenar por data mais recente
        return new Date(b.dateCompleted!).getTime() - new Date(a.dateCompleted!).getTime();
      })
      .slice(0, 3);
  }, [profile]);
  
  // Navegar para tela de conquistas
  const handleStreakPress = useCallback(() => {
    navigate('achievements');
  }, []);
  
  // Navegar para a tela do timer
  const handleStartSession = useCallback(() => {
    navigate('timer');
  }, []);
  
  // Navegar para a tela de estatísticas
  const handleViewStats = useCallback(() => {
    navigate('stats');
  }, []);
  
  // Navegar para a tela de histórico
  const handleViewHistory = useCallback(() => {
    navigate('history');
  }, []);
  
  // Navegar para a tela de configurações
  const handleViewSettings = useCallback(() => {
    openSettingsScreen();
  }, []);
  
  // Handle starting scheduled session
  const handleStartScheduledSession = useCallback(() => {
    if (!nextSession) return;
    
    // Set timer mode
    switchTimerMode(nextSession.mode);
    
    // Set duration in minutes
    const durationMs = nextSession.duration * 60 * 1000;
    updateTimeDuration(durationMs);
    
    // Store session ID for later use when saving
    AsyncStorage.setItem('currentScheduledSessionId', nextSession.id);
    AsyncStorage.setItem('currentScheduledSessionName', nextSession.name);
    
    // Navigate to timer
    navigate('timer');
    
    // Start timer
    startTimer();
  }, [nextSession, switchTimerMode, updateTimeDuration, startTimer]);
  
  return (
    <ScrollView 
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Math.max(20, insets.top),
          paddingBottom: Math.max(20, insets.bottom)
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <Animated.View 
        style={styles.header}
        entering={FadeIn.duration(800)}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.greeting, { color: theme.colors.primary }]}>
            {greeting}!
          </Text>
          <Text 
            variant="displayLarge" 
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Cole
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleViewSettings}>
          <Avatar.Icon 
            icon="cog" 
            size={50} 
            color={theme.colors.onSurfaceVariant}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Upcoming Session Card - New */}
      <UpcomingSessionCard onStartNow={handleStartScheduledSession} />
      
      {/* Card Motivacional */}
      <Animated.View entering={SlideInUp.duration(800).delay(300)}>
        <Surface 
          style={[styles.quoteCard, { backgroundColor: theme.colors.primary }]}
          elevation={4}
        >
          <MaterialCommunityIcons 
            name="format-quote-open" 
            size={36} 
            color={theme.colors.onPrimary}
            style={styles.quoteIcon}
          />
          <Text 
            variant="titleMedium" 
            style={[styles.quoteText, { color: theme.colors.onPrimary }]}
          >
            {randomQuote}
          </Text>
        </Surface>
      </Animated.View>
      
      {/* Botão grande para iniciar sessão */}
      <Animated.View entering={FadeIn.duration(1000).delay(500)}>
        <Button 
          mode="contained" 
          onPress={handleStartSession}
          icon="timer"
          contentStyle={styles.startButtonContent}
          labelStyle={styles.startButtonLabel}
          style={styles.startButton}
        >
          Iniciar Sessão de Estudo
        </Button>
      </Animated.View>
      
      {/* Indicador de Streak */}
      <Animated.View entering={FadeIn.duration(1000).delay(600)}>
        <StreakIndicator 
          currentStreak={streakData.currentStreak}
          longestStreak={streakData.longestStreak}
          daysThisWeek={streakData.daysThisWeek}
          onPress={handleStreakPress}
        />
      </Animated.View>
      
      {/* Resumo de Estatísticas */}
      <Animated.View entering={FadeIn.duration(1000).delay(700)}>
        <View style={styles.statsContainer}>
          <Surface 
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              Tempo Total
            </Text>
            <Text 
              variant="titleLarge" 
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
            >
              {formattedTotalTime}
            </Text>
          </Surface>
          
          <Surface 
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <MaterialCommunityIcons 
              name="trophy" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              Nível
            </Text>
            <Text 
              variant="titleLarge" 
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
            >
              {profile?.level || 1}
            </Text>
          </Surface>
          
          <Surface 
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <MaterialCommunityIcons 
              name="star" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              XP
            </Text>
            <Text 
              variant="titleLarge" 
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
            >
              {profile?.totalXp || 0}
            </Text>
          </Surface>
        </View>
      </Animated.View>
      
      {/* Achievements section */}
      {profile && recentAchievements.length > 0 && (
        <Animated.View entering={FadeInRight.duration(800).delay(700)}>
          <View style={styles.sectionHeader}>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
            >
              Conquistas Recentes
            </Text>
            <IconButton 
              icon="arrow-right" 
              size={20}
              onPress={handleStreakPress}
              style={styles.seeAllButton}
            />
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsList}
          >
            {recentAchievements.map((achievement) => (
              <Surface 
                key={achievement.id}
                style={[styles.achievementCard, { backgroundColor: theme.colors.surface }]}
                elevation={2}
              >
                <MaterialCommunityIcons 
                  name={getValidIcon(achievement.icon) as any} 
                  size={32} 
                  color={theme.colors.primary}
                  style={styles.achievementIcon}
                />
                <Text 
                  variant="titleMedium" 
                  style={{ color: theme.colors.onSurface }}
                  numberOfLines={2}
                >
                  {achievement.title}
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                  numberOfLines={2}
                >
                  {achievement.description}
                </Text>
                <View style={styles.achievementXp}>
                  <MaterialCommunityIcons name="star" size={16} color={theme.colors.secondary} />
                  <Text style={{ color: theme.colors.secondary, marginLeft: 4 }}>
                    +{achievement.xpReward} XP
                  </Text>
                </View>
              </Surface>
            ))}
          </ScrollView>
        </Animated.View>
      )}
      
      {/* Ações Rápidas */}
      <Animated.View entering={FadeIn.duration(1000).delay(900)}>
        <View style={styles.sectionHeader}>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
          >
            Ações Rápidas
          </Text>
        </View>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleViewStats}
          >
            <MaterialCommunityIcons 
              name="chart-line" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Estatísticas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleViewHistory}
          >
            <MaterialCommunityIcons 
              name="history" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Histórico
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleStreakPress}
          >
            <MaterialCommunityIcons 
              name="trophy" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Conquistas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleViewSettings}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={32} 
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Configurações
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Montserrat-Thin',
    fontSize: 42,
    letterSpacing: 1.2,
  },
  quoteCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  quoteIcon: {
    marginBottom: 8,
    opacity: 0.8,
  },
  quoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    marginBottom: 16,
    borderRadius: 12,
  },
  startButtonContent: {
    height: 56,
  },
  startButtonLabel: {
    fontSize: 18,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statCard: {
    width: '31%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  seeAllButton: {
    marginRight: -8,
  },
  achievementsList: {
    paddingBottom: 8,
  },
  achievementCard: {
    width: 180,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  achievementIcon: {
    marginBottom: 12,
  },
  achievementXp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default React.memo(HomeScreen); 