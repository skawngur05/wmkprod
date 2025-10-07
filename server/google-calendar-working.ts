import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  colorId?: string;
  color?: string;
}

export class GoogleCalendarService {
  private calendar: any;
  private oauth2Client: any;
  private credentials: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // In production, look for credentials file in the same directory as the script
      const credentialsPath = process.env.NODE_ENV === 'production' 
        ? path.join(process.cwd(), 'client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json')
        : path.join(process.cwd(), 'client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json');
      
      console.log('🔍 Looking for Google credentials at:', credentialsPath);
      
      if (!fs.existsSync(credentialsPath)) {
        console.warn('Google Calendar credentials not found. Calendar sync will be disabled.');
        console.warn('Checked path:', credentialsPath);
        console.warn('Current working directory:', process.cwd());
        return;
      }

      this.credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      const callbackUrl = process.env.NODE_ENV === 'production' 
        ? `${process.env.PRODUCTION_URL || 'https://your-domain.com'}/auth/google/callback`
        : 'http://localhost:3001/auth/google/callback';
      
      this.oauth2Client = new google.auth.OAuth2(
        this.credentials.web.client_id,
        this.credentials.web.client_secret,
        callbackUrl
      );

      if (this.loadTokens()) {
        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        console.log('Google Calendar OAuth client initialized with saved tokens');
      } else {
        console.log('Google Calendar OAuth client initialized - authentication required');
      }
    } catch (error) {
      console.error('Failed to initialize Google Calendar service:', error);
    }
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent'
    });

    return authUrl;
  }

  async getAccessToken(code: string) {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      this.saveTokens(tokens);
      
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  private loadTokens() {
    try {
      const tokensPath = path.join(process.cwd(), 'server', 'google-tokens.json');
      if (fs.existsSync(tokensPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
        this.oauth2Client.setCredentials(tokens);
        return true;
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
    return false;
  }

  private saveTokens(tokens: any) {
    try {
      const tokensPath = path.join(process.cwd(), 'server', 'google-tokens.json');
      fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private async refreshTokensIfNeeded() {
    try {
      if (!this.oauth2Client?.credentials?.refresh_token) {
        console.warn('No refresh token available');
        return false;
      }

      // Check if access token is expired or about to expire
      const now = Date.now();
      const expiryDate = this.oauth2Client.credentials.expiry_date;
      
      if (expiryDate && expiryDate <= now + 60000) { // Refresh if expires in next minute
        console.log('🔄 Access token expired or expiring soon, refreshing...');
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(credentials);
        this.saveTokens(credentials);
        console.log('✅ Tokens refreshed successfully');
        return true;
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to refresh tokens:', error.message);
      if (error.message.includes('invalid_grant')) {
        console.error('🔑 Refresh token is invalid. Re-authentication required.');
        this.clearTokens();
      }
      return false;
    }
  }

  clearTokens() {
    try {
      const tokensPath = path.join(process.cwd(), 'server', 'google-tokens.json');
      if (fs.existsSync(tokensPath)) {
        fs.unlinkSync(tokensPath);
        console.log('🗑️ Cleared invalid tokens');
      }
      this.oauth2Client.setCredentials({});
      this.calendar = null;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  isAuthenticated() {
    return !!(this.calendar && this.oauth2Client?.credentials?.access_token);
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isAuthenticated()) {
        return { 
          success: false, 
          message: 'Not authenticated. Please authenticate first.' 
        };
      }

      // Try to refresh tokens if needed
      const refreshed = await this.refreshTokensIfNeeded();
      if (!refreshed) {
        return { 
          success: false, 
          message: 'Authentication expired. Please re-authenticate.' 
        };
      }

      const response = await this.calendar.calendarList.list();
      return { 
        success: true, 
        message: `Connected successfully. Found ${response.data.items?.length || 0} calendars.` 
      };
    } catch (error: any) {
      if (error.message.includes('invalid_grant')) {
        this.clearTokens();
        return { 
          success: false, 
          message: 'Authentication expired. Please re-authenticate with Google Calendar.' 
        };
      }
      return { 
        success: false, 
        message: `Connection failed: ${error.message}` 
      };
    }
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('Not authenticated with Google Calendar');
        return null;
      }

      // Try to refresh tokens if needed
      const refreshed = await this.refreshTokensIfNeeded();
      if (!refreshed) {
        console.error('❌ Cannot create event: authentication expired');
        return null;
      }

      // Ensure we have valid start and end times
      if (!event.start) {
        console.error('❌ Cannot create Google Calendar event: missing start time');
        return null;
      }

      // If no end time, default to 1 hour after start
      let endTime = event.end;
      if (!endTime) {
        const startDate = new Date(event.start);
        startDate.setHours(startDate.getHours() + 1);
        endTime = startDate.toISOString();
        console.log('📝 No end time provided, defaulting to 1 hour duration');
      }

      // Ensure dates are in proper ISO format
      const startDateTime = new Date(event.start).toISOString();
      const endDateTime = new Date(endTime).toISOString();

      console.log('Creating Google Calendar event with:', {
        summary: event.title,
        start: startDateTime,
        end: endDateTime
      });

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: startDateTime,
            timeZone: 'America/Toronto',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'America/Toronto',
          },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        },
      });
      
      console.log('✅ Event created in Google Calendar:', response.data.id);
      return response.data.id || null;
    } catch (error: any) {
      console.error('❌ Failed to create Google Calendar event:', error.message);
      return null;
    }
  }

  async updateEvent(googleEventId: string, event: CalendarEvent): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('Not authenticated with Google Calendar');
        return false;
      }

      // Ensure we have valid start and end times
      if (!event.start) {
        console.error('❌ Cannot update Google Calendar event: missing start time');
        return false;
      }

      // If no end time, default to 1 hour after start
      let endTime = event.end;
      if (!endTime) {
        const startDate = new Date(event.start);
        startDate.setHours(startDate.getHours() + 1);
        endTime = startDate.toISOString();
        console.log('📝 No end time provided, defaulting to 1 hour duration');
      }

      // Ensure dates are in proper ISO format
      const startDateTime = new Date(event.start).toISOString();
      const endDateTime = new Date(endTime).toISOString();

      console.log('Updating Google Calendar event with:', {
        eventId: googleEventId,
        summary: event.title,
        start: startDateTime,
        end: endDateTime
      });

      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: startDateTime,
            timeZone: 'America/Toronto',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'America/Toronto',
          },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        },
      });
      
      console.log('✅ Event updated in Google Calendar:', googleEventId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to update Google Calendar event:', error.message);
      return false;
    }
  }

  async deleteEvent(googleEventId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('Not authenticated with Google Calendar');
        return false;
      }

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });
      
      console.log('✅ Event deleted from Google Calendar:', googleEventId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to delete Google Calendar event:', error.message);
      return false;
    }
  }

  // Google Calendar color mapping to match business calendar scheme
  private getColorFromColorId(colorId?: string): string {
    // Updated Google Calendar color mapping based on your color legend:
    // basil > Green, peacock > blue, grape > violet, tomato > red, 
    // flamingo > pink, graphite > gray, tangerine > orange, banana > yellow,
    // lavender > purple, sage > almost green
    const colorMap: { [key: string]: string } = {
      '1': '#6B7280', // Graphite -> Gray
      '2': '#EC4899', // Flamingo -> Pink  
      '3': '#EF4444', // Tomato -> Red
      '4': '#F59E0B', // Tangerine -> Orange
      '5': '#F59E0B', // Orange -> Orange
      '6': '#FCD34D', // Banana -> Yellow
      '7': '#22C55E', // Basil -> Green
      '8': '#10B981', // Sage -> Almost green (emerald)
      '9': '#22C55E', // Green -> Green
      '10': '#3B82F6', // Peacock -> Blue
      '11': '#8B5CF6', // Lavender -> Purple/Violet
    };
    
    return colorId ? (colorMap[colorId] || '#6B7280') : '#6B7280'; // Default gray
  }

  async importEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    try {
      if (!this.isAuthenticated()) {
        console.warn('Not authenticated with Google Calendar');
        return [];
      }

      // Try to refresh tokens if needed
      const refreshed = await this.refreshTokensIfNeeded();
      if (!refreshed) {
        console.error('❌ Cannot import events: authentication expired');
        return [];
      }

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate || new Date().toISOString(),
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events: CalendarEvent[] = response.data.items?.map((event: any) => {
        const colorId = event.colorId;
        const hexColor = this.getColorFromColorId(colorId);
        
        console.log(`🎨 Event "${event.summary}" colorId: ${colorId} -> ${hexColor}`);
        
        return {
          id: event.id,
          title: event.summary || 'Untitled Event',
          description: event.description,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          attendees: event.attendees?.map((attendee: any) => attendee.email).filter(Boolean),
          colorId: colorId,
          color: hexColor,
        };
      }) || [];

      console.log(`✅ Imported ${events.length} events from Google Calendar with colors`);
      return events;
    } catch (error: any) {
      if (error.message.includes('invalid_grant')) {
        console.error('❌ Invalid grant error - clearing tokens and requiring re-authentication');
        this.clearTokens();
        console.error('❌ Failed to import Google Calendar events: Authentication expired. Please re-authenticate.');
      } else {
        console.error('❌ Failed to import Google Calendar events:', error.message);
      }
      return [];
    }
  }
}
