CREATE DATABASE IF NOT EXISTS convertx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE convertx;

CREATE TABLE IF NOT EXISTS user_settings (
  user_id    CHAR(36) PRIMARY KEY,
  theme      ENUM('light','dark') NOT NULL DEFAULT 'light',
  decimals   TINYINT UNSIGNED NOT NULL DEFAULT 6,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversion_history (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id      CHAR(36) NOT NULL,
  category     VARCHAR(30) NOT NULL,
  from_unit    VARCHAR(30) NOT NULL,
  to_unit      VARCHAR(30) NOT NULL,
  input_value  VARCHAR(60) NOT NULL,
  result_value VARCHAR(60) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hist_user (user_id, id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id   CHAR(36) NOT NULL,
  category  VARCHAR(30) NOT NULL,
  from_unit VARCHAR(30) NOT NULL,
  to_unit   VARCHAR(30) NOT NULL,
  UNIQUE KEY uq_fav (user_id, category, from_unit, to_unit)
);

CREATE USER IF NOT EXISTS 'convertx'@'localhost' IDENTIFIED BY 'convertx_pass';
GRANT SELECT, INSERT, UPDATE, DELETE ON convertx.* TO 'convertx'@'localhost';
FLUSH PRIVILEGES;
