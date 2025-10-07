-- Migration to change assigned_to from enum to varchar for flexibility
-- This allows assignment to any user, not just hardcoded values

-- First, let's update the column type from enum to varchar
ALTER TABLE leads 
MODIFY COLUMN assigned_to VARCHAR(100) NOT NULL;

-- Update the column to allow NULL temporarily for the change
ALTER TABLE leads 
MODIFY COLUMN assigned_to VARCHAR(100) NULL;

-- Now make it NOT NULL again with a default
ALTER TABLE leads 
MODIFY COLUMN assigned_to VARCHAR(100) NOT NULL DEFAULT 'Kim';
