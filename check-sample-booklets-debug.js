import { db } from './server/db.js';
import { sampleBooklets } from './shared/schema.js';

async function checkSampleBooklets() {
  try {
    console.log('Checking sample booklets...');
    const result = await db.select().from(sampleBooklets);
    console.log('Sample booklets count:', result.length);
    
    if (result.length > 0) {
      console.log('First booklet:', JSON.stringify(result[0], null, 2));
    } else {
      console.log('No sample booklets found in database');
    }
  } catch (error) {
    console.error('Error checking sample booklets:', error);
  }
  process.exit(0);
}

checkSampleBooklets();
