import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
}

export class GoogleCalendarService {
  test() {
    return 'minimal test';
  }
}
