-- Add commercial_subcategory column to leads table

-- Select the database first
USE wrapqrqc_wmkreact;

-- Add commercial_subcategory column to leads table
ALTER TABLE leads
ADD COLUMN commercial_subcategory VARCHAR(50) NULL;


USE wrapqrqc_wmkreact;

ALTER TABLE leads 
MODIFY COLUMN lead_origin ENUM('Facebook', 'Google Text', 'Instagram', 'Trade Show', 'WhatsApp', 'Commercial', 'Referral', 'Website', 'Cold Call') NOT NULL;