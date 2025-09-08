-- Add color column to calendar_events table
ALTER TABLE calendar_events ADD COLUMN color VARCHAR(7) DEFAULT '#6B7280';
