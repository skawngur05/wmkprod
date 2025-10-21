-- Diagnose name mismatches between database and CSV
USE wrapqrqc_wmkreact;

-- Show first 20 commercial leads in database to see actual format
SELECT 'ACTUAL NAMES IN DATABASE:' as debug_info;
SELECT id, name, LEFT(notes, 50) as current_notes
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial'
ORDER BY name
LIMIT 20;

-- Check if the specific companies from our script exist with exact names
SELECT 'CHECKING EXACT MATCHES:' as debug_info;

-- Test a few specific companies
SELECT 'Looking for: 2020 Global Group LLC' as searching_for;
SELECT COUNT(*) as exact_match_count
FROM leads 
WHERE name = '2020 Global Group LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

SELECT 'Looking for: A A Design & Home LLC' as searching_for;
SELECT COUNT(*) as exact_match_count
FROM leads 
WHERE name = 'A A Design & Home LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

SELECT 'Looking for: ABA House Art & Design Center' as searching_for;
SELECT COUNT(*) as exact_match_count
FROM leads 
WHERE name = 'ABA House Art & Design Center' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Show names that contain these company parts to see the actual format
SELECT 'PARTIAL MATCHES - 2020 Global:' as debug_info;
SELECT id, name FROM leads WHERE name LIKE '%2020 Global%';

SELECT 'PARTIAL MATCHES - A A Design:' as debug_info;
SELECT id, name FROM leads WHERE name LIKE '%A A Design%';

SELECT 'PARTIAL MATCHES - ABA House:' as debug_info;
SELECT id, name FROM leads WHERE name LIKE '%ABA House%';
