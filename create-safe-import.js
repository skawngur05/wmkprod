import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current SQL file
const sqlFilePath = path.join(__dirname, 'migrations', 'commercial_leads.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

// Extract the VALUES section
const lines = sqlContent.split('\n');
const valueLines = [];
let inValues = false;

for (const line of lines) {
    if (line.includes(') VALUES')) {
        inValues = true;
        continue;
    }
    if (inValues && line.trim().startsWith('(') && line.trim().endsWith('),')) {
        // This is a data line, convert it to UNION ALL format
        const cleanLine = line.trim().slice(0, -1); // Remove trailing comma
        valueLines.push(cleanLine);
    } else if (inValues && line.trim().startsWith('(') && line.trim().endsWith(');')) {
        // This is the last data line
        const cleanLine = line.trim().slice(0, -2); // Remove trailing semicolon
        valueLines.push(cleanLine);
        break;
    }
}

console.log(`Found ${valueLines.length} commercial leads to convert`);

// Create the duplicate-safe SQL
const duplicateSafeSql = `-- Import all commercial leads from CSV data - DUPLICATE-SAFE VERSION

USE wrapqrqc_wmkreact;

-- First, remove any existing duplicates (keeping the one with the highest ID)
DELETE t1 FROM leads t1
INNER JOIN leads t2 
WHERE t1.id < t2.id 
AND t1.name = t2.name 
AND t1.lead_origin = 'Commercial'
AND t1.project_type = 'Commercial';

-- Insert commercial leads only if they don't already exist
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
)
SELECT * FROM (
    SELECT ${valueLines[0].slice(1, -1)} -- Remove outer parentheses from first line
${valueLines.slice(1).map(line => `    UNION ALL\n    SELECT ${line.slice(1, -1)}`).join('\n')}
) AS new_leads
WHERE NOT EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.name = new_leads.name 
    AND leads.lead_origin = 'Commercial'
    AND leads.project_type = 'Commercial'
);`;

// Write the duplicate-safe version
const safeSqlPath = path.join(__dirname, 'migrations', 'commercial_leads_safe.sql');
fs.writeFileSync(safeSqlPath, duplicateSafeSql, 'utf-8');

console.log('✅ Created duplicate-safe SQL file: commercial_leads_safe.sql');
console.log('✅ This version will:');
console.log('   - Remove any existing duplicates first');
console.log('   - Only insert companies that don\'t already exist');
console.log('   - Prevent future duplicates when run multiple times');
