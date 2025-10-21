-- Check for exact duplicates and why UPDATE might only affect 1 row
USE wrapqrqc_wmkreact;

-- Show ALL records with this name (should be 2 if duplicates exist)
SELECT 'ALL RECORDS WITH THIS NAME:' as debug_info;
SELECT id, name, notes, 
       CASE 
           WHEN notes IS NULL THEN 'NULL'
           WHEN notes = '' THEN 'EMPTY'
           ELSE LEFT(notes, 100)
       END as current_notes_preview
FROM leads 
WHERE name = '2020 Global Group LLC - Lina Molano'
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
ORDER BY id;

-- Try the UPDATE again and see exactly what happens
UPDATE leads 
SET notes = 'UPDATED: Customer Type: IO | Rep: Due on receipt | Address: 2020 North Bayshore Dr. #906, Miami, FL, 33137'
WHERE name = '2020 Global Group LLC - Lina Molano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Check results after update
SELECT 'AFTER UPDATE:' as debug_info;
SELECT id, name, notes
FROM leads 
WHERE name = '2020 Global Group LLC - Lina Molano'
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
ORDER BY id;
