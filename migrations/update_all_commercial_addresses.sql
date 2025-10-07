-- Update ALL commercial leads (including duplicates) with address information
-- This will update both copies of each duplicate record

USE wrapqrqc_wmkreact;

-- Show count before update
SELECT 'BEFORE UPDATE:' as info;
SELECT COUNT(*) as total_commercial_leads
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';

-- Update: 2020 Global Group LLC
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes'
WHERE name = '2020 Global Group LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: A A Design & Home LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'A A Design & Home LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: ABA House Art & Design Center
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33178 | Notes: Has notes | Customer: ABA House Art &  Design Center'
WHERE name = 'ABA House Art & Design Center' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: ABC Interior Solutions, Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33173 | Notes: No notes'
WHERE name = 'ABC Interior Solutions, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Academy of Design At City Furniture
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: EM | Terms: Due on receipt | Address: Tamarac, FL, 33321 | Notes: Has notes'
WHERE name = 'Academy of Design At City Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Acosta Interior Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL | Notes: No notes'
WHERE name = 'Acosta Interior Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Addison House
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: AE | Terms: Due on receipt | Address: Aventura, FL, 33180 | Notes: Has notes'
WHERE name = 'Addison House' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Adriana Hoyos
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: MC | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Adriana Hoyos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Advanced Film Solutions
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: IO | Terms: Due on receipt | Address: Lutz, FL, 33549 | Notes: No notes'
WHERE name = 'Advanced Film Solutions' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: AGE Marketing Services
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami Beach, FL, 33140 | Notes: No notes'
WHERE name = 'AGE Marketing Services' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Aidia Design Corp.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: No notes'
WHERE name = 'Aidia Design Corp.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Alejandro Espriella
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Miami Beach, FL, 33140 | Notes: No notes'
WHERE name = 'Alejandro Espriella' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Alicia Interior Decoration Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Medley, FL, 33178 | Notes: No notes'
WHERE name = 'Alicia Interior Decoration Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Allula Design Group LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33127 | Notes: Has notes'
WHERE name = 'Allula Design Group LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Alluring Design LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Hialeah, FL, 33016 | Notes: Has notes'
WHERE name = 'Alluring Design LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: AM Profile
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'AM Profile' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: American Masters Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Davie, FL, 33325 | Notes: Has notes'
WHERE name = 'American Masters Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Laduree, Corp
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: Has notes | Customer: Anadir Espinosa'
WHERE name = 'Laduree, Corp' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Heimwerker LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes | Customer: Andres De Lamo'
WHERE name = 'Heimwerker LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: APA Closet Doors
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: Has notes'
WHERE name = 'APA Closet Doors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Archinet 305 Inc
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes'
WHERE name = 'Archinet 305 Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Areas by Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33142 | Notes: No notes'
WHERE name = 'Areas by Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Arkintex Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33172 | Notes: Has notes'
WHERE name = 'Arkintex Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Arkipro
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: SP | Terms: Due on receipt | Address: Coral Gables, FL, 33134 | Notes: No notes'
WHERE name = 'Arkipro' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Armando Vera P.A.
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: Has notes'
WHERE name = 'Armando Vera P.A.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: ARPI Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33018 | Notes: No notes'
WHERE name = 'ARPI Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Artefacto - Aventura
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: CL | Terms: Due on receipt | Address: Aventura, FL, 33160 | Notes: Has notes'
WHERE name = 'Artefacto - Aventura' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Artefacto - Doral
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: CL | Terms: Due on receipt | Address: Doral, FL, 33122 | Notes: No notes'
WHERE name = 'Artefacto - Doral' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Artefacto - Merrick Park
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: CL | Terms: Due on receipt | Address: Coral Gables, FL, 33146 | Notes: Has notes'
WHERE name = 'Artefacto - Merrick Park' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Attenas Decor LLC.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Coral Gables, FL, 33134 | Notes: Has notes'
WHERE name = 'Attenas Decor LLC.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Auster & Stern Interiors
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Boca Raton, FL, 33431 | Notes: Has notes'
WHERE name = 'Auster & Stern Interiors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Avant Design Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes'
WHERE name = 'Avant Design Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Avanti Contemporary Furniture
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: IO | Address: Weston, FL, 33326 | Notes: Has notes'
WHERE name = 'Avanti Contemporary Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Aventura Home Decor
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: North Miami Beach, FL, 33160 | Notes: No notes'
WHERE name = 'Aventura Home Decor' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: B Designs
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: SP | Terms: Due on receipt | Address: Aventura, FL, 33160 | Notes: No notes'
WHERE name = 'B Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: B. Pila Design Studio
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33133 | Notes: Has notes'
WHERE name = 'B. Pila Design Studio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Barbara Brickell Designs
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Lighthouse Point, FL, 33064 | Notes: No notes'
WHERE name = 'Barbara Brickell Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Bayshore Construction Group, LLC
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Sunrise, FL, 33325 | Notes: Has notes'
WHERE name = 'Bayshore Construction Group, LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Bellagio Designs
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: North Miami, FL, 33162 | Notes: Has notes'
WHERE name = 'Bellagio Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Binca Imaging Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33178 | Notes: No notes'
WHERE name = 'Binca Imaging Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Blinds Ideas and Shades
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33166 | Notes: Has notes'
WHERE name = 'Blinds Ideas and Shades' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Blue Concepts Inc
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: No notes'
WHERE name = 'Blue Concepts Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Blue Monkey Construction Group LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33130 | Notes: No notes'
WHERE name = 'Blue Monkey Construction Group LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Boca Bargoons
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: EM | Terms: Due on receipt | Address: Hallandale Beach, FL, 33009 | Notes: Has notes'
WHERE name = 'Boca Bargoons' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: BRG Homes
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: Has notes'
WHERE name = 'BRG Homes' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Brick O. Real Estate
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Aventura, FL, 33180 | Notes: No notes'
WHERE name = 'Brick O. Real Estate' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Britto Design Studio Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: Has notes'
WHERE name = 'Britto Design Studio Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Caio Importadora LTDA
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Signs | Rep: IO | Terms: Due on receipt | Address: Manaus AM | Notes: No notes'
WHERE name = 'Caio Importadora LTDA' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Caligaris - Boga Style Home
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: LK | Terms: Due on receipt | Address: Miami, FL | Notes: Has notes | Customer: Caligaris'
WHERE name = 'Caligaris - Boga Style Home' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Capital Contractor Services
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Hallandale, FL, 33009 | Notes: No notes'
WHERE name = 'Capital Contractor Services' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Carolina Dorrego Designs
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33130 | Notes: No notes'
WHERE name = 'Carolina Dorrego Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Casa & Resort
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33145 | Notes: Has notes'
WHERE name = 'Casa & Resort' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Casa Q Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33186 | Notes: Has notes'
WHERE name = 'Casa Q Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cervera Real Estate
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: SP | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: No notes'
WHERE name = 'Cervera Real Estate' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: CF International
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Hialeah, FL, 33010 | Notes: Has notes'
WHERE name = 'CF International' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: CH Construction Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: No notes'
WHERE name = 'CH Construction Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Charmed Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Pinecrest, FL, 33156 | Notes: Has notes'
WHERE name = 'Charmed Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Chase Comunicaion Visual
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Signs | Rep: IO | Terms: Due on receipt | Address: Asuncion | Notes: No notes | Customer: Chase Comunicacion Visual'
WHERE name = 'Chase Comunicaion Visual' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cisneros Studios LLC
UPDATE leads 
SET notes = 'Customer Type: Commercial:Media & Advertising | Rep: SP | Terms: Due on receipt | Address: Medley, FL, 33166 | Notes: Has notes'
WHERE name = 'Cisneros Studios LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cohen Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: No notes'
WHERE name = 'Cohen Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Constantin Gorges
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: No notes'
WHERE name = 'Constantin Gorges' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Continental Electric
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: Has notes'
WHERE name = 'Continental Electric' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Costa Window Treatments
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Costa Window Treatments' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Custom Finish Walls
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33186 | Notes: No notes'
WHERE name = 'Custom Finish Walls' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cynthia Rocklin
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Bay Harbor Islands, FL, 33154 | Notes: Has notes'
WHERE name = 'Cynthia Rocklin' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Dali Furniture Designers
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: IO | Terms: Due on receipt | Address: Hialeah, FL, 33018 | Notes: Has notes'
WHERE name = 'Dali Furniture Designers' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: DAX
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: LK | Address: Medley, FL, 33166 | Notes: No notes'
WHERE name = 'DAX' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Dayoris Doors
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Miami Gardens, FL, 33014 | Notes: No notes'
WHERE name = 'Dayoris Doors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Debora Aguiar Arquitetos
UPDATE leads 
SET notes = 'Customer Type: Architect | Rep: CL | Terms: Due on receipt | Address: Sao Paulo, SP Brasil | Notes: No notes'
WHERE name = 'Debora Aguiar Arquitetos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Deco Dan General Painting
UPDATE leads 
SET notes = 'Customer Type: Professional:Paint & Designs | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33125 | Notes: No notes'
WHERE name = 'Deco Dan General Painting' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Deco Sol Inc
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33122 | Notes: Has notes'
WHERE name = 'Deco Sol Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Decor 4ever LLC.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Sunny Isles, FL, 33160 | Notes: No notes'
WHERE name = 'Decor 4ever LLC.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Decor Blinds + Shades, Inc.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33122 | Notes: No notes'
WHERE name = 'Decor Blinds + Shades, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Deep Design Solutions
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33133 | Notes: Has notes'
WHERE name = 'Deep Design Solutions' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Design Draperies, LLC
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: Has notes'
WHERE name = 'Design Draperies, LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Design Solutions
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Address: Miami, FL, 33129 | Notes: No notes'
WHERE name = 'Design Solutions' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Design Studio By Natalia
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Design Studio By Natalia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Designer Discount Fabrics & Furniture
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: EM | Terms: Due on receipt | Address: Dania Beach, FL, 33004 | Notes: Has notes'
WHERE name = 'Designer Discount Fabrics & Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Digiprint Productions
UPDATE leads 
SET notes = 'Customer Type: Commercial:Signs | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33172 | Notes: No notes | Customer: Digiprint Productions .'
WHERE name = 'Digiprint Productions' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Dion Atelier
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes'
WHERE name = 'Dion Atelier' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Ditex Corp.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: RP | Terms: Due on receipt | Address: Puerto Nuevo, PR, 00922 | Notes: No notes'
WHERE name = 'Ditex Corp.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: DKOR Interiors
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: North Miami, FL, 33162 | Notes: Has notes'
WHERE name = 'DKOR Interiors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Doors 4 U
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Medley, FL, 33166-2212 | Notes: Has notes'
WHERE name = 'Doors 4 U' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Duwerks, Inc.
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Hialeah, FL, 33018 | Notes: No notes'
WHERE name = 'Duwerks, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: E & P Solution Services Inc.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Signs | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: Has notes'
WHERE name = 'E & P Solution Services Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: E Render
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: North Miami, FL, 33181 | Notes: No notes'
WHERE name = 'E Render' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Eclectic Elements
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33145 | Notes: Has notes'
WHERE name = 'Eclectic Elements' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Economy Sign Supply (Referrals)
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: RP | Terms: Due on receipt | Address: Miami, FL | Notes: No notes'
WHERE name = 'Economy Sign Supply (Referrals)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: El Dorado Furniture
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33054 | Notes: Has notes'
WHERE name = 'El Dorado Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Eolo A & I Design, Inc
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33129 | Notes: Has notes'
WHERE name = 'Eolo A & I Design, Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: EPG Corp.
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Miami, FL, 33172 | Notes: Has notes'
WHERE name = 'EPG Corp.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Equilibrium Interior Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Ft. Lauderdale, FL, 33305 | Notes: Has notes | Customer: Equilibrium Interior Design Inc'
WHERE name = 'Equilibrium Interior Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Evolution Tech
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Miramar, FL, 33027 | Notes: Has notes'
WHERE name = 'Evolution Tech' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Expoships, LLLP
UPDATE leads 
SET notes = 'Customer Type: Professional:Boats & Yachts | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: No notes'
WHERE name = 'Expoships, LLLP' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Extreme Surfaces Design Center
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Aventura, FL, 33180 | Notes: Has notes'
WHERE name = 'Extreme Surfaces Design Center' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fabric Gallery Decorative Fabrics
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33155 | Notes: No notes'
WHERE name = 'Fabric Gallery Decorative Fabrics' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fabulous Wallcoverings
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: EM | Terms: Due on receipt | Address: Hallandale Beach, FL, 33009 | Notes: Has notes'
WHERE name = 'Fabulous Wallcoverings' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fede Design , LLC.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33138 | Notes: Has notes | Customer: Fede Design, LLC.'
WHERE name = 'Fede Design , LLC.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Finish My Condo
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: Sunny Isles, FL, 33160 | Notes: Has notes'
WHERE name = 'Finish My Condo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fister Design, Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: Has notes'
WHERE name = 'Fister Design, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Flat Print Cut
UPDATE leads 
SET notes = 'Customer Type: Professional:Media & Advertising | Rep: SP | Terms: Due on receipt | Address: Phoenix, AZ, 85017 | Notes: No notes'
WHERE name = 'Flat Print Cut' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fleurish Design & Events
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33172 | Notes: No notes'
WHERE name = 'Fleurish Design & Events' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Floridian Furniture
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33134 | Notes: No notes'
WHERE name = 'Floridian Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Flornaments Planners Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: EM | Terms: Due on receipt | Address: North Miami Beach, FL, 33179 | Notes: Has notes'
WHERE name = 'Flornaments Planners Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Furze Bard + Associates LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Hollywood, FL, 33020 | Notes: Has notes'
WHERE name = 'Furze Bard + Associates LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: GK Design Center Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Coral Gables, FL, 33134 | Notes: Has notes'
WHERE name = 'GK Design Center Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Glottman
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33127 | Notes: Has notes'
WHERE name = 'Glottman' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Habitat Design Studio, Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33143 | Notes: No notes'
WHERE name = 'Habitat Design Studio, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Hardware 4 Ships
UPDATE leads 
SET notes = 'Rep: IO | Address: Dania, FL, 33004 | Notes: No notes'
WHERE name = 'Hardware 4 Ships' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Heralpin USA, Inc.
UPDATE leads 
SET notes = 'Customer Type: Commercial | Rep: CL | Terms: Due on receipt | Address: Doral, FL, 33166 | Notes: No notes'
WHERE name = 'Heralpin USA, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Hirsch Interiors
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Address: North Miami Beach, FL, 33160 | Notes: No notes'
WHERE name = 'Hirsch Interiors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Hollywood Design Group Corp.
UPDATE leads 
SET notes = 'Customer Type: Dealers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: Weston, FL, 33326 | Notes: Has notes'
WHERE name = 'Hollywood Design Group Corp.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Home Design Center Of Florida
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: SP | Terms: Due on receipt | Address: Ft. Lauderdale, FL, 33316 | Notes: Has notes'
WHERE name = 'Home Design Center Of Florida' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: I- Design
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33132 | Notes: Has notes'
WHERE name = 'I- Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: I. C. Designs By Aimee
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33178 | Notes: Has notes'
WHERE name = 'I. C. Designs By Aimee' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Icon Unlimited Corp
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: Has notes'
WHERE name = 'Icon Unlimited Corp' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Idea Mueble
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33172 | Notes: No notes'
WHERE name = 'Idea Mueble' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: IHS International Hospitality Supplier
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: West Palm Beach, FL, 33405 | Notes: Has notes'
WHERE name = 'IHS International Hospitality Supplier' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Infeel USA - Texas
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: San Antonio, TX, 78260 | Notes: No notes'
WHERE name = 'Infeel USA - Texas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Inside Corporation
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: LK | Terms: Due on receipt | Address: Dania Beach, FL, 33004 | Notes: No notes'
WHERE name = 'Inside Corporation' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Insight design
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Insight design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Interior Trade Cartel
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: San Antonio, TX, 78258 | Notes: No notes'
WHERE name = 'Interior Trade Cartel' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Interiors Studio M, LLC
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: RP | Terms: Due on receipt | Address: Weston, FL, 33326 | Notes: No notes'
WHERE name = 'Interiors Studio M, LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: International Closet Center, Inc.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: No notes | Customer: International Closet Center, Inc.*'
WHERE name = 'International Closet Center, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Inversiones MMT LLC
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: RP | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes'
WHERE name = 'Inversiones MMT LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: JP Printing
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: RP | Terms: Due on receipt | Address: Boca Raton, FL, 33433 | Notes: No notes | Customer: Jean Philippe Coirin'
WHERE name = 'JP Printing' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: JL Home Projects
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Boca Raton, FL, 33432 | Notes: Has notes'
WHERE name = 'JL Home Projects' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Johnsons Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL | Notes: No notes'
WHERE name = 'Johnsons Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Jon Richards Company
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Orlando, FL, 32824 | Notes: No notes'
WHERE name = 'Jon Richards Company' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Juan Carlos Carrion
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33132 | Notes: No notes'
WHERE name = 'Juan Carlos Carrion' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Juan Carlos Tovar
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: LK | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes'
WHERE name = 'Juan Carlos Tovar' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Judy Appel Designs
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Ft. Lauderdale, FL, 33301 | Notes: Has notes'
WHERE name = 'Judy Appel Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: K Studio Arquitecture + Interior Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Address: Miami, FL, 33126 | Notes: No notes'
WHERE name = 'K Studio Arquitecture + Interior Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Kis Interior Design Inc
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: No notes | Customer: Kis Interior Design'
WHERE name = 'Kis Interior Design Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Kitchen Solutions by Dynamic
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: IO | Terms: Due on receipt | Address: Hallandale, FL, 33009 | Notes: No notes'
WHERE name = 'Kitchen Solutions by Dynamic' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Kubli Studio
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33130 | Notes: Has notes'
WHERE name = 'Kubli Studio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Laird Plastics
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: IO | Terms: Net 30 | Address: Miami, FL, 33169 | Notes: No notes | Customer: Laird Plastics.'
WHERE name = 'Laird Plastics' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Latour Design & Development
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Latour Design & Development' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lauren Paris Interiors Inc
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Palm Beach Garden, FL, 33418 | Notes: No notes'
WHERE name = 'Lauren Paris Interiors Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lennar Corp. (700)
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33172 | Notes: Has notes | Customer: Lennar Corp.'
WHERE name = 'Lennar Corp. (700)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lineaire Designs
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Lineaire Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Loguer Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: Has notes'
WHERE name = 'Loguer Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lori Ferrell Interior Design
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: No notes'
WHERE name = 'Lori Ferrell Interior Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Luckey's Management
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Ft. Lauderdale, FL, 33312 | Notes: Has notes'
WHERE name = 'Luckey''s Management' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Luxe & Co. Interiors LLC.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Address: Coral Gables, FL, 33133 | Notes: No notes | Customer: Luxe & Co. Interiors LLC'
WHERE name = 'Luxe & Co. Interiors LLC.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Luxury Living Group
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Luxury Living Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: M Q V Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: AE | Terms: Due on receipt | Address: Miami Lakes, FL, 33018 | Notes: Has notes'
WHERE name = 'M Q V Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: M Sidia Design LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'M Sidia Design LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Macleod Constructors Inc.
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: IO | Terms: Due on receipt | Address: Miami, FL | Notes: No notes | Customer: Macleod Constructors Inc..'
WHERE name = 'Macleod Constructors Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Man With A Beard
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: IO | Terms: Due on receipt | Address: Cutler Bay, FL, 33157 | Notes: No notes | Customer: Man With A Beard.'
WHERE name = 'Man With A Beard' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Manzione Interiors LLC
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33178 | Notes: No notes'
WHERE name = 'Manzione Interiors LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Margaret Marquez Interiors
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Coral Gables, FL, 33143 | Notes: No notes'
WHERE name = 'Margaret Marquez Interiors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Marketing (Exhibition and Catalog)
UPDATE leads 
SET notes = 'Customer Type: .Marketing | Rep: M | Terms: Due on receipt | Address: Doral, FL, 33126 | Notes: No notes'
WHERE name = 'Marketing (Exhibition and Catalog)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Marketing (Repairs)
UPDATE leads 
SET notes = 'Customer Type: .Marketing | Rep: M | Terms: Due on receipt | Address: Doral, FL, 33126 | Notes: No notes'
WHERE name = 'Marketing (Repairs)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Maru's Corner
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: EM | Terms: Due on receipt | Address: Coral Gables, FL, 33134 | Notes: Has notes'
WHERE name = 'Maru''s Corner' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Mary Angulo
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: IO | Terms: Due on receipt | Address: Weston, FL, 33326 | Notes: No notes'
WHERE name = 'Mary Angulo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Mas Interior Design Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33132 | Notes: Has notes'
WHERE name = 'Mas Interior Design Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Max Strang Architecture
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33133 | Notes: Has notes'
WHERE name = 'Max Strang Architecture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Medusa Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Pompano Beach, FL, 33069 | Notes: Has notes'
WHERE name = 'Medusa Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Mega TV
UPDATE leads 
SET notes = 'Customer Type: Professional:Media & Advertising | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33181 | Notes: No notes'
WHERE name = 'Mega TV' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Melo Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes'
WHERE name = 'Melo Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Melon Corp.
UPDATE leads 
SET notes = 'Customer Type: Commercial:Events & Displays | Rep: IO | Terms: Due on receipt | Address: Hialeah, FL, 33010 | Notes: No notes'
WHERE name = 'Melon Corp.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Metro Door
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: EM | Terms: Due on receipt | Address: Miami, FL, 33180 | Notes: Has notes'
WHERE name = 'Metro Door' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Miami Dade College
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33176 | Notes: Has notes'
WHERE name = 'Miami Dade College' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Michael Wolk Design Associates
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Michael Wolk Design Associates' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Modern Home 2 Go
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes'
WHERE name = 'Modern Home 2 Go' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Modloft
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: IO | Address: North Miami, FL, 33181 | Notes: No notes'
WHERE name = 'Modloft' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Monroy & Co. PA
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33172 | Notes: Has notes'
WHERE name = 'Monroy & Co. PA' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: More Space Place (Aventura)
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: LK | Terms: Due on receipt | Address: Aventura, FL, 33160 | Notes: Has notes'
WHERE name = 'More Space Place (Aventura)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Nadia Llerena
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Notes: No notes'
WHERE name = 'Nadia Llerena' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: New Image Event Furniture
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: SP | Terms: Due on receipt | Address: Hialeah, FL, 33010 | Notes: No notes'
WHERE name = 'New Image Event Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Nexus Ideas
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33138 | Notes: No notes'
WHERE name = 'Nexus Ideas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Nick Luaces Design Associates
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Coconut Grove, FL, 33133 | Notes: Has notes | Customer: NLDA'
WHERE name = 'Nick Luaces Design Associates' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Northern Monkey Design Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Ft. Lauderdale, FL, 33312 | Notes: Has notes'
WHERE name = 'Northern Monkey Design Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Novelty Design Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: Has notes'
WHERE name = 'Novelty Design Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: NuSpace Network
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Bay Harbor Islands, FL, 33154 | Notes: No notes'
WHERE name = 'NuSpace Network' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: O-Gee Paint Co.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Paint & Designs | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33153 | Notes: Has notes'
WHERE name = 'O-Gee Paint Co.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Octametro LLC
UPDATE leads 
SET notes = 'Customer Type: Commercial:Signs | Rep: RP | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes'
WHERE name = 'Octametro LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: One Of  A  Kind
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes | Customer: One Of A Kind *'
WHERE name = 'One Of  A  Kind' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Opzioni Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Hollywood, FL, 33021 | Notes: Has notes | Customer: Opzioni Design Inc.'
WHERE name = 'Opzioni Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: P & P Architectural Advice LTD
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Miami, FL, 33180 | Notes: Has notes'
WHERE name = 'P & P Architectural Advice LTD' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Pepe Calderin Design, Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33138 | Notes: No notes'
WHERE name = 'Pepe Calderin Design, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: PG Studio Inc
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: Has notes'
WHERE name = 'PG Studio Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Plasticos Comerciales S.A.
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: IO | Terms: Due on receipt | Address: Santo Domingo, Dom. Rep. | Notes: No notes'
WHERE name = 'Plasticos Comerciales S.A.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Plus Vision Advertising
UPDATE leads 
SET notes = 'Customer Type: Commercial:Signs | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33172 | Notes: Has notes'
WHERE name = 'Plus Vision Advertising' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Proffetional Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Coral Gables, FL, 33134 | Notes: No notes'
WHERE name = 'Proffetional Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Property Markets Group
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Address: Miami, FL, 33131 | Notes: No notes'
WHERE name = 'Property Markets Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: R Design Studio Inc.
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: AE | Terms: Due on receipt | Address: Miami Beach, FL, 33140 | Notes: Has notes'
WHERE name = 'R Design Studio Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: R2 Construction Group, LLC.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33132 | Notes: Has notes | Customer: R2 Construction Group'
WHERE name = 'R2 Construction Group, LLC.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rana Furniture
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33172 | Notes: No notes'
WHERE name = 'Rana Furniture' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: RBS Woodwork Corp
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Hialeah, FL, 33018 | Notes: No notes'
WHERE name = 'RBS Woodwork Corp' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Red Gallerie LLC
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: EM | Terms: Due on receipt | Address: Miami, FL, 33127 | Notes: Has notes'
WHERE name = 'Red Gallerie LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Red South Beach Hotel
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: SP | Terms: Due on receipt | Address: Miami Beach, FL, 33140 | Notes: No notes'
WHERE name = 'Red South Beach Hotel' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rene Cardona Arango
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Coconut Creek, FL, 33073 | Notes: Has notes'
WHERE name = 'Rene Cardona Arango' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rod Wraps
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Address: Medley, FL | Notes: No notes'
WHERE name = 'Rod Wraps' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rodriguez and Quiroga Architects Chartere
UPDATE leads 
SET notes = 'Customer Type: Architect | Rep: AE | Terms: Due on receipt | Address: Coral Gables, FL, 33134 | Notes: Has notes'
WHERE name = 'Rodriguez and Quiroga Architects Chartere' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Roma Design Group
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: Has notes'
WHERE name = 'Roma Design Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Roos International LTD. Inc. USA
UPDATE leads 
SET notes = 'Customer Type: Dealers:Fabrics & Wallcovering | Rep: RP | Terms: Due on receipt | Address: Deerfield Beach, FL, 33442 | Notes: Has notes'
WHERE name = 'Roos International LTD. Inc. USA' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rothman Associates
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'Rothman Associates' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Roma Investment Group , LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Address: Dania Beach, FL, 33004 | Notes: Has notes | Customer: Sanctuarium Design'
WHERE name = 'Roma Investment Group , LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sandra Diaz Interior Design
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33183 | Notes: No notes'
WHERE name = 'Sandra Diaz Interior Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sanzogo  Corporation
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: SP | Terms: Due on receipt | Address: Sunny Isles, FL, 33160 | Notes: Has notes | Customer: Sanzogo Corporation'
WHERE name = 'Sanzogo  Corporation' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Saruski Design Studio
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Miami, FL, 33127 | Notes: Has notes'
WHERE name = 'Saruski Design Studio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Service Painting Of Florida
UPDATE leads 
SET notes = 'Rep: RP | Terms: Due on receipt | Address: Ft. Myers, FL, 33966 | Notes: No notes'
WHERE name = 'Service Painting Of Florida' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: USA Bienes Raices
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33132 | Notes: No notes | Customer: Sharon Hawkins'
WHERE name = 'USA Bienes Raices' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sharron Lewis Design Central
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33132 | Notes: No notes | Customer: Sharron Lewis Design Central *'
WHERE name = 'Sharron Lewis Design Central' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sims Corporation
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Coral Gables, FL, 33149-3174 | Notes: No notes'
WHERE name = 'Sims Corporation' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sire Design LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Aventura, FL, 33180 | Notes: No notes'
WHERE name = 'Sire Design LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: SO-FLO Construction
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33145 | Notes: Has notes'
WHERE name = 'SO-FLO Construction' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: 420  Harbor Drive LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Key Biscayne, FL, 33149 | Notes: No notes | Customer: Sonia Daccach'
WHERE name = '420  Harbor Drive LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Southern Design and Export
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Ft. Lauderdale, FL, 33304 | Notes: Has notes'
WHERE name = 'Southern Design and Export' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Spacio Design Build
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33130 | Notes: Has notes'
WHERE name = 'Spacio Design Build' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Spazio Di Casa
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33127 | Notes: Has notes'
WHERE name = 'Spazio Di Casa' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Spazio Suyai
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33179 | Notes: No notes'
WHERE name = 'Spazio Suyai' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Studio Solutions Arq Corp
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33133 | Notes: No notes'
WHERE name = 'Studio Solutions Arq Corp' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Style Furniture Decor
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: EM | Address: North Miami Beach, FL, 33462 | Notes: No notes'
WHERE name = 'Style Furniture Decor' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sunny South Paint & Decor
UPDATE leads 
SET notes = 'Customer Type: Professional:Paint & Designs | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33145 | Notes: Has notes'
WHERE name = 'Sunny South Paint & Decor' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Suzanne Lawson Design
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes'
WHERE name = 'Suzanne Lawson Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Swire Properties Inc
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: Has notes'
WHERE name = 'Swire Properties Inc' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: T & G Constructors
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Doral, FL, 33166 | Notes: Has notes'
WHERE name = 'T & G Constructors' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tacon Graphics Ca
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: IO | Terms: Due on receipt | Address: Edo. Zulia,Rep. Bolivariana, DE | Notes: Has notes'
WHERE name = 'Tacon Graphics Ca' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tatiana Alessandrini Designs
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: RP | Terms: Due on receipt | Address: Miami Beach, FL, 33139 | Notes: Has notes'
WHERE name = 'Tatiana Alessandrini Designs' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Telemundo  Studios
UPDATE leads 
SET notes = 'Customer Type: Commercial:Media & Advertising | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: Has notes'
WHERE name = 'Telemundo  Studios' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Teresita Mattos
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Pembroke Pines, FL, 33028 | Notes: Has notes'
WHERE name = 'Teresita Mattos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Terra Realty LLC
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes'
WHERE name = 'Terra Realty LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Macknight Smokehouse Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33179 | Notes: No notes'
WHERE name = 'The Macknight Smokehouse Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Related Group
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Address: Miami, FL, 33131 | Notes: No notes'
WHERE name = 'The Related Group' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The UPS Store  #6290
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: North Miami Beach, FL, 33181 | Notes: No notes'
WHERE name = 'The UPS Store  #6290' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Walfab Company
UPDATE leads 
SET notes = 'Rep: RP | Terms: Due on receipt | Address: N. Miami, FL, 33162 | Notes: No notes'
WHERE name = 'The Walfab Company' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Wallpaper Company
UPDATE leads 
SET notes = 'Customer Type: Dealers:Fabrics & Wallcovering | Rep: SP | Terms: Due on receipt | Address: Miami, FL, 33131 | Notes: No notes'
WHERE name = 'The Wallpaper Company' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Thyssen Krupp Elevator Americas
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33166 | Notes: No notes'
WHERE name = 'Thyssen Krupp Elevator Americas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tomka LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33178 | Notes: No notes'
WHERE name = 'Tomka LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Trump International
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: SP | Terms: Due on receipt | Address: Sunny Isles, FL, 33160 | Notes: Has notes'
WHERE name = 'Trump International' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tubelite Co. Inc.
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: RP | Terms: 2% 10 Net 30 | Address: Wood-Ridge, NJ, 07075 | Notes: Has notes'
WHERE name = 'Tubelite Co. Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Turner Broadcasting System
UPDATE leads 
SET notes = 'Customer Type: Commercial:Media & Advertising | Rep: IO | Terms: Due on receipt | Address: Atlanta, GA, 30303 | Notes: No notes'
WHERE name = 'Turner Broadcasting System' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: U Design Shades LLC
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: Miami, FL, 33160 | Notes: Has notes'
WHERE name = 'U Design Shades LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Unlimited Wraps, Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33165-2869 | Notes: No notes | Customer: Unlimited Wraps'
WHERE name = 'Unlimited Wraps, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Up Date Design
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Hollywood, FL, 33021 | Notes: No notes'
WHERE name = 'Up Date Design' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: USA Signs Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: Doral, FL, 33172 | Notes: No notes'
WHERE name = 'USA Signs Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Valor Investments Inc.
UPDATE leads 
SET notes = 'Rep: IO | Address: Doral, FL, 33172 | Notes: No notes | Customer: Valor Investments Inc'
WHERE name = 'Valor Investments Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Via Design Studio
UPDATE leads 
SET notes = 'Customer Type: Professional | Rep: SP | Terms: Due on receipt | Address: Miami Springs, FL, 33166 | Notes: Has notes'
WHERE name = 'Via Design Studio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: VT Design Studios
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33129 | Notes: Has notes'
WHERE name = 'VT Design Studios' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Wall Boutique
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: RP | Terms: Due on receipt | Address: Miami, FL, 33129 | Notes: Has notes'
WHERE name = 'Wall Boutique' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: White Dezign
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: Has notes'
WHERE name = 'White Dezign' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Zarrella Construction, Inc.
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Davie, FL, 33314 | Notes: Has notes'
WHERE name = 'Zarrella Construction, Inc.' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Zyance Furniture LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Miami, FL, 33137 | Notes: No notes | Customer: Zyance Furniture LLC.'
WHERE name = 'Zyance Furniture LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';


-- Show count after update
SELECT 'AFTER UPDATE:' as info;
SELECT COUNT(*) as total_commercial_leads
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';

-- Show sample of updated records
SELECT 'SAMPLE UPDATED RECORDS:' as info;
SELECT id, name, LEFT(notes, 100) as notes_preview
FROM leads 
WHERE lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
  AND notes IS NOT NULL
  AND notes != ''
ORDER BY name
LIMIT 10;

-- Check for records that weren't updated (empty notes)
SELECT 'RECORDS NOT UPDATED (empty notes):' as info;
SELECT COUNT(*) as not_updated_count
FROM leads 
WHERE lead_origin = 'Commercial' 
  AND project_type = 'Commercial'
  AND (notes IS NULL OR notes = '');
