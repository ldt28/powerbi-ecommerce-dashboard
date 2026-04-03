CREATE TABLE `anomaly_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricName` varchar(128) NOT NULL,
	`anomalyType` enum('spike','drop','trend_change') NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`expectedValue` decimal(15,2),
	`actualValue` decimal(15,2) NOT NULL,
	`deviation` decimal(10,2),
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`isResolved` int NOT NULL DEFAULT 0,
	`resolvedAt` timestamp,
	`notes` text,
	CONSTRAINT `anomaly_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attribution_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversionId` varchar(255) NOT NULL,
	`customerId` varchar(255) NOT NULL,
	`modelType` enum('first_touch','last_touch','linear','time_decay','position_based') NOT NULL,
	`touchpointCount` int NOT NULL DEFAULT 0,
	`conversionValue` decimal(15,2) NOT NULL,
	`attributedValue` decimal(15,2),
	`touchpoints` text,
	`firstTouchSource` varchar(64),
	`lastTouchSource` varchar(64),
	`journeyLength` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attribution_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cohorts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cohortName` varchar(255) NOT NULL,
	`cohortType` enum('acquisition_date','first_purchase_value','geographic','demographic','behavioral') NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date,
	`memberCount` int NOT NULL DEFAULT 0,
	`retentionRate` decimal(5,2),
	`avgLifetimeValue` decimal(15,2),
	`avgRepeatPurchases` decimal(10,2),
	`churnRate` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cohorts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_journey_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customerId` varchar(255) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`eventValue` decimal(15,2),
	`source` varchar(64),
	`medium` varchar(64),
	`campaign` varchar(255),
	`deviceType` varchar(64),
	`country` varchar(64),
	`sessionId` varchar(255),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`metadata` text,
	CONSTRAINT `customer_journey_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnel_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`funnelName` varchar(255) NOT NULL,
	`funnelSteps` text NOT NULL,
	`totalSessions` int NOT NULL DEFAULT 0,
	`step1Count` int NOT NULL DEFAULT 0,
	`step2Count` int NOT NULL DEFAULT 0,
	`step3Count` int NOT NULL DEFAULT 0,
	`step4Count` int NOT NULL DEFAULT 0,
	`step5Count` int NOT NULL DEFAULT 0,
	`conversionRate` decimal(5,2),
	`dropoffRate` decimal(5,2),
	`avgTimeInFunnel` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnel_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricName` varchar(128) NOT NULL,
	`predictionDate` date NOT NULL,
	`predictedValue` decimal(15,2) NOT NULL,
	`confidenceInterval` decimal(5,2),
	`lowerBound` decimal(15,2),
	`upperBound` decimal(15,2),
	`modelType` varchar(64),
	`accuracy` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
