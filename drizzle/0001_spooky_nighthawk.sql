CREATE TABLE `ad_spend_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`adSpend` decimal(12,2) NOT NULL,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`revenueFromAds` decimal(12,2) NOT NULL,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_spend_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`apiKey` text NOT NULL,
	`apiSecret` text,
	`accessToken` text,
	`refreshToken` text,
	`isActive` int NOT NULL DEFAULT 1,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`syncType` varchar(64) NOT NULL,
	`status` varchar(32) NOT NULL,
	`recordsProcessed` int DEFAULT 0,
	`errorMessage` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_sync_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` varchar(128) NOT NULL,
	`marketplace` varchar(64) NOT NULL,
	`productSku` varchar(128),
	`productName` text,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`revenue` decimal(12,2) NOT NULL,
	`cogs` decimal(12,2),
	`profit` decimal(12,2),
	`orderDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_data_id` PRIMARY KEY(`id`)
);
