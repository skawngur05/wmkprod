import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

console.log('All imports successful');
console.log('Path:', path);
console.log('fs:', !!fs);

export class GoogleCalendarService {
  test() {
    return 'working';
  }
}

console.log('Class exported');
