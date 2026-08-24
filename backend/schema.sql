-- ==========================================================
-- AquaGo Mobile Water Wash - MySQL Production Schema
-- Compatible with MySQL 8.0+ / Render MySQL / Cloud Databases
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'customer',
  `profile_image` VARCHAR(255) NULL,
  `referral_code` VARCHAR(20) NULL UNIQUE,
  `wallet_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employees (Technicians / Washers) Profile Table
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `designation` VARCHAR(100) NOT NULL DEFAULT 'Detailing Specialist',
  `rating` FLOAT NOT NULL DEFAULT 5.0,
  `completed_jobs` INT NOT NULL DEFAULT 0,
  `today_earnings` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_earnings` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(20) NOT NULL DEFAULT 'available',
  `current_location` VARCHAR(255) NULL,
  `latitude` FLOAT NULL,
  `longitude` FLOAT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Customer Vehicles Table
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `brand` VARCHAR(50) NOT NULL,
  `model` VARCHAR(50) NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'sedan',
  `number_plate` VARCHAR(30) NOT NULL,
  `color` VARCHAR(30) NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_vehicles_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Customer Saved Addresses Table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(50) NOT NULL DEFAULT 'Home',
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) NULL,
  `landmark` VARCHAR(100) NULL,
  `city` VARCHAR(50) NOT NULL DEFAULT 'Mysuru',
  `state` VARCHAR(50) NOT NULL DEFAULT 'Karnataka',
  `pincode` VARCHAR(20) NOT NULL,
  `latitude` FLOAT NULL,
  `longitude` FLOAT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_addresses_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Services Table
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 45,
  `price_hatchback` DECIMAL(10, 2) NOT NULL DEFAULT 499.00,
  `price_sedan` DECIMAL(10, 2) NOT NULL DEFAULT 599.00,
  `price_suv` DECIMAL(10, 2) NOT NULL DEFAULT 749.00,
  `price_bike` DECIMAL(10, 2) NOT NULL DEFAULT 249.00,
  `features` JSON NULL,
  `popular` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `icon` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Addons Table
CREATE TABLE IF NOT EXISTS `addons` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 199.00,
  `duration_minutes` INT NOT NULL DEFAULT 15,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Offers & Coupons Table
CREATE TABLE IF NOT EXISTS `offers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `discount_type` VARCHAR(20) NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  `min_order_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` DECIMAL(10, 2) NULL,
  `valid_until` DATETIME NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `service_id` VARCHAR(50) NOT NULL,
  `vehicle_id` VARCHAR(50) NULL,
  `address_id` VARCHAR(50) NULL,
  `employee_id` VARCHAR(50) NULL,
  `customer_name` VARCHAR(100) NULL,
  `customer_phone` VARCHAR(30) NULL,
  `customer_email` VARCHAR(100) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending Verification',
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'online',
  `transaction_id` VARCHAR(100) NULL,
  `booking_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `vehicle_type` VARCHAR(30) NOT NULL DEFAULT 'sedan',
  `vehicle_brand` VARCHAR(50) NULL,
  `vehicle_model` VARCHAR(50) NULL,
  `vehicle_number` VARCHAR(30) NULL,
  `service_address` TEXT NULL,
  `service_latitude` FLOAT NULL,
  `service_longitude` FLOAT NULL,
  `service_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `addons_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `vehicle_condition` VARCHAR(100) NULL,
  `condition_notes` TEXT NULL,
  `special_instructions` TEXT NULL,
  `rejection_reason` TEXT NULL,
  `inspection_notes` TEXT NULL,
  `scratches_dents_notes` TEXT NULL,
  `estimated_duration` VARCHAR(50) NULL DEFAULT '45 mins',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  INDEX `idx_bookings_user` (`user_id`),
  INDEX `idx_bookings_emp` (`employee_id`),
  INDEX `idx_bookings_status` (`status`),
  INDEX `idx_bookings_date` (`booking_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Booking Addons Join Table
CREATE TABLE IF NOT EXISTS `booking_addons` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `addon_id` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Booking Photos (Before/After/Inspection) Table
CREATE TABLE IF NOT EXISTS `booking_photos` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NULL,
  `photo_type` VARCHAR(50) NOT NULL,
  `photo_url` VARCHAR(500) NOT NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  INDEX `idx_photos_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Booking Status History Audit Trail
CREATE TABLE IF NOT EXISTS `booking_status_history` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by` VARCHAR(100) NULL,
  `changed_by_role` VARCHAR(50) NULL,
  `note` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bsh_booking` (`booking_id`),
  INDEX `idx_bsh_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Booking Live Locations Table
CREATE TABLE IF NOT EXISTS `booking_locations` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NULL,
  `latitude` FLOAT NOT NULL,
  `longitude` FLOAT NOT NULL,
  `speed` FLOAT NULL,
  `heading` FLOAT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bl_booking` (`booking_id`),
  INDEX `idx_bl_emp` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Vehicle Inspections Table
CREATE TABLE IF NOT EXISTS `vehicle_inspections` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `exterior_condition` VARCHAR(100) NULL,
  `interior_condition` VARCHAR(100) NULL,
  `existing_scratches` TEXT NULL,
  `dents_notes` TEXT NULL,
  `broken_parts` TEXT NULL,
  `dirty_areas` TEXT NULL,
  `inspection_notes` TEXT NULL,
  `inspected_by` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_vi_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Customer Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` VARCHAR(50) NULL,
  `employee_id` VARCHAR(50) NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NULL,
  `service_quality_rating` INT NULL DEFAULT 5,
  `technician_rating` INT NULL DEFAULT 5,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rev_booking` (`booking_id`),
  INDEX `idx_rev_cust` (`customer_id`),
  INDEX `idx_rev_emp` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  `transaction_id` VARCHAR(100) NULL,
  `razorpay_order_id` VARCHAR(100) NULL,
  `razorpay_payment_id` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  INDEX `idx_payments_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. In-App Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'info',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Business Settings Table
CREATE TABLE IF NOT EXISTS `business_settings` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `business_name` VARCHAR(100) NOT NULL DEFAULT 'AquaGo Wash',
  `phone` VARCHAR(30) NOT NULL DEFAULT '+91 99000 11223',
  `email` VARCHAR(100) NOT NULL DEFAULT 'support@aquago.in',
  `address` TEXT NULL,
  `gst_number` VARCHAR(50) NULL,
  `tax_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
  `is_online_booking_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
