ALTER TABLE `activity_log` ADD CONSTRAINT `activity_log_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_log` ADD CONSTRAINT `activity_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ad_spend_data` ADD CONSTRAINT `ad_spend_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_audit_log` ADD CONSTRAINT `admin_audit_log_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_audit_log` ADD CONSTRAINT `admin_audit_log_targetUserId_users_id_fk` FOREIGN KEY (`targetUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_alerts` ADD CONSTRAINT `anomaly_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_connections` ADD CONSTRAINT `api_connections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_credentials` ADD CONSTRAINT `api_credentials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attribution_models` ADD CONSTRAINT `attribution_models_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohorts` ADD CONSTRAINT `cohorts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `custom_dashboards` ADD CONSTRAINT `custom_dashboards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `custom_dashboards` ADD CONSTRAINT `custom_dashboards_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_journey_events` ADD CONSTRAINT `customer_journey_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_access` ADD CONSTRAINT `dashboard_access_dashboardId_custom_dashboards_id_fk` FOREIGN KEY (`dashboardId`) REFERENCES `custom_dashboards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_access` ADD CONSTRAINT `dashboard_access_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_access` ADD CONSTRAINT `dashboard_access_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_access` ADD CONSTRAINT `dashboard_access_grantedBy_users_id_fk` FOREIGN KEY (`grantedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_alerts` ADD CONSTRAINT `dashboard_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_alerts` ADD CONSTRAINT `dashboard_alerts_metricCardId_metric_cards_id_fk` FOREIGN KEY (`metricCardId`) REFERENCES `metric_cards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_configs` ADD CONSTRAINT `dashboard_configs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_exports` ADD CONSTRAINT `dashboard_exports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_exports` ADD CONSTRAINT `dashboard_exports_configId_dashboard_configs_id_fk` FOREIGN KEY (`configId`) REFERENCES `dashboard_configs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_sharing` ADD CONSTRAINT `dashboard_sharing_dashboardId_custom_dashboards_id_fk` FOREIGN KEY (`dashboardId`) REFERENCES `custom_dashboards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_sharing` ADD CONSTRAINT `dashboard_sharing_sharedWithUserId_users_id_fk` FOREIGN KEY (`sharedWithUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_sharing` ADD CONSTRAINT `dashboard_sharing_sharedWithTeamId_teams_id_fk` FOREIGN KEY (`sharedWithTeamId`) REFERENCES `teams`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_sharing` ADD CONSTRAINT `dashboard_sharing_sharedBy_users_id_fk` FOREIGN KEY (`sharedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_templates` ADD CONSTRAINT `dashboard_templates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_sync_log` ADD CONSTRAINT `data_sync_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `export_schedules` ADD CONSTRAINT `export_schedules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funnel_analysis` ADD CONSTRAINT `funnel_analysis_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_cards` ADD CONSTRAINT `metric_cards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_cards` ADD CONSTRAINT `metric_cards_configId_dashboard_configs_id_fk` FOREIGN KEY (`configId`) REFERENCES `dashboard_configs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_filters` ADD CONSTRAINT `metric_filters_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_filters` ADD CONSTRAINT `metric_filters_metricCardId_metric_cards_id_fk` FOREIGN KEY (`metricCardId`) REFERENCES `metric_cards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_thresholds` ADD CONSTRAINT `metric_thresholds_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_thresholds` ADD CONSTRAINT `metric_thresholds_metricCardId_metric_cards_id_fk` FOREIGN KEY (`metricCardId`) REFERENCES `metric_cards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth2_tokens` ADD CONSTRAINT `oauth2_tokens_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `predictions` ADD CONSTRAINT `predictions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_data` ADD CONSTRAINT `sales_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_dashboards` ADD CONSTRAINT `shared_dashboards_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_dashboards` ADD CONSTRAINT `shared_dashboards_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_activity_log` ADD CONSTRAINT `team_activity_log_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_activity_log` ADD CONSTRAINT `team_activity_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_roles` ADD CONSTRAINT `team_roles_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_defaultDashboardId_custom_dashboards_id_fk` FOREIGN KEY (`defaultDashboardId`) REFERENCES `custom_dashboards`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activity_log_team_id_idx` ON `activity_log` (`teamId`);--> statement-breakpoint
CREATE INDEX `activity_log_user_id_idx` ON `activity_log` (`userId`);--> statement-breakpoint
CREATE INDEX `activity_log_team_id_timestamp_idx` ON `activity_log` (`teamId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `ad_spend_data_user_id_idx` ON `ad_spend_data` (`userId`);--> statement-breakpoint
CREATE INDEX `ad_spend_data_user_id_date_idx` ON `ad_spend_data` (`userId`,`date`);--> statement-breakpoint
CREATE INDEX `admin_audit_log_admin_id_idx` ON `admin_audit_log` (`adminId`);--> statement-breakpoint
CREATE INDEX `admin_audit_log_target_user_id_idx` ON `admin_audit_log` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `anomaly_alerts_user_id_idx` ON `anomaly_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `anomaly_alerts_detected_at_idx` ON `anomaly_alerts` (`detectedAt`);--> statement-breakpoint
CREATE INDEX `api_connections_user_id_idx` ON `api_connections` (`userId`);--> statement-breakpoint
CREATE INDEX `api_credentials_user_id_idx` ON `api_credentials` (`userId`);--> statement-breakpoint
CREATE INDEX `attribution_models_user_id_idx` ON `attribution_models` (`userId`);--> statement-breakpoint
CREATE INDEX `cohorts_user_id_idx` ON `cohorts` (`userId`);--> statement-breakpoint
CREATE INDEX `cohorts_start_date_idx` ON `cohorts` (`startDate`);--> statement-breakpoint
CREATE INDEX `custom_dashboards_user_id_idx` ON `custom_dashboards` (`userId`);--> statement-breakpoint
CREATE INDEX `custom_dashboards_team_id_idx` ON `custom_dashboards` (`teamId`);--> statement-breakpoint
CREATE INDEX `customer_journey_events_user_id_idx` ON `customer_journey_events` (`userId`);--> statement-breakpoint
CREATE INDEX `customer_journey_events_user_id_timestamp_idx` ON `customer_journey_events` (`userId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `customer_journey_events_customer_id_idx` ON `customer_journey_events` (`customerId`);--> statement-breakpoint
CREATE INDEX `dashboard_access_dashboard_id_idx` ON `dashboard_access` (`dashboardId`);--> statement-breakpoint
CREATE INDEX `dashboard_access_user_id_idx` ON `dashboard_access` (`userId`);--> statement-breakpoint
CREATE INDEX `dashboard_access_team_id_idx` ON `dashboard_access` (`teamId`);--> statement-breakpoint
CREATE INDEX `dashboard_alerts_user_id_idx` ON `dashboard_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `dashboard_alerts_metric_card_id_idx` ON `dashboard_alerts` (`metricCardId`);--> statement-breakpoint
CREATE INDEX `dashboard_configs_user_id_idx` ON `dashboard_configs` (`userId`);--> statement-breakpoint
CREATE INDEX `dashboard_exports_user_id_idx` ON `dashboard_exports` (`userId`);--> statement-breakpoint
CREATE INDEX `dashboard_exports_config_id_idx` ON `dashboard_exports` (`configId`);--> statement-breakpoint
CREATE INDEX `dashboard_sharing_dashboard_id_idx` ON `dashboard_sharing` (`dashboardId`);--> statement-breakpoint
CREATE INDEX `dashboard_sharing_shared_with_user_id_idx` ON `dashboard_sharing` (`sharedWithUserId`);--> statement-breakpoint
CREATE INDEX `dashboard_sharing_shared_with_team_id_idx` ON `dashboard_sharing` (`sharedWithTeamId`);--> statement-breakpoint
CREATE INDEX `dashboard_templates_user_id_idx` ON `dashboard_templates` (`userId`);--> statement-breakpoint
CREATE INDEX `data_sync_log_user_id_idx` ON `data_sync_log` (`userId`);--> statement-breakpoint
CREATE INDEX `export_schedules_user_id_idx` ON `export_schedules` (`userId`);--> statement-breakpoint
CREATE INDEX `funnel_analysis_user_id_idx` ON `funnel_analysis` (`userId`);--> statement-breakpoint
CREATE INDEX `metric_cards_user_id_idx` ON `metric_cards` (`userId`);--> statement-breakpoint
CREATE INDEX `metric_cards_config_id_idx` ON `metric_cards` (`configId`);--> statement-breakpoint
CREATE INDEX `metric_filters_user_id_idx` ON `metric_filters` (`userId`);--> statement-breakpoint
CREATE INDEX `metric_filters_metric_card_id_idx` ON `metric_filters` (`metricCardId`);--> statement-breakpoint
CREATE INDEX `metric_thresholds_user_id_idx` ON `metric_thresholds` (`userId`);--> statement-breakpoint
CREATE INDEX `metric_thresholds_metric_card_id_idx` ON `metric_thresholds` (`metricCardId`);--> statement-breakpoint
CREATE INDEX `oauth2_tokens_user_id_idx` ON `oauth2_tokens` (`userId`);--> statement-breakpoint
CREATE INDEX `oauth2_tokens_user_id_platform_idx` ON `oauth2_tokens` (`userId`,`platform`);--> statement-breakpoint
CREATE INDEX `predictions_user_id_idx` ON `predictions` (`userId`);--> statement-breakpoint
CREATE INDEX `predictions_user_id_prediction_date_idx` ON `predictions` (`userId`,`predictionDate`);--> statement-breakpoint
CREATE INDEX `sales_data_user_id_idx` ON `sales_data` (`userId`);--> statement-breakpoint
CREATE INDEX `sales_data_user_id_order_date_idx` ON `sales_data` (`userId`,`orderDate`);--> statement-breakpoint
CREATE INDEX `shared_dashboards_team_id_idx` ON `shared_dashboards` (`teamId`);--> statement-breakpoint
CREATE INDEX `shared_dashboards_created_by_idx` ON `shared_dashboards` (`createdBy`);--> statement-breakpoint
CREATE INDEX `team_activity_log_team_id_idx` ON `team_activity_log` (`teamId`);--> statement-breakpoint
CREATE INDEX `team_activity_log_user_id_idx` ON `team_activity_log` (`userId`);--> statement-breakpoint
CREATE INDEX `team_activity_log_team_id_created_at_idx` ON `team_activity_log` (`teamId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `team_invitations_team_id_idx` ON `team_invitations` (`teamId`);--> statement-breakpoint
CREATE INDEX `team_invitations_invited_by_idx` ON `team_invitations` (`invitedBy`);--> statement-breakpoint
CREATE INDEX `team_members_team_id_idx` ON `team_members` (`teamId`);--> statement-breakpoint
CREATE INDEX `team_members_user_id_idx` ON `team_members` (`userId`);--> statement-breakpoint
CREATE INDEX `team_members_team_id_user_id_idx` ON `team_members` (`teamId`,`userId`);--> statement-breakpoint
CREATE INDEX `team_roles_team_id_idx` ON `team_roles` (`teamId`);--> statement-breakpoint
CREATE INDEX `teams_owner_id_idx` ON `teams` (`ownerId`);--> statement-breakpoint
CREATE INDEX `user_preferences_default_dashboard_id_idx` ON `user_preferences` (`defaultDashboardId`);