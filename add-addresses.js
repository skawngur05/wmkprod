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
const header = lines[0];
const dataLines = lines.slice(1).filter(line => line.trim().length > 0);

console.log(`Found ${dataLines.length} companies to import`);

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

// Function to clean phone numbers (remove extra text, limit to 20 chars)
function cleanPhoneNumber(phone) {
    if (!phone) return '';
    
    // Remove extra text after the phone number
    let cleaned = phone.replace(/\s+(Lina Molano|Lucila|Cell|Patrick|Cell Patricia|Daniel|Ext.*|Extension.*)/gi, '');
    
    // Remove common prefixes/suffixes
    cleaned = cleaned.replace(/^(Phone:|Tel:|Cell:)\s*/gi, '');
    cleaned = cleaned.replace(/\s+(Customer Service|Ext\.|Extension).*$/gi, '');
    
    // Limit to 20 characters max
    if (cleaned.length > 20) {
        cleaned = cleaned.substring(0, 20);
    }
    
    return cleaned.trim();
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
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    fields.push(current);
    
    return fields;
}

// Process each line and generate SQL
const sqlStatements = [];
let processedCount = 0;

for (const line of dataLines) {
    try {
        const fields = parseCSVLine(line);
        
        if (fields.length < 20) {
            console.log(`Skipping line with insufficient fields: ${line.substring(0, 50)}...`);
            continue;
        }
        
        // Extract relevant fields (based on CSV structure)
        const companyName = fields[0] || '';
        const primaryContact = fields[1] || '';
        const streetAddress = fields[6] || '';
        const firstName = fields[20] || '';
        const lastName = fields[21] || '';
        const phone = fields[22] || '';
        const city = fields[25] || '';
        const state = fields[26] || '';
        const zip = fields[27] || '';
        const email = extractPrimaryEmail(fields[13] || ''); // Main Email field
        const customerType = fields[45] || '';
        const notes = fields[17] || '';
        const rep = fields[46] || '';
        const terms = fields[47] || '';
        const noteField = fields[48] || '';
        const classField = fields[49] || '';
        const custBroughtBy = fields[50] || '';
        const referredBy = fields[51] || '';
        
        // Skip if no company name or contact
        if (!companyName.trim()) {
            continue;
        }
        
        // Build name field
        let nameField = companyName.trim();
        if (primaryContact.trim()) {
            nameField += ` - ${primaryContact.trim()}`;
        } else if (firstName.trim() || lastName.trim()) {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            if (fullName) {
                nameField += ` - ${fullName}`;
            }
        }
        
        // Clean phone number
        const cleanedPhone = cleanPhoneNumber(phone);
        
        // Build comprehensive notes field with all available information including address
        let notesField = '';
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
        
        if (notes.trim() && notes.toLowerCase() !== 'no notes' && notes.toLowerCase() !== 'has notes') {
            notesParts.push(`Additional Notes: ${notes.trim()}`);
        }
        
        notesField = notesParts.length > 0 ? notesParts.join(' | ') : 'New commercial lead imported from CSV';
        
        // Create SQL INSERT statement
        const sqlValues = `('${escapeSqlString(nameField)}', '${escapeSqlString(cleanedPhone)}', '${escapeSqlString(email.trim())}', 'Commercial', 'Commercial', NULL, '', 'New', '${escapeSqlString(notesField)}', '2025-10-05', NULL)`;
        
        sqlStatements.push(sqlValues);
        processedCount++;
        
    } catch (error) {
        console.error(`Error processing line: ${line.substring(0, 50)}...`);
        console.error(`Error: ${error.message}`);
    }
}

console.log(`Processed ${processedCount} companies successfully`);

// Generate the complete SQL file with addresses
const sqlHeader = `-- Import all commercial leads from CSV data with addresses

USE wrapqrqc_wmkreact;

-- Insert all commercial leads data
INSERT INTO leads (
    name, 
    phone, 
    email, 
    lead_origin, 
    project_type, 
    commercial_subcategory, 
    assigned_to, 
    remarks, 
    notes, 
    date_created, 
    next_followup_date
) VALUES
`;

const sqlFooter = ';';

// Join all statements with commas and newlines
const allSqlStatements = sqlStatements.join(',\n');
const completeSql = sqlHeader + allSqlStatements + sqlFooter;

// Write to file
const outputPath = path.join(__dirname, 'migrations', 'commercial_leads_with_addresses.sql');
fs.writeFileSync(outputPath, completeSql, 'utf-8');

console.log(`\nGenerated complete SQL file with addresses: ${outputPath}`);
console.log(`Total INSERT statements: ${sqlStatements.length}`);
console.log('\nFirst 2 generated statements with addresses:');
sqlStatements.slice(0, 2).forEach((stmt, index) => {
    console.log(`${index + 1}. ${stmt.substring(0, 200)}...`);
});
