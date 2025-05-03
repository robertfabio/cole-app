import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, BackHandler } from 'react-native';
import { Text, Switch, useTheme, Button, Divider, List, RadioButton, Card, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SliderWithLabel from '../components/SliderWithLabel';
import Dialog from '../components/Dialog';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { goBack } from '../components/AppNavigator';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isBackupDialogVisible, setIsBackupDialogVisible] = useState(false);
  const [isRestoreDialogVisible, setIsRestoreDialogVisible] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [backupCode, setBackupCode] = useState('');

  // Lidar com o botão de voltar no Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  // Create backup
  const createBackup = useCallback(async () => {
    try {
      // Get all the data from AsyncStorage
      const data = {
        version: '0.1.6',
        timestamp: new Date().toISOString(),
        settings: settings,
        // Add more data as needed
      };

      // Convert to JSON string
      const backupData = JSON.stringify(data);
      
      // Using a simple encoding for demo - in a real app, you'd use better encryption
      const encoded = Buffer.from(backupData).toString('base64');
      
      setBackupCode(encoded);
      setIsBackupDialogVisible(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o backup.');
    }
  }, [settings]);

  // Restore from backup
  const restoreFromBackup = useCallback(async () => {
    try {
      // Basic validation
      if (!restoreCode.trim()) {
        Alert.alert('Erro', 'Por favor, insira um código de backup válido.');
        return;
      }
      
      // Decode the backup code
      const decoded = Buffer.from(restoreCode, 'base64').toString('utf8');
      const data = JSON.parse(decoded);
      
      // Validate the backup format
      if (!data.version || !data.settings) {
        Alert.alert('Erro', 'O código de backup é inválido ou está corrompido.');
        return;
      }
      
      // Apply the restored settings
      updateSettings(data.settings);
      
      Alert.alert('Sucesso', 'Suas configurações foram restauradas com sucesso!');
      setIsRestoreDialogVisible(false);
      setRestoreCode('');
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível restaurar a partir do backup.');
    }
  }, [restoreCode, updateSettings]);
  
  // Voltar para a tela anterior
  const handleGoBack = useCallback(() => {
    goBack();
  }, []);

  // Atualizar o tema com persistência
  const updateTheme = useCallback((value: 'light' | 'dark' | 'system') => {
    try {
      // Atualizar no contexto
      updateSettings({
        ...settings,
        theme: value
      });
      
      // Salvar no AsyncStorage para persistência
      AsyncStorage.setItem('settings', JSON.stringify({
        ...settings,
        theme: value
      }));
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      Alert.alert('Erro', 'Não foi possível salvar o tema.');
    }
  }, [settings, updateSettings]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        paddingTop: Math.max(16, insets.top),
      }]}>
        <IconButton 
          icon="arrow-left"
          size={24}
          onPress={handleGoBack}
        />
        <Text 
          variant="headlineSmall" 
          style={{ color: theme.colors.primary, fontWeight: 'bold' }}
        >
          Configurações
        </Text>
        <View style={{ width: 40 }} /> {/* Espaçador para centralizar o título */}
      </View>
    
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(20, insets.bottom),
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
      >
        <Animated.View
          entering={FadeIn.duration(300)}
        >
          {/* Tema */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Aparência" />
            <Card.Content>
              <List.Item
                title="Tema"
                description="Escolha entre tema claro, escuro ou sistema"
                right={() => (
                  <View style={styles.themeSelector}>
                    <RadioButton.Group
                      value={settings.theme}
                      onValueChange={(value) => 
                        updateTheme(value as 'light' | 'dark' | 'system')
                      }
                    >
                      <View style={styles.radioItem}>
                        <RadioButton.Item 
                          label="Claro" 
                          value="light"
                          labelStyle={{ color: theme.colors.onSurface }}
                        />
                      </View>
                      <View style={styles.radioItem}>
                        <RadioButton.Item 
                          label="Escuro" 
                          value="dark"
                          labelStyle={{ color: theme.colors.onSurface }}
                        />
                      </View>
                      <View style={styles.radioItem}>
                        <RadioButton.Item 
                          label="Sistema" 
                          value="system"
                          labelStyle={{ color: theme.colors.onSurface }}
                        />
                      </View>
                    </RadioButton.Group>
                  </View>
                )}
              />
            </Card.Content>
          </Card>

          {/* Pomodoro */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Pomodoro" />
            <Card.Content>
              <List.Item
                title="Tempo de Foco"
                description="Duração das sessões de foco"
                right={() => (
                  <SliderWithLabel
                    value={settings.pomodoroSettings.focusTime}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        pomodoroSettings: {
                          ...settings.pomodoroSettings,
                          focusTime: value
                        }
                      })
                    }
                    minimumValue={5}
                    maximumValue={60}
                    step={5}
                    label={`${settings.pomodoroSettings.focusTime} min`}
                    containerStyle={{ width: 150 }}
                  />
                )}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Pausa Curta"
                description="Duração das pausas curtas"
                right={() => (
                  <SliderWithLabel
                    value={settings.pomodoroSettings.shortBreak}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        pomodoroSettings: {
                          ...settings.pomodoroSettings,
                          shortBreak: value
                        }
                      })
                    }
                    minimumValue={3}
                    maximumValue={15}
                    step={1}
                    label={`${settings.pomodoroSettings.shortBreak} min`}
                    containerStyle={{ width: 150 }}
                  />
                )}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Pausa Longa"
                description="Duração das pausas longas"
                right={() => (
                  <SliderWithLabel
                    value={settings.pomodoroSettings.longBreak}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        pomodoroSettings: {
                          ...settings.pomodoroSettings,
                          longBreak: value
                        }
                      })
                    }
                    minimumValue={15}
                    maximumValue={30}
                    step={5}
                    label={`${settings.pomodoroSettings.longBreak} min`}
                    containerStyle={{ width: 150 }}
                  />
                )}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Ciclos até Pausa Longa"
                description="Número de sessões antes da pausa longa"
                right={() => (
                  <SliderWithLabel
                    value={settings.pomodoroSettings.sessionsBeforeLongBreak}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        pomodoroSettings: {
                          ...settings.pomodoroSettings,
                          sessionsBeforeLongBreak: value
                        }
                      })
                    }
                    minimumValue={2}
                    maximumValue={6}
                    step={1}
                    label={`${settings.pomodoroSettings.sessionsBeforeLongBreak}`}
                    containerStyle={{ width: 150 }}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Notificações */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Notificações" />
            <Card.Content>
              <List.Item
                title="Som ao completar"
                description="Tocar um som quando o timer terminar"
                right={() => (
                  <Switch
                    value={settings.notifications.sound}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          sound: value
                        }
                      })
                    }
                    color={theme.colors.primary}
                  />
                )}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Vibração"
                description="Vibrar quando o timer terminar"
                right={() => (
                  <Switch
                    value={settings.notifications.vibration}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          vibration: value
                        }
                      })
                    }
                    color={theme.colors.primary}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Metas */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Metas" />
            <Card.Content>
              <List.Item
                title="Meta Diária"
                description="Tempo de estudo diário em minutos"
                right={() => (
                  <SliderWithLabel
                    value={settings.dailyGoal}
                    onValueChange={(value) => 
                      updateSettings({
                        ...settings,
                        dailyGoal: value
                      })
                    }
                    minimumValue={30}
                    maximumValue={240}
                    step={30}
                    label={`${settings.dailyGoal} min`}
                    containerStyle={{ width: 150 }}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Backup e Restauração */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Backup e Restauração" />
            <Card.Content>
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={createBackup}
                  style={styles.button}
                >
                  Criar Backup
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={() => setIsRestoreDialogVisible(true)}
                  style={styles.button}
                >
                  Restaurar
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Sobre o App */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Sobre o App" />
            <Card.Content>
              <Text style={{ marginBottom: 8 }}>
                Cole - Cronômetro de Estudos (2025)
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Versão: 0.1.6
              </Text>
              <Text>
                Um aplicativo para ajudar você a manter o foco nos estudos e melhorar sua produtividade.
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Diálogo de Backup */}
      <Dialog
        visible={isBackupDialogVisible}
        title="Código de Backup"
        content="Copie e guarde este código em um local seguro. Você precisará dele para restaurar suas configurações."
        extraContent={
          <View style={styles.backupCodeContainer}>
            <Text selectable={true} style={styles.backupCode}>
              {backupCode}
            </Text>
          </View>
        }
        actions={[
          {
            label: 'Copiar',
            onPress: () => {
              // Clipboard functionality would go here
              // Clipboard.setString(backupCode);
              Alert.alert('Sucesso', 'Código copiado para a área de transferência!');
            }
          },
          {
            label: 'Fechar',
            onPress: () => setIsBackupDialogVisible(false)
          }
        ]}
      />
      
      {/* Diálogo de Restauração */}
      <Dialog
        visible={isRestoreDialogVisible}
        title="Restaurar Backup"
        content="Cole o código de backup para restaurar suas configurações."
        inputProps={{
          value: restoreCode,
          onChangeText: setRestoreCode,
          placeholder: 'Cole o código aqui',
          multiline: true,
          numberOfLines: 4
        }}
        actions={[
          {
            label: 'Cancelar',
            onPress: () => {
              setIsRestoreDialogVisible(false);
              setRestoreCode('');
            }
          },
          {
            label: 'Restaurar',
            onPress: restoreFromBackup
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 2,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  button: {
    minWidth: 120,
  },
  backupCodeContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  backupCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  themeSelector: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  radioItem: {
    marginVertical: -8,
  },
});

export default React.memo(SettingsScreen); 