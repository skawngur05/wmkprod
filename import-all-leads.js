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

function mapAssignedTo(assignedTo) {
  if (!assignedTo) return null;
  const mapping = {
    'Patrick': 'patrick',
    'Kim': 'kim',
    'Lina': 'lina'
  };
  return mapping[assignedTo] || null;
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
      if (char === '(') parenLevel++;
      else if (char === ')') parenLevel--;
      
      if (char === ')' && parenLevel === 0) {
        // End of a row
        rows.push(currentRow.trim());
        currentRow = '';
        // Skip the comma and any whitespace
        while (i + 1 < valuesString.length && (valuesString[i + 1] === ',' || valuesString[i + 1] === ' ' || valuesString[i + 1] === '\n' || valuesString[i + 1] === '\r')) {
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
  
  return rows;
}

async function importAllLeads() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('./wrapqrqc_wmk.sql', 'utf8');
    
    // Find all INSERT INTO leads statements
    const insertStatements = [];
    const insertRegex = /INSERT INTO `leads` \([^)]+\) VALUES\s*([\s\S]*?)(?=INSERT INTO|$)/gi;
    let match;
    
    while ((match = insertRegex.exec(sqlContent)) !== null) {
      insertStatements.push(match[1]);
    }
    
    if (insertStatements.length === 0) {
      console.log('No INSERT statements found for leads');
      return;
    }
    
    console.log(`Found ${insertStatements.length} INSERT statements for leads`);
    
    // Clear existing data first
    console.log('Clearing existing leads data...');
    await connection.execute('DELETE FROM leads');
    
    let totalLeadsImported = 0;
    let totalLeadsSkipped = 0;
    
    // Process each INSERT statement
    for (let insertIndex = 0; insertIndex < insertStatements.length; insertIndex++) {
      console.log(`Processing INSERT statement ${insertIndex + 1}/${insertStatements.length}...`);
      
      let valuesString = insertStatements[insertIndex].trim();
      
      // Remove trailing semicolon if present
      if (valuesString.endsWith(';')) {
        valuesString = valuesString.slice(0, -1);
      }
      
      // Remove the outer parentheses from the first and last row if needed
      if (valuesString.startsWith('(')) valuesString = valuesString.substring(1);
      if (valuesString.endsWith(')')) valuesString = valuesString.slice(0, -1);
      
      const rows = splitIntoRows(valuesString);
      console.log(`  Found ${rows.length} rows in this INSERT statement`);
      
      // Import leads from this INSERT statement
      for (const row of rows) {
        try {
          const values = parseRowValues(row);
          
          if (values.length < 18) {
            console.log(`  Skipping row with insufficient columns: ${values.length}`);
            totalLeadsSkipped++;
            continue;
          }
          
          // Map the values to our schema
          const leadData = {
            id: randomUUID(),
            name: values[3] || '',
            phone: values[4] || '',
            email: values[5] || '',
            leadOrigin: mapLeadOrigin(values[2]),
            status: mapStatus(values[7]),
            assignedTo: mapAssignedTo(values[8]),
            notes: values[9] || '',
            additionalNotes: values[10] || '',
            projectAmount: parseFloat(values[11]) || 0,
            nextFollowupDate: convertDate(values[6]),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Insert the lead
          await db.insert(leads).values(leadData);
          totalLeadsImported++;
          
          if (totalLeadsImported % 50 === 0) {
            console.log(`  Imported ${totalLeadsImported} leads so far...`);
          }
          
        } catch (error) {
          console.error(`  Error importing lead row: ${error.message}`);
          totalLeadsSkipped++;
        }
      }
    }
    
    console.log('\n=== Import Complete ===');
    console.log(`Total leads imported: ${totalLeadsImported}`);
    console.log(`Total leads skipped: ${totalLeadsSkipped}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await connection.end();
  }
}

// Run the import
importAllLeads();
