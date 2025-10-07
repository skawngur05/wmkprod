import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'migrations', 'commercial_leads.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

// Split into lines
const lines = sqlContent.split('\n');

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

// Process each line
const fixedLines = lines.map((line, index) => {
    // Look for lines with phone numbers (starting with '(')
    if (line.match(/^\('.*?',\s*'[^']*',\s*'[^']*'/)) {
        // Extract the phone number (second field)
        const match = line.match(/^\('([^']*)',\s*'([^']*)',\s*'([^']*)'/);
        if (match) {
            const [, name, phone, email] = match;
            
            // Check if phone is longer than 20 characters
            if (phone.length > 20) {
                const cleanedPhone = cleanPhoneNumber(phone);
                console.log(`Row ${index + 1}: "${phone}" (${phone.length} chars) -> "${cleanedPhone}" (${cleanedPhone.length} chars)`);
                
                // Replace the phone number in the line
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

// Write the fixed content back to file
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(sqlFilePath, fixedContent, 'utf-8');

console.log('✅ Phone number cleanup completed!');
console.log('Fixed SQL file saved to:', sqlFilePath);
