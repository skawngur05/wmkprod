-- Update ALL commercial leads (including duplicates) with address information
-- This will update both copies of each duplicate record

USE wrapqrqc_wmkreact;

-- Update all matching records (not just the first one)
UPDATE leads 
SET notes = 'Customer Type: IO | Rep: Due on receipt | Address: 2020 North Bayshore Dr. #906, Miami, FL, 33137'
WHERE name = '2020 Global Group LLC - Lina Molano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

UPDATE leads 
SET notes = 'Customer Type: LK | Rep: Due on receipt | Terms: 7 Days | Address: 8500 NW 17th Street, #202, Doral, FL, 33126'
WHERE name = 'A A Design & Home LLC - Andres Arango' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

UPDATE leads 
SET notes = 'Customer Type: AE | Rep: Due on receipt | Terms: 0/NET 30 | Address: 1130 NE 127th Street, North Miami, FL, 33161 | Notes: Arturo Meza | Customer: ABA House Art &amp; Design Center'
WHERE name = 'ABA House Art &  Design Center - Lourdes Garcia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Add more UPDATE statements for each company...
-- (This would be all 251 companies from your original update script)
