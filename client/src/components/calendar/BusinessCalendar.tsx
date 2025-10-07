import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent, Lead, InsertCalendarEvent, UpdateCalendarEvent, EVENT_TYPES } from '@shared/schema';
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, User, MapPin, FileText, Plus, Edit, Trash2, Calendar, RefreshCw, Link } from 'lucide-react';
import '@/styles/calendar-mobile.css';

interface BusinessCalendarProps {
  mode?: 'full' | 'mini';
  height?: string;
}

// US Holiday utility functions
const getUSHolidays = (year: number) => {
  const holidays = [];
  
  // New Year's Day
  holidays.push({
    id: `holiday-new-year-${year}`,
    title: "New Year's Day",
    start: `${year}-01-01`,
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Martin Luther King Jr. Day (3rd Monday in January)
  const mlkDay = getNthWeekdayOfMonth(year, 0, 1, 3); // 3rd Monday of January
  holidays.push({
    id: `holiday-mlk-${year}`,
    title: "Martin Luther King Jr. Day",
    start: formatDateToYMD(mlkDay),
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Presidents Day (3rd Monday in February)
  const presidentsDay = getNthWeekdayOfMonth(year, 1, 1, 3); // 3rd Monday of February
  holidays.push({
    id: `holiday-presidents-${year}`,
    title: "Presidents Day",
    start: formatDateToYMD(presidentsDay),
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Memorial Day (Last Monday in May)
  const memorialDay = getLastWeekdayOfMonth(year, 4, 1); // Last Monday of May
  holidays.push({
    id: `holiday-memorial-${year}`,
    title: "Memorial Day",
    start: formatDateToYMD(memorialDay),
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Independence Day
  holidays.push({
    id: `holiday-independence-${year}`,
    title: "Independence Day",
    start: `${year}-07-04`,
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Labor Day (1st Monday in September)
  const laborDay = getNthWeekdayOfMonth(year, 8, 1, 1); // 1st Monday of September
  holidays.push({
    id: `holiday-labor-${year}`,
    title: "Labor Day",
    start: formatDateToYMD(laborDay),
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Columbus Day (2nd Monday in October)
  const columbusDay = getNthWeekdayOfMonth(year, 9, 1, 2); // 2nd Monday of October
  holidays.push({
    id: `holiday-columbus-${year}`,
    title: "Columbus Day",
    start: formatDateToYMD(columbusDay),
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Veterans Day
  holidays.push({
    id: `holiday-veterans-${year}`,
    title: "Veterans Day",
    start: `${year}-11-11`,
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Thanksgiving (4th Thursday in November)
  const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4); // 4th Thursday of November
  holidays.push({
    id: `holiday-thanksgiving-${year}`,
    title: "Thanksgiving Day",
    start: formatDateToYMD(thanksgiving),
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  // Christmas Day
  holidays.push({
    id: `holiday-christmas-${year}`,
    title: "Christmas Day",
    start: `${year}-12-25`,
    allDay: true,
    color: '#EC4899',
    extendedProps: { type: 'us-holiday', isEditable: false }
  });
  
  return holidays;
};

// Helper function to get the nth weekday of a month
const getNthWeekdayOfMonth = (year: number, month: number, weekday: number, n: number) => {
  const date = new Date(year, month, 1);
  const firstWeekday = date.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  date.setDate(1 + offset + (n - 1) * 7);
  return date;
};

// Helper function to get the last weekday of a month
const getLastWeekdayOfMonth = (year: number, month: number, weekday: number) => {
  const date = new Date(year, month + 1, 0); // Last day of the month
  const lastDay = date.getDate();
  const lastWeekday = date.getDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  date.setDate(lastDay - offset);
  return date;
};

// Helper function to format date to YYYY-MM-DD using local system time
const formatDateToYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format datetime to ISO string using local system time
const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Helper function to get event color based on type
const getEventColor = (type: string) => {
  const eventTypeColors: Record<string, string> = {
    'call': '#3B82F6',
    'email': '#10B981',
    'meeting': '#F59E0B',
    'follow-up': '#EF4444',
    'appointment': '#8B5CF6',
    'us-holiday': '#EC4899',
    'google-calendar': '#4285F4'
  };
  return eventTypeColors[type] || '#6B7280';
};

interface CalendarEventDisplay {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color: string;
  extendedProps: {
    type: string;
    description?: string | null;
    location?: string | null;
    assignedTo?: string | null;
  };
}

export function BusinessCalendar({ mode = 'full', height = '500px' }: BusinessCalendarProps) {
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // Initialize mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper function to get default start time (next hour)
  const getDefaultStartTime = (): Date => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Next hour, 0 minutes, 0 seconds
    return nextHour;
  };

  const [formData, setFormData] = useState<Partial<InsertCalendarEvent>>({
    title: '',
    type: 'installation',
    start_date: getDefaultStartTime(),
    end_date: undefined,
    all_day: false,
    description: '',
    location: '',
    assigned_to: 'none',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Google Calendar auth state
  const [isGoogleAuthed, setIsGoogleAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check Google Calendar auth status
  const { data: authStatus } = useQuery({
    queryKey: ['/api/calendar/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/calendar/auth/status');
      if (!response.ok) throw new Error('Failed to check auth status');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch active users for assignment
  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/users/active'],
    queryFn: async () => {
      const response = await fetch('/api/users/active');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Update authentication state when data changes
  useEffect(() => {
    if (authStatus?.authenticated !== undefined) {
      setIsGoogleAuthed(authStatus.authenticated);
      // Clear auth error if authentication is successful
      if (authStatus.authenticated) {
        setAuthError(null);
      }
    }
  }, [authStatus]);

  // Google Calendar sync function
  const handleGoogleAuth = () => {
    window.location.href = '/auth/google';
  };

  // Test Google Calendar connection
  const testGoogleConnection = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/calendar/sync/test', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to test connection');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Google Calendar', 
        description: data.message,
        variant: data.connected ? 'default' : 'destructive'
      });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to test Google Calendar connection',
        variant: 'destructive'
      });
    },
  });

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: 'Google Calendar',
        description: 'Authorization was cancelled or failed',
        variant: 'destructive'
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      // Exchange code for tokens
      exchangeCodeForTokens.mutate(code);
    }
  }, []);

  // Sync events from Google Calendar
  const syncFromGoogle = useMutation({
    mutationFn: async (queryParams: string = '') => {
      console.log('📡 Calling sync API...', queryParams);
      const response = await fetch(`/api/calendar/sync${queryParams}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Handle authentication errors specifically
        if (response.status === 401 || errorData?.requiresAuth) {
          throw new Error('Authentication expired. Please re-authenticate with Google Calendar.');
        }
        
        throw new Error(errorData?.details || 'Failed to sync from Google Calendar');
      }
      
      const result = await response.json();
      console.log('📡 Sync API response:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('✅ Sync success:', result);
      toast({
        title: 'Google Calendar Sync',
        description: `Successfully synced ${result.synced} events from Google Calendar. ${result.skipped > 0 ? `${result.skipped} events were already synced.` : ''}`,
        variant: 'default'
      });
      // Refresh the calendar events
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
    },
    onError: (error: any) => {
      console.error('❌ Sync error:', error);
      
      // Check if error is related to authentication
      if (error.message?.includes('invalid_grant') || 
          error.message?.includes('Authentication expired') ||
          error.message?.includes('unauthorized') ||
          error.message?.includes('invalid_token') ||
          error.message?.includes('re-authenticate')) {
        setAuthError('Google Calendar authentication has expired. Please reconnect.');
        setIsGoogleAuthed(false);
        
        // Clear tokens on server
        fetch('/api/calendar/auth/clear', { method: 'POST' })
          .then(() => console.log('🗑️ Cleared expired tokens'))
          .catch(err => console.error('Failed to clear tokens:', err));
        
        // Refresh auth status
        queryClient.invalidateQueries({ queryKey: ['/api/calendar/auth/status'] });
      }
      
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync events from Google Calendar',
        variant: 'destructive'
      });
    }
  });

  // Exchange authorization code for tokens
  const exchangeCodeForTokens = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!response.ok) throw new Error('Failed to exchange code for tokens');
      return response.json();
    },
    onSuccess: () => {
      console.log('🎉 OAuth success! Starting automatic sync...');
      toast({
        title: 'Google Calendar',
        description: 'Successfully connected to Google Calendar! Starting sync...',
        variant: 'default'
      });
      // Clean URL and refresh auth status
      window.history.replaceState({}, document.title, window.location.pathname);
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/auth/status'] });
      
      // Automatically sync events after successful connection
      setTimeout(() => {
        console.log('🔄 Triggering automatic sync...');
        syncFromGoogle.mutate('');
      }, 1000); // Small delay to ensure auth status is updated
    },
    onError: (error) => {
      console.error('Token exchange error:', error);
      toast({
        title: 'Google Calendar',
        description: 'Failed to complete authentication',
        variant: 'destructive'
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  });

  // Fetch installations (already in database)
  const { data: installations = [], isLoading: installationsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
  });

  // Fetch calendar events from the API
  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events'],
    queryFn: async () => {
      const response = await fetch('/api/calendar/events', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Mutations for CRUD operations
  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertCalendarEvent) => {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast({ title: 'Success', description: 'Event created successfully!' });
      setAddEventModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCalendarEvent & { id: number }) => {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast({ title: 'Success', description: 'Event updated successfully!' });
      setEditEventModalOpen(false);
      setEventModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update event', variant: 'destructive' });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast({ title: 'Success', description: 'Event deleted successfully!' });
      setEventModalOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    },
  });

  if (installationsLoading || isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Convert installations to calendar events
  const installationEvents: CalendarEventDisplay[] = installations
    .filter(lead => lead.installation_date && lead.remarks === 'Sold')
    .map(lead => ({
      id: `installation-${lead.id}`,
      title: `Installation: ${lead.name}`,
      start: formatDateTimeLocal(new Date(lead.installation_date!)),
      allDay: false,
      color: '#16a34a', // Green for installations (matching legend)
      extendedProps: {
        type: 'installation',
        description: `Project: ${lead.project_amount ? `$${lead.project_amount}` : 'N/A'}`,
        location: 'Customer Location',
        assignedTo: Array.isArray(lead.assigned_installer) && lead.assigned_installer.length > 0
          ? lead.assigned_installer.join(', ') 
          : 'Not assigned',
        isEditable: false, // Installation events are read-only
      },
    }));

  // Convert pickup dates to calendar events
  const pickupEvents: CalendarEventDisplay[] = installations
    .filter(lead => lead.pickup_date && lead.remarks === 'Sold')
    .map(lead => ({
      id: `pickup-${lead.id}`,
      title: `Pickup: ${lead.name}`,
      start: formatDateTimeLocal(new Date(lead.pickup_date!)),
      allDay: false,
      color: '#0ea5e9', // Sky blue for pickups (matching meeting color in legend)
      extendedProps: {
        type: 'pickup',
        description: `Project: ${lead.project_amount ? `$${lead.project_amount}` : 'N/A'}`,
        location: 'Pickup Location',
        assignedTo: Array.isArray(lead.assigned_installer) && lead.assigned_installer.length > 0
          ? lead.assigned_installer.join(', ') 
          : 'Not assigned',
        isEditable: false, // Pickup events are read-only
      },
    }));

  // Convert other events to calendar format
  const otherEvents: CalendarEventDisplay[] = events.map(event => {
    let color = '#6B7280'; // Default gray
    
    // Use stored color for imported events (from Google Calendar) - now with proper color mapping
    if (event.type === 'imported' && event.color) {
      color = event.color;
    } else {
      // Use type-based colors for other events - matching the legend
      switch (event.type) {
        case 'installation':
          color = '#16a34a'; // Green (Installation)
          break;
        case 'pickup':
          color = '#0ea5e9'; // Sky blue (Meeting/Pickup)
          break;
        case 'leave':
          color = '#ea580c'; // Orange (Follow-up/Leave)
          break;
        case 'trade-show':
          color = '#4f46e5'; // Indigo (Appointment/Trade Show)
          break;
        case 'showroom-visit':
          color = '#4f46e5'; // Indigo (Appointment/Showroom Visit)
          break;
        case 'holiday':
          color = '#ec4899'; // Pink (Holiday)
          break;
        default:
          color = '#4f46e5'; // Default to appointment color (Indigo)
          break;
      }
    }

    return {
      id: event.id.toString(), // Convert number to string
      title: event.title,
      start: formatDateTimeLocal(new Date(event.start_date)),
      end: event.end_date ? formatDateTimeLocal(new Date(event.end_date)) : undefined,
      allDay: event.all_day,
      color,
      extendedProps: {
        id: event.id, // Store database ID for editing/deleting
        type: event.type,
        description: event.description,
        location: event.location,
        assignedTo: event.assigned_to,
        isEditable: true, // Mark as editable calendar event
      },
    };
  });

  // Generate US holidays for current and next year
  const currentYear = new Date().getFullYear();
  const usHolidays = [
    ...getUSHolidays(currentYear),
    ...getUSHolidays(currentYear + 1)
  ];

  const allEventsForCalendar = [...otherEvents, ...pickupEvents, ...usHolidays];

  // Helper function to format date for datetime-local input
  const formatDateTimeForInput = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    // Use local system time directly
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to parse datetime-local input to proper Date
  const parseDateTimeLocal = (value: string): Date | undefined => {
    if (!value) return undefined;
    // datetime-local gives us local time, create Date object accordingly
    return new Date(value);
  };

  const handleEventClick = (info: any) => {
    const { event } = info;
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'installation',
      start_date: getDefaultStartTime(),
      end_date: undefined,
      all_day: false,
      description: '',
      location: '',
      assigned_to: 'none',
    });
  };

  const handleAddEvent = () => {
    resetForm();
    setAddEventModalOpen(true);
  };

  const handleEditEvent = () => {
    if (selectedEvent && selectedEvent.extendedProps.isEditable) {
      setFormData({
        title: selectedEvent.title || '',
        type: selectedEvent.extendedProps.type || 'installation',
        start_date: selectedEvent.start,
        end_date: selectedEvent.end,
        all_day: selectedEvent.allDay || false,
        description: selectedEvent.extendedProps.description || '',
        location: selectedEvent.extendedProps.location || '',
        assigned_to: selectedEvent.extendedProps.assignedTo || 'none',
      });
      setEventModalOpen(false);
      setEditEventModalOpen(true);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent && selectedEvent.extendedProps.isEditable && selectedEvent.extendedProps.id) {
      deleteEventMutation.mutate(selectedEvent.extendedProps.id);
    }
  };

  const handleSubmit = (isEdit: boolean) => {
    const eventData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date) : new Date(),
      end_date: formData.end_date ? new Date(formData.end_date) : undefined,
      assigned_to: formData.assigned_to === 'none' ? null : formData.assigned_to,
    };

    if (isEdit && selectedEvent && selectedEvent.extendedProps.isEditable && selectedEvent.extendedProps.id) {
      updateEventMutation.mutate({ id: selectedEvent.extendedProps.id, ...eventData });
    } else if (!isEdit) {
      createEventMutation.mutate(eventData as InsertCalendarEvent);
    }
  };

  return (
    <div className={`calendar-container relative ${mode === 'mini' ? 'mini-calendar' : ''}`}>
      {/* Loading overlay */}
      {(isLoading || createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending) && (
        <div className="calendar-loading">
          <div className="calendar-loading-spinner" />
        </div>
      )}
      
      {/* Toolbar with responsive design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${mode === 'mini' ? 'text-base' : 'text-lg'}`}>Business Calendar</h3>
          {isGoogleAuthed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
              <Link className="h-3 w-3" />
              Google Synced
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isGoogleAuthed || authError ? (
            <Button 
              onClick={handleGoogleAuth} 
              variant="outline" 
              className={`flex items-center gap-2 text-xs sm:text-sm ${authError ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}`}
              size="sm"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              {authError ? 'Reconnect Google' : 'Connect Google'}
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => {
                  console.log('Manual Sync Test button clicked');
                  setAuthError(null); // Clear any previous auth errors
                  syncFromGoogle.mutate('');
                }} 
                variant="outline" 
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
                disabled={syncFromGoogle.isPending}
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${syncFromGoogle.isPending ? 'animate-spin' : ''}`} />
                {syncFromGoogle.isPending ? 'Syncing...' : 'Sync with Google'}
              </Button>
            </>
          )}
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
              toast({ title: 'Calendar Refreshed', description: 'Calendar events have been updated.' });
            }}
            variant="outline" 
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            Refresh Calendar
          </Button>
          <Button 
            onClick={() => {
              resetForm();
              setAddEventModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Add Event
          </Button>
        </div>
      </div>
      
      {/* Calendar Legend - only show in full mode */}
      {mode === 'full' && (
        <div className="calendar-legend mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
          <div className="text-sm font-medium mb-2 text-gray-700">Event Types:</div>
          <div className="flex flex-wrap gap-3">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
              <span>Call</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
              <span>Email</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#F59E0B' }}></div>
              <span>Meeting</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#EF4444' }}></div>
              <span>Follow-up</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#8B5CF6' }}></div>
              <span>Appointment</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#EC4899' }}></div>
              <span>Holiday</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Authentication Error Alert */}
      {authError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="text-red-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-red-700">{authError}</div>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-gray-600">Loading calendar...</p>
          </div>
        </div>
      )}
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={allEventsForCalendar}
        eventClick={handleEventClick}
        height="600px"
        editable={true}
        selectable={true}
        nowIndicator={true}
      />

      {/* Event Details Modal */}
      <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
        <DialogContent className="calendar-dialog-content">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              Event Details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View event information and manage event actions.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="calendar-event-details">
              <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-md mb-3">
                <h3 className="font-semibold text-base sm:text-lg border-b pb-2 mb-1">{selectedEvent.title}</h3>
                <div className="flex justify-between items-center">
                  <Badge 
                    variant="outline" 
                    className="text-xs" 
                    style={{
                      backgroundColor: `${selectedEvent.backgroundColor}25`,
                      color: selectedEvent.backgroundColor,
                      borderColor: `${selectedEvent.backgroundColor}50`
                    }}
                  >
                    {selectedEvent.extendedProps.type.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {selectedEvent.extendedProps.isEditable !== false ? 'Editable' : 'System Event'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-100 shadow-sm">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {selectedEvent.start.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    {selectedEvent.start.toTimeString() !== selectedEvent.start.toDateString() && (
                      <span className="text-xs text-gray-500">
                        {selectedEvent.start.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                        {selectedEvent.end && ` - ${selectedEvent.end.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}`}
                      </span>
                    )}
                  </div>
                </div>

                {selectedEvent.extendedProps.assignedTo && (
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-100 shadow-sm">
                    <User className="h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Assigned To</span>
                      <span className="text-sm font-medium">{selectedEvent.extendedProps.assignedTo}</span>
                    </div>
                  </div>
                )}

                {selectedEvent.extendedProps.location && (
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-100 shadow-sm">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Location</span>
                      <span className="text-sm">{selectedEvent.extendedProps.location}</span>
                    </div>
                  </div>
                )}

                {selectedEvent.extendedProps.description && (
                  <div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-gray-500">Description</span>
                    </div>
                    <p className="text-sm whitespace-pre-line pl-6">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Only show for editable events */}
              {selectedEvent?.extendedProps?.isEditable !== false && (
                <div className="flex gap-2 pt-4 mt-4 border-t">
                  <Button 
                    onClick={handleEditEvent} 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    onClick={handleDeleteEvent} 
                    variant="destructive" 
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
              {!selectedEvent?.extendedProps?.isEditable && (
                <div className="flex justify-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Installation events can be managed in the Installations section
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Event Modal */}
      <Dialog open={addEventModalOpen || editEventModalOpen} onOpenChange={(open) => {
        if (!open) {
          setAddEventModalOpen(false);
          setEditEventModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editEventModalOpen ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogDescription>
              {editEventModalOpen ? 'Update the event details below.' : 'Fill in the details to create a new calendar event.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <Label htmlFor="type">Event Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date & Time</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formatDateTimeForInput(formData.start_date)}
                onChange={(e) => setFormData({ ...formData, start_date: parseDateTimeLocal(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date & Time (Optional)</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formatDateTimeForInput(formData.end_date)}
                onChange={(e) => setFormData({ ...formData, end_date: parseDateTimeLocal(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select value={formData.assigned_to || undefined} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {activeUsers.map((user: any) => (
                    <SelectItem key={user.username} value={user.full_name || user.username}>
                      {user.full_name || user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleSubmit(editEventModalOpen)} 
                className="flex-1"
                disabled={!formData.title || createEventMutation.isPending || updateEventMutation.isPending}
              >
                {createEventMutation.isPending || updateEventMutation.isPending ? 'Saving...' : (editEventModalOpen ? 'Update Event' : 'Create Event')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAddEventModalOpen(false);
                  setEditEventModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}