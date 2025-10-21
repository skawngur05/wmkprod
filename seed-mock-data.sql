-- Mock Data Script for Wrap My Kitchen CRM
-- Default Login: admin / admin123

-- Insert default admin user and other test users
INSERT INTO users (username, password, full_name, email, role, is_active) VALUES
('admin', 'admin123', 'Admin User', 'admin@wrapmykitchen.com', 'admin', true),
('kim', 'password123', 'Kim Johnson', 'kim@wrapmykitchen.com', 'sales_rep', true),
('patrick', 'password123', 'Patrick Smith', 'patrick@wrapmykitchen.com', 'sales_rep', true),
('lina', 'password123', 'Lina Martinez', 'lina@wrapmykitchen.com', 'commercial_sales', true),
('manager', 'manager123', 'Sarah Manager', 'manager@wrapmykitchen.com', 'manager', true);

-- Insert installers
INSERT INTO installers (name, phone, email, status, hire_date, hourly_rate, specialty) VALUES
('Angel', '555-0101', 'angel@wrapmykitchen.com', 'active', '2023-01-15', 45.00, 'Residential installations, kitchen wraps'),
('Brian', '555-0102', 'brian@wrapmykitchen.com', 'active', '2023-03-20', 50.00, 'Commercial projects, large-scale installations'),
('Luis', '555-0103', 'luis@wrapmykitchen.com', 'active', '2023-06-10', 48.00, 'Specialty finishes, custom designs');

-- Insert sample leads with various statuses
INSERT INTO leads (name, phone, email, lead_origin, project_type, date_created, next_followup_date, remarks, assigned_to, notes, project_amount, address) VALUES
('John Anderson', '555-1001', 'john.anderson@email.com', 'Facebook', 'Residential', '2025-10-15', '2025-10-25', 'New', 'Kim', 'Interested in kitchen cabinet wraps, wants modern look', 3500.00, '123 Oak Street, Miami, FL 33101'),
('Sarah Williams', '555-1002', 'sarah.w@email.com', 'Google Text', 'Residential', '2025-10-14', '2025-10-22', 'In Progress', 'Patrick', 'Requested samples, very interested in gray tones', 4200.00, '456 Pine Avenue, Fort Lauderdale, FL 33301'),
('Miami Hotel Group', '555-1003', 'contact@miamihotel.com', 'Commercial', 'Commercial', '2025-10-10', '2025-10-28', 'In Progress', 'Lina', 'Large commercial project, hotel lobby renovation', 25000.00, '789 Beach Blvd, Miami Beach, FL 33139'),
('Robert Chen', '555-1004', 'robert.chen@email.com', 'Referral', 'Residential', '2025-10-12', NULL, 'Sold', 'Kim', 'Referred by previous customer, signed contract', 5500.00, '321 Maple Drive, Coral Gables, FL 33134'),
('Downtown Office LLC', '555-1005', 'info@downtownoffice.com', 'Website', 'Commercial', '2025-10-08', '2025-10-30', 'New', 'Lina', 'Office space renovation, interested in wall wraps', 18000.00, '555 Brickell Avenue, Miami, FL 33131'),
('Emily Rodriguez', '555-1006', 'emily.r@email.com', 'Instagram', 'Residential', '2025-10-05', NULL, 'Not Interested', 'Patrick', 'Price too high, went with competitor', 0.00, '678 Sunset Road, Homestead, FL 33030'),
('Michael Thompson', '555-1007', 'mthompson@email.com', 'Trade Show', 'Residential', '2025-10-01', '2025-10-26', 'Friendly Partner', 'Kim', 'Interior designer, potential for multiple referrals', 0.00, '890 Design Lane, Aventura, FL 33180'),
('Lisa Martinez', '555-1008', 'lisa.martinez@email.com', 'Facebook', 'Residential', '2025-09-28', NULL, 'Sold', 'Patrick', 'Kitchen and bathroom wraps completed', 6800.00, '234 Harbor View, Key Biscayne, FL 33149'),
('Retail Space Inc', '555-1009', 'contact@retailspace.com', 'Commercial', 'Commercial', '2025-09-25', '2025-11-01', 'In Progress', 'Lina', 'Retail store renovation, signage and wall wraps', 32000.00, '777 Shopping Plaza, Aventura, FL 33180'),
('David Park', '555-1010', 'david.park@email.com', 'WhatsApp', 'Residential', '2025-09-20', '2025-10-24', 'New', 'Kim', 'Just moved in, interested in full kitchen wrap', 4500.00, '111 Bay Drive, Miami, FL 33132');

-- Insert leads with installation dates (sold projects)
INSERT INTO leads (name, phone, email, lead_origin, project_type, date_created, remarks, assigned_to, notes, project_amount, deposit_paid, balance_paid, installation_date, installation_end_date, assigned_installer, address, selected_colors) VALUES
('Jennifer Brown', '555-1011', 'jbrown@email.com', 'Referral', 'Residential', '2025-09-15', 'Sold', 'Patrick', 'Full kitchen renovation wrap', 7200.00, true, true, '2025-10-28', '2025-10-28', 'Angel', '456 Sunset Blvd, Miami, FL 33125', '["Marble White", "Charcoal Gray"]'),
('Tech Startup HQ', '555-1012', 'facilities@techstartup.com', 'Commercial', 'Commercial', '2025-09-10', 'Sold', 'Lina', 'Office space makeover, walls and furniture', 28500.00, true, false, '2025-11-05', '2025-11-07', 'Brian', '999 Innovation Drive, Miami, FL 33130', '["Modern Black", "Tech Blue"]'),
('Carlos Ramirez', '555-1013', 'carlos.r@email.com', 'Google Text', 'Residential', '2025-09-05', 'Sold', 'Kim', 'Kitchen cabinets and island wrap', 5800.00, true, true, '2025-10-30', '2025-10-30', 'Luis', '888 Palm Court, Coconut Grove, FL 33133', '["Natural Oak", "Cream White"]');

-- Insert calendar events
INSERT INTO calendar_events (title, type, start_date, end_date, all_day, description, location, assigned_to, related_lead_id) VALUES
('Installation - Jennifer Brown Kitchen', 'installation', '2025-10-28 09:00:00', '2025-10-28 17:00:00', false, 'Full kitchen wrap installation', '456 Sunset Blvd, Miami, FL 33125', 'Angel', NULL),
('Installation - Tech Startup HQ', 'installation', '2025-11-05 08:00:00', '2025-11-07 17:00:00', false, 'Office space renovation', '999 Innovation Drive, Miami, FL 33130', 'Brian', NULL),
('Installation - Carlos Ramirez', 'installation', '2025-10-30 09:00:00', '2025-10-30 16:00:00', false, 'Kitchen cabinets wrap', '888 Palm Court, Coconut Grove, FL 33133', 'Luis', NULL),
('Holiday - Thanksgiving', 'holiday', '2025-11-27 00:00:00', '2025-11-28 23:59:59', true, 'Office closed for Thanksgiving', NULL, NULL, NULL),
('Trade Show - Miami Home Expo', 'trade-show', '2025-11-15 09:00:00', '2025-11-16 18:00:00', false, 'Annual home improvement expo', 'Miami Convention Center', NULL, NULL),
('Angel - Vacation', 'leave', '2025-12-20 00:00:00', '2025-12-31 23:59:59', true, 'Annual vacation', NULL, 'Angel', NULL);

-- Insert sample booklets orders
INSERT INTO sample_booklets (order_number, customer_name, address, email, phone, product_type, tracking_number, status, date_ordered, date_shipped, notes) VALUES
('WMK-2025-001', 'Amanda Cooper', '123 Test Street, Miami, FL 33101', 'amanda.cooper@email.com', '555-2001', 'Sample Booklet Only', 'USPS9205590123456789', 'Delivered', '2025-10-01', '2025-10-02', 'Customer requested rush delivery'),
('WMK-2025-002', 'Brian Foster', '456 Sample Ave, Fort Lauderdale, FL 33301', 'brian.f@email.com', '555-2002', 'Demo Kit & Sample Booklet', 'USPS9205590987654321', 'Shipped', '2025-10-15', '2025-10-16', 'Demo kit for commercial client'),
('WMK-2025-003', 'Christina Lee', '789 Order Lane, Boca Raton, FL 33432', 'christina.lee@email.com', '555-2003', 'Trial Kit', NULL, 'Pending', '2025-10-20', NULL, 'Waiting for inventory'),
('WMK-2025-004', 'Daniel White', '321 Sample Court, Delray Beach, FL 33444', 'daniel.w@email.com', '555-2004', 'Demo Kit Only', 'USPS9205590555666777', 'Delivered', '2025-10-10', '2025-10-11', 'Interior designer sample');

-- Insert completed projects
INSERT INTO completed_projects (lead_id, customer_name, phone, email, address, project_amount, deposit_paid, balance_paid, installation_date, completion_date, assigned_installer, notes, original_lead_origin, original_date_created, original_assigned_to) VALUES
(8, 'Lisa Martinez', '555-1008', 'lisa.martinez@email.com', '234 Harbor View, Key Biscayne, FL 33149', 6800.00, true, true, '2025-09-30', '2025-09-30', 'Angel', 'Kitchen and bathroom wraps completed successfully', 'Facebook', '2025-09-28', 'Patrick'),
(4, 'Robert Chen', '555-1004', 'robert.chen@email.com', '321 Maple Drive, Coral Gables, FL 33134', 5500.00, true, true, '2025-10-05', '2025-10-05', 'Luis', 'Excellent customer, very satisfied', 'Referral', '2025-10-12', 'Kim');

-- Insert repair requests
INSERT INTO repair_requests (project_id, customer_name, phone, email, address, issue_description, priority, status, date_reported, notes) VALUES
(1, 'Lisa Martinez', '555-1008', 'lisa.martinez@email.com', '234 Harbor View, Key Biscayne, FL 33149', 'Small corner lifting on bathroom cabinet', 'Low', 'Pending', '2025-10-18', 'Scheduled for next available installer visit'),
(2, 'Robert Chen', '555-1004', 'robert.chen@email.com', '321 Maple Drive, Coral Gables, FL 33134', 'Minor bubble on kitchen island wrap', 'Medium', 'In Progress', '2025-10-15', 'Angel assigned to fix during follow-up visit');

-- Insert SMTP settings (example configuration)
INSERT INTO smtp_settings (name, host, port, secure, username, password, from_email, from_name, is_active) VALUES
('Gmail SMTP', 'smtp.gmail.com', 465, true, 'notifications@wrapmykitchen.com', 'app_password_here', 'notifications@wrapmykitchen.com', 'Wrap My Kitchen', true);

-- Insert email templates
INSERT INTO email_templates (name, subject, body, template_type, is_active) VALUES
('Follow-up Reminder', 'Follow-up: Your Wrap My Kitchen Project', 'Hi {{customer_name}},\n\nThank you for your interest in Wrap My Kitchen! We wanted to follow up on your project inquiry.\n\n{{custom_message}}\n\nBest regards,\nWrap My Kitchen Team', 'follow_up', true),
('Installation Reminder', 'Your Installation is Scheduled', 'Hi {{customer_name}},\n\nThis is a reminder that your installation is scheduled for {{installation_date}}.\n\nInstaller: {{installer_name}}\nTime: {{installation_time}}\n\nPlease ensure the area is clear and accessible.\n\nThank you,\nWrap My Kitchen', 'installation_reminder', true),
('Repair Notification', 'Repair Request Update', 'Hi {{customer_name}},\n\nWe have received your repair request and are working to resolve it.\n\nIssue: {{issue_description}}\nStatus: {{status}}\n\nWe will keep you updated on the progress.\n\nBest regards,\nWrap My Kitchen', 'repair_notification', true);

-- Insert activity logs
INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES
(1, 'user_login', 'Admin user logged in', '127.0.0.1'),
(2, 'lead_created', 'Created new lead: John Anderson', '127.0.0.1'),
(3, 'lead_updated', 'Updated lead status for Sarah Williams', '127.0.0.1'),
(4, 'lead_created', 'Created new commercial lead: Miami Hotel Group', '127.0.0.1'),
(5, 'user_login', 'Manager user logged in', '127.0.0.1');
