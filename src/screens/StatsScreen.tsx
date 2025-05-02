import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Divider, Chip, IconButton } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { formatTime, formatTimeDescription } from '../utils/timeFormat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withSequence, 
  FadeInLeft,
  FadeInRight 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width * 0.85;

type Period = 'day' | 'week' | 'month' | 'year';

const StatsScreen: React.FC = () => {
  const { studySessions } = useTimer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  
  // Animation values
  const barHeights = useSharedValue([0, 0, 0, 0]);
  const chartScale = useSharedValue(0.9);

  useEffect(() => {
    // Animate the chart when component mounts
    chartScale.value = withSequence(
      withTiming(1.05, { duration: 500 }),
      withSpring(1)
    );
    
    // Animate bars with sequential values based on data
    const totalTime = getTotalStudyTime();
    const maxTime = getMaxTime();
    const statsData = getStats();
    const normalizedHeights = statsData.map(time => Math.min((time / (maxTime || 1)) * 0.8, 0.8));
    
    barHeights.value = withTiming(normalizedHeights as any, { duration: 1000 });
  }, [selectedPeriod, studySessions]);

  // Get total study time
  const getTotalStudyTime = () => {
    return studySessions.reduce((total, session) => total + session.duration, 0);
  };

  // Get total study sessions count
  const getTotalSessionsCount = () => {
    return studySessions.length;
  };

  // Get longest study session
  const getLongestSession = () => {
    if (studySessions.length === 0) return 0;
    return Math.max(...studySessions.map(session => session.duration));
  };

  // Get average study time per session
  const getAverageTime = () => {
    if (studySessions.length === 0) return 0;
    return getTotalStudyTime() / getTotalSessionsCount();
  };

  // Get stats based on selected period
  const getStats = () => {
    switch (selectedPeriod) {
      case 'day':
        return getDailyStats();
      case 'week':
        return getWeeklyStats();
      case 'month':
        return getMonthlyStats();
      case 'year':
        return getYearlyStats();
      default:
        return getWeeklyStats();
    }
  };

  // Get today's stats hourly breakdown
  const getDailyStats = () => {
    const stats = Array(24).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= today) {
        const hour = sessionDate.getHours();
        stats[hour] += session.duration;
      }
    });
    
    return stats;
  };

  // Get this week's stats for 7 days
  const getWeeklyStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStats = Array(7).fill(0);
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const diffTime = today.getTime() - sessionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        weekStats[6 - diffDays] += session.duration;
      }
    });
    
    return weekStats;
  };

  // Get monthly stats
  const getMonthlyStats = () => {
    const stats = Array(30).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const diffTime = today.getTime() - sessionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 30) {
        stats[29 - diffDays] += session.duration;
      }
    });
    
    return stats;
  };

  // Get yearly stats (by month)
  const getYearlyStats = () => {
    const stats = Array(12).fill(0);
    const today = new Date();
    const year = today.getFullYear();
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate.getFullYear() === year) {
        const month = sessionDate.getMonth();
        stats[month] += session.duration;
      }
    });
    
    return stats;
  };

  // Get max time for scaling
  const getMaxTime = () => {
    const stats = getStats();
    return Math.max(...stats, 1); // Min 1 to avoid division by zero
  };

  // Get appropriate labels based on selected period
  const getLabels = () => {
    switch (selectedPeriod) {
      case 'day':
        return ['00h', '04h', '08h', '12h', '16h', '20h'];
      case 'week':
        return getWeekDayLabels();
      case 'month':
        return ['1', '5', '10', '15', '20', '25', '30'];
      case 'year':
        return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      default:
        return getWeekDayLabels();
    }
  };

  // Get week day labels
  const getWeekDayLabels = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date().getDay();
    
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const index = (today - i + 7) % 7;
      result.push(days[index]);
    }
    
    return result;
  };

  // Get chart data
  const getChartData = () => {
    const stats = getStats();
    const labels = getLabels();

    // Filter labels based on data length
    const filteredLabels = selectedPeriod === 'year' 
      ? labels 
      : selectedPeriod === 'day' 
        ? labels.slice(0, Math.min(labels.length, 6))
        : labels.slice(0, Math.min(labels.length, 7));

    // For daily and monthly view, we need to filter the data points
    let filteredData;
    if (selectedPeriod === 'day') {
      // Group by 4 hours for daily view
      filteredData = [
        stats.slice(0, 4).reduce((sum, value) => sum + value, 0),
        stats.slice(4, 8).reduce((sum, value) => sum + value, 0),
        stats.slice(8, 12).reduce((sum, value) => sum + value, 0),
        stats.slice(12, 16).reduce((sum, value) => sum + value, 0),
        stats.slice(16, 20).reduce((sum, value) => sum + value, 0),
        stats.slice(20, 24).reduce((sum, value) => sum + value, 0),
      ];
    } else if (selectedPeriod === 'month') {
      // Group by 5 days for monthly view
      filteredData = [
        stats.slice(0, 5).reduce((sum, value) => sum + value, 0),
        stats.slice(5, 10).reduce((sum, value) => sum + value, 0),
        stats.slice(10, 15).reduce((sum, value) => sum + value, 0),
        stats.slice(15, 20).reduce((sum, value) => sum + value, 0),
        stats.slice(20, 25).reduce((sum, value) => sum + value, 0),
        stats.slice(25, 30).reduce((sum, value) => sum + value, 0),
      ];
    } else if (selectedPeriod === 'year') {
      filteredData = stats;
    } else {
      // Weekly
      filteredData = stats;
    }

    return {
      labels: filteredLabels,
      datasets: [
        {
          // Convert ms to hours
          data: filteredData.map(ms => Math.max(ms / (1000 * 60 * 60), 0.01)), 
          color: () => theme.colors.primary,
          strokeWidth: 2,
        },
      ],
    };
  };
  
  // Obter distribuição por dia da semana para o gráfico de pizza
  const getWeekdayDistribution = () => {
    const weekdayStats = [0, 0, 0, 0, 0, 0, 0]; // Dom, Seg, Ter, Qua, Qui, Sex, Sáb
    const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const colors = [
      '#FF6384', // Vermelho
      '#36A2EB', // Azul
      '#FFCE56', // Amarelo
      '#4BC0C0', // Verde água
      '#9966FF', // Roxo
      '#FF9F40', // Laranja
      '#C9CBCF'  // Cinza
    ];
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const weekday = sessionDate.getDay(); // 0 = Domingo, 6 = Sábado
      weekdayStats[weekday] += session.duration;
    });
    
    // Converter para o formato esperado pelo PieChart
    return weekdayStats.map((value, index) => ({
      name: weekdayNames[index],
      value: Math.max(value / (1000 * 60 * 60), 0.01), // Converter para horas
      color: colors[index],
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12
    }));
  };
  
  // Obter distribuição por período do dia para o gráfico de barras
  const getTimeOfDayDistribution = () => {
    const periodLabels = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];
    const periodStats = [0, 0, 0, 0];
    const periodCounts = [0, 0, 0, 0];
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const hour = sessionDate.getHours();
      
      // Classificar por período do dia
      let periodIndex;
      if (hour >= 6 && hour < 12) {
        periodIndex = 0; // Manhã (6h-12h)
      } else if (hour >= 12 && hour < 18) {
        periodIndex = 1; // Tarde (12h-18h)
      } else if (hour >= 18 && hour < 24) {
        periodIndex = 2; // Noite (18h-24h)
      } else {
        periodIndex = 3; // Madrugada (0h-6h)
      }
      
      periodStats[periodIndex] += session.duration;
      periodCounts[periodIndex]++;
    });
    
    // Calcular a duração média em minutos para cada período
    const averageDurations = periodStats.map((total, index) => {
      if (periodCounts[index] === 0) return 0;
      return Math.round(total / periodCounts[index] / (1000 * 60)); // Converter para minutos
    });
    
    return {
      labels: periodLabels,
      datasets: [{
        data: averageDurations.map(val => Math.max(val, 1)), // Garantir valor mínimo para visualização
        colors: [
          (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
          (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
          (opacity = 1) => `rgba(153, 102, 255, ${opacity})`
        ]
      }]
    };
  };

  // Animated style for charts

  // Animated style for charts
  const chartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chartScale.value }],
  }));

  return (
    <ScrollView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(16, insets.top)
        }
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: Math.max(80, insets.bottom + 32), // Fixed padding to avoid navigation overlap
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerText, { color: theme.colors.primary }]}
        >
          Estatísticas de Estudo
        </Text>
      </View>

      {/* Summary Stats Cards */}
      <View style={styles.statsCardsContainer}>
        <Animated.View entering={FadeInLeft.duration(500).delay(100)} style={styles.statsCardWrapper}>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontSize: 14 }}>
                Tempo Total
              </Text>
              <Text 
                numberOfLines={1}
                ellipsizeMode="tail"
                variant="headlineSmall" 
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                {formatTimeDescription(getTotalStudyTime())}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInRight.duration(500).delay(200)} style={styles.statsCardWrapper}>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontSize: 14 }}>
                Sessões
              </Text>
              <Text 
                numberOfLines={1}
                ellipsizeMode="tail"
                variant="headlineSmall" 
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                {getTotalSessionsCount()}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInLeft.duration(500).delay(300)} style={styles.statsCardWrapper}>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontSize: 14 }}>
                Média por Sessão
              </Text>
              <Text 
                numberOfLines={1}
                ellipsizeMode="tail"
                variant="headlineSmall" 
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                {formatTimeDescription(getAverageTime())}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInRight.duration(500).delay(400)} style={styles.statsCardWrapper}>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontSize: 14 }}>
                Sessão mais Longa
              </Text>
              <Text 
                numberOfLines={1}
                ellipsizeMode="tail"
                variant="headlineSmall" 
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                {formatTimeDescription(getLongestSession())}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </View>

      {/* Period Selection */}
      <View style={styles.periodSelector}>
        <Text 
          variant="titleMedium" 
          style={{ color: theme.colors.primary, marginRight: 10 }}
        >
          Período:
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.chipContainer}
        >
          <Chip 
            selected={selectedPeriod === 'day'} 
            onPress={() => setSelectedPeriod('day')}
            style={[
              styles.chip,
              selectedPeriod === 'day' ? { backgroundColor: theme.colors.primaryContainer } : null
            ]}
            textStyle={{ color: theme.colors.primary }}
          >
            Hoje
          </Chip>
          <Chip 
            selected={selectedPeriod === 'week'} 
            onPress={() => setSelectedPeriod('week')}
            style={[
              styles.chip,
              selectedPeriod === 'week' ? { backgroundColor: theme.colors.primaryContainer } : null
            ]}
            textStyle={{ color: theme.colors.primary }}
          >
            Semana
          </Chip>
          <Chip 
            selected={selectedPeriod === 'month'} 
            onPress={() => setSelectedPeriod('month')}
            style={[
              styles.chip,
              selectedPeriod === 'month' ? { backgroundColor: theme.colors.primaryContainer } : null
            ]}
            textStyle={{ color: theme.colors.primary }}
          >
            Mês
          </Chip>
          <Chip 
            selected={selectedPeriod === 'year'} 
            onPress={() => setSelectedPeriod('year')}
            style={[
              styles.chip,
              selectedPeriod === 'year' ? { backgroundColor: theme.colors.primaryContainer } : null
            ]}
            textStyle={{ color: theme.colors.primary }}
          >
            Ano
          </Chip>
        </ScrollView>
      </View>

      {/* Chart Section - Gráfico de Linha */}
      <Animated.View style={chartAnimatedStyle}>
        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.chartContent}>
            <View style={styles.chartHeaderRow}>
              <Text 
                variant="titleMedium" 
                style={[styles.chartTitle, { color: theme.colors.primary }]}
              >
                Horas de Estudo
              </Text>
              <IconButton 
                icon="information-outline" 
                size={20} 
                iconColor={theme.colors.primary}
                onPress={() => alert('Este gráfico mostra suas horas de estudo ao longo do tempo selecionado.')}
              />
            </View>
            
            {studySessions.length > 0 ? (
              <View style={styles.chartWrapper}>
                <LineChart
                  data={getChartData()}
                  width={CHART_WIDTH}
                  height={200}
                  yAxisSuffix="h"
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: theme.colors.surface,
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    decimalPlaces: 1,
                    color: () => theme.colors.primary,
                    labelColor: () => theme.colors.secondary,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: theme.colors.tertiary,
                    },
                    formatYLabel: (value) => value.toString(),
                    horizontalLabelRotation: 0,
                    verticalLabelRotation: 0,
                  }}
                  bezier
                  style={styles.chart}
                  withShadow={false}
                  withInnerLines={true}
                  withOuterLines={true}
                  withHorizontalLabels={true}
                  withVerticalLabels={true}
                  fromZero={true}
                />
              </View>
            ) : (
              <View style={styles.emptyChartContainer}>
                <Text style={{ color: theme.colors.secondary }}>
                  Nenhuma sessão de estudo registrada ainda!
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
      
      {/* Distribuição por Dia da Semana - Gráfico de Pizza */}
      {studySessions.length > 0 && (
        <Animated.View entering={FadeInLeft.duration(500).delay(500)}>
          <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.chartContent}>
              <View style={styles.chartHeaderRow}>
                <Text 
                  variant="titleMedium" 
                  style={[styles.chartTitle, { color: theme.colors.primary }]}
                >
                  Distribuição por Dia da Semana
                </Text>
                <IconButton 
                  icon="information-outline" 
                  size={20} 
                  iconColor={theme.colors.primary}
                  onPress={() => alert('Este gráfico mostra como seu tempo de estudo está distribuído pelos dias da semana.')}
                />
              </View>
              
              <View style={styles.chartWrapper}>
                <PieChart
                  data={getWeekdayDistribution()}
                  width={CHART_WIDTH}
                  height={220}
                  chartConfig={{
                    backgroundColor: theme.colors.surface,
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    color: () => theme.colors.primary,
                    labelColor: () => theme.colors.secondary,
                  }}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                  hasLegend={true}
                  center={[CHART_WIDTH / 4, 0]}
                />
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
      
      {/* Duração Média por Período - Gráfico de Barras */}
      {studySessions.length > 0 && (
        <Animated.View entering={FadeInRight.duration(500).delay(600)}>
          <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.chartContent}>
              <View style={styles.chartHeaderRow}>
                <Text 
                  variant="titleMedium" 
                  style={[styles.chartTitle, { color: theme.colors.primary }]}
                >
                  Duração Média por Período
                </Text>
                <IconButton 
                  icon="information-outline" 
                  size={20} 
                  iconColor={theme.colors.primary}
                  onPress={() => alert('Este gráfico mostra a duração média das suas sessões de estudo em diferentes períodos do dia.')}
                />
              </View>
              
              <View style={styles.chartWrapper}>
                <BarChart
                  data={getTimeOfDayDistribution()}
                  width={CHART_WIDTH}
                  height={220}
                  yAxisSuffix="min"
                  chartConfig={{
                    backgroundColor: theme.colors.surface,
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    decimalPlaces: 0,
                    color: () => theme.colors.primary,
                    labelColor: () => theme.colors.secondary,
                    style: {
                      borderRadius: 16,
                    },
                    barPercentage: 0.7,
                  }}
                  style={styles.chart}
                  fromZero
                />
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  statsCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCardWrapper: {
    width: '48%',
    marginBottom: 12,
    maxHeight: 100,
  },
  statsCard: {
    borderRadius: 12,
    elevation: 2,
    height: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 18,
    flexShrink: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  chipContainer: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
  },
  chartCard: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
  },
  chartContent: {
    padding: 16,
  },
  chartTitle: {
    fontWeight: 'bold',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -20,
  },
  emptyChartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StatsScreen;