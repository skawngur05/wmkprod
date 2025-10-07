-- Debug script to check name matching issues
-- Run this in phpMyAdmin to see what names exist vs what we're trying to update

USE wrapqrqc_wmkreact;

-- First, let's see all commercial leads currently in the database
SELECT 'EXISTING COMMERCIAL LEADS IN DATABASE:' as debug_info;
SELECT id, name, lead_origin, project_type, 
       CHAR_LENGTH(name) as name_length,
       LEFT(notes, 100) as current_notes
FROM leads 
WHERE lead_origin = 'Commercial' 
AND project_type = 'Commercial' 
ORDER BY name;

-- Check if the first few companies from our update script exist
SELECT 'CHECKING FOR SPECIFIC COMPANIES:' as debug_info;

SELECT 'Looking for: 2020 Global Group LLC - Lina Molano' as searching_for;
SELECT id, name, 
       CASE 
           WHEN name = '2020 Global Group LLC - Lina Molano' THEN 'EXACT MATCH'
           WHEN name LIKE '%2020 Global Group%' THEN 'PARTIAL MATCH'
           ELSE 'NO MATCH'
       END as match_status
FROM leads 
WHERE name LIKE '%2020 Global%' OR name LIKE '%Lina Molano%';

SELECT 'Looking for: A A Design & Home LLC - Andres Arango' as searching_for;
SELECT id, name,
       CASE 
           WHEN name = 'A A Design & Home LLC - Andres Arango' THEN 'EXACT MATCH'
           WHEN name LIKE '%A A Design%' THEN 'PARTIAL MATCH'
           ELSE 'NO MATCH'
       END as match_status
FROM leads 
WHERE name LIKE '%A A Design%' OR name LIKE '%Andres Arango%';

SELECT 'Looking for: ABA House Art &  Design Center - Lourdes Garcia' as searching_for;
SELECT id, name,
       CASE 
           WHEN name = 'ABA House Art &  Design Center - Lourdes Garcia' THEN 'EXACT MATCH'
           WHEN name LIKE '%ABA House%' THEN 'PARTIAL MATCH'
           ELSE 'NO MATCH'
       END as match_status
FROM leads 
WHERE name LIKE '%ABA House%' OR name LIKE '%Lourdes Garcia%';
