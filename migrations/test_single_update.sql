-- Test UPDATE for just one company to verify the exact match
USE wrapqrqc_wmkreact;

-- Test update for 2020 Global Group LLC
UPDATE leads 
SET notes = 'Customer Type: IO | Rep: Due on receipt | Address: 2020 North Bayshore Dr. #906, Miami, FL, 33137'
WHERE name = '2020 Global Group LLC - Lina Molano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Check if it worked
SELECT 'RESULT:' as info;
SELECT name, notes 
FROM leads 
WHERE name = '2020 Global Group LLC - Lina Molano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';
