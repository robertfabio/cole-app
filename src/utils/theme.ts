import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Define custom color themes
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2D3047',    // Black Pearl - azul escuro sofisticado
    onPrimary: '#F4F4F4',  // Cinza claro para contraste suave
    primaryContainer: '#434763', // Variante mais clara do Black Pearl
    onPrimaryContainer: '#E8E8E8',
    secondary: '#A34A4A',  // Vermelho terroso suave
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D6A6A6', // Vermelho claro esmaecido
    onSecondaryContainer: '#4A2323',
    tertiary: '#C4A35D',   // Dourado suave para acentos
    onTertiary: '#000000',
    tertiaryContainer: '#E5D4B3',
    onTertiaryContainer: '#3E2F1A',
    background: '#F5F0E6', // Bege claro aconchegante
    surface: '#FFFFFF',     // Branco puro para superfícies
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Tema escuro "Black Pearl" (preto suave com toques sutis de azul)
    primary: '#A9B8C9',       // Cinza azulado claro para elementos primários
    onPrimary: '#1A1D24',     // Preto suave para texto sobre primário
    primaryContainer: '#232734', // Container escuro com sutil tom azulado
    onPrimaryContainer: '#E0E5EB', // Cinza muito claro para texto
    
    secondary: '#B8C2D0',     // Cinza azulado mais claro para elementos secundários
    onSecondary: '#1A1D24',   // Preto suave para texto
    secondaryContainer: '#2B303C', // Cinza azulado escuro
    onSecondaryContainer: '#F0F2F5', // Cinza claríssimo quase branco
    
    tertiary: '#F0F2F5',      // Branco com tom suave
    onTertiary: '#1A1D24',    // Preto suave para texto
    tertiaryContainer: '#35394A', // Cinza azulado neutro
    onTertiaryContainer: '#E9ECEF', // Branco suave
    
    background: '#1A1D24',    // Black pearl - preto suave azulado
    surface: '#232734',       // Superfície com tom suave de preto
    surfaceVariant: '#2B303C', // Variante mais clara
    onSurface: '#F0F2F5',     // Quase branco para texto
    onSurfaceVariant: '#D9DEE5', // Cinza muito claro para texto secundário
    
    error: '#E5A4A4',         // Rosa suave para erros
    errorContainer: '#35292E', // Container vermelho escuro suave
    onError: '#1A1D24',       // Preto suave para texto em erros
    onErrorContainer: '#F6E8E8', // Rosa claríssimo para texto
    
    outline: '#8891A0',       // Cinza médio para bordas
    outlineVariant: '#4F5568', // Cinza escuro para bordas secundárias
    
    // Elevações sutis para profundidade
    elevation: {
      level0: 'transparent',
      level1: '#21242E',
      level2: '#262A36',
      level3: '#2B303C',
      level4: '#303543',
      level5: '#353A4A',
    },
    
    // Substituições adicionais para consistência
    shadow: 'rgba(0, 0, 0, 0.25)',
    scrim: 'rgba(0, 0, 0, 0.5)',
    inverseSurface: '#E9ECEF',
    inverseOnSurface: '#1A1D24',
    inversePrimary: '#4D5871',
  },
};

// Function to get the right theme based on settings
export const getThemeForMode = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
}; 