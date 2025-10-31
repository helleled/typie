PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`name` text NOT NULL,
	`avatar_id` text,
	`role` text DEFAULT 'USER' NOT NULL,
	`state` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`avatar_id`) REFERENCES `images`(`id`) ON UPDATE cascade ON DELETE restrict
);

INSERT INTO `__new_users`("id", "email", "password", "name", "avatar_id", "role", "state", "created_at") SELECT "id", "email", "password", "name", "avatar_id", "role", "state", "created_at" FROM `users`;
DROP TABLE `users`;
ALTER TABLE `__new_users` RENAME TO `users`;
PRAGMA foreign_keys=ON;
CREATE INDEX `referral_codes_email_state_idx` ON `users` (`email`,`state`);