import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Button, useTheme, Text } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionSave: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { saveSession } = useTimer();
  const theme = useTheme();
  const [sessionName, setSessionName] = useState('');
  const [isScheduledSession, setIsScheduledSession] = useState(false);
  const [scheduledSessionId, setScheduledSessionId] = useState<string | null>(null);
  const [scheduledSessionName, setScheduledSessionName] = useState<string | null>(null);
  
  // Check if this was a scheduled session
  useEffect(() => {
    const checkScheduledSession = async () => {
      try {
        const sessionId = await AsyncStorage.getItem('currentScheduledSessionId');
        const sessionName = await AsyncStorage.getItem('currentScheduledSessionName');
        
        if (sessionId && sessionName) {
          setIsScheduledSession(true);
          setScheduledSessionId(sessionId);
          setScheduledSessionName(sessionName);
          setSessionName(sessionName);
          
          // Clear the data
          AsyncStorage.removeItem('currentScheduledSessionId');
          AsyncStorage.removeItem('currentScheduledSessionName');
        }
      } catch (error) {
        console.error('Error checking for scheduled session:', error);
      }
    };
    
    checkScheduledSession();
  }, []);
  
  const handleSave = () => {
    if (!sessionName.trim()) {
      Alert.alert('Erro', 'Por favor, informe um nome para sua sessão de estudo.');
      return;
    }
    
    // Save with scheduled session info if applicable
    saveSession(sessionName, isScheduledSession, scheduledSessionId || undefined);
    onClose();
  };
  
  return (
    <View style={styles.container}>
      <Text 
        variant="titleLarge" 
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Salvar Sessão de Estudo
      </Text>
      
      {isScheduledSession && (
        <Text 
          variant="bodyMedium" 
          style={[styles.scheduledNote, { color: theme.colors.primary }]}
        >
          Sessão agendada concluída! 🎉
        </Text>
      )}
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.surfaceVariant,
          color: theme.colors.onSurfaceVariant,
          borderColor: theme.colors.outline
        }]}
        placeholder="Nome da sessão"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={sessionName}
        onChangeText={setSessionName}
        autoFocus
      />
      
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={[styles.button, styles.cancelButton]}
        >
          Cancelar
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.button, styles.saveButton]}
        >
          Salvar
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  scheduledNote: {
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
});

export default SessionSave; 