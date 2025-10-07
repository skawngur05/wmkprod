-- Import all commercial leads from CSV data - DUPLICATE-SAFE VERSION

USE wrapqrqc_wmkreact;

-- First, let's check and remove any duplicates from previous imports
-- Remove duplicate commercial leads (keeping the one with the highest ID)
DELETE t1 FROM leads t1
INNER JOIN leads t2 
WHERE t1.id < t2.id 
AND t1.name = t2.name 
AND t1.lead_origin = 'Commercial'
AND t1.project_type = 'Commercial'
AND t1.phone = t2.phone;

-- Now insert commercial leads only if they don't already exist
INSERT INTO leads (
    name, 
    phone, 
    email, 
    lead_origin, 
    project_type, 
    commercial_subcategory, 
    assigned_to, 
    remarks, 
    notes, 
    date_created, 
    next_followup_date
)
SELECT * FROM (
    SELECT 
        '2020 Global Group LLC - Lina Molano' as name,
        '786-389-2185' as phone,
        'alexamolano@hotmail.com' as email,
        'Commercial' as lead_origin,
        'Commercial' as project_type,
        NULL as commercial_subcategory,
        '' as assigned_to,
        'New' as remarks,
        'Customer Type: IO | Rep: Due on receipt' as notes,
        '2025-10-02' as date_created,
        NULL as next_followup_date
    UNION ALL
    SELECT 
        'A A Design & Home LLC - Andres Arango',
        '786-333-5678',
        'aadesigninc@gmail.com',
        'Commercial',
        'Commercial',
        NULL,
        '',
        'New',
        'Customer Type: LK | Rep: Due on receipt | Terms: 7/31/2015 LIBROS NUEVOS   Nuevo Invoice',
        '2025-10-02',
        NULL
) AS new_leads
WHERE NOT EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.name = new_leads.name 
    AND leads.lead_origin = 'Commercial'
    AND leads.project_type = 'Commercial'
);
