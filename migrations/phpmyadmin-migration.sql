-- =============================================
-- TIMEZONE-FREE DATE MIGRATION FOR PHPMYADMIN
-- Copy and paste this entire script into phpMyAdmin
-- =============================================

-- IMPORTANT: Make sure to backup your database first!
-- In phpMyAdmin: Export > Quick > SQL > Go

-- This migration converts DATE columns to VARCHAR(10) for timezone-free operation
-- Perfect for US EST client - eliminates all timezone conversion issues

-- =============================================
-- STEP 1: MIGRATE LEADS TABLE
-- =============================================

-- Add new VARCHAR columns
ALTER TABLE `leads` 
ADD COLUMN `date_created_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `next_followup_date_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `pickup_date_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `installation_date_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `installation_end_date_new` VARCHAR(10) DEFAULT NULL;

-- Convert existing data to YYYY-MM-DD string format
UPDATE `leads` SET 
`date_created_new` = DATE_FORMAT(`date_created`, '%Y-%m-%d'),
`next_followup_date_new` = CASE 
    WHEN `next_followup_date` IS NOT NULL THEN DATE_FORMAT(`next_followup_date`, '%Y-%m-%d')
    ELSE NULL 
END,
`pickup_date_new` = CASE 
    WHEN `pickup_date` IS NOT NULL THEN DATE_FORMAT(`pickup_date`, '%Y-%m-%d')
    ELSE NULL 
END,
`installation_date_new` = CASE 
    WHEN `installation_date` IS NOT NULL THEN DATE_FORMAT(`installation_date`, '%Y-%m-%d')
    ELSE NULL 
END,
`installation_end_date_new` = CASE 
    WHEN `installation_end_date` IS NOT NULL THEN DATE_FORMAT(`installation_end_date`, '%Y-%m-%d')
    ELSE NULL 
END;

-- Remove old DATE columns
ALTER TABLE `leads` 
DROP COLUMN `date_created`,
DROP COLUMN `next_followup_date`,
DROP COLUMN `pickup_date`,
DROP COLUMN `installation_date`,
DROP COLUMN `installation_end_date`;

-- Rename new columns to original names
ALTER TABLE `leads` 
CHANGE COLUMN `date_created_new` `date_created` VARCHAR(10) NOT NULL,
CHANGE COLUMN `next_followup_date_new` `next_followup_date` VARCHAR(10) DEFAULT NULL,
CHANGE COLUMN `pickup_date_new` `pickup_date` VARCHAR(10) DEFAULT NULL,
CHANGE COLUMN `installation_date_new` `installation_date` VARCHAR(10) DEFAULT NULL,
CHANGE COLUMN `installation_end_date_new` `installation_end_date` VARCHAR(10) DEFAULT NULL;

-- =============================================
-- STEP 2: MIGRATE SAMPLE_BOOKLETS TABLE
-- =============================================

-- Add new VARCHAR columns
ALTER TABLE `sample_booklets` 
ADD COLUMN `date_ordered_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `date_shipped_new` VARCHAR(10) DEFAULT NULL;

-- Convert existing data
UPDATE `sample_booklets` SET 
`date_ordered_new` = DATE_FORMAT(`date_ordered`, '%Y-%m-%d'),
`date_shipped_new` = CASE 
    WHEN `date_shipped` IS NOT NULL THEN DATE_FORMAT(`date_shipped`, '%Y-%m-%d')
    ELSE NULL 
END;

-- Remove old columns
ALTER TABLE `sample_booklets` 
DROP COLUMN `date_ordered`,
DROP COLUMN `date_shipped`;

-- Rename new columns
ALTER TABLE `sample_booklets` 
CHANGE COLUMN `date_ordered_new` `date_ordered` VARCHAR(10) NOT NULL,
CHANGE COLUMN `date_shipped_new` `date_shipped` VARCHAR(10) DEFAULT NULL;

-- =============================================
-- STEP 3: MIGRATE REPAIR_REQUESTS TABLE
-- =============================================

-- Add new VARCHAR columns
ALTER TABLE `repair_requests` 
ADD COLUMN `date_reported_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `completion_date_new` VARCHAR(10) DEFAULT NULL;

-- Convert existing data
UPDATE `repair_requests` SET 
`date_reported_new` = DATE_FORMAT(`date_reported`, '%Y-%m-%d'),
`completion_date_new` = CASE 
    WHEN `completion_date` IS NOT NULL THEN DATE_FORMAT(`completion_date`, '%Y-%m-%d')
    ELSE NULL 
END;

-- Remove old columns
ALTER TABLE `repair_requests` 
DROP COLUMN `date_reported`,
DROP COLUMN `completion_date`;

-- Rename new columns
ALTER TABLE `repair_requests` 
CHANGE COLUMN `date_reported_new` `date_reported` VARCHAR(10) NOT NULL,
CHANGE COLUMN `completion_date_new` `completion_date` VARCHAR(10) DEFAULT NULL;

-- =============================================
-- STEP 4: MIGRATE COMPLETED_PROJECTS TABLE (if exists)
-- =============================================

-- Add new VARCHAR columns
ALTER TABLE `completed_projects` 
ADD COLUMN `installation_date_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `completion_date_new` VARCHAR(10) DEFAULT NULL,
ADD COLUMN `original_date_created_new` VARCHAR(10) DEFAULT NULL;

-- Convert existing data
UPDATE `completed_projects` SET 
`installation_date_new` = CASE 
    WHEN `installation_date` IS NOT NULL THEN DATE_FORMAT(`installation_date`, '%Y-%m-%d')
    ELSE NULL 
END,
`completion_date_new` = DATE_FORMAT(`completion_date`, '%Y-%m-%d'),
`original_date_created_new` = CASE 
    WHEN `original_date_created` IS NOT NULL THEN DATE_FORMAT(`original_date_created`, '%Y-%m-%d')
    ELSE NULL 
END;

-- Remove old columns
ALTER TABLE `completed_projects` 
DROP COLUMN `installation_date`,
DROP COLUMN `completion_date`,
DROP COLUMN `original_date_created`;

-- Rename new columns
ALTER TABLE `completed_projects` 
CHANGE COLUMN `installation_date_new` `installation_date` VARCHAR(10) DEFAULT NULL,
CHANGE COLUMN `completion_date_new` `completion_date` VARCHAR(10) NOT NULL,
CHANGE COLUMN `original_date_created_new` `original_date_created` VARCHAR(10) DEFAULT NULL;

-- =============================================
-- STEP 5: MIGRATE INSTALLERS TABLE (if exists)
-- =============================================

-- Add new VARCHAR column
ALTER TABLE `installers` 
ADD COLUMN `hire_date_new` VARCHAR(10) DEFAULT NULL;

-- Convert existing data
UPDATE `installers` SET 
`hire_date_new` = CASE 
    WHEN `hire_date` IS NOT NULL THEN DATE_FORMAT(`hire_date`, '%Y-%m-%d')
    ELSE NULL 
END;

-- Remove old column
ALTER TABLE `installers` 
DROP COLUMN `hire_date`;

-- Rename new column
ALTER TABLE `installers` 
CHANGE COLUMN `hire_date_new` `hire_date` VARCHAR(10) DEFAULT NULL;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check leads table
SELECT 'LEADS TABLE - Date format verification' as check_type;
SELECT 
    `id`,
    `date_created`,
    `next_followup_date`,
    `installation_date`,
    CHAR_LENGTH(`date_created`) as date_length,
    `date_created` REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' as valid_format
FROM `leads` 
LIMIT 5;

-- Check sample_booklets table
SELECT 'SAMPLE_BOOKLETS TABLE - Date format verification' as check_type;
SELECT 
    `id`,
    `date_ordered`,
    `date_shipped`,
    CHAR_LENGTH(`date_ordered`) as date_length,
    `date_ordered` REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' as valid_format
FROM `sample_booklets` 
LIMIT 5;

-- Check repair_requests table
SELECT 'REPAIR_REQUESTS TABLE - Date format verification' as check_type;
SELECT 
    `id`,
    `date_reported`,
    `completion_date`,
    CHAR_LENGTH(`date_reported`) as date_length,
    `date_reported` REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' as valid_format
FROM `repair_requests` 
LIMIT 5;

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================

-- SUCCESS! Your database now uses timezone-free date storage
-- All dates are stored as VARCHAR(10) in YYYY-MM-DD format
-- Perfect for US EST client - no more timezone conversion issues!

-- Next steps:
-- 1. Restart your Node.js application 
-- 2. Test date entry and display functionality
-- 3. Verify dates show correctly in all forms
-- 4. Your US EST client will now get consistent date behavior!
