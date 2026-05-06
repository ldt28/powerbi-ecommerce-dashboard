CREATE TABLE `export_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`format` enum('csv','excel','pdf') NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`time` varchar(5) NOT NULL,
	`emailRecipients` text NOT NULL,
	`includeMetrics` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `export_schedules_id` PRIMARY KEY(`id`)
);
