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
import { leads, sampleBooklets } from './shared/schema.js';

// Mapping functions
function mapLeadOrigin(origin) {
  const mapping = {
    'Google Text': 'google',
    'Website': 'website',
    'Trade Show': 'trade-show',
    'Referral': 'referral',
    'Commercial': 'commercial',
    'WhatsApp': 'whatsapp',
    'Facebook': 'facebook',
    'Instagram': 'instagram'
  };
  return mapping[origin] || 'website';
}

function mapStatus(status) {
  const mapping = {
    'New': 'new',
    'In Progress': 'in-progress',
    'Sold': 'sold',
    'Not Interested': 'not-interested',
    'Not Service Area': 'not-service-area',
    'Not Compatible': 'not-compatible'
  };
  return mapping[status] || 'new';
}

function mapAssignedTo(remarks) {
  if (!remarks) return null;
  const mapping = {
    'Patrick': 'patrick',
    'Kim': 'kim',
    'Lina': 'lina'
  };
  return mapping[remarks] || null;
}

// Function to convert date format
function convertDate(dateStr) {
  if (!dateStr || dateStr === 'NULL' || dateStr === null) return null;
  
  // Handle various date formats
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    return dateStr; // Already in correct format
  }
  
  return dateStr;
}

async function importFullData() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('./wrapqrqc_wmk.sql', 'utf8');
    
    // Extract leads data
    const leadsMatch = sqlContent.match(/INSERT INTO `leads`[^;]+;/s);
    if (!leadsMatch) {
      console.log('No leads data found in SQL file');
      return;
    }
    
    console.log('Parsing leads data...');
    const insertStatement = leadsMatch[0];
    
    // Extract the VALUES part and split by '),(' to get individual rows
    const valuesMatch = insertStatement.match(/VALUES\s+(.+);/s);
    if (!valuesMatch) {
      console.log('Could not parse VALUES from leads INSERT statement');
      return;
    }
    
    let valuesString = valuesMatch[1].trim();
    
    // Remove the outer parentheses from the first and last row
    if (valuesString.startsWith('(')) valuesString = valuesString.substring(1);
    if (valuesString.endsWith(')')) valuesString = valuesString.slice(0, -1);
    
    // Split rows by '),(' but we need to be careful about commas inside quoted strings
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
        if (char === '(') parenLevel++;
        else if (char === ')') parenLevel--;
        
        if (char === ')' && parenLevel === 0) {
          // End of a row
          rows.push(currentRow.trim());
          currentRow = '';
          // Skip the comma and any whitespace
          while (i + 1 < valuesString.length && (valuesString[i + 1] === ',' || valuesString[i + 1] === ' ' || valuesString[i + 1] === '\n')) {
            i++;
          }
          // Skip the opening paren of the next row
          if (i + 1 < valuesString.length && valuesString[i + 1] === '(') {
            i++;
          }
          continue;
        }
      }
      
      currentRow += char;
    }
    
    console.log(`Found ${rows.length} leads to import`);
    
    // Clear existing data first
    console.log('Clearing existing leads data...');
    await connection.execute('DELETE FROM leads');
    
    // Import leads
    console.log('Importing leads...');
    let leadsImported = 0;
    let leadsSkipped = 0;
    
    for (const row of rows) {
      try {
        // Parse individual values from the row
        const values = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          const prevChar = i > 0 ? row[i - 1] : '';
          
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
        const cleanedValues = values.map(val => {
          val = val.trim();
          
          // Handle NULL
          if (val === 'NULL') return null;
          
          // Handle quoted strings
          if ((val.startsWith("'") && val.endsWith("'")) || 
              (val.startsWith('"') && val.endsWith('"'))) {
            return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          }
          
          // Handle numbers
          if (/^\d+(\.\d+)?$/.test(val)) {
            return parseFloat(val);
          }
          
          return val;
        });
        
        if (cleanedValues.length < 14) {
          console.log(`Skipping row with insufficient data: ${cleanedValues.length} columns`);
          leadsSkipped++;
          continue;
        }
        
        // Map the values to our schema
        // Original columns: id, date_added, lead_origin, customer_name, phone, email, follow_up_date, status, remarks, notes, kim_notes, price, created_at, updated_at, is_installed, sample_booklet_sent, installation_date, installation_by
        const leadData = {
          id: randomUUID(),
          name: cleanedValues[3] || 'Unknown',
          phone: cleanedValues[4] || '',
          email: cleanedValues[5] || '',
          lead_origin: mapLeadOrigin(cleanedValues[2]),
          date_created: convertDate(cleanedValues[1]) || '2025-01-01',
          next_followup_date: convertDate(cleanedValues[6]),
          remarks: mapStatus(cleanedValues[7]),
          assigned_to: mapAssignedTo(cleanedValues[8]),
          project_amount: parseFloat(cleanedValues[11]) || 0,
          notes: cleanedValues[9] || '',
          additional_notes: cleanedValues[10] || '',
          deposit_paid: cleanedValues[14] === 1 || cleanedValues[14] === '1',
          balance_paid: false, // Default to false
          installation_date: convertDate(cleanedValues[16]),
          assigned_installer: cleanedValues[17] || null
        };
        
        await db.insert(leads).values(leadData);
        leadsImported++;
        
        if (leadsImported % 50 === 0) {
          console.log(`Imported ${leadsImported} leads...`);
        }
      } catch (error) {
        console.error(`Error importing lead: ${error.message}`);
        console.error(`Row data: ${row.substring(0, 100)}...`);
        leadsSkipped++;
      }
    }
    
    console.log('\n=== IMPORT COMPLETE ===');
    console.log(`Leads imported: ${leadsImported}`);
    console.log(`Leads skipped: ${leadsSkipped}`);
    console.log(`Total records imported: ${leadsImported}`);
    
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the import
importFullData()
  .then(() => {
    console.log('Full data import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
