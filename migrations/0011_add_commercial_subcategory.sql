-- Add commercial_subcategory column to leads table
ALTER TABLE leads
ADD COLUMN commercial_subcategory VARCHAR(50) DEFAULT NULL AFTER project_type;

-- Add "Cold Call" to lead_origin enum
ALTER TABLE leads
MODIFY COLUMN lead_origin ENUM('Facebook', 'Google Text', 'Instagram', 'Trade Show', 'WhatsApp', 'Commercial', 'Referral', 'Website', 'Cold Call') NOT NULL;
