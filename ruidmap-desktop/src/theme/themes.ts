import { ThemeConfig } from '../types';

export const lightTheme: ThemeConfig = {
  name: 'Light',
  colors: {
    primary: '#0066cc',
    secondary: '#004499', 
    accent: '#00aaff',
    background: '#f8f9fa',
    text: '#212529',
    border: '#dee2e6'
  }
};

export const darkTheme: ThemeConfig = {
  name: 'Dark',
  colors: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#06b6d4', 
    background: '#111827',
    text: '#f9fafb',
    border: '#374151'
  }
};

export const customTheme: ThemeConfig = {
  name: 'Custom',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb'
  }
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  custom: customTheme
};

export const applyTheme = (themeName: keyof typeof themes) => {
  const theme = themes[themeName];
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-border', theme.colors.border);
  
  // Apply dark class for Tailwind
  if (themeName === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};