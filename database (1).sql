-- FarmDirect Complete Database Schema
-- Run this on a fresh MySQL/MariaDB database named 'farmdirect'

CREATE DATABASE IF NOT EXISTS farmdirect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmdirect;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  username     VARCHAR(100) UNIQUE NOT NULL,
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('buyer','farmer','admin') DEFAULT 'buyer',
  contact      VARCHAR(50),
  address      TEXT,
  age          INT,
  status       ENUM('pending','active','suspended','rejected') DEFAULT 'pending',
  profile_pic  VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default admin account (password: admin123 — CHANGE IN PRODUCTION)
INSERT IGNORE INTO users (username, full_name, email, password, role, status)
VALUES ('admin', 'Admin', 'admin@farmdirect.ph',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAoXiWxBsn4L2RqO', 'admin', 'active');

-- ── FARMER PROFILES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT UNIQUE NOT NULL,
  store_name     VARCHAR(255) NOT NULL DEFAULT '',
  store_photo    VARCHAR(255),
  farm_location  VARCHAR(255) DEFAULT '',
  province       VARCHAR(100) DEFAULT '',
  bio            TEXT,
  gcash_number   VARCHAR(50),
  paymaya_number VARCHAR(50),
  id_photo       VARCHAR(255),
  face_photo     VARCHAR(255),
  rating         DECIMAL(3,2) DEFAULT 0.00,
  total_sales    DECIMAL(12,2) DEFAULT 0.00,
  is_verified    TINYINT(1) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── BUYER PROFILES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buyer_profiles (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  user_id              INT UNIQUE NOT NULL,
  delivery_address     TEXT DEFAULT '',
  city                 VARCHAR(100) DEFAULT '',
  province             VARCHAR(100) DEFAULT '',
  preferred_categories VARCHAR(500),
  id_photo             VARCHAR(255),
  face_photo           VARCHAR(255),
  total_orders         INT DEFAULT 0,
  total_spent          DECIMAL(12,2) DEFAULT 0.00,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id    INT NOT NULL,
  name         VARCHAR(255) NOT NULL,
  variety      VARCHAR(100),
  description  TEXT,
  category     VARCHAR(100) NOT NULL DEFAULT 'Others',
  price        DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(50) DEFAULT 'kg',
  stock_qty    INT DEFAULT 0,
  harvest_date DATE,
  availability ENUM('Onhand','Pre-order','Out of Stock') DEFAULT 'Onhand',
  photo        VARCHAR(255),
  is_active    TINYINT(1) DEFAULT 1,
  is_deleted   TINYINT(1) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  unique_order_id  VARCHAR(20) UNIQUE NOT NULL,
  buyer_id         INT NOT NULL,
  farmer_id        INT NOT NULL,
  total_amount     DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) DEFAULT 50.00,
  grand_total      DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  rider_phone      VARCHAR(50),
  payment_method   ENUM('pay_later','gcash','paymaya','cash_on_delivery') DEFAULT 'pay_later',
  latitude         DECIMAL(10,7),
  longitude        DECIMAL(10,7),
  status           ENUM('pending','process','packed','in_transit','delivered','cancelled') DEFAULT 'pending',
  cancel_reason    TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id)  REFERENCES users(id),
  FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- ── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  qty         INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  order_id     INT NOT NULL,
  buyer_id     INT NOT NULL,
  method       VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100),
  amount       DECIMAL(10,2) NOT NULL,
  status       ENUM('pending','verified','rejected') DEFAULT 'pending',
  receipt_photo VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id),
  FOREIGN KEY (buyer_id)  REFERENCES users(id)
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT NOT NULL,
  buyer_id    INT NOT NULL,
  farmer_id   INT NOT NULL,
  product_id  INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (order_id, buyer_id, product_id),
  FOREIGN KEY (order_id)   REFERENCES orders(id),
  FOREIGN KEY (buyer_id)   REFERENCES users(id),
  FOREIGN KEY (farmer_id)  REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── ANALYTICS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id    INT NOT NULL,
  month        TINYINT NOT NULL,
  year         SMALLINT NOT NULL,
  total_sales  DECIMAL(12,2) DEFAULT 0.00,
  total_orders INT DEFAULT 0,
  UNIQUE KEY unique_month (farmer_id, month, year),
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── COMMISSIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  order_id       INT NOT NULL,
  farmer_id      INT NOT NULL,
  order_total    DECIMAL(10,2) NOT NULL,
  rate           DECIMAL(5,2) DEFAULT 5.00,
  commission_amt DECIMAL(10,2) NOT NULL,
  status         ENUM('pending','paid') DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id),
  FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- ── CANCEL ORDERS LOG ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cancel_orders (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  order_id          INT NOT NULL,
  requested_by      INT NOT NULL,
  reason            VARCHAR(255),
  additional_reason TEXT,
  status            ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)      REFERENCES orders(id),
  FOREIGN KEY (requested_by)  REFERENCES users(id)
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_farmer   ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer     ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
