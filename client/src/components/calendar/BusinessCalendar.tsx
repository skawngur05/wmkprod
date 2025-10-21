import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent, Lead, InsertCalendarEvent, UpdateCalendarEvent } from '@shared/schema';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, X, Edit2, Trash2, RefreshCw, Users, MapPin, Clock, FileText, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import '@/styles/calendar.css';

interface BusinessCalendarProps {
  mode?: 'full' | 'mini';
  height?: string;
}

const formatDateToYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EVENT_TYPE_CONFIG = {
  installation: { 
    label: 'Installation', 
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: '🔧'
  },
  pickup: { 
    label: 'Pickup', 
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: '📦'
  },
  leave: { 
    label: 'Leave', 
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: '🏖️'
  },
  'trade-show': { 
    label: 'Trade Show', 
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    icon: '🎪'
  },
  'showroom-visit': { 
    label: 'Showroom Visit', 
    color: '#06b6d4',
    bgColor: '#cffafe',
    icon: '🏢'
  },
  holiday: { 
    label: 'Holiday', 
    color: '#ec4899',
    bgColor: '#fce7f3',
    icon: '🎉'
  },
  imported: { 
    label: 'Google Event', 
    color: '#6366f1',
    bgColor: '#e0e7ff',
    icon: '📅'
  },
};

export function BusinessCalendar({ mode = 'full', height = '700px' }: BusinessCalendarProps) {
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getDefaultStartTime = (): Date => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
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
    assigned_to: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/users/active'],
  });

  const { data: installations = [], isLoading: installationsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

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
    mutationFn: async ({ id, ...updates }: any) => {
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
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const installationEvents = installations
    .filter(lead => lead.installation_date && lead.remarks === 'Sold')
    .map(lead => ({
      id: `installation-${lead.id}`,
      title: lead.name,
      start: lead.installation_date,
      allDay: true,
      backgroundColor: EVENT_TYPE_CONFIG.installation.color,
      borderColor: EVENT_TYPE_CONFIG.installation.color,
      extendedProps: {
        type: 'installation',
        description: lead.notes,
        location: lead.address,
        assignedTo: lead.assigned_installer,
        isEditable: false,
      },
    }));

  const pickupEvents = installations
    .filter(lead => lead.pickup_date && lead.remarks === 'Sold')
    .map(lead => ({
      id: `pickup-${lead.id}`,
      title: `Pickup: ${lead.name}`,
      start: lead.pickup_date,
      allDay: true,
      backgroundColor: EVENT_TYPE_CONFIG.pickup.color,
      borderColor: EVENT_TYPE_CONFIG.pickup.color,
      extendedProps: {
        type: 'pickup',
        description: lead.notes,
        location: lead.address,
        assignedTo: lead.assigned_installer,
        isEditable: false,
      },
    }));

  const otherEvents = events.map(event => {
    const config = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG] || EVENT_TYPE_CONFIG.imported;
    
    return {
      id: event.id.toString(),
      title: event.title,
      start: event.start_date,
      end: event.end_date || undefined,
      allDay: event.all_day,
      backgroundColor: event.color || config.color,
      borderColor: event.color || config.color,
      extendedProps: {
        type: event.type,
        description: event.description,
        location: event.location,
        assignedTo: event.assigned_to,
        isEditable: !event.google_event_id,
        googleEventId: event.google_event_id,
      },
    };
  });

  const allEvents = [...installationEvents, ...pickupEvents, ...otherEvents];

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setEventModalOpen(true);
  };

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.dateStr);
    clickedDate.setHours(9, 0, 0, 0);
    setFormData({
      ...formData,
      start_date: clickedDate,
      end_date: undefined,
    });
    setAddEventModalOpen(true);
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    
    const eventId = parseInt(selectedEvent.id);
    const dbEvent = events.find(e => e.id === eventId);
    
    if (!dbEvent) return;

    setFormData({
      title: dbEvent.title,
      type: dbEvent.type,
      start_date: new Date(dbEvent.start_date),
      end_date: dbEvent.end_date ? new Date(dbEvent.end_date) : undefined,
      all_day: dbEvent.all_day,
      description: dbEvent.description || '',
      location: dbEvent.location || '',
      assigned_to: dbEvent.assigned_to || '',
    });
    
    setEventModalOpen(false);
    setEditEventModalOpen(true);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    
    const eventId = parseInt(selectedEvent.id);
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required fields',
        variant: 'destructive' 
      });
      return;
    }

    const eventData: InsertCalendarEvent = {
      title: formData.title,
      type: formData.type || 'installation',
      start_date: formData.start_date,
      end_date: formData.end_date,
      all_day: formData.all_day || false,
      description: formData.description || '',
      location: formData.location || '',
      assigned_to: formData.assigned_to || '',
    };

    if (editEventModalOpen && selectedEvent) {
      const eventId = parseInt(selectedEvent.id);
      updateEventMutation.mutate({ id: eventId, ...eventData });
    } else {
      createEventMutation.mutate(eventData);
    }
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
      assigned_to: '',
    });
  };

  const getEventTypeConfig = (type: string) => {
    return EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG] || EVENT_TYPE_CONFIG.imported;
  };

  return (
    <div className="calendar-redesign">
      {/* Modern Toolbar */}
      <div className="calendar-toolbar bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Calendar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your schedule and events</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAddEventModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-add-event"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap gap-3">
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2" data-testid={`legend-${key}`}>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: config.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {config.icon} {config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="calendar-container bg-white dark:bg-gray-900 rounded-b-lg" style={{ height }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobileView ? 'dayGridMonth' : 'timeGridWeek'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: isMobileView ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={allEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="100%"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkClick="popover"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          viewDidMount={(info) => setCurrentView(info.view.type)}
        />
      </div>

      {/* View Event Modal */}
      <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-view-event">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold mb-2">
                  {selectedEvent?.title}
                </DialogTitle>
                {selectedEvent?.extendedProps?.type && (
                  <Badge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: getEventTypeConfig(selectedEvent.extendedProps.type).bgColor,
                      color: getEventTypeConfig(selectedEvent.extendedProps.type).color
                    }}
                  >
                    {getEventTypeConfig(selectedEvent.extendedProps.type).icon} {getEventTypeConfig(selectedEvent.extendedProps.type).label}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleString() : 'N/A'}
                  {selectedEvent?.end && ` - ${new Date(selectedEvent.end).toLocaleString()}`}
                  {selectedEvent?.allDay && ' (All day)'}
                </p>
              </div>
            </div>

            {selectedEvent?.extendedProps?.assignedTo && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Assigned To</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEvent.extendedProps.assignedTo}
                  </p>
                </div>
              </div>
            )}

            {selectedEvent?.extendedProps?.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEvent.extendedProps.location}
                  </p>
                </div>
              </div>
            )}

            {selectedEvent?.extendedProps?.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEvent.extendedProps.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedEvent?.extendedProps?.isEditable && (
            <DialogFooter className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
                disabled={deleteEventMutation.isPending}
                data-testid="button-delete-event"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={handleEditEvent}
                data-testid="button-edit-event"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogFooter>
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
        <DialogContent className="sm:max-w-[550px]" data-testid="dialog-add-edit-event">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editEventModalOpen ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription>
              {editEventModalOpen ? 'Update event details below' : 'Fill in the event details below'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
                data-testid="input-event-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger data-testid="select-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_CONFIG).filter(([key]) => key !== 'imported').map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date & Time *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date ? formatDateTimeLocal(new Date(formData.start_date)) : ''}
                  onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value) })}
                  required
                  data-testid="input-start-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date ? formatDateTimeLocal(new Date(formData.end_date)) : ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value) : undefined })}
                  data-testid="input-end-date"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="all_day"
                checked={formData.all_day || false}
                onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked })}
                data-testid="switch-all-day"
              />
              <Label htmlFor="all_day" className="cursor-pointer">All day event</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select
                value={formData.assigned_to || 'none'}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value === 'none' ? '' : value })}
              >
                <SelectTrigger data-testid="select-assigned-to">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not assigned</SelectItem>
                  {activeUsers.map((user: any) => (
                    <SelectItem key={user.id} value={user.full_name}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
                data-testid="input-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add event description"
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddEventModalOpen(false);
                  setEditEventModalOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending || updateEventMutation.isPending}
                data-testid="button-save-event"
              >
                <Check className="h-4 w-4 mr-2" />
                {editEventModalOpen ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
