import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Breakpoint Types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: number;   // 0px
  sm: number;   // 640px
  md: number;   // 768px
  lg: number;   // 1024px
  xl: number;   // 1280px
  '2xl': number; // 1536px
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Responsive Context
interface ResponsiveContextType {
  currentBreakpoint: Breakpoint;
  windowSize: { width: number; height: number };
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
};

// Responsive Provider
interface ResponsiveProviderProps {
  children: ReactNode;
  breakpoints?: Partial<BreakpointConfig>;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ 
  children, 
  breakpoints = {} 
}) => {
  const config = { ...defaultBreakpoints, ...breakpoints };
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  const getCurrentBreakpoint = (): Breakpoint => {
    const { width } = windowSize;
    
    if (width >= config['2xl']) return '2xl';
    if (width >= config.xl) return 'xl';
    if (width >= config.lg) return 'lg';
    if (width >= config.md) return 'md';
    if (width >= config.sm) return 'sm';
    return 'xs';
  };

  const currentBreakpoint = getCurrentBreakpoint();
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  return (
    <ResponsiveContext.Provider
      value={{
        currentBreakpoint,
        windowSize,
        isMobile,
        isTablet,
        isDesktop,
        orientation,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

// Responsive Component
interface ResponsiveProps {
  children: ReactNode;
  breakpoint?: Breakpoint;
  only?: boolean;
  up?: boolean;
  down?: boolean;
}

export const Responsive: React.FC<ResponsiveProps> = ({
  children,
  breakpoint,
  only = false,
  up = false,
  down = false,
}) => {
  const { currentBreakpoint } = useResponsive();
  
  if (!breakpoint) return <>{children}</>;

  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(breakpoint);

  let shouldRender = false;

  if (only) {
    shouldRender = currentBreakpoint === breakpoint;
  } else if (up) {
    shouldRender = currentIndex >= targetIndex;
  } else if (down) {
    shouldRender = currentIndex <= targetIndex;
  } else {
    shouldRender = currentIndex >= targetIndex;
  }

  return shouldRender ? <>{children}</> : null;
};

// Mobile First Component
export const MobileFirst: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isMobile } = useResponsive();
  return isMobile ? <>{children}</> : null;
};

// Desktop First Component
export const DesktopFirst: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDesktop } = useResponsive();
  return isDesktop ? <>{children}</> : null;
};

// Responsive Grid
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number | string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentCols = cols[currentBreakpoint] || cols.xs || 1;
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;
  
  return (
    <div 
      className={`grid grid-cols-${currentCols} ${gapClass} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${currentCols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

// Responsive Text
interface ResponsiveTextProps {
  children: ReactNode;
  size?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl' },
  className = '',
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentSize = size[currentBreakpoint] || size.xs || 'text-base';
  
  return (
    <span className={`${currentSize} ${className}`}>
      {children}
    </span>
  );
};

// Responsive Container
interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = { xs: '100%', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
  padding = { xs: 'px-4', sm: 'px-6', md: 'px-8', lg: 'px-12' },
  className = '',
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentMaxWidth = maxWidth[currentBreakpoint] || maxWidth.xs || '100%';
  const currentPadding = padding[currentBreakpoint] || padding.xs || 'px-4';
  
  return (
    <div 
      className={`mx-auto ${currentPadding} ${className}`}
      style={{ maxWidth: currentMaxWidth }}
    >
      {children}
    </div>
  );
};

// Responsive Navigation
interface ResponsiveNavProps {
  children: ReactNode;
  mobileComponent: ReactNode;
  desktopComponent: ReactNode;
  breakpoint?: Breakpoint;
}

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({
  children,
  mobileComponent,
  desktopComponent,
  breakpoint = 'md',
}) => {
  const { currentBreakpoint } = useResponsive();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(breakpoint);
  
  const isMobileView = currentIndex < targetIndex;
  
  return (
    <nav>
      {isMobileView ? mobileComponent : desktopComponent}
      {children}
    </nav>
  );
};

// Hook for responsive values
export const useResponsiveValue = <T,>(values: Partial<Record<Breakpoint, T>>) => {
  const { currentBreakpoint } = useResponsive();
  
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Find the closest value for current or smaller breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // Fallback to the first available value
  for (const bp of breakpointOrder) {
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

// Media Query Hook
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Common media queries
export const mediaQueries = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
};