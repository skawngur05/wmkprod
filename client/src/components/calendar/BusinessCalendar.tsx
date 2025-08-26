import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { CalendarEvent, Lead } from '@shared/schema';

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

export function BusinessCalendar() {
  // Fetch installations (already in database)
  const { data: installations = [], isLoading: installationsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
  });

  // Fetch calendar events - temporarily disabled to fix issues
  const events: CalendarEvent[] = [];
  const eventsLoading = false;

  if (installationsLoading || eventsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
          <p className="text-muted">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Convert installations to calendar events
  const installationEvents: CalendarEventDisplay[] = installations
    .filter(lead => lead.installation_date && lead.remarks === 'sold')
    .map(lead => ({
      id: `installation-${lead.id}`,
      title: `Installation: ${lead.name}`,
      start: new Date(lead.installation_date!).toISOString(),
      allDay: false,
      color: '#10B981', // Green for installations
      extendedProps: {
        type: 'installation',
        description: `Project: ${lead.project_amount ? `$${lead.project_amount}` : 'N/A'}`,
        location: 'Customer Location',
        assignedTo: Array.isArray(lead.assigned_installer) && lead.assigned_installer.length > 0
          ? lead.assigned_installer.join(', ') 
          : 'Not assigned',
      },
    }));

  // Convert other events to calendar format
  const otherEvents: CalendarEventDisplay[] = events.map(event => {
    let color = '#6B7280'; // Default gray
    
    switch (event.type) {
      case 'leave':
        color = '#EF4444'; // Red
        break;
      case 'trade-show':
        color = '#8B5CF6'; // Purple
        break;
      case 'showroom-visit':
        color = '#F59E0B'; // Amber
        break;
      case 'holiday':
        color = '#EC4899'; // Pink
        break;
    }

    return {
      id: event.id,
      title: event.title,
      start: event.start_date.toISOString(),
      end: event.end_date?.toISOString(),
      allDay: event.all_day,
      color,
      extendedProps: {
        type: event.type,
        description: event.description,
        location: event.location,
        assignedTo: event.assigned_to,
      },
    };
  });

  const allEvents = [...installationEvents, ...otherEvents];

  const handleEventClick = (info: any) => {
    const { event } = info;
    const { extendedProps } = event;
    
    let alertMessage = `${event.title}\n`;
    alertMessage += `Type: ${extendedProps.type.replace('-', ' ').toUpperCase()}\n`;
    alertMessage += `Date: ${event.start.toLocaleDateString()}\n`;
    
    if (extendedProps.assignedTo) {
      alertMessage += `Assigned to: ${extendedProps.assignedTo}\n`;
    }
    
    if (extendedProps.location) {
      alertMessage += `Location: ${extendedProps.location}\n`;
    }
    
    if (extendedProps.description) {
      alertMessage += `Description: ${extendedProps.description}`;
    }
    
    alert(alertMessage);
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={allEvents}
        eventClick={handleEventClick}
        height="500px"
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkClick="popover"
        weekends={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '08:00',
          endTime: '17:00',
        }}
        slotMinTime="07:00"
        slotMaxTime="19:00"
        nowIndicator={true}
        selectable={true}
        selectMirror={true}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
      />
      
      {/* Legend */}
      <div className="mt-3">
        <div className="row">
          <div className="col-12">
            <small className="text-muted fw-bold">Event Legend:</small>
            <div className="d-flex flex-wrap gap-3 mt-2">
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '2px' }}></div>
                <small>Installations</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#EF4444', borderRadius: '2px' }}></div>
                <small>Leave</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#8B5CF6', borderRadius: '2px' }}></div>
                <small>Trade Shows</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B', borderRadius: '2px' }}></div>
                <small>Showroom Visits</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#EC4899', borderRadius: '2px' }}></div>
                <small>Holidays</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}