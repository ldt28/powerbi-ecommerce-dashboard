CREATE TABLE `custom_dashboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`layout` text NOT NULL,
	`widgets` text NOT NULL,
	`isPublic` int NOT NULL DEFAULT 0,
	`isTemplate` int NOT NULL DEFAULT 0,
	`templateCategory` varchar(64),
	`viewCount` int NOT NULL DEFAULT 0,
	`lastViewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_dashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_sharing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dashboardId` int NOT NULL,
	`sharedWithUserId` int,
	`sharedWithTeamId` int,
	`permission` enum('view','edit','admin') NOT NULL DEFAULT 'view',
	`sharedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboard_sharing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`type` varchar(64) NOT NULL,
	`category` varchar(64) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`defaultConfig` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_widgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`resourceType` varchar(64) NOT NULL,
	`resourceId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`description` text,
	`permissions` text NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`theme` enum('light','dark','auto') NOT NULL DEFAULT 'auto',
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`dateFormat` varchar(20) NOT NULL DEFAULT 'MM/DD/YYYY',
	`currencySymbol` varchar(5) NOT NULL DEFAULT '$',
	`emailNotifications` int NOT NULL DEFAULT 1,
	`slackNotifications` int NOT NULL DEFAULT 0,
	`slackWebhookUrl` text,
	`defaultDashboardId` int,
	`itemsPerPage` int NOT NULL DEFAULT 20,
	`autoRefreshInterval` int NOT NULL DEFAULT 300,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
