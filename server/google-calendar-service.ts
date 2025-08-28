import { google } from 'googleapis';
import path from 'path';

const CALENDAR_ID = 'primary'; // Updated to use the working calendar ID
const ALTERNATIVE_CALENDAR_IDS = ['primary', 'infofloridawmk@gmail.com'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-calendar-credentials.json');

// Create JWT auth client using keyFile instead of parsing manually
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end: string; // ISO date string
  location?: string;
  attendees?: string[];
}

export class GoogleCalendarService {
  
  // Sync event to Google Calendar
  static async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start,
            timeZone: 'America/New_York', // Adjust for Florida timezone
          },
          end: {
            dateTime: event.end,
            timeZone: 'America/New_York',
          },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        },
      });
      
      console.log('✅ Event created in Google Calendar:', response.data.id);
      return response.data.id || null;
    } catch (error) {
      console.error('❌ Error creating Google Calendar event:', error);
      return null;
    }
  }

  // Update existing event in Google Calendar
  static async updateEvent(googleEventId: string, event: CalendarEvent): Promise<boolean> {
    try {
      await calendar.events.update({
        calendarId: CALENDAR_ID,
        eventId: googleEventId,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start,
            timeZone: 'America/New_York',
          },
          end: {
            dateTime: event.end,
            timeZone: 'America/New_York',
          },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        },
      });
      
      console.log('✅ Event updated in Google Calendar:', googleEventId);
      return true;
    } catch (error) {
      console.error('❌ Error updating Google Calendar event:', error);
      return false;
    }
  }

  // Delete event from Google Calendar
  static async deleteEvent(googleEventId: string): Promise<boolean> {
    try {
      await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId: googleEventId,
      });
      
      console.log('✅ Event deleted from Google Calendar:', googleEventId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting Google Calendar event:', error);
      return false;
    }
  }

  // Get events from Google Calendar (for syncing back to our database)
  static async getEvents(timeMin?: string, timeMax?: string): Promise<any[]> {
    try {
      const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      return response.data.items || [];
    } catch (error) {
      console.error('❌ Error fetching Google Calendar events:', error);
      return [];
    }
  }

  // Test the connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Google Calendar connection...');
      
      const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        maxResults: 1,
        timeMin: new Date().toISOString(),
      });
      
      console.log('✅ Google Calendar connection successful!');
      console.log(`  Calendar ID: ${CALENDAR_ID}`);
      console.log(`  Found ${response.data.items?.length || 0} upcoming events`);
      
      return true;
    } catch (error) {
      console.error('❌ Google Calendar connection failed:');
      if (error instanceof Error) {
        console.error('  Error message:', error.message);
        if ('code' in error) {
          console.error('  Error code:', error.code);
        }
        if ('status' in error) {
          console.error('  HTTP status:', error.status);
        }
      } else {
        console.error('  Unknown error:', error);
      }
      return false;
    }
  }
}
