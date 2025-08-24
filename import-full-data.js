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

// Helper function to parse SQL INSERT statements
function parseInsertStatement(insertStatement) {
  // Extract the VALUES part
  const valuesMatch = insertStatement.match(/VALUES\s+(.*);?\s*$/s);
  if (!valuesMatch) return [];
  
  const valuesString = valuesMatch[1];
  const rows = [];
  
  // Split by "),(" to get individual rows, but handle the first and last rows specially
  let currentRow = '';
  let parenCount = 0;
  let inString = false;
  let stringChar = null;
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    if (!inString) {
      if (char === '(') {
        parenCount++;
      } else if (char === ')') {
        parenCount--;
        if (parenCount === 0) {
          currentRow += char;
          rows.push(currentRow.trim());
          currentRow = '';
          // Skip the comma and optional whitespace after the closing paren
          if (i + 1 < valuesString.length && valuesString[i + 1] === ',') {
            i++;
          }
          while (i + 1 < valuesString.length && /\s/.test(valuesString[i + 1])) {
            i++;
          }
          continue;
        }
      }
    }
    
    currentRow += char;
  }
  
  return rows;
}

// Helper function to parse a single row of values
function parseRowValues(rowString) {
  // Remove the outer parentheses
  const cleanRow = rowString.replace(/^\(|\)$/g, '');
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = null;
  let parenCount = 0;
  
  for (let i = 0; i < cleanRow.length; i++) {
    const char = cleanRow[i];
    const prevChar = i > 0 ? cleanRow[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    if (!inString) {
      if (char === '(') {
        parenCount++;
      } else if (char === ')') {
        parenCount--;
      } else if (char === ',' && parenCount === 0) {
        values.push(current.trim());
        current = '';
        continue;
      }
    }
    
    current += char;
  }
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values.map(val => {
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
}

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
  if (!dateStr || dateStr === 'NULL') return null;
  
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
    const leadsRows = parseInsertStatement(leadsMatch[0]);
    console.log(`Found ${leadsRows.length} leads to import`);
    
    // Extract sample booklets data
    const bookletMatch = sqlContent.match(/INSERT INTO `sample_booklets`[^;]+;/s);
    let bookletRows = [];
    if (bookletMatch) {
      bookletRows = parseInsertStatement(bookletMatch[0]);
      console.log(`Found ${bookletRows.length} sample booklets to import`);
    }
    
    // Clear existing data first
    console.log('Clearing existing data...');
    await connection.execute('DELETE FROM leads');
    await connection.execute('DELETE FROM sample_booklets');
    console.log('Existing data cleared.');
    
    // Import leads
    console.log('Importing leads...');
    let leadsImported = 0;
    let leadsSkipped = 0;
    
    for (const row of leadsRows) {
      try {
        const values = parseRowValues(row);
        
        if (values.length < 14) {
          console.log(`Skipping row with insufficient data: ${values.length} columns`);
          leadsSkipped++;
          continue;
        }
        
        // Map the values to our schema
        // Original columns: id, date_added, lead_origin, customer_name, phone, email, follow_up_date, status, remarks, notes, kim_notes, price, created_at, updated_at, is_installed, sample_booklet_sent, installation_date, installation_by
        const leadData = {
          id: randomUUID(),
          name: values[3] || 'Unknown',
          phone: values[4] || '',
          email: values[5] || '',
          lead_origin: mapLeadOrigin(values[2]),
          date_created: convertDate(values[1]) || new Date().toISOString().slice(0, 10),
          next_followup_date: convertDate(values[6]),
          remarks: mapStatus(values[7]),
          assigned_to: mapAssignedTo(values[8]),
          project_amount: parseFloat(values[11]) || 0,
          notes: values[9] || '',
          additional_notes: values[10] || '',
          deposit_paid: values[14] === 1 || values[14] === '1',
          balance_paid: false, // Default to false
          installation_date: convertDate(values[16]),
          assigned_installer: values[17] || null
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
    
    // Import sample booklets
    console.log('Importing sample booklets...');
    let bookletsImported = 0;
    let bookletsSkipped = 0;
    
    for (const row of bookletRows) {
      try {
        const values = parseRowValues(row);
        
        if (values.length < 13) {
          console.log(`Skipping booklet row with insufficient data: ${values.length} columns`);
          bookletsSkipped++;
          continue;
        }
        
        // Map the values to our schema
        // Original columns: id, order_number, customer_name, address, email, phone, product_type, tracking_number, status, date_ordered, date_shipped, notes, created_at, updated_at
        const bookletData = {
          id: randomUUID(),
          order_number: values[1] || '',
          customer_name: values[2] || '',
          address: values[3] || '',
          email: values[4] || '',
          phone: values[5] || '',
          product_type: values[6] || 'sample_booklet_only',
          tracking_number: values[7] || null,
          status: (values[8] || 'pending').toLowerCase(),
          date_ordered: convertDate(values[9]) || new Date().toISOString().slice(0, 10),
          date_shipped: convertDate(values[10]),
          notes: values[11] || ''
        };
        
        await db.insert(sampleBooklets).values(bookletData);
        bookletsImported++;
      } catch (error) {
        console.error(`Error importing sample booklet: ${error.message}`);
        console.error(`Row data: ${row.substring(0, 100)}...`);
        bookletsSkipped++;
      }
    }
    
    console.log('\n=== IMPORT COMPLETE ===');
    console.log(`Leads imported: ${leadsImported}`);
    console.log(`Leads skipped: ${leadsSkipped}`);
    console.log(`Sample booklets imported: ${bookletsImported}`);
    console.log(`Sample booklets skipped: ${bookletsSkipped}`);
    console.log(`Total records imported: ${leadsImported + bookletsImported}`);
    
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
