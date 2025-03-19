import { useTheme } from 'next-themes';

export const presetLight = {
  lighter: '#FFFFFF',  // Pure white
  light: '#FFFAFA',    // Snow white
  default: '#F8F8FF',  // Ghost white
  dark: '#F0F8FF',     // Alice blue
  foreground: '#000000',
};

export const presetDark = {
  lighter: '#2C3E50',
  light: '#34495E',
  default: '#ECF0F1',
  dark: '#FFFFFF',
  foreground: '#1A202C',
};

export const DEFAULT_PRESET_COLORS = {
  lighter: '#E3F2FD',
  light: '#64B5F6',
  default: '#2196F3',
  dark: '#1565C0',
  foreground: '#FFFFFF',
};

export const DEFAULT_PRESET_COLOR_NAME = 'GymForce Blue';

export const usePresets = () => {
  const { theme } = useTheme();

  return [
    {
      name: DEFAULT_PRESET_COLOR_NAME,
      colors: DEFAULT_PRESET_COLORS,
    },
    // {
    //   name: 'Monochrome',
    //   colors: {
    //     lighter: theme === 'light' ? presetLight.lighter : presetDark.lighter,
    //     light: theme === 'light' ? presetLight.light : presetDark.light,
    //     default: theme === 'light' ? presetLight.default : presetDark.default,
    //     dark: theme === 'light' ? presetLight.dark : presetDark.dark,
    //     foreground: theme === 'light' ? presetLight.foreground : presetDark.foreground,
    //   },
    // },
    {
      name: 'Energy Green',
      colors: {
        lighter: '#E8F5E9',
        light: '#81C784',
        default: '#4CAF50',
        dark: '#2E7D32',
        foreground: '#FFFFFF',
      },
    },
    {
      name: 'Power Purple',
      colors: {
        lighter: '#F3E5F5',
        light: '#BA68C8',
        default: '#9C27B0',
        dark: '#6A1B9A',
        foreground: '#FFFFFF',
      },
    },
    {
      name: 'Strength Red',
      colors: {
        lighter: '#FFEBEE',
        light: '#EF5350',
        default: '#F44336',
        dark: '#C62828',
        foreground: '#FFFFFF',
      },
    },
    {
      name: 'Focus Orange',
      colors: {
        lighter: '#FFF3E0',
        light: '#FFB74D',
        default: '#FF9800',
        dark: '#EF6C00',
        foreground: '#FFFFFF',
      },
    },
    {
      name: 'Calm Teal',
      colors: {
        lighter: '#E0F7FA',  // Lighter teal
        light: '#B2EBF2',    // Light teal
        default: '#26A69A',  // Teal
        dark: '#00796B',     // Dark teal
        foreground: '#FFFFFF',
      },
    },
  ];
};