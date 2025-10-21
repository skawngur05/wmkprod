import { useAuth } from '@/contexts/auth-context';
import { BusinessCalendar } from '@/components/calendar/BusinessCalendar';
import { useEffect } from 'react';

export default function CalendarPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Business Calendar | WMK CRM';
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <BusinessCalendar 
        mode="full"
        height="calc(100vh - 200px)"
      />
    </div>
  );
}
