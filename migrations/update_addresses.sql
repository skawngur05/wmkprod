-- Update existing commercial leads with address information
-- Run this in phpMyAdmin to add addresses to existing records

USE wrapqrqc_wmkreact;

-- Update notes to include address information for existing commercial leads
UPDATE leads SET notes = CASE 
    WHEN name = '2020 Global Group LLC - Lina Molano' THEN 'Customer Type: IO | Rep: Due on receipt | Address: 2020 North Bayshore Dr. #906, Miami, FL, 33137'
    WHEN name = 'A A Design & Home LLC - Andres Arango' THEN 'Customer Type: LK | Rep: Due on receipt | Terms: 7/31/2015 LIBROS NUEVOS   Nuevo Invoice | Address: 3470 East Coast Ave. Apt #1013, Miami, FL, 33137'
    WHEN name = 'ABA House Art &  Design Center - Lourdes Garcia' THEN 'Customer Type: AE | Rep: Due on receipt | Terms: 07/31/2015  PENDIENTE POR CONTACTO  Esta de viaje . Volver a llamar | Address: 11439 NW 34 st  Suite 11439, Miami, FL, 33178'
    WHEN name = 'ABC Interior Solutions, Inc. - Jorge L. Perez' THEN 'Customer Type: IO | Rep: Due on receipt | Address: 11450 SW 57 Terr., Miami, FL, 33173'
    WHEN name = 'Academy of Design At City Furniture - Lisa Aportela' THEN 'Customer Type: EM | Rep: Due on receipt | Terms: Lisa needs a catalog. Will confirm presentation to the other designers in the department for the month of June. | Address: 6701 N. Hiatus Rd., Tamarac, FL, 33321'
    -- Add more cases as needed...
    ELSE notes
END
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';
