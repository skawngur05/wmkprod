-- Add commercial_subcategory column to leads table

-- Select the database first
USE wrapqrqc_wmkreact;

-- Add commercial_subcategory column to leads table
ALTER TABLE leads
ADD COLUMN commercial_subcategory VARCHAR(50) NULL;
