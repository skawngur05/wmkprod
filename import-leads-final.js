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

function mapAssignedInstaller(installer) {
  if (!installer) return null;
  const mapping = {
    'Angel': 'angel',
    'Brian': 'brian', 
    'Luis': 'luis'
  };
  return mapping[installer] || null;
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

async function importAllLeads() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('./wrapqrqc_wmk.sql', 'utf8');
    
    // Find all complete INSERT INTO leads statements (including the semicolon)
    const insertMatches = sqlContent.match(/INSERT INTO `leads` \([^)]+\) VALUES[\s\S]*?;/gi);
    
    if (!insertMatches || insertMatches.length === 0) {
      console.log('No INSERT statements found for leads');
      return;
    }
    
    console.log(`Found ${insertMatches.length} complete INSERT statements for leads`);
    
    // Clear existing data first
    console.log('Clearing existing leads data...');
    await connection.execute('DELETE FROM leads');
    
    let totalLeadsImported = 0;
    let totalLeadsSkipped = 0;
    
    // Process each INSERT statement
    for (let insertIndex = 0; insertIndex < insertMatches.length; insertIndex++) {
      console.log(`\nProcessing INSERT statement ${insertIndex + 1}/${insertMatches.length}...`);
      
      const insertStatement = insertMatches[insertIndex];
      
      // Extract the VALUES part
      const valuesMatch = insertStatement.match(/VALUES\s+([\s\S]*?);/i);
      if (!valuesMatch) {
        console.log('  Could not extract VALUES section');
        continue;
      }
      
      let valuesString = valuesMatch[1].trim();
      
      // Parse the values - split by rows
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
      
      console.log(`  Found ${rows.length} rows in this INSERT statement`);
      
      // Import leads from this INSERT statement
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        try {
          const row = rows[rowIndex];
          
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
            
            return val;
          });
          
          if (cleanedValues.length < 18) {
            console.log(`  Row ${rowIndex + 1}: Skipping - insufficient columns (${cleanedValues.length})`);
            totalLeadsSkipped++;
            continue;
          }
          
          // Map the values to our schema
          const leadData = {
            id: randomUUID(),
            name: cleanedValues[3] || '',
            phone: cleanedValues[4] || '',
            email: cleanedValues[5] || '',
            lead_origin: mapLeadOrigin(cleanedValues[2]),
            remarks: mapStatus(cleanedValues[7]), // status goes into remarks field
            assigned_to: mapAssignedTo(cleanedValues[8]),
            notes: cleanedValues[9] || '',
            additional_notes: cleanedValues[10] || '',
            project_amount: parseFloat(cleanedValues[11]) || 0,
            next_followup_date: convertDate(cleanedValues[6]),
            date_created: convertDate(cleanedValues[1]) || new Date(), // Use the date from SQL or current date
            deposit_paid: cleanedValues[14] === '1' || cleanedValues[14] === 1,
            balance_paid: cleanedValues[15] === '1' || cleanedValues[15] === 1,
            installation_date: convertDate(cleanedValues[16]),
            assigned_installer: mapAssignedInstaller(cleanedValues[17]),
          };
          
          // Insert the lead
          await db.insert(leads).values(leadData);
          totalLeadsImported++;
          
          if (totalLeadsImported % 25 === 0) {
            console.log(`  Imported ${totalLeadsImported} leads so far...`);
          }
          
        } catch (error) {
          console.error(`  Error importing row ${rowIndex + 1}: ${error.message}`);
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
