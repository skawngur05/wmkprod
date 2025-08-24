-- MySQL Database Schema for WMK React CRM
-- Run this script to create the database tables

CREATE DATABASE IF NOT EXISTS wmk_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wmk_crm;

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'sales_rep'
);

-- Leads table
CREATE TABLE leads (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  lead_origin VARCHAR(100) NOT NULL,
  date_created DATETIME NOT NULL DEFAULT NOW(),
  next_followup_date DATETIME,
  remarks VARCHAR(255) NOT NULL DEFAULT 'new',
  assigned_to VARCHAR(255),
  project_amount DECIMAL(10,2),
  notes TEXT,
  additional_notes TEXT,
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  balance_paid BOOLEAN NOT NULL DEFAULT FALSE,
  installation_date DATETIME,
  assigned_installer VARCHAR(255)
);

-- Sample Booklets table
CREATE TABLE sample_booklets (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(255) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  product_type VARCHAR(100) NOT NULL,
  tracking_number VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  date_ordered DATETIME NOT NULL DEFAULT NOW(),
  date_shipped DATETIME,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_leads_date_created ON leads(date_created);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(remarks);
CREATE INDEX idx_booklets_status ON sample_booklets(status);
CREATE INDEX idx_booklets_date_ordered ON sample_booklets(date_ordered);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, username, password, role) VALUES 
  (UUID(), 'admin', '$2b$10$Z9G9Z9G9Z9G9Z9G9Z9G9ZO7.2P2P2P2P2P2P2P2P2P2P2P2P2P2P2P2P2', 'admin');
