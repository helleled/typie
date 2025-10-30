CREATE TABLE `canvas_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`canvas_id` text NOT NULL,
	`shapes` text NOT NULL,
	`update` blob NOT NULL,
	`vector` blob NOT NULL,
	`compacted_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`canvas_id`) REFERENCES `canvases`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `canvas_contents_canvas_id_unique` ON `canvas_contents` (`canvas_id`);
CREATE TABLE `canvas_snapshot_contributors` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `canvas_snapshots`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `canvas_snapshot_contributors_snapshot_id_user_id_unique` ON `canvas_snapshot_contributors` (`snapshot_id`,`user_id`);
CREATE TABLE `canvas_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`canvas_id` text NOT NULL,
	`snapshot` blob NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`canvas_id`) REFERENCES `canvases`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `canvases_canvasId_createdAt_order_idx` ON `canvas_snapshots` (`canvas_id`,`created_at`,`order`);
CREATE TABLE `canvases` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`title` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `canvases_entity_id_idx` ON `canvases` (`entity_id`);
CREATE TABLE `canvases_fts` (
	`id` text NOT NULL,
	`site_id` text NOT NULL,
	`title` text
);

CREATE TABLE `credit_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`code` text NOT NULL,
	`amount` integer NOT NULL,
	`state` text DEFAULT 'AVAILABLE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `credit_codes_code_unique` ON `credit_codes` (`code`);
CREATE TABLE `embeds` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`title` text,
	`description` text,
	`html` text,
	`thumbnail_url` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `embeds_url_unique` ON `embeds` (`url`);
CREATE TABLE `entities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`site_id` text NOT NULL,
	`parent_id` text,
	`slug` text NOT NULL,
	`permalink` text NOT NULL,
	`type` text NOT NULL,
	`order` text NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`visibility` text DEFAULT 'PRIVATE' NOT NULL,
	`availability` text DEFAULT 'PRIVATE' NOT NULL,
	`viewed_at` text,
	`deleted_at` text,
	`purged_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`parent_id`) REFERENCES `entities`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `embeds_userId_state_idx` ON `entities` (`user_id`,`state`);
CREATE INDEX `embeds_siteId_state_idx` ON `entities` (`site_id`,`state`);
CREATE INDEX `embeds_siteId_parentId_state_idx` ON `entities` (`site_id`,`parent_id`,`state`);
CREATE INDEX `embeds_parentId_state_idx` ON `entities` (`parent_id`,`state`);
CREATE INDEX `embeds_userId_viewedAt_idx` ON `entities` (`user_id`,`viewed_at`);
CREATE UNIQUE INDEX `entities_site_id_parent_id_order_unique` ON `entities` (`site_id`,`parent_id`,`order`);
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`format` text NOT NULL,
	`size` integer NOT NULL,
	`path` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `folders_entityId_idx` ON `folders` (`entity_id`);
CREATE TABLE `font_families` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `font_families_user_id_name_unique` ON `font_families` (`user_id`,`name`);
CREATE TABLE `fonts` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`name` text NOT NULL,
	`family_name` text,
	`full_name` text,
	`post_script_name` text,
	`weight` integer NOT NULL,
	`size` integer NOT NULL,
	`path` text NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `font_families`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `fonts_familyId_state_idx` ON `fonts` (`family_id`,`state`);
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`format` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`placeholder` text NOT NULL,
	`path` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_id` text,
	`content` text NOT NULL,
	`color` text NOT NULL,
	`order` text NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `images_userId_state_order_idx` ON `notes` (`user_id`,`state`,`order`);
CREATE INDEX `images_entityId_state_order_idx` ON `notes` (`entity_id`,`state`,`order`);
CREATE UNIQUE INDEX `notes_user_id_order_unique` ON `notes` (`user_id`,`order`);
CREATE TABLE `payment_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	`amount` integer NOT NULL,
	`state` text NOT NULL,
	`due_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `entities_userId_state_idx` ON `payment_invoices` (`user_id`,`state`);
CREATE TABLE `payment_records` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`outcome` text NOT NULL,
	`billing_amount` integer NOT NULL,
	`credit_amount` integer NOT NULL,
	`data` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `payment_invoices`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rule` text NOT NULL,
	`fee` integer NOT NULL,
	`interval` text NOT NULL,
	`availability` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE TABLE `post_anchors` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`node_id` text NOT NULL,
	`name` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `post_anchors_postId_nodeId_unique_idx` ON `post_anchors` (`post_id`,`node_id`);
CREATE TABLE `post_character_count_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`bucket` text NOT NULL,
	`additions` integer DEFAULT 0 NOT NULL,
	`deletions` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `post_character_count_changes_userId_postId_bucket_unique_idx` ON `post_character_count_changes` (`user_id`,`post_id`,`bucket`);
CREATE INDEX `post_character_count_changes_userId_bucket_idx` ON `post_character_count_changes` (`user_id`,`bucket`);
CREATE TABLE `post_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`body` text NOT NULL,
	`text` text NOT NULL,
	`character_count` integer DEFAULT 0 NOT NULL,
	`blob_size` integer DEFAULT 0 NOT NULL,
	`stored_marks` text DEFAULT '[]' NOT NULL,
	`layout_mode` text DEFAULT 'SCROLL' NOT NULL,
	`page_layout` text,
	`note` text DEFAULT '' NOT NULL,
	`update` blob NOT NULL,
	`vector` blob NOT NULL,
	`compacted_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `post_contents_post_id_unique` ON `post_contents` (`post_id`);
CREATE INDEX `post_contents_postId_idx` ON `post_contents` (`post_id`);
CREATE INDEX `post_contents_updatedAt_idx` ON `post_contents` (`updated_at`);
CREATE INDEX `post_contents_compactedAt_idx` ON `post_contents` (`compacted_at`);
CREATE TABLE `post_reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text,
	`device_id` text NOT NULL,
	`emoji` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `post_reactions_postId_createdAt_idx` ON `post_reactions` (`post_id`,`created_at`);
CREATE TABLE `post_snapshot_contributors` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `post_snapshots`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `post_snapshot_contributors_snapshot_id_user_id_unique` ON `post_snapshot_contributors` (`snapshot_id`,`user_id`);
CREATE TABLE `post_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`snapshot` blob NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `post_snapshots_postId_createdAt_order_idx` ON `post_snapshots` (`post_id`,`created_at`,`order`);
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`title` text,
	`subtitle` text,
	`max_width` integer DEFAULT 800 NOT NULL,
	`cover_image_id` text,
	`password` text,
	`content_rating` text DEFAULT 'ALL' NOT NULL,
	`allow_reaction` integer DEFAULT 1 NOT NULL,
	`protect_content` integer DEFAULT 1 NOT NULL,
	`type` text DEFAULT 'NORMAL' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`cover_image_id`) REFERENCES `images`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `posts_entityId_idx` ON `posts` (`entity_id`);
CREATE INDEX `posts_createdAt_idx` ON `posts` (`created_at`);
CREATE INDEX `posts_updatedAt_idx` ON `posts` (`updated_at`);
CREATE TABLE `posts_fts` (
	`id` text NOT NULL,
	`site_id` text NOT NULL,
	`title` text,
	`subtitle` text,
	`text` text
);

CREATE TABLE `preorder_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`amount` integer NOT NULL,
	`state` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE TABLE `preorder_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`wish` text,
	`preorder_payment_id` text NOT NULL,
	`code_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`code_id`) REFERENCES `credit_codes`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `preorder_users_email_unique` ON `preorder_users` (`email`);
CREATE TABLE `referral_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `referral_codes_user_id_unique` ON `referral_codes` (`user_id`);
CREATE UNIQUE INDEX `referral_codes_code_unique` ON `referral_codes` (`code`);
CREATE TABLE `referrals` (
	`id` text PRIMARY KEY NOT NULL,
	`referrer_id` text NOT NULL,
	`referee_id` text NOT NULL,
	`referrer_compensated_at` text,
	`referee_compensated_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`referee_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `referrals_referee_id_unique` ON `referrals` (`referee_id`);
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `referral_codes_userId_state_idx` ON `sites` (`user_id`,`state`);
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE TABLE `user_billing_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`billing_key` text NOT NULL,
	`card_number_hash` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_billing_keys_user_id_unique` ON `user_billing_keys` (`user_id`);
CREATE UNIQUE INDEX `user_billing_keys_billing_key_unique` ON `user_billing_keys` (`billing_key`);
CREATE TABLE `user_in_app_purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`store` text NOT NULL,
	`identifier` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_in_app_purchases_user_id_unique` ON `user_in_app_purchases` (`user_id`);
CREATE UNIQUE INDEX `user_in_app_purchases_store_identifier_unique` ON `user_in_app_purchases` (`store`,`identifier`);
CREATE TABLE `user_marketing_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_marketing_consents_user_id_unique` ON `user_marketing_consents` (`user_id`);
CREATE TABLE `user_payment_credits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_payment_credits_user_id_unique` ON `user_payment_credits` (`user_id`);
CREATE TABLE `user_personal_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`birth_date` text NOT NULL,
	`gender` text NOT NULL,
	`phone_number` text,
	`ci` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_personal_identities_user_id_unique` ON `user_personal_identities` (`user_id`);
CREATE UNIQUE INDEX `user_personal_identities_ci_unique` ON `user_personal_identities` (`ci`);
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`value` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);
CREATE TABLE `user_push_notification_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_push_notification_tokens_token_unique` ON `user_push_notification_tokens` (`token`);
CREATE INDEX `user_push_notification_tokens_userId_idx` ON `user_push_notification_tokens` (`user_id`);
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_sessions_token_unique` ON `user_sessions` (`token`);
CREATE INDEX `user_sessions_userId_idx` ON `user_sessions` (`user_id`);
CREATE TABLE `user_single_sign_ons` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`principal` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_single_sign_ons_user_id_provider_unique` ON `user_single_sign_ons` (`user_id`,`provider`);
CREATE UNIQUE INDEX `user_single_sign_ons_provider_principal_unique` ON `user_single_sign_ons` (`provider`,`principal`);
CREATE TABLE `user_surveys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`value` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `user_surveys_user_id_name_unique` ON `user_surveys` (`user_id`,`name`);
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`name` text NOT NULL,
	`avatar_id` text NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`avatar_id`) REFERENCES `images`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE INDEX `referral_codes_email_state_idx` ON `users` (`email`,`state`);
CREATE TABLE `widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`order` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);

CREATE UNIQUE INDEX `widgets_user_id_order_unique` ON `widgets` (`user_id`,`order`);
CREATE UNIQUE INDEX `widgets_user_id_name_unique` ON `widgets` (`user_id`,`name`);