-- Migration to add commercial_sales role to users table
-- This adds support for users who can only see Commercial projects

ALTER TABLE `users` MODIFY COLUMN `role` ENUM('installer', 'sales_rep', 'commercial_sales', 'manager', 'owner', 'admin', 'administrator') NOT NULL DEFAULT 'sales_rep';
