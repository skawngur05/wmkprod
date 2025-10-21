-- Update assigned_to column to remove enum constraint and allow any user name
-- First, check the current structure
DESCRIBE leads;

-- Update the assigned_to column to be a varchar that can accept any user name
ALTER TABLE leads MODIFY COLUMN assigned_to VARCHAR(255) NOT NULL;

-- Optional: Update any existing hardcoded values to match the actual user names
-- This is just an example - adjust based on your actual user data
-- UPDATE leads SET assigned_to = 'Kim' WHERE assigned_to = 'kim';
-- UPDATE leads SET assigned_to = 'Patrick' WHERE assigned_to = 'patrick';
-- UPDATE leads SET assigned_to = 'Lina' WHERE assigned_to = 'lina';

-- Show the updated structure
DESCRIBE leads;
