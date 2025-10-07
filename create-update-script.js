import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const csvFilePath = path.join(__dirname, 'for import.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

// Split into lines and remove the header
const lines = csvContent.split('\n');
const dataLines = lines.slice(1).filter(line => line.trim().length > 0);

console.log(`Found ${dataLines.length} companies to process for updates`);

// Function to escape single quotes in SQL strings
function escapeSqlString(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

// Function to extract email from a string that might contain multiple emails
function extractPrimaryEmail(emailString) {
    if (!emailString) return '';
    const emails = emailString.split(/[;,]/).map(e => e.trim());
    return emails[0] || '';
}

// Function to parse CSV line (handles quotes and commas within fields)
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current);
    return fields;
}

// Process each line and generate UPDATE statements
const updateStatements = [];
let processedCount = 0;

for (const line of dataLines) {
    try {
        const fields = parseCSVLine(line);
        
        if (fields.length < 20) {
            continue;
        }
        
        // Extract relevant fields
        const companyName = fields[0] || '';
        const primaryContact = fields[1] || '';
        const streetAddress = fields[6] || '';
        const firstName = fields[20] || '';
        const lastName = fields[21] || '';
        const city = fields[25] || '';
        const state = fields[26] || '';
        const zip = fields[27] || '';
        const customerType = fields[45] || '';
        const rep = fields[46] || '';
        const terms = fields[47] || '';
        const noteField = fields[48] || '';
        const classField = fields[49] || '';
        const custBroughtBy = fields[50] || '';
        const referredBy = fields[51] || '';
        
        // Skip if no company name
        if (!companyName.trim()) {
            continue;
        }
        
        // Build name field (same logic as insert script)
        let nameField = companyName.trim();
        if (primaryContact.trim()) {
            nameField += ` - ${primaryContact.trim()}`;
        } else if (firstName.trim() || lastName.trim()) {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            if (fullName) {
                nameField += ` - ${fullName}`;
            }
        }
        
        // Build comprehensive notes with address
        const notesParts = [];
        
        if (customerType.trim()) {
            notesParts.push(`Customer Type: ${customerType.trim()}`);
        }
        
        if (rep.trim()) {
            notesParts.push(`Rep: ${rep.trim()}`);
        }
        
        if (terms.trim()) {
            notesParts.push(`Terms: ${terms.trim()}`);
        }
        
        // Add address information if available
        const addressParts = [];
        if (streetAddress.trim()) {
            addressParts.push(streetAddress.trim());
        }
        if (city.trim()) {
            addressParts.push(city.trim());
        }
        if (state.trim()) {
            addressParts.push(state.trim());
        }
        if (zip.trim()) {
            addressParts.push(zip.trim());
        }
        
        if (addressParts.length > 0) {
            notesParts.push(`Address: ${addressParts.join(', ')}`);
        }
        
        if (noteField.trim()) {
            notesParts.push(`Notes: ${noteField.trim()}`);
        }
        
        if (classField.trim()) {
            notesParts.push(`Class: ${classField.trim()}`);
        }
        
        if (custBroughtBy.trim()) {
            notesParts.push(`Customer Brought By: ${custBroughtBy.trim()}`);
        }
        
        if (referredBy.trim()) {
            notesParts.push(`Referred By: ${referredBy.trim()}`);
        }
        
        const notesField = notesParts.length > 0 ? notesParts.join(' | ') : 'New commercial lead imported from CSV';
        
        // Create UPDATE statement
        const updateStatement = `UPDATE leads SET notes = '${escapeSqlString(notesField)}' WHERE name = '${escapeSqlString(nameField)}' AND lead_origin = 'Commercial' AND project_type = 'Commercial';`;
        
        updateStatements.push(updateStatement);
        processedCount++;
        
    } catch (error) {
        console.error(`Error processing line: ${line.substring(0, 50)}...`);
        console.error(`Error: ${error.message}`);
    }
}

console.log(`Processed ${processedCount} companies successfully`);

// Generate the UPDATE SQL file
const sqlHeader = `-- Update existing commercial leads with address information
-- This will UPDATE existing records, not create duplicates

USE wrapqrqc_wmkreact;

-- Update existing commercial leads with comprehensive notes including addresses
`;

const updateSql = sqlHeader + updateStatements.join('\n');

// Write to file
const outputPath = path.join(__dirname, 'migrations', 'update_commercial_addresses.sql');
fs.writeFileSync(outputPath, updateSql, 'utf-8');

console.log(`\nGenerated UPDATE SQL file: ${outputPath}`);
console.log(`Total UPDATE statements: ${updateStatements.length}`);
console.log('\nFirst 2 generated UPDATE statements:');
updateStatements.slice(0, 2).forEach((stmt, index) => {
    console.log(`${index + 1}. ${stmt.substring(0, 150)}...`);
});

console.log('\n✅ This file will UPDATE existing records, not create duplicates');
console.log('✅ Run this in phpMyAdmin to add addresses to your existing commercial leads');
