import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Text, 
  Switch, 
  useTheme, 
  Card, 
  Divider, 
  Button, 
  IconButton, 
  RadioButton, 
  List,
  Surface
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useSettings } from '../contexts/SettingsContext';
import Animated, { 
  FadeInUp, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen: React.FC = () => {
  const { settings, updateTheme, updateTimerType, updatePomodoroSettings, 
          toggleSound, toggleNotifications, updateDailyGoal } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const settingScale = useSharedValue(1);
  
  // Section headings style
  const sectionStyle = {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: 'bold' as 'bold',
    marginTop: 16,
    marginBottom: 8,
  };

  const handleScaleAnimation = () => {
    settingScale.value = withTiming(0.97, { duration: 100 }, () => {
      settingScale.value = withTiming(1, { duration: 100 });
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateTheme(theme);
    handleScaleAnimation();
  };

  const handleTimerTypeChange = (type: 'standard' | 'pomodoro') => {
    updateTimerType(type);
    handleScaleAnimation();
  };

  const handlePomodoroDurationChange = (type: keyof typeof settings.pomodoroSettings, value: number) => {
    updatePomodoroSettings({
      ...settings.pomodoroSettings,
      [type]: value,
    });
  };

  const handleDailyGoalChange = (minutes: number) => {
    updateDailyGoal(minutes);
  };

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
          paddingBottom: Math.max(16, insets.bottom)
        }
      ]}
    >
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerText, { color: theme.colors.primary }]}
        >
          Configurações
        </Text>
      </View>

      {/* Theme Settings */}
      <Animated.View entering={FadeInUp.delay(100).duration(500)}>
        <Text style={sectionStyle}>Aparência</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <Text style={{ color: theme.colors.onSurface }}>Tema</Text>
              <View style={styles.themeOptions}>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: '#F5F0E6',
                      borderColor: settings.theme === 'light' ? theme.colors.primary : '#F5F0E6',
                      borderWidth: settings.theme === 'light' ? 2 : 0,
                    }
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <IconButton
                    icon="white-balance-sunny"
                    iconColor="#2D3047"
                    size={24}
                  />
                  <Text style={{ color: '#2D3047' }}>Claro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: '#212121',
                      borderColor: settings.theme === 'dark' ? theme.colors.primary : '#212121',
                      borderWidth: settings.theme === 'dark' ? 2 : 0,
                    }
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <IconButton
                    icon="weather-night"
                    iconColor="#fff"
                    size={24}
                  />
                  <Text style={{ color: '#fff' }}>Escuro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Timer Settings */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <Text style={sectionStyle}>Timer</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <Text style={{ color: theme.colors.onSurface }}>Tipo de Timer</Text>
              <View style={styles.timerTypeContainer}>
                <RadioButton.Group
                  value={settings.timerType}
                  onValueChange={(value) => 
                    handleTimerTypeChange(value as 'standard' | 'pomodoro')
                  }
                >
                  <View style={styles.radioRow}>
                    <RadioButton
                      value="standard"
                      color={theme.colors.primary}
                    />
                    <Text style={{ color: theme.colors.onSurface }}>Padrão</Text>
                  </View>
                  <View style={styles.radioRow}>
                    <RadioButton
                      value="pomodoro"
                      color={theme.colors.primary}
                    />
                    <Text style={{ color: theme.colors.onSurface }}>Pomodoro</Text>
                  </View>
                </RadioButton.Group>
              </View>
            </View>

            {settings.timerType === 'pomodoro' && (
              <Animated.View 
                entering={FadeInDown.duration(300)}
                style={styles.pomodoroSettings}
              >
                <Divider style={styles.divider} />
                <Text style={{ marginBottom: 10, fontWeight: 'bold', color: theme.colors.onSurface }}>
                  Configuração do Pomodoro
                </Text>
                
                <List.Item
                  title="Tempo de foco"
                  titleStyle={{ color: theme.colors.onSurface }}
                  description={`${settings.pomodoroSettings.focusTime} minutos`}
                  descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  right={() => (
                    <View style={styles.sliderContainer}>
                      <Slider
                        value={settings.pomodoroSettings.focusTime}
                        onValueChange={(value: number) => 
                          handlePomodoroDurationChange('focusTime', value)
                        }
                        minimumValue={5}
                        maximumValue={60}
                        step={5}
                        minimumTrackTintColor={theme.colors.primary}
                        style={{ width: 150 }}
                        thumbTintColor={theme.colors.primary}
                      />
                    </View>
                  )}
                />
                
                <List.Item
                  title="Pausa curta"
                  titleStyle={{ color: theme.colors.onSurface }}
                  description={`${settings.pomodoroSettings.shortBreak} minutos`}
                  descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  right={() => (
                    <View style={styles.sliderContainer}>
                      <Slider
                        value={settings.pomodoroSettings.shortBreak}
                        onValueChange={(value: number) => 
                          handlePomodoroDurationChange('shortBreak', value)
                        }
                        minimumValue={1}
                        maximumValue={15}
                        step={1}
                        minimumTrackTintColor={theme.colors.secondary}
                        style={{ width: 150 }}
                        thumbTintColor={theme.colors.secondary}
                      />
                    </View>
                  )}
                />
                
                <List.Item
                  title="Pausa longa"
                  titleStyle={{ color: theme.colors.onSurface }}
                  description={`${settings.pomodoroSettings.longBreak} minutos`}
                  descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  right={() => (
                    <View style={styles.sliderContainer}>
                      <Slider
                        value={settings.pomodoroSettings.longBreak}
                        onValueChange={(value: number) => 
                          handlePomodoroDurationChange('longBreak', value)
                        }
                        minimumValue={10}
                        maximumValue={30}
                        step={5}
                        minimumTrackTintColor={theme.colors.tertiary}
                        style={{ width: 150 }}
                        thumbTintColor={theme.colors.tertiary}
                      />
                    </View>
                  )}
                />

                <List.Item
                  title="Sessões até pausa longa"
                  titleStyle={{ color: theme.colors.onSurface }}
                  description={`${settings.pomodoroSettings.sessionsBeforeLongBreak} sessões`}
                  descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  right={() => (
                    <View style={styles.sliderContainer}>
                      <Slider
                        value={settings.pomodoroSettings.sessionsBeforeLongBreak}
                        onValueChange={(value: number) => 
                          handlePomodoroDurationChange('sessionsBeforeLongBreak', value)
                        }
                        minimumValue={2}
                        maximumValue={6}
                        step={1}
                        minimumTrackTintColor={theme.colors.primary}
                        style={{ width: 150 }}
                        thumbTintColor={theme.colors.primary}
                      />
                    </View>
                  )}
                />
              </Animated.View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Goals Settings */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)}>
        <Text style={sectionStyle}>Metas Diárias</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <List.Item
              title="Meta de estudo diária"
              titleStyle={{ color: theme.colors.onSurface }}
              description={`${settings.dailyGoal} minutos`}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              right={() => (
                <View style={styles.sliderContainer}>
                  <Slider
                    value={settings.dailyGoal}
                    onValueChange={(value: number) => handleDailyGoalChange(value)}
                    minimumValue={30}
                    maximumValue={480}
                    step={30}
                    minimumTrackTintColor={theme.colors.primary}
                    style={{ width: 150 }}
                    thumbTintColor={theme.colors.primary}
                  />
                </View>
              )}
            />
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Notifications Settings */}
      <Animated.View entering={FadeInUp.delay(400).duration(500)}>
        <Text style={sectionStyle}>Notificações</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <List.Item
              title="Som ao terminar"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Tocar som ao finalizar um ciclo"
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              right={() => (
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={toggleSound}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Notificações"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Receber notificações do timer"
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              right={() => (
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={toggleNotifications}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>
      </Animated.View>

      {/* About Section */}
      <Animated.View entering={FadeInUp.delay(500).duration(500)}>
        <Text style={sectionStyle}>Sobre</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.aboutText, { color: theme.colors.onSurface }]}>
              Cole - Cronômetro de Estudos
            </Text>
            <Text style={[styles.aboutVersion, { color: theme.colors.onSurfaceVariant }]}>
              Versão 0.0.3
            </Text>
            <Text style={[styles.aboutDescription, { color: theme.colors.onSurface }]}>
              Cole é um aplicativo para ajudar estudantes a gerenciar seu tempo de estudo de forma eficiente. Com estatísticas detalhadas e opções de timer flexíveis para otimizar sua rotina de estudos.
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
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
  card: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  themeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 8,
    width: 100,
    height: 100,
  },
  timerTypeContainer: {
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  pomodoroSettings: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  aboutVersion: {
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.7,
  },
  aboutDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen; 