import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { formatTime } from '../utils/timeFormat';

const SessionSave: React.FC = () => {
  const { totalStudyTime, saveSession, isSaving } = useTimer();
  const [sessionName, setSessionName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const theme = useTheme();

  const handleOpenModal = () => {
    setSessionName('');
    setShowModal(true);
  };

  const handleSaveSession = async () => {
    await saveSession(sessionName.trim());
    setShowModal(false);
  };

  const canSave = Math.abs(totalStudyTime) > 0 && !isSaving; // Use Math.abs para considerar valores negativos

  // Don't show the button if timer is at 00:00:00
  if (totalStudyTime === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handleOpenModal}
        disabled={!canSave || isSaving}
        style={[
          styles.saveButton,
          { backgroundColor: theme.colors.secondary }
        ]}
      >
        {isSaving ? 'Salvando...' : 'Salvar Sessão'}
      </Button>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[
            styles.modalContent, 
            { backgroundColor: theme.colors.surface }
          ]}>
            <Text 
              style={[
                styles.modalTitle, 
                { color: theme.colors.primary }
              ]}
            >
              Salvar Sessão de Estudo
            </Text>
            
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.background,
                }
              ]}
              placeholder="Nome da sessão"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={sessionName}
              onChangeText={setSessionName}
              maxLength={50}
            />

            <View style={styles.modalButtonContainer}>
              <Button
                mode="outlined"
                onPress={() => setShowModal(false)}
                style={styles.modalButton}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveSession}
                style={styles.modalButton}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator animating={true} color={theme.colors.onPrimary} size={20} />
                ) : (
                  'Salvar'
                )}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButton: {
    minWidth: 160,
    borderRadius: 30,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    width: '85%',
    maxWidth: 350,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    width: '45%',
    borderRadius: 8,
  },
});

export default SessionSave; 