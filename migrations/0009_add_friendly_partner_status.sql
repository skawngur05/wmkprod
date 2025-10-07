-- Add 'Friendly Partner' to the remarks enum
ALTER TABLE leads MODIFY COLUMN remarks ENUM('Not Interested', 'Not Service Area', 'Not Compatible', 'Sold', 'In Progress', 'New', 'Friendly Partner') DEFAULT 'New';
