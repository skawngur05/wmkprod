import { google } from 'googleapis';
console.log('Google APIs imported:', !!google);

export class GoogleCalendarService {
  test() {
    return 'working';
  }
}

console.log('Class exported');
