import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

console.log('Testing file path...');
const credentialsPath = path.join(__dirname, '../client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json');
console.log('Credentials path:', credentialsPath);
console.log('File exists:', fs.existsSync(credentialsPath));

export class GoogleCalendarService {
  test() {
    return 'working';
  }
}

console.log('Class exported');
