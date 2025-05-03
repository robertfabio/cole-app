import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';

interface SliderWithLabelProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  label: string;
  containerStyle?: ViewStyle;
}

const SliderWithLabel: React.FC<SliderWithLabelProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  label,
  containerStyle
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.surfaceVariant}
        thumbTintColor={theme.colors.primary}
        style={styles.slider}
      />
      <Text style={[styles.label, { color: theme.colors.primary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 150,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  }
});

export default SliderWithLabel; 