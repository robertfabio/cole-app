import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Surface, ProgressBar, Divider, Chip, IconButton, Badge } from 'react-native-paper';
import { 
  Achievement, 
  UserAchievementProfile, 
  loadAchievementProfile, 
  getCompletedAchievementCount, 
  getTotalAchievementCount, 
  getCompletionPercentage,
  getXpForNextLevel,
  DailyAchievement
} from '../utils/achievementSystem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInRight,
  Layout,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  SlideInUp
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AchievementItem = React.memo(({ 
  achievement, 
  isExpanded, 
  onToggle
}: { 
  achievement: Achievement; 
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  
  // Animação da barra de progresso
  useEffect(() => {
    if (achievement.isCompleted) {
      progress.value = withTiming(1, { duration: 600 });
    } else {
      const progressValue = Math.min(
        achievement.currentProgress / achievement.requirement, 
        0.99
      );
      progress.value = withTiming(progressValue, { duration: 800 });
    }
  }, [achievement, progress]);
  
  // Animação do item
  const itemStyle = useAnimatedStyle(() => {
    const scaleValue = isExpanded 
      ? interpolate(progress.value, [0, 1], [1, 1.02])
      : 1;
      
    return {
      transform: [{ scale: scaleValue }]
    };
  });
  
  // Formatação do progresso
  const formatProgress = () => {
    if (achievement.isCompleted) {
      return '100%';
    }
    
    const percentage = Math.round((achievement.currentProgress / achievement.requirement) * 100);
    return `${percentage}%`;
  };
  
  // Estilos baseados em estado de conclusão
  const containerStyle = {
    backgroundColor: achievement.isCompleted 
      ? theme.dark
        ? 'rgba(46, 125, 50, 0.2)'  // Verde escuro com transparência
        : 'rgba(200, 230, 201, 0.8)' // Verde claro com transparência
      : theme.colors.surfaceVariant,
    borderLeftWidth: 5,
    borderLeftColor: achievement.isCompleted 
      ? theme.colors.primary 
      : theme.colors.outline
  };
  
  const titleStyle = {
    color: achievement.isCompleted 
      ? theme.colors.primary
      : theme.colors.onSurface,
    fontWeight: achievement.isCompleted ? 'bold' : 'normal'
  };
  
  const progressBarColor = achievement.isCompleted 
    ? theme.colors.primary
    : theme.colors.secondary;
  
  return (
    <Animated.View 
      style={[styles.achievementItem, containerStyle, itemStyle]}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        onPress={onToggle}
        style={styles.achievementHeader}
        activeOpacity={0.7}
      >
        <View style={styles.achievementIconContainer}>
          <MaterialCommunityIcons 
            name={getValidIcon(achievement.icon)} 
            size={28} 
            color={achievement.isCompleted ? theme.colors.primary : theme.colors.onSurfaceVariant} 
          />
        </View>
        
        <View style={styles.achievementContent}>
          <View style={styles.achievementTitleRow}>
            <Text 
              variant="titleMedium" 
              style={titleStyle}
              numberOfLines={isExpanded ? undefined : 1}
            >
              {achievement.title}
            </Text>
            
            {achievement.isCompleted && (
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={theme.colors.primary} 
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          
          <Text 
            variant="bodySmall" 
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={isExpanded ? undefined : 1}
          >
            {achievement.description}
          </Text>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress.value} 
              color={progressBarColor}
              style={styles.progressBar} 
            />
            <Text 
              variant="labelSmall" 
              style={{ 
                color: achievement.isCompleted ? theme.colors.primary : theme.colors.onSurfaceVariant,
                marginLeft: 4
              }}
            >
              {formatProgress()}
            </Text>
          </View>
        </View>
        
        <IconButton 
          icon={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          iconColor={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.achievementDetails}
        >
          <Divider style={{ marginVertical: 10 }} />
          
          <View style={styles.achievementDetailRow}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Categoria:
            </Text>
            <Chip 
              icon={() => (
                <MaterialCommunityIcons 
                  name={getCategoryIcon(achievement.category)} 
                  size={16} 
                  color={theme.colors.onPrimaryContainer} 
                />
              )}
              style={{ 
                backgroundColor: theme.colors.primaryContainer,
                height: 28
              }}
            >
              <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 12 }}>
                {formatCategory(achievement.category)}
              </Text>
            </Chip>
          </View>
          
          <View style={styles.achievementDetailRow}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Recompensa:
            </Text>
            <View style={styles.xpContainer}>
              <MaterialCommunityIcons name="star" size={16} color={theme.colors.secondary} />
              <Text style={{ color: theme.colors.secondary, marginLeft: 4, fontWeight: 'bold' }}>
                {achievement.xpReward} XP
              </Text>
            </View>
          </View>
          
          {achievement.isCompleted && achievement.dateCompleted && (
            <View style={styles.achievementDetailRow}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Completado em:
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                {new Date(achievement.dateCompleted).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
});

// Componente para conquistas diárias
const DailyAchievementItem = React.memo(({ 
  achievement
}: { 
  achievement: DailyAchievement;
}) => {
  const theme = useTheme();
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = achievement.lastCompletedDate === today;
  const pulseAnim = useSharedValue(1);
  
  // Animação de pulso para conquistas não completadas
  useEffect(() => {
    if (!isCompletedToday) {
      const interval = setInterval(() => {
        pulseAnim.value = withTiming(1.05, { duration: 1000 }, () => {
          pulseAnim.value = withTiming(1, { duration: 1000 });
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isCompletedToday, pulseAnim]);
  
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isCompletedToday ? 1 : pulseAnim.value }],
  }));
  
  return (
    <Animated.View
      style={[
        styles.dailyAchievementCard,
        {
          backgroundColor: isCompletedToday 
            ? theme.dark 
              ? 'rgba(46, 125, 50, 0.3)' 
              : 'rgba(200, 230, 201, 0.9)'
            : theme.colors.surfaceVariant,
        },
        cardStyle
      ]}
      entering={SlideInUp.duration(400).springify()}
    >
      <View style={styles.dailyAchievementIconContainer}>
        <MaterialCommunityIcons
          name={getValidIcon(achievement.icon)}
          size={32}
          color={isCompletedToday ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
        {isCompletedToday && (
          <View style={styles.completedBadge}>
            <MaterialCommunityIcons
              name="check"
              size={12}
              color="#FFF"
            />
          </View>
        )}
      </View>
      
      <Text
        variant="titleMedium"
        style={[
          styles.dailyAchievementTitle,
          { 
            color: isCompletedToday ? theme.colors.primary : theme.colors.onSurface,
            textDecorationLine: isCompletedToday ? 'line-through' : 'none'
          }
        ]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>
      
      <Text
        variant="bodySmall"
        style={[
          styles.dailyAchievementDescription,
          { color: theme.colors.onSurfaceVariant }
        ]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>
      
      <View style={styles.dailyAchievementReward}>
        <MaterialCommunityIcons name="star" size={14} color={theme.colors.secondary} />
        <Text 
          style={{ 
            color: theme.colors.secondary, 
            marginLeft: 4, 
            fontSize: 12,
            fontWeight: 'bold'
          }}
        >
          +{achievement.xpReward} XP
        </Text>
      </View>
    </Animated.View>
  );
});

// Funções auxiliares
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'tempo': return 'clock-outline';
    case 'sessões': return 'bookmark-multiple';
    case 'consistência': return 'calendar-check';
    case 'pomodoros': return 'timer-sand';
    case 'especial': return 'trophy';
    default: return 'star';
  }
};

const formatCategory = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Adicione a função getValidIcon
const getValidIcon = (icon: string): any => {
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

// Tela principal
const AchievementsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const [profile, setProfile] = useState<UserAchievementProfile | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showDailyAchievements, setShowDailyAchievements] = useState(false);
  
  // Carregar dados de conquistas
  useEffect(() => {
    const loadProfile = async () => {
      const data = await loadAchievementProfile();
      setProfile(data);
    };
    
    loadProfile();
  }, []);
  
  // Alternar expansão do item
  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  // Filtrar conquistas por categoria
  const getFilteredAchievements = useCallback(() => {
    if (!profile) return [];
    
    if (!activeCategory) {
      return profile.achievements;
    }
    
    return profile.achievements.filter(a => a.category === activeCategory);
  }, [profile, activeCategory]);
  
  // Obter progresso para próximo nível
  const getLevelProgress = () => {
    if (!profile) return { current: 0, required: 1000, percentage: 0 };
    
    const { current, required } = getXpForNextLevel(profile);
    const percentage = Math.min(current / required, 1);
    
    return { current, required, percentage };
  };
  
  // Contar conquistas diárias completadas hoje
  const countCompletedDailyAchievements = useCallback(() => {
    if (!profile) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    return profile.dailyAchievements.filter(a => a.lastCompletedDate === today).length;
  }, [profile]);
  
  // Renderizar as categorias
  const renderCategoryChips = () => {
    const categories = ['tempo', 'sessões', 'consistência', 'pomodoros', 'especial'];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsContainer}
      >
        <Chip
          mode={activeCategory === null ? "flat" : "outlined"}
          selected={activeCategory === null}
          onPress={() => setActiveCategory(null)}
          style={styles.categoryChip}
        >
          Todas
        </Chip>
        
        {categories.map(category => (
          <Chip
            key={category}
            mode={activeCategory === category ? "flat" : "outlined"}
            selected={activeCategory === category}
            onPress={() => setActiveCategory(category)}
            style={styles.categoryChip}
            icon={() => (
              <MaterialCommunityIcons 
                name={getCategoryIcon(category)} 
                size={16} 
                color={activeCategory === category ? theme.colors.onPrimary : theme.colors.primary} 
              />
            )}
          >
            {formatCategory(category)}
          </Chip>
        ))}
      </ScrollView>
    );
  };
  
  if (!profile) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <Text>Carregando conquistas...</Text>
      </View>
    );
  }
  
  const levelProgress = getLevelProgress();
  const completedCount = getCompletedAchievementCount(profile);
  const totalCount = getTotalAchievementCount(profile);
  const filteredAchievements = getFilteredAchievements();
  const completedDailyCount = countCompletedDailyAchievements();
  const totalDailyCount = profile.dailyAchievements.length;
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: insets.top || 16
        }
      ]}
    >
      <Surface 
        style={[
          styles.headerContainer,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <View style={styles.profileInfoContainer}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelNumber}>
              {profile.level}
            </Text>
          </View>
          
          <View style={styles.userInfoContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              Nível {profile.level}
            </Text>
            
            <View style={styles.xpProgressContainer}>
              <ProgressBar 
                progress={levelProgress.percentage} 
                color={theme.colors.primary}
                style={styles.xpProgressBar} 
              />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {levelProgress.current} / {levelProgress.required} XP
              </Text>
            </View>
            
            <View style={styles.statsContainer}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Conquistas: {completedCount}/{totalCount} ({getCompletionPercentage(profile)}%)
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                XP Total: {profile.totalXp}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Seção de Conquistas Diárias */}
        <TouchableOpacity 
          style={styles.dailyAchievementsHeader}
          onPress={() => setShowDailyAchievements(!showDailyAchievements)}
          activeOpacity={0.7}
        >
          <View style={styles.dailyAchievementsTitle}>
            <MaterialCommunityIcons 
              name="calendar-today" 
              size={20} 
              color={theme.colors.primary} 
              style={{ marginRight: 8 }}
            />
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
            >
              Conquistas Diárias
            </Text>
            <Badge 
              style={{ 
                backgroundColor: theme.colors.secondary,
                marginLeft: 8
              }}
            >
              {completedDailyCount}/{totalDailyCount}
            </Badge>
          </View>
          <IconButton 
            icon={showDailyAchievements ? "chevron-up" : "chevron-down"} 
            size={24} 
            iconColor={theme.colors.primary}
          />
        </TouchableOpacity>
        
        {showDailyAchievements && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.dailyAchievementsContainer}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dailyAchievementsList}
            >
              {profile.dailyAchievements.map((achievement) => (
                <DailyAchievementItem
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}
        
        <Divider style={{ marginVertical: 8 }} />
        
        {renderCategoryChips()}
      </Surface>
      
      <FlatList
        data={filteredAchievements}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.achievementsList}
        renderItem={({ item }) => (
          <AchievementItem 
            achievement={item} 
            isExpanded={expandedId === item.id}
            onToggle={() => toggleExpanded(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <Text 
            style={[
              styles.emptyListText, 
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            Nenhuma conquista encontrada nesta categoria.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfoContainer: {
    flex: 1,
  },
  xpProgressContainer: {
    marginTop: 8,
  },
  xpProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryChipsContainer: {
    paddingVertical: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  achievementsList: {
    padding: 16,
    paddingBottom: 100, // Espaço extra para scroll
  },
  achievementItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  achievementDetails: {
    padding: 12,
    paddingTop: 0,
  },
  achievementDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  dailyAchievementCard: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  dailyAchievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  completedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(46, 125, 50, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  dailyAchievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dailyAchievementDescription: {
    marginBottom: 8,
  },
  dailyAchievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyAchievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dailyAchievementsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyAchievementsContainer: {
    padding: 12,
  },
  dailyAchievementsList: {
    padding: 12,
  },
});

export default AchievementsScreen; 