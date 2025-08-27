CREATE TABLE `wmk_colors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(100),
	`description` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wmk_colors_id` PRIMARY KEY(`id`),
	CONSTRAINT `wmk_colors_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `selected_colors` text;