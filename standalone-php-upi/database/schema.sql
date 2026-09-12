-- ==============================================================================
-- Production-Ready UPI Payment Checkout System Database Schema
-- Charset: utf8mb4, Engine: InnoDB
-- Strict Foreign Keys, Indexes & Timestamps
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `upi_checkout` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `upi_checkout`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'moderator') NOT NULL DEFAULT 'admin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_login` (`username`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(5) NOT NULL DEFAULT 'INR',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) NULL,
  `customer_email` VARCHAR(150) NULL,
  `customer_phone` VARCHAR(20) NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(5) NOT NULL DEFAULT 'INR',
  `status` ENUM('pending', 'processing', 'paid', 'failed', 'cancelled', 'manual_review', 'refunded') NOT NULL DEFAULT 'pending',
  `customer_session_id` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  INDEX `idx_order_status` (`status`),
  INDEX `idx_order_expires` (`expires_at`),
  INDEX `idx_order_created` (`created_at`),
  CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `provider` VARCHAR(50) NOT NULL DEFAULT 'upi_direct',
  `provider_payment_id` VARCHAR(100) NULL,
  `transaction_id` VARCHAR(100) NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(5) NOT NULL DEFAULT 'INR',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'upi',
  `status` ENUM('pending', 'processing', 'paid', 'failed', 'manual_review', 'refunded') NOT NULL DEFAULT 'pending',
  `raw_reference` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_payment_order_id` (`order_id`),
  INDEX `idx_payment_txn_id` (`transaction_id`),
  INDEX `idx_payment_status` (`status`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payment Events (Webhook logging & audit trail)
CREATE TABLE IF NOT EXISTS `payment_events` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `signature` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_events_order` (`order_id`),
  INDEX `idx_events_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payment Proofs (Screenshot uploads)
CREATE TABLE IF NOT EXISTS `payment_proofs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(50) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `utr_reference` VARCHAR(50) NULL,
  `ip_address` VARCHAR(45) NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_proof_order_id` (`order_id`),
  INDEX `idx_proof_status` (`status`),
  CONSTRAINT `fk_proofs_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Manual Reviews (Admin review workflow records)
CREATE TABLE IF NOT EXISTS `manual_reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `proof_id` INT UNSIGNED NULL,
  `review_status` ENUM('queued', 'under_review', 'approved', 'rejected') NOT NULL DEFAULT 'queued',
  `admin_notes` TEXT NULL,
  `reviewed_by` INT UNSIGNED NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_manual_order` (`order_id`),
  INDEX `idx_manual_status` (`review_status`),
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_proof` FOREIGN KEY (`proof_id`) REFERENCES `payment_proofs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_review_admin` FOREIGN KEY (`reviewed_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Admin Logs (Auditing actions)
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(50) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_logs_admin` (`admin_id`),
  INDEX `idx_logs_action` (`action`),
  CONSTRAINT `fk_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- Seed Initial Sample Data
-- Default SuperAdmin: admin / Admin@123456
-- Sample Product: ₹149 VIP Access
-- ==============================================================================

INSERT INTO `admins` (`username`, `email`, `password_hash`, `role`) VALUES
('admin', 'admin@example.com', '$2y$12$e6mZt6wG7g8iG4R0yQcQo.W4QW.rK/eO4g6K5d6e2p.s2Y0y1gM2q', 'superadmin')
ON DUPLICATE KEY UPDATE `username` = `username`;

INSERT INTO `products` (`id`, `product_code`, `name`, `description`, `amount`, `currency`, `status`) VALUES
(1, 'VIP-149', 'VIP Exclusive Access Pack', 'Lifetime VIP access to exclusive photo set and video collection.', 149.00, 'INR', 'active')
ON DUPLICATE KEY UPDATE `product_code` = `product_code`;
