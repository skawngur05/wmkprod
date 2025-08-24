import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

// Database configuration
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'wmk_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = drizzle(connection);

// Import the schema
import { sampleBooklets } from './shared/schema.js';

// Mapping functions
function mapProductType(productType) {
  const mapping = {
    'Sample Booklet Only': 'sample_booklet_only',
    'Demo Kit and Sample Booklet': 'demo_kit_and_sample_booklet',
    'Trial Kit': 'trial_kit',
    'Demo Kit Only': 'demo_kit_only'
  };
  return mapping[productType] || 'sample_booklet_only';
}

function mapStatus(status) {
  const mapping = {
    'Pending': 'pending',
    'Shipped': 'shipped',
    'Delivered': 'delivered'
  };
  return mapping[status] || 'pending';
}

// Function to convert date format
function convertDate(dateStr) {
  if (!dateStr || dateStr === 'NULL' || dateStr === null) return null;
  
  // Handle string dates
  if (typeof dateStr === 'string') {
    // Remove quotes if present
    dateStr = dateStr.replace(/^['"]|['"]$/g, '');
    
    // Try to parse the date
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed; // Return Date object
      }
    } catch (e) {
      // If parsing fails, return null
      return null;
    }
  }
  
  return null;
}

// Function to parse a single row of values
function parseRowValues(valuesString) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
    }
    
    if (!inQuotes && char === ',') {
      values.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  // Clean up values
  return values.map(val => {
    val = val.trim();
    
    // Handle NULL
    if (val === 'NULL') return null;
    
    // Handle quoted strings
    if ((val.startsWith("'") && val.endsWith("'")) || 
        (val.startsWith('"') && val.endsWith('"'))) {
      return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    
    return val;
  });
}

// Function to split INSERT statement into individual rows
function splitIntoRows(valuesString) {
  const rows = [];
  let currentRow = '';
  let parenLevel = 0;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
    }
    
    if (!inQuotes) {
      if (char === '(') {
        parenLevel++;
        if (parenLevel === 1) {
          currentRow = ''; // Start new row
          continue;
        }
      } else if (char === ')') {
        parenLevel--;
        if (parenLevel === 0) {
          // End of current row
          if (currentRow.trim()) {
            rows.push(currentRow.trim());
          }
          currentRow = '';
          continue;
        }
      }
    }
    
    if (parenLevel > 0) {
      currentRow += char;
    }
  }
  
  return rows;
}

async function importSampleBooklets() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('./wrapqrqc_wmk.sql', 'utf8');
    
    // Find the sample booklets INSERT statement
    const insertMatch = sqlContent.match(/INSERT INTO `sample_booklets`[\s\S]*?;/i);
    
    if (!insertMatch) {
      console.log('No INSERT statement found for sample_booklets');
      return;
    }
    
    console.log('Found sample booklets INSERT statement');
    
    const insertStatement = insertMatch[0];
    
    // Extract the VALUES part
    const valuesMatch = insertStatement.match(/VALUES\s+([\s\S]*?);/i);
    if (!valuesMatch) {
      console.log('Could not extract VALUES section');
      return;
    }
    
    let valuesString = valuesMatch[1].trim();
    const rows = splitIntoRows(valuesString);
    
    console.log(`Found ${rows.length} sample booklets to import`);
    
    // Clear existing data first
    console.log('Clearing existing sample booklets data...');
    await connection.execute('DELETE FROM sample_booklets');
    
    let imported = 0;
    let skipped = 0;
    
    // Import sample booklets
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      try {
        const row = rows[rowIndex];
        const values = parseRowValues(row);
        
        if (values.length < 12) {
          console.log(`Row ${rowIndex + 1}: Skipping - insufficient columns (${values.length})`);
          skipped++;
          continue;
        }
        
        // Map the values to our schema
        const bookletData = {
          id: randomUUID(),
          order_number: values[1] || '',
          customer_name: values[2] || '',
          address: values[3] || '',
          email: values[4] || '',
          phone: values[5] || '',
          product_type: mapProductType(values[6]),
          tracking_number: values[7],
          status: mapStatus(values[8]),
          date_ordered: convertDate(values[9]) || new Date(),
          date_shipped: convertDate(values[10]),
          notes: values[11] || '',
          created_at: convertDate(values[12]) || new Date(),
          updated_at: convertDate(values[13]) || new Date(),
        };
        
        // Insert the sample booklet
        await db.insert(sampleBooklets).values(bookletData);
        imported++;
        
        console.log(`Imported sample booklet ${imported}: ${bookletData.customer_name} (${bookletData.order_number})`);
        
      } catch (error) {
        console.error(`Error importing row ${rowIndex + 1}: ${error.message}`);
        skipped++;
      }
    }
    
    console.log('\n=== Sample Booklets Import Complete ===');
    console.log(`Total imported: ${imported}`);
    console.log(`Total skipped: ${skipped}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await connection.end();
  }
}

// Run the import
importSampleBooklets();
