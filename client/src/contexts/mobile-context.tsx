import React, { createContext, useContext, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBottomNavVisible: boolean;
  toggleBottomNav: () => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isBottomNavVisible, setIsBottomNavVisible] = React.useState(true);
  
  // Determine device type - more precise than just isMobile
  const isTablet = isMobile && window.innerWidth >= 640;
  const isDesktop = !isMobile;
  
  const toggleBottomNav = () => {
    setIsBottomNavVisible(prev => !prev);
  };
  
  return (
    <MobileContext.Provider 
      value={{ 
        isMobile, 
        isTablet, 
        isDesktop, 
        isBottomNavVisible,
        toggleBottomNav
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
}
