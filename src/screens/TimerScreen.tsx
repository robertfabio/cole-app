import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { useTheme, Text, IconButton } from 'react-native-paper';
import { useTimer } from '../contexts/TimerContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import SessionSave from '../components/SessionSave';

const TimerScreen: React.FC = () => {
  const theme = useTheme();
  const { totalStudyTime, isRunning } = useTimer();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Only show save button if timer has run for some time
  const canSave = Math.abs(totalStudyTime) > 0;
  
  const handleFullScreen = () => {
    navigation.navigate('FullscreenTimer' as never);
  };
  
  const handleOpenSaveModal = () => {
    setShowSaveModal(true);
  };
  
  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };
  
  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: Math.max(16, insets.bottom)
        }
      ]}
    >
      <Animated.View 
        entering={FadeIn.duration(500)}
        style={styles.header}
      >
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Cronômetro
        </Text>
        
        <IconButton
          icon="fullscreen"
          size={28}
          onPress={handleFullScreen}
        />
      </Animated.View>
      
      <TimerDisplay />
      
      <TimerControls />
      
      {canSave && !isRunning && (
        <View style={styles.saveButtonContainer}>
          <IconButton
            icon="content-save"
            mode="contained"
            size={24}
            onPress={handleOpenSaveModal}
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.secondary }
            ]}
            iconColor={theme.colors.onSecondary}
          />
        </View>
      )}
      
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSaveModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface }
          ]}>
            <SessionSave onClose={handleCloseSaveModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 10,
  },
  saveButton: {
    borderRadius: 30,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});

export default TimerScreen;