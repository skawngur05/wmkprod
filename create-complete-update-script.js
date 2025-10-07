import fs from 'fs';

// Simple CSV parser function
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing - handles basic cases
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Add the last value
    
    // Create record object
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

// Read the CSV file
const csvContent = fs.readFileSync('for import.csv', 'utf8');

// Parse CSV
const records = parseCSV(csvContent);

console.log(`Processing ${records.length} companies...`);

// Generate complete UPDATE script for all companies
let sqlContent = `-- Update ALL commercial leads (including duplicates) with address information
-- This will update both copies of each duplicate record

USE wrapqrqc_wmkreact;

-- Show count before update
SELECT 'BEFORE UPDATE:' as info;
SELECT COUNT(*) as total_commercial_leads
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';

`;

let updateCount = 0;

records.forEach((record, index) => {
  try {
    // Extract all the fields
    const company = record['Company'] || '';
    const contact = record['Contact'] || '';
    const customerType = record['Customer Type'] || '';
    const rep = record['Rep'] || '';
    const terms = record['Terms'] || '';
    const street = record['Street'] || '';
    const city = record['City'] || '';
    const state = record['State'] || '';
    const zip = record['Zip'] || '';
    const notes = record['Notes'] || '';
    const customer = record['Customer'] || '';

    // Skip if no company name
    if (!company.trim()) {
      console.log(`Skipping row ${index + 1}: No company name`);
      return;
    }

    // Create the full name (company - contact)
    const fullName = contact.trim() ? `${company.trim()} - ${contact.trim()}` : company.trim();

    // Build comprehensive notes
    let notesArray = [];
    
    if (customerType) notesArray.push(`Customer Type: ${customerType}`);
    if (rep) notesArray.push(`Rep: ${rep}`);
    if (terms) notesArray.push(`Terms: ${terms}`);
    
    // Add address if available
    const addressParts = [street, city, state, zip].filter(part => part && part.trim());
    if (addressParts.length > 0) {
      notesArray.push(`Address: ${addressParts.join(', ')}`);
    }
    
    if (notes) notesArray.push(`Notes: ${notes}`);
    if (customer && customer !== company) notesArray.push(`Customer: ${customer}`);

    const finalNotes = notesArray.join(' | ');

    // Escape single quotes for SQL
    const escapedName = fullName.replace(/'/g, "''");
    const escapedNotes = finalNotes.replace(/'/g, "''");

    // Create UPDATE statement that affects ALL matching records
    sqlContent += `-- Update: ${fullName}
UPDATE leads 
SET notes = '${escapedNotes}'
WHERE name = '${escapedName}' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

`;

    updateCount++;
  } catch (error) {
    console.error(`Error processing row ${index + 1}:`, error.message);
  }
});

// Add verification queries at the end
sqlContent += `
-- Show count after update
SELECT 'AFTER UPDATE:' as info;
SELECT COUNT(*) as total_commercial_leads
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';

-- Show sample of updated records
SELECT 'SAMPLE UPDATED RECORDS:' as info;
SELECT id, name, LEFT(notes, 100) as notes_preview
FROM leads 
WHERE lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
  AND notes IS NOT NULL
  AND notes != ''
ORDER BY name
LIMIT 10;

-- Check for records that weren't updated (empty notes)
SELECT 'RECORDS NOT UPDATED (empty notes):' as info;
SELECT COUNT(*) as not_updated_count
FROM leads 
WHERE lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
  AND (notes IS NULL OR notes = '');
`;

// Write the complete SQL file
fs.writeFileSync('migrations/update_all_commercial_addresses.sql', sqlContent);

console.log(`✅ Complete UPDATE script generated!`);
console.log(`📝 File: migrations/update_all_commercial_addresses.sql`);
console.log(`🔢 Total UPDATE statements: ${updateCount}`);
console.log(`💡 This will update ALL matching records (including duplicates)`);
