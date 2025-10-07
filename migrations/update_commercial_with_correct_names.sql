-- Update ALL commercial leads with CORRECT name format (Company - Contact)
-- This matches the actual format in your database

USE wrapqrqc_wmkreact;

-- Show count before update
SELECT 'BEFORE UPDATE:' as info;
SELECT COUNT(*) as total_commercial_leads
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';

-- Update: 2020 Global Group LLC - Lina Molano
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Lina Molano, Miami, FL, 33137'
WHERE name = '2020 Global Group LLC - Lina Molano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: A A Design & Home LLC - Andres Arango
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Andres Arango, Miami, FL, 33137 | Notes: 7/31/2015 LIBROS NUEVOS   Nuevo Invoice'
WHERE name = 'A A Design & Home LLC - Andres Arango' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: ABA House Art & Design Center - Lourdes Garcia
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 11439 NW 34 st  Suite 11439, Miami, FL, 33178 | Notes: 07/31/2015  PENDIENTE POR CONTACTO  Esta de viaje . Volver a llamar | Customer: ABA House Art &  Design Center'
WHERE name = 'ABA House Art & Design Center - Lourdes Garcia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: ABC Interior Solutions, Inc. - Jorge Perez
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: IO | Terms: Due on receipt | Address: 11450 SW 57 Terr., Miami, FL, 33173'
WHERE name = 'ABC Interior Solutions, Inc. - Jorge Perez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Academy of Design At City Furniture - Lisa Aportela
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: EM | Terms: Due on receipt | Address: Lisa Aportela, Tamarac, FL, 33321 | Notes: Lisa needs a catalog. Will confirm presentation to the other designers in the department for the month of June.'
WHERE name = 'Academy of Design At City Furniture - Lisa Aportela' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Acosta Interior Design - Susy Acosta
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Susy Acosta, Miami, FL'
WHERE name = 'Acosta Interior Design - Susy Acosta' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Addison House - Alberto
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: AE | Terms: Due on receipt | Address: 2850  NE 187 Street, Aventura, FL, 33180 | Notes: 7/31/2015  PENDIENTE CONTACTO'
WHERE name = 'Addison House - Alberto' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Adriana Hoyos - Eduardo Perez
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: MC | Terms: Due on receipt | Address: Eduardo Perez, Miami, FL, 33137 | Notes: 7/31/2015   PENDIENTE CONTACTO'
WHERE name = 'Adriana Hoyos - Eduardo Perez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Advanced Film Solutions - Adam Feldman
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: IO | Terms: Due on receipt | Address: Adam Feldman, Lutz, FL, 33549'
WHERE name = 'Advanced Film Solutions - Adam Feldman' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: AGE Marketing Services - Alex Espriella
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Alex Espriella, Miami Beach, FL, 33140'
WHERE name = 'AGE Marketing Services - Alex Espriella' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Aidia Design Corp. - George Kaahkedjian
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: George Kaahkedjian, Miami, FL, 33166'
WHERE name = 'Aidia Design Corp. - George Kaahkedjian' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Alejandro Espriella - Alejandro Espreilla
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: 2642 Collins Ave, Miami Beach, FL, 33140'
WHERE name = 'Alejandro Espriella - Alejandro Espreilla' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Alicia Interior Decoration Inc. - Alicia Gonzalez
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Alicia Gonzalez, Medley, FL, 33178'
WHERE name = 'Alicia Interior Decoration Inc. - Alicia Gonzalez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Allula Design Group LLC - Lucila Anderson
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Lucila Anderson, Miami, FL, 33127 | Notes: 8/31/2015 4:01:52 PM:  LIBROS NUEVOS                                Amigo de Victor'
WHERE name = 'Allula Design Group LLC - Lucila Anderson' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Alluring Design LLC - Fausto Mendez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Fausto Mendez, Hialeah, FL, 33016 | Notes: Professional I Discount'
WHERE name = 'Alluring Design LLC - Fausto Mendez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: AM Profile - Pablo Smulevich
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: AE | Terms: Due on receipt | Address: Pablo Smulevich, Miami, FL, 33137 | Notes: 7/31/2015  Se envio por mail catalago marron'
WHERE name = 'AM Profile - Pablo Smulevich' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: American Masters Inc. - Luis Campos
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Luis Campos, Davie, FL, 33325 | Notes: 8/27/2015 4:09:07 PM:    Este cliente si viene se le atiende. No visitar .Perdida de tiempo'
WHERE name = 'American Masters Inc. - Luis Campos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Laduree, Corp - Anadir Espinosa
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Anadir Espinoza, Miami, FL, 33131 | Notes: Clientes Potenciales ya visitados  Boga Style Home  Oscar Glottman                                LIBROS NUEVOS  Arafat Estopinian                               Antonini Furniture                               Animas Domus                              ... | Customer: Anadir Espinosa'
WHERE name = 'Laduree, Corp - Anadir Espinosa' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Heimwerker LLC - Andres De lamo
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Andres De Lamo, Doral, FL, 33178 | Customer: Andres De Lamo'
WHERE name = 'Heimwerker LLC - Andres De lamo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: APA Closet Doors - Alejandro Escuela
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: LK | Terms: Due on receipt | Address: Alejandro Escuela, Miami, FL, 33166 | Notes: Hable con Jenny . Dice que las ventas estan paradas como consecuencia del verano.  Le ofreci Muestras Nuevas para Agosto.'
WHERE name = 'APA Closet Doors - Alejandro Escuela' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Archinet 305 Inc - Juan Miguel Escalona
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Juan Miguel Escalona, Doral, FL, 33178'
WHERE name = 'Archinet 305 Inc - Juan Miguel Escalona' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Areas by Design - Jaime Arias
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Jaime Areas & Alirio Mendez, Miami, FL, 33142'
WHERE name = 'Areas by Design - Jaime Arias' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Arkintex Design - Ines
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 2638 NW 97 Ave, Miami, FL, 33172 | Notes: 8/11/2015  LIBROS NUEVOS  Esperando nuevo proyecto'
WHERE name = 'Arkintex Design - Ines' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Arkipro - Isabel Arzola
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: SP | Terms: Due on receipt | Address: Isabel C Arzola, Coral Gables, FL, 33134'
WHERE name = 'Arkipro - Isabel Arzola' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Armando Vera P.A. - Jesus Armando Vera
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: RP | Terms: Due on receipt | Address: Jesus Armando Vera, Miami, FL, 33166 | Notes: Hable con Armando , actualize sus datos. Viene el 08-09-2016'
WHERE name = 'Armando Vera P.A. - Jesus Armando Vera' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: ARPI Group - Claudio Resnick
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: Claudio Resnick, Miami, FL, 33018'
WHERE name = 'ARPI Group - Claudio Resnick' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Artefacto - Aventura - Martin
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: CL | Terms: Due on receipt | Address: 17651 Biscayne Blvd, Aventura, FL, 33160 | Notes: 1. Andrea Milanez  - (Interior Design Consultant)  andrea@artefacto.com (305)931-9484    2. Ariana Fordi  - (Interior Design Consultant)  ariana@artefacto.com (305)931-9484    3. Fernando Machado  - (Interior Design Consultant)  fernando@artefacto.com ...'
WHERE name = 'Artefacto - Aventura - Martin' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Artefacto - Doral
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: CL | Terms: Due on receipt | Address: 3290 NW 79th AVE, Doral, FL, 33122'
WHERE name = 'Artefacto - Doral' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Artefacto - Merrick Park
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: CL | Terms: Due on receipt | Address: 4440 Ponce De Leon Blvd., Coral Gables, FL, 33146 | Notes: Spoke to Renata Gouto, she said she received wire transfer info, sent it to her customer, customer is currently in Panama. As soon as she know when he does wire she will notifiy us.  12/13/2012 12:05:19 PM:'
WHERE name = 'Artefacto - Merrick Park' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Attenas Decor LLC. - Anselmo Hernandez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Anselmo Hernandez, Coral Gables, FL, 33134 | Notes: Anselmo gets a 25% discount on the material But account is set up as retail to determine discount at time of each purchase.  2/20/2013'
WHERE name = 'Attenas Decor LLC. - Anselmo Hernandez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Auster & Stern Interiors - Tania Stern
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Tania  Stern, Boca Raton, FL, 33431 | Notes: 7/31/2015    Hable con Tania.     Que Elda la llame para una cita .  8/3/2015   Ya Elda llamo para la cita'
WHERE name = 'Auster & Stern Interiors - Tania Stern' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Avant Design Group - Cristina
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: 2125 Biscayne Boulevard. PH #540, Miami, FL, 33137'
WHERE name = 'Avant Design Group - Cristina' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Avanti Contemporary Furniture - Antonio Lemus
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: IO | Address: Antonio Lemus, Weston, FL, 33326 | Notes: 7/31/2015   LIBROS NUEVOS'
WHERE name = 'Avanti Contemporary Furniture - Antonio Lemus' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Aventura Home Decor - Andrea Cohen
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: 17100 W. Dixie Hwy. Suite #100, North Miami Beach, FL, 33160'
WHERE name = 'Aventura Home Decor - Andrea Cohen' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: B Designs - Liliana Barmaimon
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: SP | Terms: Due on receipt | Address: Liliana Barmaimon, Aventura, FL, 33160'
WHERE name = 'B Designs - Liliana Barmaimon' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: B. Pila Design Studio - Beatrice Gonzalez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Beatrice Gonzalez, Miami, FL, 33133 | Notes: 9/9/2015   Hablamos con Florinda . su cliente aprobo el sample.     Esta en la espera del dinero.'
WHERE name = 'B. Pila Design Studio - Beatrice Gonzalez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Barbara Brickell Designs - Barbara Brickell
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Barbara A. Brickell, Lighthouse Point, FL, 33064'
WHERE name = 'Barbara Brickell Designs - Barbara Brickell' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Bayshore Construction Group, LLC - Christopher MacNair
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Christopher MacNair, Sunrise, FL, 33325 | Notes: 7/31/2015  PENDIENTE POR CONTACTO'
WHERE name = 'Bayshore Construction Group, LLC - Christopher MacNair' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Bellagio Designs - Margarita Ronderos
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Margarita Ronderos, North Miami, FL, 33162 | Notes: Silvia Parra Cell 954-451-6170'
WHERE name = 'Bellagio Designs - Margarita Ronderos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Binca Imaging Group - Gilberto Huertas
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: 10680 NW 37th Terrace, Miami, FL, 33178'
WHERE name = 'Binca Imaging Group - Gilberto Huertas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Blinds Ideas and Shades - Andreina Luciani
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Andreina Luciani, Doral, FL, 33166 | Notes: 25 % On Infeel Products .  20 % on specialty product'
WHERE name = 'Blinds Ideas and Shades - Andreina Luciani' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Blue Concepts Inc - Soraya Vaca
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: 524 Palmetto Dr, Miami, FL, 33166'
WHERE name = 'Blue Concepts Inc - Soraya Vaca' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Blue Monkey Construction Group LLC - Eddie Batres
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: RP | Terms: Due on receipt | Address: 80 SW 8 St. Suite #2000, Miami, FL, 33130'
WHERE name = 'Blue Monkey Construction Group LLC - Eddie Batres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Boca Bargoons - Edward Wollstein
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: EM | Terms: Due on receipt | Address: Edward Wollstein, Hallandale Beach, FL, 33009 | Notes: 7/31/2015    LIBROS NUEVOS'
WHERE name = 'Boca Bargoons - Edward Wollstein' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: BRG Homes - Martina Casella
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: 605 Lincoln Road, Miami Beach, FL, 33139 | Notes: 7/31/2015  PENDIENTE CONTACTO'
WHERE name = 'BRG Homes - Martina Casella' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Brick O. Real Estate - Julio Torres
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: 2645 NE 207th Street, Aventura, FL, 33180'
WHERE name = 'Brick O. Real Estate - Julio Torres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Britto Design Studio Inc. - Ricardo Britto
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Ricardo Britto, Miami, FL, 33131 | Notes: 7/31/2015  PENDIENTE CONTACTO'
WHERE name = 'Britto Design Studio Inc. - Ricardo Britto' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Caio Importadora LTDA - Bosco
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Signs | Rep: IO | Terms: Due on receipt | Address: Praca Auxiliadora No. 4, Manaus AM'
WHERE name = 'Caio Importadora LTDA - Bosco' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Caligaris - Boga Style Home - Liliana Silva
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: LK | Terms: Due on receipt | Address: Liliana Silva, Miami, FL | Notes: 9-03-2015  LIBROS NUEVOS | Customer: Caligaris'
WHERE name = 'Caligaris - Boga Style Home - Liliana Silva' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Capital Contractor Services - Jodi Sandler
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: 3100 Country Club Lane, Hallandale, FL, 33009'
WHERE name = 'Capital Contractor Services - Jodi Sandler' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Carolina Dorrego Designs - Carolina Dorrego
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Carolina Dorrego, Miami, FL, 33130'
WHERE name = 'Carolina Dorrego Designs - Carolina Dorrego' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Casa & Resort - Alex Gonzalez
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: IO | Terms: Due on receipt | Address: Alex Gonzalez, Miami, FL, 33145 | Notes: 08-05-2015  Quede en llamar a Maria para una cita con el vendedor'
WHERE name = 'Casa & Resort - Alex Gonzalez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Casa Q Inc. - Mercedes Aquino
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: 12501 SW 134 Court, Miami, FL, 33186 | Notes: Referred by Martin from Artefacto.  15% Duiscount'
WHERE name = 'Casa Q Inc. - Mercedes Aquino' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cervera Real Estate - Sildy Cervera
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: SP | Terms: Due on receipt | Address: Attn: Sildy Cervera, Miami Beach, FL, 33139'
WHERE name = 'Cervera Real Estate - Sildy Cervera' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: CF International - Carmen Feijoo
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Carmen Feijoo, Hialeah, FL, 33010 | Notes: 8/12/2015   Se envia samples de madera para    proyecto    Nuevo estimado'
WHERE name = 'CF International - Carmen Feijoo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: CH Construction Group - Mauricio Chavez
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Mauricio Chavez, Miami, FL, 33131'
WHERE name = 'CH Construction Group - Mauricio Chavez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Charmed Design - Marlene Gonzalez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Marlene Gonzalez, Pinecrest, FL, 33156 | Notes: 8/3/2015 Contactada via email'
WHERE name = 'Charmed Design - Marlene Gonzalez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Chase Comunicaion Visual - Segio Chase
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Signs | Rep: IO | Terms: Due on receipt | Address: Sergio M Chase, Asuncion | Customer: Chase Comunicacion Visual'
WHERE name = 'Chase Comunicaion Visual - Segio Chase' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cisneros Studios LLC - Indira Cazorla
UPDATE leads 
SET notes = 'Customer Type: Commercial:Media & Advertising | Rep: SP | Terms: Due on receipt | Address: 7575 NW 74 St., Medley, FL, 33166 | Notes: Carmen Accounting 305.507.3729'
WHERE name = 'Cisneros Studios LLC - Indira Cazorla' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cohen Design - Pilar Cohen
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Pilar Cohen, Miami Beach, FL, 33139'
WHERE name = 'Cohen Design - Pilar Cohen' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Constantin Gorges - Constantin Gorges
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: 100 S. Pointe Drive, Miami Beach, FL, 33139'
WHERE name = 'Constantin Gorges - Constantin Gorges' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Continental Electric - Michael Forrest
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: CL | Terms: Due on receipt | Address: Michael Forrest, Miami, FL, 33166'
WHERE name = 'Continental Electric - Michael Forrest' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Costa Window Treatments - Cesar Costa
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: Cesar Costa, Miami, FL, 33137 | Notes: Estimates to be prepared ful price as per Thereza 6/27/12. Initial discount of 30% was determined in a meeting per Ray.    Theresa 305-878-0708 cell'
WHERE name = 'Costa Window Treatments - Cesar Costa' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Custom Finish Walls - Sofia Manavello
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: IO | Terms: Due on receipt | Address: Sofia Manavello, Miami, FL, 33186'
WHERE name = 'Custom Finish Walls - Sofia Manavello' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Cynthia Rocklin - Cynthia Rocklin
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: 9601 W Broadview Dr., Bay Harbor Islands, FL, 33154 | Notes: 8/14/2015 Nuevos memo sample'
WHERE name = 'Cynthia Rocklin - Cynthia Rocklin' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Dali Furniture Designers - Daniel Lopez
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: IO | Terms: Due on receipt | Address: Daniel Lopez, Hialeah, FL, 33018 | Notes: Left message in voicemail to call us back.,'
WHERE name = 'Dali Furniture Designers - Daniel Lopez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: DAX - Vanina Blas
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: LK | Address: Vanina Blas, Medley, FL, 33166'
WHERE name = 'DAX - Vanina Blas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Dayoris Doors - Dan
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: 16600 NW 54 Ave. Suite #4, Miami Gardens, FL, 33014'
WHERE name = 'Dayoris Doors - Dan' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Debora Aguiar Arquitetos - Debora Aguiar
UPDATE leads 
SET notes = 'Customer Type: Architect | Rep: CL | Terms: Due on receipt | Address: Debora Aguiar, Sao Paulo, SP Brasil'
WHERE name = 'Debora Aguiar Arquitetos - Debora Aguiar' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Deco Dan General Painting - Dan Valeriano
UPDATE leads 
SET notes = 'Customer Type: Professional:Paint & Designs | Rep: IO | Terms: Due on receipt | Address: Dan Valeriano, Miami, FL, 33125'
WHERE name = 'Deco Dan General Painting - Dan Valeriano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Deco Sol Inc - Ali Dominguez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Ali Dominguez, Miami, FL, 33122 | Notes: Called office and cell phone left a message  12/16/2013 11:40:21 AM:'
WHERE name = 'Deco Sol Inc - Ali Dominguez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Decor 4ever LLC. - Lisa Aportela
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Lisa Aportela, Sunny Isles, FL, 33160'
WHERE name = 'Decor 4ever LLC. - Lisa Aportela' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Decor Blinds + Shades, Inc. - Patricia Maldonado-Cooper
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Patricia Maldonado-Cooper, Miami, FL, 33122'
WHERE name = 'Decor Blinds + Shades, Inc. - Patricia Maldonado-Cooper' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Deep Design Solutions - Marisol Pinto
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: 1866 Tigertail Ave., Miami, FL, 33133 | Notes: Spoke to Carlos will call marisol to confirm order  12/16/2013 11:42:22 AM:'
WHERE name = 'Deep Design Solutions - Marisol Pinto' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Design Draperies, LLC - Roberta Luciani
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: Roberta Luciani, Doral, FL, 33178 | Notes: 8/31/2015 5:10:33 PM:  PENDIENTE CONTACTO'
WHERE name = 'Design Draperies, LLC - Roberta Luciani' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Design Solutions - Marcia Chade
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Address: Marcia Chade, Miami, FL, 33129'
WHERE name = 'Design Solutions - Marcia Chade' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Design Studio By Natalia - Natalia Neverko
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Natalia Neverko, Miami, FL, 33137 | Notes: 7/31/2015  Contactada por email'
WHERE name = 'Design Studio By Natalia - Natalia Neverko' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Designer Discount Fabrics & Furniture - Jackie Liriano
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: EM | Terms: Due on receipt | Address: Jackie Liriano, Dania Beach, FL, 33004 | Notes: 7/31/2015     Pendiente Visita'
WHERE name = 'Designer Discount Fabrics & Furniture - Jackie Liriano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Digiprint Productions - Guillermo Torres
UPDATE leads 
SET notes = 'Customer Type: Commercial:Signs | Rep: IO | Terms: Due on receipt | Address: 1460 NW 107th Ave. Unit R, Miami, FL, 33172 | Customer: Digiprint Productions .'
WHERE name = 'Digiprint Productions - Guillermo Torres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Dion Atelier - Dion Atelier
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: 2 NE 40th Street 3rd Floor, Miami, FL, 33137'
WHERE name = 'Dion Atelier - Dion Atelier' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Ditex Corp. - Alberto Valdez
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: RP | Terms: Due on receipt | Address: Calle #1 Edf. La Marketing Suite #104, Puerto Nuevo, PR, 00922'
WHERE name = 'Ditex Corp. - Alberto Valdez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: DKOR Interiors - Silvia Parra
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Silvia Parra, North Miami, FL, 33162 | Notes: 7/31/2015    LIBROS NUEVOS    7/31/2015   Se le envio informacion murales y documentos fotos'
WHERE name = 'DKOR Interiors - Silvia Parra' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Doors 4 U - Rafael Carballo
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Rafael Carballo, Medley, FL, 33166-2212 | Notes: 9/23/2015 Hable con Hendry  . Dice que solo necesita   Infeel cuando un cliente lo requiere.    Su fuerte es puertas de vidrio con aluminio'
WHERE name = 'Doors 4 U - Rafael Carballo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Duwerks, Inc. - Christopher Dudot
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Christopher Dudot, Hialeah, FL, 33018'
WHERE name = 'Duwerks, Inc. - Christopher Dudot' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: E & P Solution Services Inc. - Ursula Sotomayor
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Signs | Rep: RP | Terms: Due on receipt | Address: Ursula Sotomayor, Miami, FL, 33166 | Notes: Invoice 06-23-2016'
WHERE name = 'E & P Solution Services Inc. - Ursula Sotomayor' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: E Render - Lissette Pagan
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: Lissette Pagan, North Miami, FL, 33181'
WHERE name = 'E Render - Lissette Pagan' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Eclectic Elements - Monica Suleski
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Monica Suleski, Miami, FL, 33145 | Notes: 7/31/2015 Contactado por email  8/13/2015  LIBROS NUEVOS'
WHERE name = 'Eclectic Elements - Monica Suleski' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Economy Sign Supply (Referrals) - Jose Garcia
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: RP | Terms: Due on receipt | Address: Miami, FL'
WHERE name = 'Economy Sign Supply (Referrals) - Jose Garcia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: El Dorado Furniture - Rodolfo(Rudy) Remigio
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: SP | Terms: Due on receipt | Address: 4200  NW 167th St., Miami, FL, 33054 | Notes: Prices are quoted retail but 25% commission to referral party (normally divided by 3). Discount given to store will be detrmined by referral party.'
WHERE name = 'El Dorado Furniture - Rodolfo(Rudy) Remigio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Eolo A & I Design, Inc - Sandra Diaz-Velasco
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Sandra Diaz-Velasco, Miami, FL, 33129 | Notes: Contacte a Diego. Dice que nos tomara en cuenta en nuevos proyectos.'
WHERE name = 'Eolo A & I Design, Inc - Sandra Diaz-Velasco' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: EPG Corp. - Gladys Pirela
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Gladys E Pirela, Miami, FL, 33172 | Notes: 7/31/2015    PENDIENTE POR CONTACTO'
WHERE name = 'EPG Corp. - Gladys Pirela' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Equilibrium Interior Design - Norma Roig
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Norma Roig, Ft. Lauderdale, FL, 33305 | Notes: 7/31/2015      Elda debe pedir cita despues de Agosto 30 | Customer: Equilibrium Interior Design Inc'
WHERE name = 'Equilibrium Interior Design - Norma Roig' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Evolution Tech - Solani & Brenno Carvalho
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: Solani & Brenno Carvalho, Miramar, FL, 33027 | Notes: 9/1/2015   Hable con el Sr  Brenno. Me envio su informacion por texto'
WHERE name = 'Evolution Tech - Solani & Brenno Carvalho' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Expoships, LLLP - David Lester
UPDATE leads 
SET notes = 'Customer Type: Professional:Boats & Yachts | Rep: RP | Terms: Due on receipt | Address: Attn: Mr. David Lester, Miami, FL, 33131'
WHERE name = 'Expoships, LLLP - David Lester' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Extreme Surfaces Design Center - lee Cahlon
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Lee Cahlon, Aventura, FL, 33180 | Notes: 8/28/2015   Hable con Lee y se acordo de Infeel.  Necesita que se le haga un update de nuestro material  9/01/2015  Contacto para cita'
WHERE name = 'Extreme Surfaces Design Center - lee Cahlon' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fabric Gallery Decorative Fabrics - Armando Batule
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: Armando Batule, Miami, FL, 33155'
WHERE name = 'Fabric Gallery Decorative Fabrics - Armando Batule' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fabulous Wallcoverings - Josh Shapiro
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: EM | Terms: Due on receipt | Address: Josh Shapiro, Hallandale Beach, FL, 33009 | Notes: 8/28/2015   que lo llamen la semana proxima para visitarlo  le dije que teniamos nueva colleccion'
WHERE name = 'Fabulous Wallcoverings - Josh Shapiro' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fede Design , LLC. - Federico Teran
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Federico Teran, Miami, FL, 33138 | Notes: Se le dejo samples | Customer: Fede Design, LLC.'
WHERE name = 'Fede Design , LLC. - Federico Teran' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Finish My Condo - Carina
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: 17070 Collins Ave. #266B, Sunny Isles, FL, 33160 | Notes: Visited by Sylvia 09/21/2012. Agreed on 20% discount.  It is yet to be determine how to present estimates.  Full price? Discounted?'
WHERE name = 'Finish My Condo - Carina' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fister Design, Inc. - Irene Fister
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Irene Fister, Miami Beach, FL, 33139 | Notes: 7/314/2015 Contactada por email'
WHERE name = 'Fister Design, Inc. - Irene Fister' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Flat Print Cut - Darien Page
UPDATE leads 
SET notes = 'Customer Type: Professional:Media & Advertising | Rep: SP | Terms: Due on receipt | Address: Darien Page, Phoenix, AZ, 85017'
WHERE name = 'Flat Print Cut - Darien Page' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Fleurish Design & Events
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: IO | Terms: Due on receipt | Address: 8850 NW 13th terr. Unit #105, Miami, FL, 33172'
WHERE name = 'Fleurish Design & Events' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Floridian Furniture - Celia Pinto
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Celia Pinto, Miami, FL, 33134'
WHERE name = 'Floridian Furniture - Celia Pinto' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Flornaments Planners Inc. - Pierina Stomstein
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: EM | Terms: Due on receipt | Address: Pierina Stomstein, North Miami Beach, FL, 33179 | Notes: 8/28/2015   Le actualize los datos por telefono.  Le estoy enviando 2 memo samples LW 449-LW 450  por correo'
WHERE name = 'Flornaments Planners Inc. - Pierina Stomstein' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Furze Bard + Associates LLC
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: 2750 North 29th Avenue Suite 315, Hollywood, FL, 33020 | Notes: 7/31/2015     PENDIENTE POR CONTACTO'
WHERE name = 'Furze Bard + Associates LLC' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: GK Design Center Inc. - Karen Bolea
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: 2317-19 Le Jeune Rd., Coral Gables, FL, 33134 | Notes: Lle enviamos unos samples en Junio directamente a su cliente en Boca Raton. Esperando repuesta.'
WHERE name = 'GK Design Center Inc. - Karen Bolea' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Glottman - Lissandra Perez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Wynwood District, Miami, FL, 33127 | Notes: Per Ray all order to be at 15% Professional I'
WHERE name = 'Glottman - Lissandra Perez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Habitat Design Studio, Inc. - Raquel Garcia
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: 5920 SW 83rd St., Miami, FL, 33143'
WHERE name = 'Habitat Design Studio, Inc. - Raquel Garcia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Hardware 4 Ships - Don Schallick
UPDATE leads 
SET notes = 'Rep: IO | Address: Don Schallick, Dania, FL, 33004'
WHERE name = 'Hardware 4 Ships - Don Schallick' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Heralpin USA, Inc. - Rafael Betancourt
UPDATE leads 
SET notes = 'Customer Type: Commercial | Rep: CL | Terms: Due on receipt | Address: Rafael Betancourt, Doral, FL, 33166'
WHERE name = 'Heralpin USA, Inc. - Rafael Betancourt' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Hirsch Interiors - Ana Maria Hirsch
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Address: Ana Maria Hirsch, North Miami Beach, FL, 33160'
WHERE name = 'Hirsch Interiors - Ana Maria Hirsch' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Hollywood Design Group Corp. - Marcos Levy
UPDATE leads 
SET notes = 'Customer Type: Dealers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: Marcos Levy, Weston, FL, 33326 | Notes: 8/28/2015 2:40:15 PM:    Mantiene la misma direccion   Esta pendiente de Infeel .  Amigo de Ray      9/24/2015 Vino a la oficina . LIBROS NUEVOS Y MASTER and  Window Film   Se reunio con Ray'
WHERE name = 'Hollywood Design Group Corp. - Marcos Levy' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Home Design Center Of Florida - Suzette
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: SP | Terms: Due on receipt | Address: 1805 S. federal Hwy., Ft. Lauderdale, FL, 33316 | Notes: In the process of making arrangement for her showroom.  Alex�s cell:786-426-1280'
WHERE name = 'Home Design Center Of Florida - Suzette' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: I- Design - Max Piccinini
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: AE | Terms: Due on receipt | Address: Max Piccinini, Miami, FL, 33132 | Notes: 7/31/2015   VIsitado por Anadir & Lili.  LIBROS NUEVOS    Lili Le envio email a Lisett ofreciendole el 40%     Le envio Price List'
WHERE name = 'I- Design - Max Piccinini' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: I. C. Designs By Aimee - Aimee Lopez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Aimee Lopez, Miami, FL, 33178 | Notes: Estamos en contacto . Esta dando clase en la Universidad'
WHERE name = 'I. C. Designs By Aimee - Aimee Lopez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Icon Unlimited Corp - Yamila San Martin
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: 1521 Alton Road, Suite 753, Miami Beach, FL, 33139 | Notes: 7/31/2015 PENDIENTE CONTACTO'
WHERE name = 'Icon Unlimited Corp - Yamila San Martin' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Idea Mueble - Rogers Betancourt
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Rogers Betancourt, Doral, FL, 33172'
WHERE name = 'Idea Mueble - Rogers Betancourt' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: IHS International Hospitality Supplier - Ximena Arizaga
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Ximena Arizaga, West Palm Beach, FL, 33405 | Notes: 7/31/2015   PENDIENTE POR CONTACTO'
WHERE name = 'IHS International Hospitality Supplier - Ximena Arizaga' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Infeel USA - Texas - Ricardo Fernandez
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: 24207 Cafe Hill, San Antonio, TX, 78260'
WHERE name = 'Infeel USA - Texas - Ricardo Fernandez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Inside Corporation - Estefania Guerrero
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: LK | Terms: Due on receipt | Address: Estefania Guerrero, Dania Beach, FL, 33004'
WHERE name = 'Inside Corporation - Estefania Guerrero' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Insight design - Inaki Muguruza
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Inaki Muguruza, Miami, FL, 33137 | Notes: 8/3/2015  Monique le dio fecha a Lili para la presentacion del material .  Exigio almuerzo. o que dejara los libros en la tienda'
WHERE name = 'Insight design - Inaki Muguruza' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Interior Trade Cartel - Heather
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: IO | Terms: Due on receipt | Address: 930 Proton Suite #303, San Antonio, TX, 78258'
WHERE name = 'Interior Trade Cartel - Heather' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Interiors Studio M, LLC - Monica D'Roa
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: RP | Terms: Due on receipt | Address: Monica D''Roa, Weston, FL, 33326'
WHERE name = 'Interiors Studio M, LLC - Monica D''Roa' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: International Closet Center, Inc. - Paola Frewa
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Paola Frewa, Miami, FL, 33166 | Customer: International Closet Center, Inc.*'
WHERE name = 'International Closet Center, Inc. - Paola Frewa' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Inversiones MMT LLC - Alexis Boscan
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: RP | Terms: Due on receipt | Address: Alexis Boscan, Doral, FL, 33178'
WHERE name = 'Inversiones MMT LLC - Alexis Boscan' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: JP Printing - Jean Philippe Coirin
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: RP | Terms: Due on receipt | Address: Jean Philippe Coirin, Boca Raton, FL, 33433 | Customer: Jean Philippe Coirin'
WHERE name = 'JP Printing - Jean Philippe Coirin' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: JL Home Projects - Juliano Scherba
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Juliano Scherba, Boca Raton, FL, 33432 | Notes: 7/31/2015    LIBROS NUEVOS'
WHERE name = 'JL Home Projects - Juliano Scherba' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Johnsons Group - Johanna Johnson
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Johanna Johnson, Miami, FL'
WHERE name = 'Johnsons Group - Johanna Johnson' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Jon Richards Company - James Long
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: James Long, Orlando, FL, 32824'
WHERE name = 'Jon Richards Company - James Long' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Juan Carlos Carrion - Juan Carlos Carrion
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: 253 NE 2nd Street, Miami, FL, 33132'
WHERE name = 'Juan Carlos Carrion - Juan Carlos Carrion' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Juan Carlos Tovar - Juan Carlos Tovar
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: LK | Terms: Due on receipt | Address: 11160 NW 71St., Doral, FL, 33178'
WHERE name = 'Juan Carlos Tovar - Juan Carlos Tovar' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Judy Appel Designs - Judy Appel
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: 80 Hendricks Isle, Ft. Lauderdale, FL, 33301 | Notes: 8/28/2015 LIBROS NUEVOS   ENVIADO POR JANETTE  La cliente ahora esta trabajando sin local'
WHERE name = 'Judy Appel Designs - Judy Appel' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: K Studio Arquitecture + Interior Design - Anette Nolasco
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Address: 782 NW 42nd Ave. Suite #205, Miami, FL, 33126'
WHERE name = 'K Studio Arquitecture + Interior Design - Anette Nolasco' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Kis Interior Design Inc - Guimar Urbina
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Guimar Urbina, Miami, FL, 33131 | Customer: Kis Interior Design'
WHERE name = 'Kis Interior Design Inc - Guimar Urbina' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Kitchen Solutions by Dynamic - Marcela Garcia
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Kitchen & Bath | Rep: IO | Terms: Due on receipt | Address: Marcela Garcia, Hallandale, FL, 33009'
WHERE name = 'Kitchen Solutions by Dynamic - Marcela Garcia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Kubli Studio - Lili Kubli
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: 1250 South Miami Avenue, Miami, FL, 33130 | Notes: 9-01-2015 Closet Factory   9-10-2015  Level 1 Restaurant   LIBROS NUEVOS   9-11-2015  Alejandra Arquict  LIBROS NUEVOS  9-11-2015 Dr Shnur Nuevo estimado  9-11-2015 RTKL  LIBROS NUEVOS    Memo samples'
WHERE name = 'Kubli Studio - Lili Kubli' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Laird Plastics - John
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: IO | Terms: Net 30 | Address: 15825 NW 15th Ave., Miami, FL, 33169 | Customer: Laird Plastics.'
WHERE name = 'Laird Plastics - John' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Latour Design & Development - Daniel Latour
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Daniel Latour, Miami, FL, 33137 | Notes: Hable con Jessica. Dice que estan cerrando varios proyectos.  Para los nuevos proyectos nos llamara para ver lo nuevo de Infeel . quedamos para final de Agosto.'
WHERE name = 'Latour Design & Development - Daniel Latour' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lauren Paris Interiors Inc - Lorraine Paris
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Lorraine Paris, Palm Beach Garden, FL, 33418'
WHERE name = 'Lauren Paris Interiors Inc - Lorraine Paris' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lennar Corp. (700) - Steven Zamora
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: LK | Terms: Due on receipt | Address: Steven Zamora, Miami, FL, 33172 | Notes: Waiting on payment to schedule installation  12/13/2012 12:00:51 PM: | Customer: Lennar Corp.'
WHERE name = 'Lennar Corp. (700) - Steven Zamora' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lineaire Designs - Adriana Tineo
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 2347 Biscayne Boulevard, Miami, FL, 33137 | Notes: 7/31/2015  PENDIENTE CONTACTO'
WHERE name = 'Lineaire Designs - Adriana Tineo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Loguer Design - Aracelis Ramirez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Aracelis Ramirez, Miami, FL, 33131 | Notes: Hable con Aracelis Ramirez. Marina ya no trabaja con ellos.  Quede en llamarla para una cita para  que la visite LiLi'
WHERE name = 'Loguer Design - Aracelis Ramirez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Lori Ferrell Interior Design - Lori Ferrell
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: SP | Terms: Due on receipt | Address: 1425 Brickell Avenue #66F, Miami, FL, 33131'
WHERE name = 'Lori Ferrell Interior Design - Lori Ferrell' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Luckey's Management - Sandy Patel
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Sandy Patel, Ft. Lauderdale, FL, 33312 | Notes: 7/31/2015    PENDIENTE POR CONTACTO'
WHERE name = 'Luckey''s Management - Sandy Patel' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Luxe & Co. Interiors LLC. - Fabiana Souza
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Address: 100 Edgewater Drive, Coral Gables, FL, 33133 | Customer: Luxe & Co. Interiors LLC'
WHERE name = 'Luxe & Co. Interiors LLC. - Fabiana Souza' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Luxury Living Group - Ricardo Britto
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: AE | Terms: Due on receipt | Address: 90 NE 39th Street, Miami, FL, 33137 | Notes: 7/31/2015  Catalago Marron   LIBROS NUEVOS'
WHERE name = 'Luxury Living Group - Ricardo Britto' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: M Q V Design - Cristhian Castillo
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: AE | Terms: Due on receipt | Address: Cristhian Castillo, Miami Lakes, FL, 33018 | Notes: 8/11/2015  Seguimiento por samples enviado.    Llamar finales de Agosto'
WHERE name = 'M Q V Design - Cristhian Castillo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: M Sidia Design LLC - Mouna Sidia
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 2000 N Bayshore Dr., Miami, FL, 33137 | Notes: 7/31/2015  PENDIENTE CONTACTO'
WHERE name = 'M Sidia Design LLC - Mouna Sidia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Macleod Constructors Inc. - Arturo Macleod
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: IO | Terms: Due on receipt | Address: Arturo Macleod, Miami, FL | Customer: Macleod Constructors Inc..'
WHERE name = 'Macleod Constructors Inc. - Arturo Macleod' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Man With A Beard - Martin Errazola
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: IO | Terms: Due on receipt | Address: 18620 Belview Dr., Cutler Bay, FL, 33157 | Customer: Man With A Beard.'
WHERE name = 'Man With A Beard - Martin Errazola' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Manzione Interiors LLC - Nathalie Manzione
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Nathalie Manzione, Miami, FL, 33178'
WHERE name = 'Manzione Interiors LLC - Nathalie Manzione' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Margaret Marquez Interiors - Margaret Marquez
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: 116 Gavilan Ave., Coral Gables, FL, 33143'
WHERE name = 'Margaret Marquez Interiors - Margaret Marquez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Marketing (Exhibition and Catalog)
UPDATE leads 
SET notes = 'Customer Type: .Marketing | Rep: M | Terms: Due on receipt | Address: 1723 NW 82nd Ave., Doral, FL, 33126'
WHERE name = 'Marketing (Exhibition and Catalog)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Marketing (Repairs)
UPDATE leads 
SET notes = 'Customer Type: .Marketing | Rep: M | Terms: Due on receipt | Address: 1723 NW 82nd Ave., Doral, FL, 33126'
WHERE name = 'Marketing (Repairs)' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Maru's Corner - Maria Eugenia
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: EM | Terms: Due on receipt | Address: Maria Eugenia, Coral Gables, FL, 33134 | Notes: 7/31/2015   Cita despues del  15 de Agosto    8/11/2015   Se entrego nueva informacion 40% descuento  LIBROS NUEVOS'
WHERE name = 'Maru''s Corner - Maria Eugenia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Mary Angulo - Mary Angulo
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: IO | Terms: Due on receipt | Address: 1659 Island Way, Weston, FL, 33326'
WHERE name = 'Mary Angulo - Mary Angulo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Mas Interior Design Inc. - Mirtha Arriaran
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: 900 Biscayne Blvd #5001, Miami, FL, 33132 | Notes: Sonia Toth  Luxury Real Estate Specialist  South Pointe Drive Realty  www.soniatoth.com  Cell : (786) 351-0808  NexTel : 159*224780*7  Fax : (786) 453-0110    Olga 1-323-360-3930    Mirtha 305-322-7542'
WHERE name = 'Mas Interior Design Inc. - Mirtha Arriaran' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Max Strang Architecture - Aly Jimenez
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Aly Jimenez, Miami, FL, 33133 | Notes: 7/31/2015  Contactada por email'
WHERE name = 'Max Strang Architecture - Aly Jimenez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Medusa Design - Fernando Torres
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Fernando Torres, Pompano Beach, FL, 33069 | Notes: 7/31/2015   Samples. Pendiente Estimado'
WHERE name = 'Medusa Design - Fernando Torres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Mega TV
UPDATE leads 
SET notes = 'Customer Type: Professional:Media & Advertising | Rep: IO | Terms: Due on receipt | Address: 14901 NE 20th Ave., Miami, FL, 33181'
WHERE name = 'Mega TV' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Melo Group - Carlos Melo
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Carlos Melo, Miami, FL, 33137'
WHERE name = 'Melo Group - Carlos Melo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Melon Corp. - Helga Tapias
UPDATE leads 
SET notes = 'Customer Type: Commercial:Events & Displays | Rep: IO | Terms: Due on receipt | Address: 2700 W. 3 Ct., Hialeah, FL, 33010'
WHERE name = 'Melon Corp. - Helga Tapias' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Metro Door - Herman Alter
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: EM | Terms: Due on receipt | Address: Herman Alter, Miami, FL, 33180 | Notes: 8/25/2015   LIBROS NUEVOS    8/25/2015 4:00:08 PM:  Se programo visita semana proxima  Update de libros, informacion descuento'
WHERE name = 'Metro Door - Herman Alter' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Miami Dade College - Monica Parga
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: SP | Terms: Due on receipt | Address: Room 9254, Miami, FL, 33176 | Notes: The Cabinet     Att:Herby   786 5479002  llamo 01-16-2015 para pedir nombre del installador'
WHERE name = 'Miami Dade College - Monica Parga' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Michael Wolk Design Associates - Dragana Stojanovic
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 31 NE 28th Street, Miami, FL, 33137 | Notes: 7/31/2015  PENDIENTE CONTACTO'
WHERE name = 'Michael Wolk Design Associates - Dragana Stojanovic' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Modern Home 2 Go - Julissa De Los Santos
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Julissa De Los Santos, Miami, FL, 33137'
WHERE name = 'Modern Home 2 Go - Julissa De Los Santos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Modloft - Ted Toledano
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: IO | Address: Ted Toledano, North Miami, FL, 33181'
WHERE name = 'Modloft - Ted Toledano' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Monroy & Co. PA - Cecilia Monroy
UPDATE leads 
SET notes = 'Rep: IO | Terms: Due on receipt | Address: Cecilia Monroy, Doral, FL, 33172 | Notes: 8/28/2015    Se le envio por email la nueva direccion .  LLamada de recordatorio'
WHERE name = 'Monroy & Co. PA - Cecilia Monroy' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: More Space Place (Aventura) - Federico Papale
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: LK | Terms: Due on receipt | Address: Federico Papale, Aventura, FL, 33160 | Notes: 8-28-2015 LIBROS NUEVOS'
WHERE name = 'More Space Place (Aventura) - Federico Papale' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Nadia Llerena - Nadia Llerena
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Nadia Llerena'
WHERE name = 'Nadia Llerena - Nadia Llerena' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: New Image Event Furniture - Metis
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: SP | Terms: Due on receipt | Address: 615 West 18th Street, Hialeah, FL, 33010'
WHERE name = 'New Image Event Furniture - Metis' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Nexus Ideas - Manuel Gejo
UPDATE leads 
SET notes = 'Customer Type: Professional:Events & Displays | Rep: IO | Terms: Due on receipt | Address: 7201 NE 4th Ave. Suite #101, Miami, FL, 33138'
WHERE name = 'Nexus Ideas - Manuel Gejo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Nick Luaces Design Associates - Mercedes Castillo
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: Nick Luaces Design Associates, Coconut Grove, FL, 33133 | Notes: 8/13/2015  LIBROS NUEVOS | Customer: NLDA'
WHERE name = 'Nick Luaces Design Associates - Mercedes Castillo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Northern Monkey Design Inc. - Spencer Barker
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Spencer Barker, Ft. Lauderdale, FL, 33312 | Notes: 7/31/2015    PENDIENTE POR CONTACTO'
WHERE name = 'Northern Monkey Design Inc. - Spencer Barker' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Novelty Design Group - Judy Santos
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: Judy Santos, Miami, FL, 33131 | Notes: 7/31/2015   LIBROS NUEVOS'
WHERE name = 'Novelty Design Group - Judy Santos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: NuSpace Network - Ana Maria
UPDATE leads 
SET notes = 'Rep: LK | Terms: Due on receipt | Address: 1111 Kane concourse, suite 111, Bay Harbor Islands, FL, 33154'
WHERE name = 'NuSpace Network - Ana Maria' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: O-Gee Paint Co. - Peggy Sue
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Paint & Designs | Rep: CL | Terms: Due on receipt | Address: 6995 Bird Rd., Miami, FL, 33153 | Notes: Paint and Wall Paper Distributor'
WHERE name = 'O-Gee Paint Co. - Peggy Sue' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Octametro LLC - Fernando Rodriguez
UPDATE leads 
SET notes = 'Customer Type: Commercial:Signs | Rep: RP | Terms: Due on receipt | Address: 6394 NW 97TH Ave., Doral, FL, 33178'
WHERE name = 'Octametro LLC - Fernando Rodriguez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: One Of  A  Kind - Roberta Sanz De Santamaria
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: SP | Terms: Due on receipt | Address: Roberta Sanz De Santamaria, Miami, FL, 33137 | Customer: One Of A Kind *'
WHERE name = 'One Of  A  Kind - Roberta Sanz De Santamaria' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Opzioni Design - Jeannette Gonzalez
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Jeannette Gonzalez, Hollywood, FL, 33021 | Notes: 8/31/2015  Esta trabajando desde su casa.  Le envie la direccion nueva por email . Prefiere venir a la oficina | Customer: Opzioni Design Inc.'
WHERE name = 'Opzioni Design - Jeannette Gonzalez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: P & P Architectural Advice LTD - Mina Poler
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Mina Poler, Miami, FL, 33180 | Notes: 7/31/2015   Se visito con el catalogo marron'
WHERE name = 'P & P Architectural Advice LTD - Mina Poler' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Pepe Calderin Design, Inc. - Jashira Ruiz
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: AE | Terms: Due on receipt | Address: 7500 NE 4th Ct # 104, Miami, FL, 33138'
WHERE name = 'Pepe Calderin Design, Inc. - Jashira Ruiz' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: PG Studio Inc - Paola Garcia
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 7753 NW 113th Path, Doral, FL, 33178 | Notes: 8/5/2015   LIBROS NUEVOS  Samples para Aviacion Project'
WHERE name = 'PG Studio Inc - Paola Garcia' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Plasticos Comerciales S.A. - Freddy Johnson
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: IO | Terms: Due on receipt | Address: Av. 27 de Febrero #499 El Millon, Santo Domingo, Dom. Rep.'
WHERE name = 'Plasticos Comerciales S.A. - Freddy Johnson' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Plus Vision Advertising - Alexander Rey
UPDATE leads 
SET notes = 'Customer Type: Commercial:Signs | Rep: RP | Terms: Due on receipt | Address: Alexander Rey, Miami, FL, 33172 | Notes: 7/31/2015   PENDIENTE CONTACTO'
WHERE name = 'Plus Vision Advertising - Alexander Rey' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Proffetional Group - Raquel del Olmo Blas
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: 2600 S. Douglas Road Suite #1007, Coral Gables, FL, 33134'
WHERE name = 'Proffetional Group - Raquel del Olmo Blas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Property Markets Group - Delilah Phelan
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Address: 1441 Brickell Ave., Miami, FL, 33131'
WHERE name = 'Property Markets Group - Delilah Phelan' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: R Design Studio Inc. - Roger Zwickel
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: AE | Terms: Due on receipt | Address: 5151 Collins Ave. Suite 220, Miami Beach, FL, 33140 | Notes: SE LE ENTREGO SAMPLES DE POV'
WHERE name = 'R Design Studio Inc. - Roger Zwickel' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: R2 Construction Group, LLC. - Ronie Romero
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: CL | Terms: Due on receipt | Address: 1444 Biscayne Boulevard, Miami, FL, 33132 | Notes: Customer referred by Martin from Artefacto.  As per Carlos Lopez to quote Retail. | Customer: R2 Construction Group'
WHERE name = 'R2 Construction Group, LLC. - Ronie Romero' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rana Furniture - Rodrigo Ramirez
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: IO | Terms: Due on receipt | Address: 10005 NW 21 St, Doral, FL, 33172'
WHERE name = 'Rana Furniture - Rodrigo Ramirez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: RBS Woodwork Corp - Ambrozio
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: 3171 W 81st Street, Hialeah, FL, 33018'
WHERE name = 'RBS Woodwork Corp - Ambrozio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Red Gallerie LLC - Maria Pereira
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: EM | Terms: Due on receipt | Address: Maria Pereira, Miami, FL, 33127 | Notes: 7/31/2015    LIBROS NUEVOS'
WHERE name = 'Red Gallerie LLC - Maria Pereira' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Red South Beach Hotel - Luke Merrick
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: SP | Terms: Due on receipt | Address: Luke Merrick, Miami Beach, FL, 33140'
WHERE name = 'Red South Beach Hotel - Luke Merrick' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rene Cardona Arango - Rene Cardona
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: 4836 N State Road 7 Apto 303, Coconut Creek, FL, 33073 | Notes: 8/21/2015  Pendiente estimado    8/21/2015   Libro Genon para proyecto nuevo    8/26/2015  Seguimiento de proyecto. memo samples de Infeel'
WHERE name = 'Rene Cardona Arango - Rene Cardona' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rod Wraps - Enrique Torres
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Address: Enrique Torres, Medley, FL'
WHERE name = 'Rod Wraps - Enrique Torres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rodriguez and Quiroga Architects Chartere - Mirtha Albeirus
UPDATE leads 
SET notes = 'Customer Type: Architect | Rep: AE | Terms: Due on receipt | Address: Mirtha L.  Albeirus, Coral Gables, FL, 33134 | Notes: 7/31/2015 Catalago marron enviado por mail'
WHERE name = 'Rodriguez and Quiroga Architects Chartere - Mirtha Albeirus' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Roma Design Group - Ana Cristina Robles
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: EM | Terms: Due on receipt | Address: Ana Cristina Robles, Miami, FL, 33131 | Notes: 7/31/2015    LIBROS NUEVOS    8/13/2015  estimado'
WHERE name = 'Roma Design Group - Ana Cristina Robles' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Roos International LTD. Inc. USA - Deborah Roos
UPDATE leads 
SET notes = 'Customer Type: Dealers:Fabrics & Wallcovering | Rep: RP | Terms: Due on receipt | Address: Deborah Roos, Deerfield Beach, FL, 33442 | Notes: 8/19/2015   LIBROS NUEVOS Y MASTER para Trinidad  LIBROS NUEVOS Y MASTER para Showroom'
WHERE name = 'Roos International LTD. Inc. USA - Deborah Roos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Rothman Associates - Maria
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: 53 NE 24 St., Miami, FL, 33137 | Notes: 2/10/2014 11:51:10 AM:  Llame a Maria para la mercancia que tiene aqui en el warehouse, salio la contestadora.  Gaby.'
WHERE name = 'Rothman Associates - Maria' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Roma Investment Group , LLC - Mariela Barcenas
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Address: Mariela Barcenas, Dania Beach, FL, 33004 | Notes: estimates full price. Gets 20% Discount. | Customer: Sanctuarium Design'
WHERE name = 'Roma Investment Group , LLC - Mariela Barcenas' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sandra Diaz Interior Design - Sandra Diaz
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: 5800 SW 122 ave., Miami, FL, 33183'
WHERE name = 'Sandra Diaz Interior Design - Sandra Diaz' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sanzogo  Corporation - Elaine Sanzogo
UPDATE leads 
SET notes = 'Customer Type: Professional:Fabrics & Wallcovering | Rep: SP | Terms: Due on receipt | Address: 17011 N. Bay Road, Sunny Isles, FL, 33160 | Notes: 9/25/2015  Esta trabajando con Wall Boutique | Customer: Sanzogo Corporation'
WHERE name = 'Sanzogo  Corporation - Elaine Sanzogo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Saruski Design Studio
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: AE | Terms: Due on receipt | Address: 46 NW 36th St. Suite #4, Miami, FL, 33127 | Notes: 7/31/2015   PENDIENTE CONTACTO'
WHERE name = 'Saruski Design Studio' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Service Painting Of Florida - Sam Grisoff
UPDATE leads 
SET notes = 'Rep: RP | Terms: Due on receipt | Address: 12140 Metro Parkway, Suite K, Ft. Myers, FL, 33966'
WHERE name = 'Service Painting Of Florida - Sam Grisoff' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: USA Bienes Raices - Sharon Hawkins
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: IO | Terms: Due on receipt | Address: 244 Biscayne, Blvd., Miami, FL, 33132 | Customer: Sharon Hawkins'
WHERE name = 'USA Bienes Raices - Sharon Hawkins' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sharron Lewis Design Central - Elizabeth Calomiris
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: 1601 NE 2nd Avenue, Miami, FL, 33132 | Customer: Sharron Lewis Design Central *'
WHERE name = 'Sharron Lewis Design Central - Elizabeth Calomiris' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sims Corporation - Wilson Sims
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Wilson Sims, Coral Gables, FL, 33149-3174'
WHERE name = 'Sims Corporation - Wilson Sims' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sire Design LLC - Eilyn Cueto
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: SP | Terms: Due on receipt | Address: Eilyn Cueto, Aventura, FL, 33180'
WHERE name = 'Sire Design LLC - Eilyn Cueto' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: SO-FLO Construction - Luis Novoa
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Luis Novoa, Miami, FL, 33145 | Notes: Left message to see status on project.  12/16/2013 11:41:20 AM:'
WHERE name = 'SO-FLO Construction - Luis Novoa' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: 420  Harbor Drive LLC - Sonia Daccach
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: CL | Terms: Due on receipt | Address: Sonia Daccach, Key Biscayne, FL, 33149 | Customer: Sonia Daccach'
WHERE name = '420  Harbor Drive LLC - Sonia Daccach' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Southern Design and Export - Raymond Contreras
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: EM | Terms: Due on receipt | Address: Raymond Contreras, Ft. Lauderdale, FL, 33304 | Notes: 8/28/2015   Se le dejo mensaje telefonico'
WHERE name = 'Southern Design and Export - Raymond Contreras' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Spacio Design Build - Alex Wertheim
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: CL | Terms: Due on receipt | Address: 175 SW 7 St. # 2111, Miami, FL, 33130 | Notes: Hable con Caitlin para actualizar datos y enviarle la promocion'
WHERE name = 'Spacio Design Build - Alex Wertheim' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Spazio Di Casa - Andrea Fernandez
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture | Rep: IO | Terms: Due on receipt | Address: 3850 N. Miami Ave., Miami, FL, 33127 | Notes: se le envio fotos de material de cocodrilo'
WHERE name = 'Spazio Di Casa - Andrea Fernandez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Spazio Suyai - Solcire Anez
UPDATE leads 
SET notes = 'Customer Type: Professional:Cabinet, Closet & Door | Rep: IO | Terms: Due on receipt | Address: Solcire Anez, Miami, FL, 33179'
WHERE name = 'Spazio Suyai - Solcire Anez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Studio Solutions Arq Corp - Pablo Campo
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Pablo Campo, Miami, FL, 33133'
WHERE name = 'Studio Solutions Arq Corp - Pablo Campo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Style Furniture Decor - Larisa Krutous
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Furniture &Designer Center | Rep: EM | Address: Larisa Krutous, North Miami Beach, FL, 33462'
WHERE name = 'Style Furniture Decor - Larisa Krutous' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Sunny South Paint & Decor
UPDATE leads 
SET notes = 'Customer Type: Professional:Paint & Designs | Rep: CL | Terms: Due on receipt | Address: 3202 Coral Way, Miami, FL, 33145 | Notes: Laura 305-441-9234'
WHERE name = 'Sunny South Paint & Decor' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Suzanne Lawson Design - Suzanne Lawson
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: LK | Terms: Due on receipt | Address: Suzanne Lawson, Miami, FL, 33137'
WHERE name = 'Suzanne Lawson Design - Suzanne Lawson' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Swire Properties Inc - Hannah Lenard
UPDATE leads 
SET notes = 'Customer Type: Professional:Property Rental & Sales | Rep: CL | Terms: Due on receipt | Address: 501 Brickell Key Drive, Miami, FL, 33131 | Notes: No llamar es de Artefacto'
WHERE name = 'Swire Properties Inc - Hannah Lenard' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: T & G Constructors - Carolina Ramirez
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: LK | Terms: Due on receipt | Address: Carolina Ramirez, Doral, FL, 33166 | Notes: Jorge Gioco  (786)246-8374'
WHERE name = 'T & G Constructors - Carolina Ramirez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tacon Graphics Ca - Humberto Banfi
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: IO | Terms: Due on receipt | Address: Ave. 15 Delicias Calle 67 Cecilio Acosta, Edo. Zulia,Rep. Bolivariana, DE | Notes: Cliente de Venezuela'
WHERE name = 'Tacon Graphics Ca - Humberto Banfi' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tatiana Alessandrini Designs - Tatiana Alessandrini
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: RP | Terms: Due on receipt | Address: 1200 West Avenue, Suite 624, Miami Beach, FL, 33139 | Notes: Always send estimates full price.'
WHERE name = 'Tatiana Alessandrini Designs - Tatiana Alessandrini' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Telemundo  Studios - Jose Carlos
UPDATE leads 
SET notes = 'Customer Type: Commercial:Media & Advertising | Rep: SP | Terms: Due on receipt | Address: 7355 NW 41st Street, Miami, FL, 33166 | Notes: Dario Yepes 305.322.4926  (purchaser)'
WHERE name = 'Telemundo  Studios - Jose Carlos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Teresita Mattos - Teresita Mattos
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: 17030 NW 19 Ct, Pembroke Pines, FL, 33028 | Notes: Quotes to be prepared full price.  Customer gets 15 % discount'
WHERE name = 'Teresita Mattos - Teresita Mattos' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Terra Realty LLC - Andres Marquez
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: 10783 NW 41st St., Doral, FL, 33178'
WHERE name = 'Terra Realty LLC - Andres Marquez' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Macknight Smokehouse Inc. - Claudia Castillo
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Claudia Castillo, Miami, FL, 33179'
WHERE name = 'The Macknight Smokehouse Inc. - Claudia Castillo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Related Group - Tatiana Rengifo
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Address: Tatiana Rengifo, Miami, FL, 33131'
WHERE name = 'The Related Group - Tatiana Rengifo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The UPS Store  #6290 - Luis Grisales
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: Luis M. Grisales, North Miami Beach, FL, 33181'
WHERE name = 'The UPS Store  #6290 - Luis Grisales' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Walfab Company - Rick Donoff
UPDATE leads 
SET notes = 'Rep: RP | Terms: Due on receipt | Address: 1956 NE 151 St., N. Miami, FL, 33162'
WHERE name = 'The Walfab Company - Rick Donoff' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: The Wallpaper Company - Guillermo Urbina
UPDATE leads 
SET notes = 'Customer Type: Dealers:Fabrics & Wallcovering | Rep: SP | Terms: Due on receipt | Address: Guillermo Urbina, Miami, FL, 33131'
WHERE name = 'The Wallpaper Company - Guillermo Urbina' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Thyssen Krupp Elevator Americas - Johnny La Salle
UPDATE leads 
SET notes = 'Customer Type: Commercial:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: 7481 NW 66th St., Miami, FL, 33166'
WHERE name = 'Thyssen Krupp Elevator Americas - Johnny La Salle' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tomka LLC - Jesus Torres
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: IO | Terms: Due on receipt | Address: Jesus Torres, Doral, FL, 33178'
WHERE name = 'Tomka LLC - Jesus Torres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Trump International - Mark Stevens
UPDATE leads 
SET notes = 'Customer Type: .Retail | Rep: SP | Terms: Due on receipt | Address: Attn: Mark Stevens, Sunny Isles, FL, 33160 | Notes: Mark''s direct line 305.692.5670'
WHERE name = 'Trump International - Mark Stevens' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Tubelite Co. Inc. - Fred Dunn
UPDATE leads 
SET notes = 'Customer Type: Dealers:Signs | Rep: RP | Terms: 2% 10 Net 30 | Address: PO Box #165, Wood-Ridge, NJ, 07075 | Notes: 11205 NW 131st Street Miami, FL 33178.  Phone: 305-883-9070. Fax: 305-883-9456.   Toll Free: 800-505-4900. Toll Free Fax: 800-505-7454 ...'
WHERE name = 'Tubelite Co. Inc. - Fred Dunn' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Turner Broadcasting System
UPDATE leads 
SET notes = 'Customer Type: Commercial:Media & Advertising | Rep: IO | Terms: Due on receipt | Address: Latin America, Inc., Atlanta, GA, 30303'
WHERE name = 'Turner Broadcasting System' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: U Design Shades LLC - Alessandra Pereira
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Fabrics & Wallcovering | Rep: CL | Terms: Due on receipt | Address: Alessandra Pereira, Miami, FL, 33160 | Notes: Adalberto (Gump): 786-218-6158'
WHERE name = 'U Design Shades LLC - Alessandra Pereira' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Unlimited Wraps, Inc. - Rey Acosta
UPDATE leads 
SET notes = 'Customer Type: Professional:Installer | Rep: RP | Terms: Due on receipt | Address: Attn: Rey Acosta, Miami, FL, 33165-2869 | Customer: Unlimited Wraps'
WHERE name = 'Unlimited Wraps, Inc. - Rey Acosta' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Up Date Design - Claudia Rozo
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Claudia Rozo, Hollywood, FL, 33021'
WHERE name = 'Up Date Design - Claudia Rozo' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: USA Signs Inc. - Katya Caceres
UPDATE leads 
SET notes = 'Customer Type: Professional:Signs | Rep: IO | Terms: Due on receipt | Address: Katya Caceres, Doral, FL, 33172'
WHERE name = 'USA Signs Inc. - Katya Caceres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Valor Investments Inc. - Maria Carolina Dorta
UPDATE leads 
SET notes = 'Rep: IO | Address: Maria Carolina Dorta, Doral, FL, 33172 | Customer: Valor Investments Inc'
WHERE name = 'Valor Investments Inc. - Maria Carolina Dorta' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Via Design Studio - Ana Paula Ibarra
UPDATE leads 
SET notes = 'Customer Type: Professional | Rep: SP | Terms: Due on receipt | Address: Ana Paula Ibarra, Miami Springs, FL, 33166 | Notes: Referred by Claudia Castillo - Installer'
WHERE name = 'Via Design Studio - Ana Paula Ibarra' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: VT Design Studios - Viviana Torres
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: LK | Terms: Due on receipt | Address: Viviana  Torres, Miami, FL, 33129 | Notes: 8/3/2015 Contactada por email'
WHERE name = 'VT Design Studios - Viviana Torres' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Wall Boutique - Andrea Rodrigues
UPDATE leads 
SET notes = 'Customer Type: Professional:Interior Designer | Rep: RP | Terms: Due on receipt | Address: Andrea Rodrigues, Miami, FL, 33129 | Notes: 8/6/2015   Samples para nuevo proyecto  Nuevo estimado'
WHERE name = 'Wall Boutique - Andrea Rodrigues' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: White Dezign - Blanca Castellon
UPDATE leads 
SET notes = 'Customer Type: Exhibition Centers:Interior Design | Rep: IO | Terms: Due on receipt | Address: Blanca Castellon, Miami, FL, 33137 | Notes: Left message to call back, to know on status of project  12/16/2013 12:06:36 PM:'
WHERE name = 'White Dezign - Blanca Castellon' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Zarrella Construction, Inc. - Tom Moulson
UPDATE leads 
SET notes = 'Customer Type: Professional:Architecture Designer | Rep: IO | Terms: Due on receipt | Address: 4901 SW 52nd Ave., Davie, FL, 33314 | Notes: 7/31/2015   En espera de aprobacion de Estimado   Proyecto Porsche'
WHERE name = 'Zarrella Construction, Inc. - Tom Moulson' 
  AND lead_origin = 'Commercial' 
  AND project_type = 'Commercial';

-- Update: Zyance Furniture LLC - Gaelle Vujasin
UPDATE leads 
SET notes = 'Customer Type: Professional:Furniture | Rep: LK | Terms: Due on receipt | Address: Gaelle Vujasin, Miami, FL, 33137 | Customer: Zyance Furniture LLC.'
WHERE name = 'Zyance Furniture LLC - Gaelle Vujasin' 
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

-- Check how many were actually updated
SELECT 'UPDATE SUCCESS RATE:' as info;
SELECT 
  COUNT(*) as total_commercial_leads,
  SUM(CASE WHEN notes IS NOT NULL AND notes != '' THEN 1 ELSE 0 END) as updated_leads,
  ROUND(SUM(CASE WHEN notes IS NOT NULL AND notes != '' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_percentage
FROM leads 
WHERE lead_origin = 'Commercial' AND project_type = 'Commercial';
