import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

interface ResponsiveContextType {
  screenSize: {
    width: number;
    height: number;
  };
  breakpoints: ResponsiveBreakpoints;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  orientation: 'portrait' | 'landscape';
}

const ResponsiveContext = createContext<ResponsiveContextType | null>(null);

interface ResponsiveProviderProps {
  children: ReactNode;
  breakpoints?: ResponsiveBreakpoints;
}

const defaultBreakpoints: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ 
  children, 
  breakpoints = defaultBreakpoints 
}) => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize.width < breakpoints.mobile;
  const isTablet = screenSize.width >= breakpoints.mobile && screenSize.width < breakpoints.tablet;
  const isDesktop = screenSize.width >= breakpoints.tablet && screenSize.width < breakpoints.wide;
  const isWide = screenSize.width >= breakpoints.wide;
  const orientation = screenSize.width > screenSize.height ? 'landscape' : 'portrait';

  return (
    <ResponsiveContext.Provider
      value={{
        screenSize,
        breakpoints,
        isMobile,
        isTablet,
        isDesktop,
        isWide,
        orientation,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};