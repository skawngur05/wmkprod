CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`all_day` boolean NOT NULL DEFAULT false,
	`description` text,
	`location` varchar(255),
	`assigned_to` varchar(255),
	`related_lead_id` int,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `completed_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int NOT NULL,
	`customer_name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`email` varchar(100),
	`address` text,
	`project_amount` decimal(10,2) DEFAULT '0.00',
	`deposit_paid` boolean DEFAULT false,
	`balance_paid` boolean DEFAULT false,
	`installation_date` date,
	`completion_date` date NOT NULL,
	`assigned_installer` varchar(100),
	`notes` text,
	`original_lead_origin` enum('Facebook','Google Text','Instagram','Trade Show','WhatsApp','Commercial','Referral'),
	`original_date_created` date,
	`original_assigned_to` enum('Kim','Patrick','Lina'),
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `completed_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`email` varchar(100),
	`status` enum('active','inactive') DEFAULT 'active',
	`hire_date` date,
	`hourly_rate` decimal(10,2),
	`specialty` text,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`email` varchar(100),
	`lead_origin` enum('Facebook','Google Text','Instagram','Trade Show','WhatsApp','Commercial','Referral','Website') NOT NULL,
	`date_created` date NOT NULL,
	`next_followup_date` date,
	`remarks` enum('Not Interested','Not Service Area','Not Compatible','Sold','In Progress','New') DEFAULT 'New',
	`assigned_to` enum('Kim','Patrick','Lina') NOT NULL,
	`notes` text,
	`additional_notes` text,
	`project_amount` decimal(10,2) DEFAULT '0.00',
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	`deposit_paid` boolean DEFAULT false,
	`balance_paid` boolean DEFAULT false,
	`installation_date` date,
	`assigned_installer` varchar(100),
	`address` text,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repair_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int,
	`customer_name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(255),
	`address` text NOT NULL,
	`issue_description` text NOT NULL,
	`priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
	`status` enum('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending',
	`date_reported` date NOT NULL,
	`completion_date` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repair_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sample_booklets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_number` varchar(100) NOT NULL,
	`customer_name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`product_type` enum('Demo Kit & Sample Booklet','Sample Booklet Only','Trial Kit','Demo Kit Only') NOT NULL,
	`tracking_number` varchar(100),
	`status` enum('Pending','Shipped','Delivered','Refunded') DEFAULT 'Pending',
	`date_ordered` date NOT NULL,
	`date_shipped` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sample_booklets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_id` varchar(128) NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`user_agent` text,
	`login_time` timestamp NOT NULL DEFAULT current_timestamp(),
	`last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	`is_active` boolean DEFAULT true,
	`logout_time` timestamp,
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`full_name` varchar(100) NOT NULL,
	`email` varchar(100),
	`role` enum('installer','sales_rep','manager','owner','admin','administrator') NOT NULL DEFAULT 'sales_rep',
	`permissions` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`last_login` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
