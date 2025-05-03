import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Dialog as PaperDialog, Text, Button, useTheme } from 'react-native-paper';

interface DialogAction {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  color?: string;
}

interface DialogProps {
  visible: boolean;
  title: string;
  content: string;
  actions: DialogAction[];
  extraContent?: React.ReactNode;
  inputProps?: TextInputProps;
}

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  content,
  actions,
  extraContent,
  inputProps
}) => {
  const theme = useTheme();
  
  return (
    <PaperDialog
      visible={visible}
      onDismiss={() => actions.find(a => a.label === 'Cancelar' || a.label === 'Fechar')?.onPress?.()}
      style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
    >
      <PaperDialog.Title style={{ color: theme.colors.primary }}>
        {title}
      </PaperDialog.Title>
      
      <PaperDialog.Content>
        <Text style={[styles.content, { color: theme.colors.onSurface }]}>
          {content}
        </Text>
        
        {inputProps && (
          <TextInput
            {...inputProps}
            style={[
              styles.input,
              {
                borderColor: theme.colors.outline,
                color: theme.colors.onSurface,
                backgroundColor: theme.colors.surfaceVariant,
              },
              inputProps.style
            ]}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        )}
        
        {extraContent}
      </PaperDialog.Content>
      
      <PaperDialog.Actions style={styles.actions}>
        {actions.map((action, index) => (
          <Button
            key={index}
            mode={action.mode || 'text'}
            onPress={action.onPress}
            textColor={action.color || theme.colors.primary}
            style={styles.actionButton}
          >
            {action.label}
          </Button>
        ))}
      </PaperDialog.Actions>
    </PaperDialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12,
    elevation: 24,
  },
  content: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 14,
  },
  actions: {
    padding: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginHorizontal: 4,
  }
});

export default Dialog; 