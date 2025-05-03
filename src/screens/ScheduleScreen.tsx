import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Text, useTheme, Surface, Button, IconButton, FAB, Dialog, Portal, TextInput, Divider, SegmentedButtons, Chip, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSchedule, ScheduleSession } from '../contexts/ScheduleContext';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const SESSION_COLORS = ['#6750A4', '#B4A7D6', '#4285F4', '#7BAAF7', '#0F9D58', '#F4B400', '#DB4437'];

const ScheduleScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { sessions, addSession, updateSession, deleteSession } = useSchedule();
  
  // State for session form dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState('');
  
  // Form state
  const [sessionName, setSessionName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Default: Monday
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [timerMode, setTimerMode] = useState('focus');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState('15');
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedColor, setSelectedColor] = useState(SESSION_COLORS[0]);
  
  // Time picker state (for platforms that use modal)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  
  // Reset form
  const resetForm = useCallback(() => {
    setSessionName('');
    setDayOfWeek(1);
    setStartTime('09:00');
    setDuration('60');
    setTimerMode('focus');
    setReminderEnabled(true);
    setReminderMinutesBefore('15');
    setIsEnabled(true);
    setSelectedColor(SESSION_COLORS[0]);
  }, []);
  
  // Open dialog for creating new session
  const handleAddSession = () => {
    resetForm();
    setIsEditing(false);
    setDialogVisible(true);
  };
  
  // Open dialog for editing existing session
  const handleEditSession = (session: ScheduleSession) => {
    setSessionName(session.name);
    setDayOfWeek(session.dayOfWeek);
    setStartTime(session.startTime);
    setDuration(session.duration.toString());
    setTimerMode(session.mode);
    setReminderEnabled(session.reminderEnabled);
    setReminderMinutesBefore(session.reminderMinutesBefore.toString());
    setIsEnabled(session.isEnabled);
    setSelectedColor(session.color || SESSION_COLORS[0]);
    
    setIsEditing(true);
    setEditingSessionId(session.id);
    setDialogVisible(true);
  };
  
  // Handle session deletion
  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Excluir Sessão',
      'Tem certeza que deseja excluir esta sessão da agenda?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir', 
          onPress: () => deleteSession(sessionId),
          style: 'destructive'
        }
      ]
    );
  };
  
  // Handle time picker change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      setTempTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    }
  };
  
  // Open time picker
  const openTimePicker = () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setTempTime(date);
    setShowTimePicker(true);
  };
  
  // Submit form
  const handleSubmit = async () => {
    // Validate form
    if (!sessionName.trim()) {
      Alert.alert('Erro', 'O nome da sessão é obrigatório');
      return;
    }
    
    if (isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert('Erro', 'A duração deve ser um número válido');
      return;
    }
    
    if (isNaN(Number(reminderMinutesBefore)) || Number(reminderMinutesBefore) < 0) {
      Alert.alert('Erro', 'O tempo do lembrete deve ser um número válido');
      return;
    }
    
    // Create session object
    const sessionData = {
      name: sessionName.trim(),
      dayOfWeek,
      startTime,
      duration: Number(duration),
      mode: timerMode as any,
      isEnabled,
      reminderEnabled,
      reminderMinutesBefore: Number(reminderMinutesBefore),
      color: selectedColor
    };
    
    try {
      if (isEditing) {
        await updateSession(editingSessionId, sessionData);
      } else {
        await addSession(sessionData);
      }
      setDialogVisible(false);
    } catch (error) {
      console.error('Failed to save session:', error);
      Alert.alert('Erro', 'Falha ao salvar a sessão. Tente novamente.');
    }
  };
  
  // Group sessions by day of week
  const sessionsByDay = useMemo(() => {
    const grouped: Record<number, ScheduleSession[]> = {};
    
    // Initialize empty arrays for each day
    for (let i = 0; i < 7; i++) {
      grouped[i] = [];
    }
    
    // Group sessions
    sessions.forEach(session => {
      grouped[session.dayOfWeek].push(session);
    });
    
    // Sort sessions by start time within each day
    Object.keys(grouped).forEach(day => {
      grouped[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return grouped;
  }, [sessions]);
  
  // Render a single session item
  const renderSessionItem = (session: ScheduleSession) => {
    const [hours, minutes] = session.startTime.split(':');
    const formattedTime = `${hours}:${minutes}`;
    
    return (
      <Animated.View 
        key={session.id}
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
      >
        <Surface 
          style={[
            styles.sessionItem, 
            { 
              backgroundColor: session.color || theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
              opacity: session.isEnabled ? 1 : 0.6
            }
          ]}
          elevation={1}
        >
          <View style={styles.sessionHeader}>
            <View style={styles.timeContainer}>
              <Text variant="titleLarge" style={styles.timeText}>
                {formattedTime}
              </Text>
            </View>
            
            <View style={styles.sessionDetails}>
              <Text variant="titleMedium" style={styles.sessionName}>
                {session.name}
              </Text>
              
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons 
                  name={session.mode === 'focus' ? 'timer-outline' : 
                    session.mode === 'shortBreak' ? 'coffee-outline' : 'sleep'} 
                  size={16} 
                  color={theme.colors.onSurfaceVariant}
                  style={styles.detailIcon}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {session.duration} minutos
                </Text>
              </View>
              
              {session.reminderEnabled && (
                <View style={styles.detailsRow}>
                  <MaterialCommunityIcons 
                    name="bell-outline" 
                    size={16} 
                    color={theme.colors.onSurfaceVariant}
                    style={styles.detailIcon}
                  />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    Lembrete {session.reminderMinutesBefore} min antes
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.sessionActions}>
              <IconButton 
                icon="pencil" 
                size={20} 
                onPress={() => handleEditSession(session)}
                style={styles.actionButton}
              />
              <IconButton 
                icon="delete" 
                size={20} 
                onPress={() => handleDeleteSession(session.id)}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Surface>
      </Animated.View>
    );
  };
  
  // Render sessions for a day
  const renderDaySection = (day: number) => {
    const daySessions = sessionsByDay[day];
    
    if (daySessions.length === 0) {
      return null;
    }
    
    return (
      <View key={day} style={styles.daySection}>
        <Text variant="titleMedium" style={[styles.dayTitle, { color: theme.colors.primary }]}>
          {DAYS_OF_WEEK[day]}
        </Text>
        
        <View style={styles.sessionsContainer}>
          {daySessions.map(renderSessionItem)}
        </View>
      </View>
    );
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(20, insets.top),
          paddingBottom: Math.max(20, insets.bottom)
        }
      ]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Agenda de Estudos
        </Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="calendar-blank" 
              size={80} 
              color={theme.colors.outlineVariant}
            />
            <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Sem sessões agendadas
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Adicione sessões para criar sua agenda de estudos
            </Text>
            <Button 
              mode="contained" 
              onPress={handleAddSession}
              style={styles.emptyButton}
              icon="plus"
            >
              Adicionar Sessão
            </Button>
          </View>
        ) : (
          <>
            {/* Render sessions grouped by day */}
            {[1, 2, 3, 4, 5, 6, 0].map(renderDaySection)}
          </>
        )}
        
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* Add FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddSession}
        color={theme.colors.onPrimary}
      />
      
      {/* Session Form Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>
            {isEditing ? 'Editar Sessão' : 'Nova Sessão'}
          </Dialog.Title>
          
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              <View style={styles.formContainer}>
                <TextInput
                  label="Nome da Sessão"
                  value={sessionName}
                  onChangeText={setSessionName}
                  mode="outlined"
                  style={styles.input}
                />
                
                <Text variant="bodyMedium" style={styles.sectionTitle}>Dia da Semana</Text>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <Chip
                      key={index}
                      selected={dayOfWeek === index}
                      onPress={() => setDayOfWeek(index)}
                      style={[
                        styles.dayChip,
                        dayOfWeek === index && { backgroundColor: theme.colors.primaryContainer }
                      ]}
                      showSelectedCheck={false}
                    >
                      {day.slice(0, 3)}
                    </Chip>
                  ))}
                </View>
                
                <Text variant="bodyMedium" style={styles.sectionTitle}>Horário de Início</Text>
                <TouchableOpacity onPress={openTimePicker} style={styles.timePickerButton}>
                  <Surface style={styles.timePicker} elevation={0}>
                    <Text variant="titleLarge">{startTime}</Text>
                    <MaterialCommunityIcons name="clock-outline" size={24} />
                  </Surface>
                </TouchableOpacity>
                
                {showTimePicker && (
                  <RNDateTimePicker
                    value={tempTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <TextInput
                      label="Duração (min)"
                      value={duration}
                      onChangeText={setDuration}
                      mode="outlined"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text variant="bodyMedium" style={styles.inputLabel}>Modo do Timer</Text>
                    <SegmentedButtons
                      value={timerMode}
                      onValueChange={setTimerMode}
                      buttons={[
                        { value: 'focus', label: 'Foco' },
                        { value: 'shortBreak', label: 'Pausa' },
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.switchRow}>
                  <Text variant="bodyMedium">Ativar Lembrete</Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                  />
                </View>
                
                {reminderEnabled && (
                  <TextInput
                    label="Lembrete (min antes)"
                    value={reminderMinutesBefore}
                    onChangeText={setReminderMinutesBefore}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                )}
                
                <View style={styles.switchRow}>
                  <Text variant="bodyMedium">Habilitar Sessão</Text>
                  <Switch
                    value={isEnabled}
                    onValueChange={setIsEnabled}
                  />
                </View>
                
                <Text variant="bodyMedium" style={styles.sectionTitle}>Cor</Text>
                <View style={styles.colorsContainer}>
                  {SESSION_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColor
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleSubmit}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  sessionsContainer: {
    gap: 12,
  },
  sessionItem: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  timeContainer: {
    marginRight: 16,
  },
  timeText: {
    fontWeight: 'bold',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    opacity: 0.8,
  },
  sessionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  inputLabel: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  dayChip: {
    margin: 2,
  },
  scrollArea: {
    maxHeight: 400,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timePickerButton: {
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: 'white',
  },
});

export default ScheduleScreen; 