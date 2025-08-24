-- Clear existing data
TRUNCATE TABLE leads CASCADE;
DELETE FROM users WHERE username IN ('kim', 'patrick', 'lina');

-- Insert users with proper roles
INSERT INTO users (username, password, role) VALUES
('kim', 'password', 'sales_rep'),
('patrick', 'password', 'sales_rep'), 
('lina', 'password', 'sales_rep');

-- Insert leads data from MySQL dump
-- Converting MySQL enum values to match PostgreSQL schema
INSERT INTO leads (
  date_created, 
  lead_origin, 
  name, 
  phone, 
  email, 
  next_followup_date, 
  remarks, 
  assigned_to, 
  notes, 
  additional_notes, 
  project_amount, 
  deposit_paid, 
  balance_paid, 
  installation_date, 
  assigned_installer
) VALUES
('2025-08-22', 'google', 'NA', '(786) 301-8300', 'Ksazanovich@gmail.com', '2025-08-25', 'in-progress', 'patrick', '', '', 4995.00, false, false, NULL, NULL),
('2025-08-22', 'website', 'Mareena Win', '(813) 528-1250', 'mareenawin@gmail.com', '2025-08-25', 'not-service-area', 'kim', '', '', 0.00, false, false, NULL, NULL),
('2025-08-21', 'google', 'Missy - New Project', '(786) 255-0686', 'Missygueits@gmail.com', NULL, 'sold', 'patrick', 'New Project - WMK-009 most likely. Need a confirmation of the color - HOUSE no COI
NEED TO CONNECT WITH HER HUBSBAND FOR CHASE renovation - Instead of replacing, reface!2', '', 2295.00, false, false, NULL, NULL),
('2025-08-21', 'google', 'Jose', '(786) 510-9456', 'jorgecgarcia21@gmail.com', '2025-08-27', 'in-progress', 'patrick', '', '', 4995.00, false, false, NULL, NULL),
('2025-02-03', 'trade-show', 'Renato', '(954) 591-1264', 'Renatoafaria@gmail.com', '2025-09-04', 'sold', 'patrick', 'NEED TO FOLLOW UP IN EARLY SEPT FOR THE DEPOSIT', '', 2995.00, false, false, NULL, NULL),
('2025-08-20', 'google', 'Melissa', '(786) 201-6978', 'Melissa@viadolcegroup.com', '2025-08-25', 'in-progress', 'patrick', 'sent a follow up text and email', '', 6495.00, false, false, NULL, NULL),
('2025-08-20', 'google', 'Xeanny', '(954) 494-5292', 'xeannych@icloud.com', '2025-09-02', 'sold', 'patrick', 'NEED TO GET HER CREDIT CARD INFO once she has her dates for the floor ( end of SEPT )', '', 4313.00, false, false, NULL, NULL),
('2025-08-20', 'google', 'Ada Villalobos', '(645) 230-6812', 'villala99@hotmail.com', '2025-08-25', 'in-progress', 'patrick', 'I answered her text on 08/21 / She will order the sample booklet first', '', 2795.00, false, false, NULL, NULL),
('2025-08-19', 'trade-show', 'Francesca McFeely', '(954) 415-1155', 'Francescam@bellsouth.net', '2025-08-29', 'in-progress', 'patrick', 'Good afternoon Francesca. Sorry for not getting back to you last week. The answer is yes. we will cover the toe kicks as well. Do you want to schedule the work for the end of September? FYI, at the moment, this is the closest date I can do it but please keep in mind that we have a Tradeshow next weekend and I will add many installation so if you schedule pass Friday, your project will be most likely done in October - Patrick

Yes please and then I will need an estimate including all we talked about in writing to francescam@bellsouth.net thank u', '', 5995.00, false, false, NULL, NULL),
('2025-08-19', 'referral', 'Wil & Angel', '(305) 297-2220', 'sabelhome@gmail.com', '2025-09-23', 'in-progress', 'patrick', 'They will be closing the unit first before they decide estimate 09/23/2025', '', 2595.00, false, false, NULL, NULL),
('2025-08-18', 'google', 'Alex', '(305) 494-3258', 'Studio52wj@gmail.com', '2025-08-25', 'in-progress', 'patrick', 'He wants to visit the showroom on Wednesday at 12:30PM', '', 3195.00, false, false, NULL, NULL),
('2025-08-19', 'website', 'Pedro Alves', '(954) 696-0781', 'pedro.alves@icloud.com', '2025-08-27', 'in-progress', 'patrick', 'Good afternoon Pedro. Just wanted to know if you have any questions regarding the estimate I sent you? - sent on 08/24', '', 3995.00, false, false, NULL, NULL),
('2025-08-16', 'website', 'Vera Thompson', '(786) 287-0682', 'vera0402@yahoo.com', '2025-08-27', 'in-progress', 'patrick', 'She have 2 projects', 'I told her what I think about WMP and his guarantee.', 1995.00, false, false, NULL, NULL),
('2025-08-16', 'google', 'Jesica & Miguel from Cutler Bay', '(305) 450-2340', 'Task@mhilife.com', '2025-08-26', 'in-progress', 'patrick', 'planning to visit the showroom on Saturday. She is coming at 12h30pm
Also countertop needs to be less than 44inches Additional $1,995 for all countertops and backsplash with Grey marble infeel. Sent an text on 08/24 to get an update on the countertops', '', 7995.00, false, false, NULL, NULL),
('2025-08-16', 'google', 'Andy Plattus', '(213) 716-6570', 'Suddenmoves7@yahoo.com', '2025-08-22', 'not-interested', 'patrick', '', '', 6995.00, false, false, NULL, NULL),
('2025-08-16', 'website', 'Vanesa Rodriguez', '(786) 427-3049', 'rodriguezvr1211@gmail.com', '2025-08-26', 'in-progress', 'patrick', 'sent a text confirming if she received the estimate', 'See if she got the estimate in her SPAM folder?', 4995.00, false, false, NULL, NULL),
('2025-08-16', 'google', 'NA', '(702) 467-2975', 'Steelefaded@yahoo.com', '2025-08-22', 'not-interested', 'kim', 'Sent a text to get an update on the landlord', '', 1500.00, false, false, NULL, NULL),
('2025-08-14', 'google', 'Carolina', '(305) 613-8464', 'Bookcaropozo@gmail.com', '2025-09-04', 'sold', 'patrick', 'Installation on 09/04. SENT sample booklet today by USPS', '', 2895.00, true, false, '2025-08-30', 'brian'),
('2025-08-13', 'google', 'Elise Jessica', '(917) 843-6567', 'Elise.Jessica@ymail.com', '2025-08-27', 'not-interested', 'kim', '', '', 2495.00, false, false, NULL, NULL),
('2025-08-13', 'website', 'Debi Favinger', '(954) 471-5864', 'dfavinger@hotmail.com', '2025-08-28', 'in-progress', 'patrick', 'TEXTED ON 08/21 to see if any update', '', 2395.00, false, false, NULL, NULL),
('2025-08-13', 'whatsapp', 'Diana Bomery', '(305) 502-5300', 'dianabomeny@gmail.com', '2025-08-29', 'in-progress', 'patrick', 'INVITED to showroom on 08/20', '', 2495.00, false, false, NULL, NULL),
('2025-08-13', 'google', 'Luz Suarez', '(754) 423-6406', 'adriana0731@icloud.com', NULL, 'sold', 'kim', 'She came here to get the sample for her Brother', 'SOLD ARE PROJECT 3 MONTHS AGO. Installation AT THE END OF AUGUST', 2995.00, true, false, '2025-08-30', NULL),
('2025-08-13', 'google', 'Heather Lefebvre', '(954) 254-7675', 'heather@oceanarealiving.com', '2025-08-25', 'in-progress', 'patrick', 'Need to send sample booklet today 08/13. NEED to follow up with her on MONDAY to see if she got the samples', '', 5995.00, false, false, NULL, NULL),
('2025-08-12', 'google', 'Robert Southard - Boat Project', '(954) 214-3974', 'ttlapp65@gmail.com', '2025-08-25', 'in-progress', 'patrick', 'boat project', 'Potential VISIT ON THE BOAT ON MONDAY 08/25', 9500.00, false, false, NULL, NULL),
('2025-08-12', 'google', 'Gilles Lacasse', '(819) 208-0719', 'gilles.lacasse007@gmail.com', NULL, 'not-service-area', 'kim', 'SOMEONE IN CANADA', '', 0.00, false, false, NULL, NULL),
('2025-08-11', 'google', 'Ana M Pineda', '(786) 546-5281', 'Shiftingparadigm@hotmail.com', '2025-08-28', 'in-progress', 'patrick', 'TEXT on 08/21 with an update question since we were about to do the project and then everything stopped.', 'Warm Lead / Interested but doesn''t have money at the moment / She will reach out to us when shes ready', 2695.00, false, false, NULL, NULL),
('2025-08-11', 'google', 'Ramin Mozafar', '(305) 401-7316', 'RLBMozafari@gmail.com', NULL, 'sold', 'patrick', '', '', 3395.00, false, false, NULL, NULL),
('2025-08-11', 'referral', 'Hasnaa Boutros', '(954) 579-3647', 'hboutros@onesothebysrealty.com', '2025-10-15', 'in-progress', 'kim', 'She replied. She not ready yet to make changes... Follow up in 2 months', '', 5495.00, false, false, NULL, NULL),
('2025-08-11', 'website', 'Maria Fazio', '(732) 754-0605', 'Mariac1476@yahoo.com', '2025-08-25', 'in-progress', 'patrick', 'Salon Project In NJ - Any update on her project. When is she coming to Florida? Maybe she can come to our showroom', 'PATRICK WILL FOLLOW UP THAT ONE. Made the offer with taupe and grey. She needs to commit to the work', 9995.00, false, false, NULL, NULL),
('2025-08-09', 'website', 'Kelly Ellis', '(919) 710-2921', 'KNGARRIS@GMAIL.COM', NULL, 'not-service-area', 'patrick', 'NO CARPENTER NO AREA', '', 0.00, false, false, NULL, NULL),
('2025-08-09', 'google', 'carmona ramon', '(617) 794-9979', 'carmonaramon3@gmail.com', '2025-08-28', 'in-progress', 'patrick', 'Came to the showroom. Ready to move forward but could not give the deposit on the spot!', 'HE WILL GIVE ME HIS CREDIT CARD TODAY. I Left VM and Called for the Credti card and date. Closing is next week so need to wait no to put anything on credit card. He should be ready NOW - 08/20/2025. Issue with CLOSING. Next week', 5995.00, false, false, NULL, NULL),
('2025-08-08', 'google', 'Malle Hernandez', '(786) 623-7802', 'mallehernandez@yahoo.com', '2025-09-01', 'in-progress', 'patrick', 'sent a follow text and email. TEXT on 08/21 for an update', '', 4696.00, false, false, NULL, NULL),
('2025-08-07', 'commercial', 'Amaurys Clavero - Ocean One', '(954) 889-4651', 'ChefEngeneer@gmail.com', '2025-08-27', 'in-progress', 'patrick', 'FRONT DESK RECEPTION - Follow up with Ray - This client doesnt have a valid email address.', 'NO EMAIL ADDRESS!', 100000.00, false, false, NULL, NULL),
('2025-08-06', 'google', 'Jose Pernia', '(786) 623-7505', 'Jose@beainteriorsdesign.com', '2025-08-29', 'in-progress', 'patrick', 'new project. BUDGETING phase. WIll get back to him in ONE month', '', 3995.00, false, false, NULL, NULL),
('2025-08-06', 'website', 'Janice Ryan', '(214) 577-6878', 'jrwrmach6@gmail.com', NULL, 'not-service-area', 'kim', '', '', 0.00, false, false, NULL, NULL),
('2025-08-06', 'website', 'Cheyl Sett', '(248) 652-6821', 'cherylsetter@gmail.com', NULL, 'not-service-area', 'kim', '', '', 0.00, false, false, NULL, NULL),
('2025-08-06', 'referral', 'Luiz Modolo - Stuart Drossner Friend', '(646) 286-9874', 'fmodolo1@gmail.com', NULL, 'sold', 'patrick', 'REALTOR - needed to move quickly in Bal Harbour. Harbour House Condo # 406, Bal Harbour.. Friend with Luis. TEXTED him on 08/08', '', 2695.00, false, false, NULL, NULL),
('2025-08-06', 'website', 'Alessandra Carvalho', '(305) 851-1881', 'alessandra@oaksdg.com', '2025-08-22', 'in-progress', 'patrick', 'Came to showroom. WIll meet with her client on Tuesday. Follow up on Wednesday. I just texted her 08/13. Follow up on 08/15 by text', '', 2495.00, false, false, NULL, NULL),
('2025-08-06', 'google', 'Michelle', '(954) 864-8784', 'michcamp1447@gmail.com', '2025-08-22', 'in-progress', 'patrick', 'sent follow up text and email. VM & TEXT on 08/08. VM on 08/13', 'I invited her to showroon on 08/15', 2195.00, false, false, NULL, NULL),
('2025-08-06', 'google', 'Melissa Izquierdo', '(305) 301-9808', 'Melissa@igkhair.com', '2025-08-26', 'in-progress', 'patrick', 'Speak French / sent follow up text and email / She is coming today 08/08
Good afternoon Melissa. Did you get my answer regarding the off-white sample that we can give you? - 08/24', 'Long Message regarding thewood grain parttern and sample booklet 08/13. Last chance. 08/15 I am sending the simple booklet today', 3295.00, false, false, NULL, NULL),
('2025-08-06', 'website', 'Ernesto Pesaola', '(786) 657-5101', 'epesaola@gmail.com', '2025-09-30', 'kim', 'On 08/08 he asked questions Thermofoil versus Vinyl. SPoke to him 08/08. He wants to come during the week. I texted him the address', 'I texted him on 08/13 to get any update', 2695.00, false, false, NULL, NULL),
('2025-08-06', 'google', 'Iouan safi', '(646) 280-6404', 'iouansafi@yahoo.com', '2025-09-08', 'sold', 'patrick', 'She is coming at the showroom on SATURDAY  08/09/2025', 'Came with her friend. will go for NEW DOORS options. NEED TO SEND HER REVISION quote and CHAT IMAGES. I texted her on 08/12 to get the deposit', 6795.00, false, false, NULL, NULL),
('2025-08-05', 'google', 'Marisel', '(305) 934-9605', 'mariselbarbeito@gmail.com', '2025-08-28', 'in-progress', 'patrick', 'sent follow up text and email 08/06', 'GIVE HER a 20% discount IF she does her project NEXT WEEK. TEXTED & VM today 08/08 for the promotion for her project. She texted me.... Shopping around so discount will not work', 4995.00, false, false, NULL, NULL),
('2025-08-04', 'google', 'Greg and Kim Heath', '(708) 612-0136', 'kheath3362@gmail.com', NULL, 'sold', 'patrick', '', '', 3495.00, false, false, NULL, NULL),
('2025-08-04', 'google', 'Cristina Mederos', '(954) 274-4386', 'Cristina.mederos@gmail.com', NULL, 'not-interested', 'kim', '', '', 5995.00, false, false, NULL, NULL),
('2025-08-04', 'google', 'Silvana Zelaschi', '(786) 916-7571', 'silvanazelaschi@gmail.com', '2025-08-25', 'in-progress', 'patrick', 'sent a follow up email 08/06. She wants to come to our showroom. 06/07/25. TEXTED her on 08/08', 'INVITED HER TO SHOWROOM on 08/15', 2995.00, false, false, NULL, NULL),
('2025-08-04', 'website', 'Fran Rigi', '(323) 646-1660', 'franrigi60@gmail.com', '2025-08-22', 'in-progress', 'patrick', 'Good afternoon Fran. As per our conversation, the price for the product to wrap your kitchen countertops and the bathroom countertop is $1,195 + $90 shipping. Total: $1,285. Labor ( if you want our guys to install, it will be $1,000 extra . 08/15. KIM TEXTED HER', '', 3495.00, false, false, NULL, NULL),
('2025-08-03', 'website', 'Ankit Kapoor', '(845) 240-0862', 'ANKITKAPOOR1985@GMAIL.COM', NULL, 'not-service-area', 'patrick', '', '', 0.00, false, false, NULL, NULL),
('2025-08-03', 'website', 'Oladayo Akorede', '(301) 768-9022', 'expositoto@rocketmail.com', NULL, 'not-service-area', 'kim', '', '', 0.00, false, false, NULL, NULL),
('2025-08-03', 'website', 'Laura Tallent', '(260) 349-8499', 'ltallent30@gmail.com', NULL, 'not-service-area', 'kim', '', '', 0.00, false, false, NULL, NULL),
('2025-08-02', 'website', 'Valerie Rangel', '(630) 687-5015', 'vrangel703@att.net', NULL, 'not-service-area', 'kim', '', '', 0.00, false, false, NULL, NULL),
('2025-08-01', 'website', 'Maria Alonso', '(954) 544-8072', 'malonso@edexadesign.com', '2025-08-25', 'in-progress', 'patrick', 'She Wants SAMPLE booklet sent to her. I told her to get it online or her directly. Texted me on 08/08. No answer yet from her client', 'ASKED her to share images of her client 08/13 / Still havent sent the pictures , sent a text message on 08/21', 895.00, false, false, NULL, NULL),
('2025-08-01', 'google', 'Andy', '(954) 715-9884', 'Sandyvo82@yahoo.com', NULL, 'not-interested', 'patrick', '', '', 0.00, false, false, NULL, NULL),
('2025-08-01', 'google', 'Tammy Gammerman', '(305) 528-0392', 'Tgammerman@gmail.com', NULL, 'sold', 'patrick', '', '', 4043.25, true, true, NULL, NULL),
('2024-11-25', 'trade-show', 'Nicki Sayward', '', 'nsayward@gmail.com', NULL, 'sold', 'patrick', '', '', 6495.00, false, false, NULL, NULL),
('2024-11-26', 'trade-show', 'ravanzan', '(305) 987-1481', 'Ravanzan@gmail.com', NULL, 'sold', 'patrick', '', '', 1995.00, false, false, NULL, NULL),
('2024-11-26', 'trade-show', 'Elena Belom Enrici', '(305) 333-7167', 'Elena.Enrici@hotmail.com', NULL, 'sold', 'patrick', '', '', 2495.00, false, false, NULL, NULL),
('2024-12-02', 'google', 'Edbenavidescitroen', '(917) 214-5116', 'Edbenavidescitroen@gmail.com', NULL, 'sold', 'patrick', '', '', 5495.00, false, false, NULL, NULL),
('2024-12-19', 'google', 'Christian', '(786) 394-7087', 'Brinzicorp@gmail.com', NULL, 'sold', 'patrick', '', '', 595.00, false, false, NULL, NULL);