import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Predefined themes
export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'default',
    displayName: 'Default',
    colors: {
      light: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          accent: '#3B82F6',
        },
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      dark: {
        primary: '#60A5FA',
        secondary: '#9CA3AF',
        accent: '#A78BFA',
        background: '#111827',
        surface: '#1F2937',
        text: {
          primary: '#F9FAFB',
          secondary: '#D1D5DB',
          accent: '#60A5FA',
        },
        border: '#374151',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },
  
  cyberpunk: {
    id: 'cyberpunk',
    name: 'cyberpunk',
    displayName: 'Cyberpunk',
    colors: {
      light: {
        primary: '#FF006E',
        secondary: '#8338EC',
        accent: '#3A86FF',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: {
          primary: '#212529',
          secondary: '#6C757D',
          accent: '#FF006E',
        },
        border: '#DEE2E6',
        success: '#06FFA5',
        warning: '#FFD23F',
        error: '#FF006E',
        info: '#3A86FF',
      },
      dark: {
        primary: '#FF006E',
        secondary: '#8338EC',
        accent: '#06FFA5',
        background: '#0D1117',
        surface: '#161B22',
        text: {
          primary: '#C9D1D9',
          secondary: '#8B949E',
          accent: '#FF006E',
        },
        border: '#30363D',
        success: '#06FFA5',
        warning: '#FFD23F',
        error: '#FF006E',
        info: '#3A86FF',
      },
    },
    typography: {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 0 5px rgba(255, 0, 110, 0.2)',
      md: '0 0 10px rgba(255, 0, 110, 0.3)',
      lg: '0 0 20px rgba(255, 0, 110, 0.4)',
      xl: '0 0 30px rgba(255, 0, 110, 0.5)',
    },
  },

  nature: {
    id: 'nature',
    name: 'nature',
    displayName: 'Nature',
    colors: {
      light: {
        primary: '#059669',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#FFFFFF',
        surface: '#F0FDF4',
        text: {
          primary: '#064E3B',
          secondary: '#6B7280',
          accent: '#059669',
        },
        border: '#D1FAE5',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      dark: {
        primary: '#34D399',
        secondary: '#9CA3AF',
        accent: '#6EE7B7',
        background: '#064E3B',
        surface: '#065F46',
        text: {
          primary: '#ECFDF5',
          secondary: '#A7F3D0',
          accent: '#34D399',
        },
        border: '#047857',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA',
      },
    },
    typography: {
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(5, 150, 105, 0.05)',
      md: '0 4px 6px -1px rgba(5, 150, 105, 0.1)',
      lg: '0 10px 15px -3px rgba(5, 150, 105, 0.1)',
      xl: '0 20px 25px -5px rgba(5, 150, 105, 0.1)',
    },
  },

  ocean: {
    id: 'ocean',
    name: 'ocean',
    displayName: 'Ocean',
    colors: {
      light: {
        primary: '#0EA5E9',
        secondary: '#64748B',
        accent: '#06B6D4',
        background: '#FFFFFF',
        surface: '#F0F9FF',
        text: {
          primary: '#0C4A6E',
          secondary: '#64748B',
          accent: '#0EA5E9',
        },
        border: '#E0F2FE',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0EA5E9',
      },
      dark: {
        primary: '#38BDF8',
        secondary: '#94A3B8',
        accent: '#67E8F9',
        background: '#0C4A6E',
        surface: '#0E7490',
        text: {
          primary: '#F0F9FF',
          secondary: '#BAE6FD',
          accent: '#38BDF8',
        },
        border: '#0369A1',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#38BDF8',
      },
    },
    typography: {
      fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(14, 165, 233, 0.05)',
      md: '0 4px 6px -1px rgba(14, 165, 233, 0.1)',
      lg: '0 10px 15px -3px rgba(14, 165, 233, 0.1)',
      xl: '0 20px 25px -5px rgba(14, 165, 233, 0.1)',
    },
  },
};

// Theme store
interface ThemeContextType {
  currentTheme: string;
  darkMode: boolean;
  customTheme?: Partial<Theme>;
  setTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  setCustomTheme: (customTheme: Partial<Theme>) => void;
  resetCustomTheme: () => void;
  getCurrentTheme: () => Theme;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<string>('default');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [customTheme, setCustomThemeState] = useState<Partial<Theme> | undefined>();

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setCurrentThemeState(parsed.currentTheme || 'default');
        setDarkMode(parsed.darkMode || false);
        setCustomThemeState(parsed.customTheme);
      } catch (error) {
        console.warn('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // Save theme to localStorage when state changes
  useEffect(() => {
    const themeData = {
      currentTheme,
      darkMode,
      customTheme,
    };
    localStorage.setItem('theme-storage', JSON.stringify(themeData));
  }, [currentTheme, darkMode, customTheme]);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentThemeState(themeId);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setCustomTheme = (newCustomTheme: Partial<Theme>) => {
    setCustomThemeState(newCustomTheme);
  };

  const resetCustomTheme = () => {
    setCustomThemeState(undefined);
  };

  const getCurrentTheme = (): Theme => {
    const baseTheme = themes[currentTheme];
    
    if (customTheme) {
      return {
        ...baseTheme,
        ...customTheme,
        colors: {
          ...baseTheme.colors,
          ...(customTheme.colors || {}),
        },
      };
    }
    
    return baseTheme;
  };

  const value: ThemeContextType = {
    currentTheme,
    darkMode,
    customTheme,
    setTheme,
    toggleDarkMode,
    setCustomTheme,
    resetCustomTheme,
    getCurrentTheme,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};