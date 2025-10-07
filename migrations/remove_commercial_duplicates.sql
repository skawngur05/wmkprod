-- Remove duplicate commercial leads, keeping the one with the lower ID
-- This will remove exactly half of your commercial leads (the duplicates)

USE wrapqrqc_wmkreact;

-- First, let's see how many duplicates we have
SELECT 'DUPLICATE ANALYSIS:' as info;
SELECT name, COUNT(*) as duplicate_count
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, name
LIMIT 20;

-- Delete duplicates, keeping only the record with the lowest ID for each name
DELETE l1 FROM leads l1
INNER JOIN leads l2 
WHERE l1.id > l2.id 
  AND l1.name = l2.name 
  AND l1.lead_origin = 'Commercial' 
  AND l1.project_type = 'Commercial'
  AND l2.lead_origin = 'Commercial' 
  AND l2.project_type = 'Commercial';

-- Verify the cleanup
SELECT 'AFTER CLEANUP:' as info;
SELECT COUNT(*) as total_commercial_leads
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';

SELECT 'REMAINING DUPLICATES (should be 0):' as info;
SELECT name, COUNT(*) as duplicate_count
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial'
GROUP BY name
HAVING COUNT(*) > 1;
