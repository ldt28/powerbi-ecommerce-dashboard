CREATE TABLE `dashboard_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricCardId` int NOT NULL,
	`alertType` enum('warning','critical') NOT NULL,
	`currentValue` decimal(15,2) NOT NULL,
	`thresholdValue` decimal(15,2) NOT NULL,
	`message` text,
	`isResolved` int NOT NULL DEFAULT 0,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboard_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`configName` varchar(255) NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`layout` text NOT NULL,
	`metrics` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`configId` int NOT NULL,
	`exportFormat` enum('csv','pdf','json') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`fileUrl` text,
	`exportedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboard_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`templateDescription` text,
	`templateConfig` text NOT NULL,
	`isPublic` int NOT NULL DEFAULT 0,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metric_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`configId` int NOT NULL,
	`metricKey` varchar(255) NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`isVisible` int NOT NULL DEFAULT 1,
	`cardColor` varchar(7) NOT NULL DEFAULT '#ffffff',
	`backgroundColor` varchar(7) NOT NULL DEFAULT '#f5f5f5',
	`textColor` varchar(7) NOT NULL DEFAULT '#000000',
	`cardSize` enum('small','medium','large') NOT NULL DEFAULT 'medium',
	`showTrend` int NOT NULL DEFAULT 1,
	`showComparison` int NOT NULL DEFAULT 0,
	`comparisonPeriod` enum('day','week','month','quarter','year') DEFAULT 'month',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metric_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metric_filters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricCardId` int NOT NULL,
	`filterType` enum('date_range','category','region','product','custom') NOT NULL,
	`filterValue` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metric_filters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metric_thresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricCardId` int NOT NULL,
	`targetValue` decimal(15,2),
	`warningThreshold` decimal(15,2),
	`criticalThreshold` decimal(15,2),
	`thresholdType` enum('above','below','range') NOT NULL DEFAULT 'above',
	`alertEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metric_thresholds_id` PRIMARY KEY(`id`)
);
