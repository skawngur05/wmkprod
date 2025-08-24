-- Create installers table for WMK Kitchen Solutions
-- This table stores information about installation team members

CREATE TABLE installers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
    hire_date DATE,
    hourly_rate DECIMAL(10, 2),
    specialty VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_installers_status (status),
    INDEX idx_installers_hire_date (hire_date),
    INDEX idx_installers_email (email),
    INDEX idx_installers_name (name)
);

-- Insert sample installer data
INSERT INTO installers (id, name, phone, email, status, hire_date, hourly_rate, specialty, notes) VALUES
(UUID(), 'Angel Rodriguez', '(555) 123-4567', 'angel@wmk-kitchen.com', 'active', '2023-01-15', 28.50, 'Cabinet Installation, Countertops', 'Senior installer with 8 years experience. Excellent with custom work.'),
(UUID(), 'Brian Thompson', '(555) 234-5678', 'brian@wmk-kitchen.com', 'active', '2023-06-01', 25.00, 'Tile Work, Backsplashes', 'Specialized in tile and backsplash installation. Very detail-oriented.'),
(UUID(), 'Luis Martinez', '(555) 345-6789', 'luis@wmk-kitchen.com', 'active', '2024-02-10', 24.00, 'General Installation, Plumbing', 'Newest team member, quick learner with plumbing background.');

-- Show the created table structure
DESCRIBE installers;
