ALTER TABLE `completed_projects` MODIFY COLUMN `installation_date` varchar(10);--> statement-breakpoint
ALTER TABLE `completed_projects` MODIFY COLUMN `completion_date` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `completed_projects` MODIFY COLUMN `original_date_created` varchar(10);--> statement-breakpoint
ALTER TABLE `installers` MODIFY COLUMN `hire_date` varchar(10);--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `date_created` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `next_followup_date` varchar(10);--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `pickup_date` varchar(10);--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `installation_date` varchar(10);--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `installation_end_date` varchar(10);--> statement-breakpoint
ALTER TABLE `repair_requests` MODIFY COLUMN `date_reported` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `repair_requests` MODIFY COLUMN `completion_date` varchar(10);--> statement-breakpoint
ALTER TABLE `sample_booklets` MODIFY COLUMN `date_ordered` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `sample_booklets` MODIFY COLUMN `date_shipped` varchar(10);--> statement-breakpoint
ALTER TABLE `calendar_events` ADD `color` varchar(7);