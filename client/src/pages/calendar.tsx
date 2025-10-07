import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useMobile } from '@/contexts/mobile-context';
import { BusinessCalendar } from '@/components/calendar/BusinessCalendar';
import { useState, useEffect } from 'react';
import '@/styles/calendar-page.css';

export default function CalendarPage() {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const [pageTitle, setPageTitle] = useState('Business Calendar');

  // Update page title based on mobile status
  useEffect(() => {
    document.title = `${pageTitle} | WMK CRM`;
    
    // Add mobile-specific meta tags for better display
    if (isMobile) {
      // Add viewport meta tag for better mobile experience if not already present
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    }
    
    return () => {
      // Reset viewport meta when component unmounts
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, [isMobile, pageTitle]);

  return (
    <div className={isMobile ? 'mobile-calendar-page' : 'calendar-page'}>
      {/* Page Header */}
      <div className="mb-4">
        <h1 className={isMobile ? "h4 mb-2" : "h3 mb-3"}>
          <i className="fas fa-calendar-alt me-2"></i>
          {pageTitle}
        </h1>
        {!isMobile && (
          <p className="text-muted">
            Manage your business calendar, schedule appointments, and track events.
          </p>
        )}
      </div>
      
      {/* Mobile specific instructions */}
      {isMobile && (
        <div className="alert alert-info mb-3" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          <small>
            Tip: Tap a date to see events. Switch between month, week, or list view using the buttons above.
          </small>
        </div>
      )}
      
      {/* Main Calendar Component */}
      <div className={`card ${isMobile ? 'border-0 shadow-sm' : 'shadow'}`}>
        <div className={`card-body ${isMobile ? 'p-0 pt-2' : 'p-4'}`}>
          <BusinessCalendar 
            mode="full"
            height={isMobile ? "calc(100vh - 180px)" : "700px"}
          />
        </div>
      </div>
    </div>
  );
}
