-- Advanced diagnostic to find the exact name format and encoding issues
USE wrapqrqc_wmkreact;

-- 1. Find any names that contain "2020 Global"
SELECT 'NAMES CONTAINING 2020 Global:' as debug_info;
SELECT id, name, 
       CHAR_LENGTH(name) as name_length,
       HEX(name) as name_hex_encoding,
       ASCII(SUBSTRING(name, 1, 1)) as first_char_ascii,
       ASCII(SUBSTRING(name, -1, 1)) as last_char_ascii
FROM leads 
WHERE name LIKE '%2020 Global%' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- 2. Show the first 10 commercial leads with their exact names
SELECT 'FIRST 10 COMMERCIAL LEADS:' as debug_info;
SELECT id, 
       CONCAT('"', name, '"') as quoted_name,
       CHAR_LENGTH(name) as length,
       HEX(name) as hex_encoding
FROM leads 
WHERE lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
ORDER BY name
LIMIT 10;

-- 3. Try to match with TRIM and different variations
SELECT 'TESTING VARIATIONS:' as debug_info;
SELECT 
    'Exact match' as test_type,
    COUNT(*) as match_count
FROM leads 
WHERE name = '2020 Global Group LLC - Lina Molano'
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial'

UNION ALL

SELECT 
    'Trimmed match' as test_type,
    COUNT(*) as match_count
FROM leads 
WHERE TRIM(name) = '2020 Global Group LLC - Lina Molano'
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial'

UNION ALL

SELECT 
    'LIKE match' as test_type,
    COUNT(*) as match_count
FROM leads 
WHERE name LIKE '2020 Global Group LLC - Lina Molano'
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial'

UNION ALL

SELECT 
    'Contains match' as test_type,
    COUNT(*) as match_count
FROM leads 
WHERE name LIKE '%2020 Global Group LLC%'
  AND name LIKE '%Lina Molano%'
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';
