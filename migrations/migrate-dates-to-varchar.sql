-- Database Migration: Convert DATE columns to VARCHAR(10) for timezone-free operation
-- This migration converts existing DATE columns to VARCHAR(10) and preserves all data
-- Perfect for US EST client to eliminate timezone conversion issues

-- =============================================
-- MIGRATION: DATE to VARCHAR(10) Conversion
-- Run this on your production MySQL database
-- =============================================

-- Step 1: LEADS table migration
ALTER TABLE leads 
ADD COLUMN date_created_new VARCHAR(10),
ADD COLUMN next_followup_date_new VARCHAR(10),
ADD COLUMN pickup_date_new VARCHAR(10),
ADD COLUMN installation_date_new VARCHAR(10),
ADD COLUMN installation_end_date_new VARCHAR(10);

-- Convert existing data to string format
UPDATE leads SET 
date_created_new = DATE_FORMAT(date_created, '%Y-%m-%d'),
next_followup_date_new = CASE 
    WHEN next_followup_date IS NOT NULL THEN DATE_FORMAT(next_followup_date, '%Y-%m-%d')
    ELSE NULL 
END,
pickup_date_new = CASE 
    WHEN pickup_date IS NOT NULL THEN DATE_FORMAT(pickup_date, '%Y-%m-%d')
    ELSE NULL 
END,
installation_date_new = CASE 
    WHEN installation_date IS NOT NULL THEN DATE_FORMAT(installation_date, '%Y-%m-%d')
    ELSE NULL 
END,
installation_end_date_new = CASE 
    WHEN installation_end_date IS NOT NULL THEN DATE_FORMAT(installation_end_date, '%Y-%m-%d')
    ELSE NULL 
END;

-- Drop old columns and rename new ones
ALTER TABLE leads 
DROP COLUMN date_created,
DROP COLUMN next_followup_date,
DROP COLUMN pickup_date,
DROP COLUMN installation_date,
DROP COLUMN installation_end_date;

ALTER TABLE leads 
CHANGE COLUMN date_created_new date_created VARCHAR(10) NOT NULL,
CHANGE COLUMN next_followup_date_new next_followup_date VARCHAR(10),
CHANGE COLUMN pickup_date_new pickup_date VARCHAR(10),
CHANGE COLUMN installation_date_new installation_date VARCHAR(10),
CHANGE COLUMN installation_end_date_new installation_end_date VARCHAR(10);

-- Step 2: COMPLETED_PROJECTS table migration
ALTER TABLE completed_projects 
ADD COLUMN installation_date_new VARCHAR(10),
ADD COLUMN completion_date_new VARCHAR(10),
ADD COLUMN original_date_created_new VARCHAR(10);

UPDATE completed_projects SET 
installation_date_new = CASE 
    WHEN installation_date IS NOT NULL THEN DATE_FORMAT(installation_date, '%Y-%m-%d')
    ELSE NULL 
END,
completion_date_new = DATE_FORMAT(completion_date, '%Y-%m-%d'),
original_date_created_new = CASE 
    WHEN original_date_created IS NOT NULL THEN DATE_FORMAT(original_date_created, '%Y-%m-%d')
    ELSE NULL 
END;

ALTER TABLE completed_projects 
DROP COLUMN installation_date,
DROP COLUMN completion_date,
DROP COLUMN original_date_created;

ALTER TABLE completed_projects 
CHANGE COLUMN installation_date_new installation_date VARCHAR(10),
CHANGE COLUMN completion_date_new completion_date VARCHAR(10) NOT NULL,
CHANGE COLUMN original_date_created_new original_date_created VARCHAR(10);

-- Step 3: REPAIR_REQUESTS table migration
ALTER TABLE repair_requests 
ADD COLUMN date_reported_new VARCHAR(10),
ADD COLUMN completion_date_new VARCHAR(10);

UPDATE repair_requests SET 
date_reported_new = DATE_FORMAT(date_reported, '%Y-%m-%d'),
completion_date_new = CASE 
    WHEN completion_date IS NOT NULL THEN DATE_FORMAT(completion_date, '%Y-%m-%d')
    ELSE NULL 
END;

ALTER TABLE repair_requests 
DROP COLUMN date_reported,
DROP COLUMN completion_date;

ALTER TABLE repair_requests 
CHANGE COLUMN date_reported_new date_reported VARCHAR(10) NOT NULL,
CHANGE COLUMN completion_date_new completion_date VARCHAR(10);

-- Step 4: SAMPLE_BOOKLETS table migration
ALTER TABLE sample_booklets 
ADD COLUMN date_ordered_new VARCHAR(10),
ADD COLUMN date_shipped_new VARCHAR(10);

UPDATE sample_booklets SET 
date_ordered_new = DATE_FORMAT(date_ordered, '%Y-%m-%d'),
date_shipped_new = CASE 
    WHEN date_shipped IS NOT NULL THEN DATE_FORMAT(date_shipped, '%Y-%m-%d')
    ELSE NULL 
END;

ALTER TABLE sample_booklets 
DROP COLUMN date_ordered,
DROP COLUMN date_shipped;

ALTER TABLE sample_booklets 
CHANGE COLUMN date_ordered_new date_ordered VARCHAR(10) NOT NULL,
CHANGE COLUMN date_shipped_new date_shipped VARCHAR(10);

-- Step 5: INSTALLERS table migration (if hire_date exists)
ALTER TABLE installers 
ADD COLUMN hire_date_new VARCHAR(10);

UPDATE installers SET 
hire_date_new = CASE 
    WHEN hire_date IS NOT NULL THEN DATE_FORMAT(hire_date, '%Y-%m-%d')
    ELSE NULL 
END;

ALTER TABLE installers 
DROP COLUMN hire_date;

ALTER TABLE installers 
CHANGE COLUMN hire_date_new hire_date VARCHAR(10);

-- Verification queries to check the migration
SELECT 'LEADS TABLE CHECK:' as check_type;
SELECT date_created, next_followup_date, installation_date FROM leads LIMIT 5;

SELECT 'SAMPLE_BOOKLETS TABLE CHECK:' as check_type;
SELECT date_ordered, date_shipped FROM sample_booklets LIMIT 5;

SELECT 'REPAIR_REQUESTS TABLE CHECK:' as check_type;
SELECT date_reported, completion_date FROM repair_requests LIMIT 5;

-- Migration complete! 
-- All date columns are now VARCHAR(10) storing dates as "YYYY-MM-DD" strings
-- No more timezone conversion issues for your US EST client!
