import React, { ReactNode } from 'react';
import { useMobile } from '@/contexts/mobile-context';

interface MobileTableWrapperProps {
  children: ReactNode;
  variant?: 'scroll' | 'stacked' | 'mini';
  className?: string;
}

export function MobileTableWrapper({ 
  children, 
  variant = 'scroll',
  className = '' 
}: MobileTableWrapperProps) {
  const { isMobile } = useMobile();
  
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }
  
  const variantClass = 
    variant === 'stacked' ? 'mobile-stacked-table' :
    variant === 'mini' ? 'mobile-mini-table' :
    'mobile-scroll-table';
  
  return (
    <div className={`mobile-table-container ${variantClass} ${className}`}>
      {children}
    </div>
  );
}
