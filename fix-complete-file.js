import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Read and fix the complete SQL file
const sqlFilePath = path.join(__dirname, 'migrations', 'commercial_leads_complete.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

const lines = sqlContent.split('\n');
const fixedLines = lines.map((line, index) => {
    if (line.match(/^\('.*?',\s*'[^']*',\s*'[^']*'/)) {
        const match = line.match(/^\('([^']*)',\s*'([^']*)',\s*'([^']*)'/);
        if (match) {
            const [, name, phone, email] = match;
            
            if (phone.length > 20) {
                const cleanedPhone = cleanPhoneNumber(phone);
                console.log(`Row ${index + 1}: "${phone}" (${phone.length} chars) -> "${cleanedPhone}" (${cleanedPhone.length} chars)`);
                
                const newLine = line.replace(
                    /^(\('[^']*',\s*')([^']*)(.*)/,
                    `$1${cleanedPhone}$3`
                );
                return newLine;
            }
        }
    }
    return line;
});

const fixedContent = fixedLines.join('\n');
fs.writeFileSync(sqlFilePath, fixedContent, 'utf-8');

console.log('✅ Phone numbers fixed in commercial_leads_complete.sql');

// Now copy it to the main file
const mainSqlPath = path.join(__dirname, 'migrations', 'commercial_leads.sql');
fs.writeFileSync(mainSqlPath, fixedContent, 'utf-8');

console.log('✅ Updated commercial_leads.sql with detailed notes and fixed phone numbers');
