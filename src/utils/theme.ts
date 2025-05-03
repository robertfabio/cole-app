import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Cores mais minimalistas com um vermelho mais elegante
const lightColors = {
  primary: '#E63946', // Vermelho mais elegante
  onPrimary: '#FFFFFF', 
  primaryContainer: '#FFE9E9', // Container muito suave
  onPrimaryContainer: '#400010',
  secondary: '#457B9D', // Azul médio
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E0F2F9', // Azul muito claro
  onSecondaryContainer: '#0A2D3C',
  tertiary: '#1D3557', // Azul escuro
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E6F0FF', // Container muito suave
  onTertiaryContainer: '#001B3F',
  error: '#BA1A1A',
  background: '#FFFFFF',
  onBackground: '#1F1F1F',
  surface: '#F8F8F8', // Cinza muito claro para manter o minimalismo
  onSurface: '#1F1F1F',
  surfaceVariant: '#F0F0F0', // Cinza mais claro ainda
  onSurfaceVariant: '#404040',
  outline: '#DDDDDD', // Cinza claro para bordas
  shadow: 'rgba(0, 0, 0, 0.1)',
  inverseSurface: '#2E2E2E',
  inverseOnSurface: '#F5F5F5',
  inversePrimary: '#FFB4AB',
};

const darkColors = {
  primary: '#F67E86', // Versão mais suave do vermelho para dark mode
  onPrimary: '#FFFFFF',
  primaryContainer: '#93000A', // Vermelho mais escuro para o container
  onPrimaryContainer: '#FFE9E9',
  secondary: '#82B5CC', // Versão mais clara do azul para dark mode
  onSecondary: '#003547',
  secondaryContainer: '#2A4A5B', // Azul mais escuro para o container
  onSecondaryContainer: '#DBE9F0',
  tertiary: '#8EBCFF', // Azul claro para dark mode
  onTertiary: '#00337D',
  tertiaryContainer: '#004DAF', // Azul mais escuro para o container
  onTertiaryContainer: '#D6E2FF',
  error: '#FFB4AB',
  background: '#121212', // Preto suave
  onBackground: '#EDEDED',
  surface: '#1E1E1E', // Cinza escuro
  onSurface: '#EDEDED',
  surfaceVariant: '#2A2A2A', // Cinza um pouco mais claro
  onSurfaceVariant: '#C7C7C7',
  outline: '#444444', // Cinza para bordas
  shadow: 'rgba(0, 0, 0, 0.5)',
  inverseSurface: '#EDEDED',
  inverseOnSurface: '#1A1A1A',
  inversePrimary: '#C00012',
};

export const getThemeForMode = (mode: 'light' | 'dark'): MD3Theme => {
  if (mode === 'dark') {
    return {
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
        ...darkColors,
      },
      roundness: 12
    };
  }

  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...lightColors,
    },
    roundness: 12
  };
}; 