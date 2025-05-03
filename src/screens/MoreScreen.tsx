import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Text, Divider, useTheme, Surface, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSettings } from '../contexts/SettingsContext';
import { navigate, openSettingsScreen } from '../components/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoreScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Atualizar a tela quando receber foco
  useFocusEffect(
    useCallback(() => {
      setIsRefreshing(prev => !prev);
      return () => {};
    }, [])
  );

  // Navegar para a tela de histórico
  const handleHistoryPress = useCallback(() => {
    navigate('history');
  }, []);

  // Navegar para a tela de configurações
  const handleSettingsPress = useCallback(() => {
    openSettingsScreen();
  }, []);

  // Alternar tema
  const handleToggleTheme = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 
                     settings.theme === 'light' ? 'system' : 'dark';
    
    try {
      // Atualizar no contexto
      updateSettings({ ...settings, theme: newTheme });
      
      // Salvar no AsyncStorage para persistência
      AsyncStorage.setItem('settings', JSON.stringify({
        ...settings,
        theme: newTheme
      }));
      
      // Feedback visual sutil
      setIsRefreshing(prev => !prev);
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o tema. Tente novamente.');
    }
  }, [settings, updateSettings]);

  // Função para obter o texto do tema atual
  const getThemeText = useCallback(() => {
    switch (settings.theme) {
      case 'light': return 'Claro';
      case 'dark': return 'Escuro';
      case 'system': return 'Sistema';
      default: return 'Claro';
    }
  }, [settings.theme]);

  // Função para obter o ícone do tema atual
  const getThemeIcon = useCallback(() => {
    switch (settings.theme) {
      case 'light': return 'white-balance-sunny';
      case 'dark': return 'weather-night';
      case 'system': return 'theme-light-dark';
      default: return 'white-balance-sunny';
    }
  }, [settings.theme]);

  // Obter versão do app
  const appVersion = '0.1.6';

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
    >
      <Animated.View entering={FadeIn.duration(800)}>
        <Text 
          variant="headlineMedium" 
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Mais Opções
        </Text>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <List.Section>
            <List.Subheader>Estudo</List.Subheader>
            
            <List.Item
              title="Histórico"
              description="Visualizar sessões de estudo anteriores"
              left={props => <List.Icon {...props} icon="history" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleHistoryPress}
            />
            
            <Divider />
            
            <List.Item
              title="Estatísticas"
              description="Ver dados detalhados do seu progresso"
              left={props => <List.Icon {...props} icon="chart-line" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigate('stats')}
            />
          </List.Section>
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <List.Section>
            <List.Subheader>Aparência</List.Subheader>
            
            <List.Item
              title="Tema"
              description={`${getThemeText()} (toque para alterar)`}
              left={props => <List.Icon {...props} icon={getThemeIcon()} />}
              onPress={handleToggleTheme}
            />
            
            <Divider />
            
            <List.Item
              title="Configurações"
              description="Personalizar o aplicativo"
              left={props => <List.Icon {...props} icon="cog" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleSettingsPress}
            />
          </List.Section>
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <List.Section>
            <List.Subheader>Sobre</List.Subheader>
            
            <List.Item
              title="Versão do App"
              description={appVersion}
              left={props => <List.Icon {...props} icon="information" />}
            />
            
            <Divider />
            
            <List.Item
              title="Suporte"
              description="Obter ajuda ou enviar feedback"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert(
                'Suporte', 
                'Esta função estará disponível em breve. Confira nossas redes sociais para contato.'
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Política de Privacidade"
              description="Como seus dados são utilizados"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert(
                'Política de Privacidade', 
                'O Cole respeita sua privacidade. Todos os dados são armazenados apenas em seu dispositivo e não são compartilhados.'
              )}
            />
          </List.Section>
        </Surface>

        <View style={styles.footer}>
          <Text 
            style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
          >
            Cole © 2025
          </Text>
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
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    overflow: 'hidden',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});

export default React.memo(MoreScreen); 