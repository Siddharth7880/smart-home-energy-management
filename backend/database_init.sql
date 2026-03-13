-- Smart Home Energy Management System Database Initialization
-- Run this script after creating the database or let Spring Boot auto-create tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS smart_home_energy;
USE smart_home_energy;

-- The following tables will be auto-created by Spring Boot JPA
-- This script is for reference only

-- Users table structure:
-- CREATE TABLE IF NOT EXISTS users (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     first_name VARCHAR(50),
--     last_name VARCHAR(50),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Roles table structure:
-- CREATE TABLE IF NOT EXISTS roles (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(20) UNIQUE NOT NULL
-- );

-- User-Roles junction table:
-- CREATE TABLE IF NOT EXISTS user_roles (
--     user_id BIGINT,
--     role_id INT,
--     PRIMARY KEY (user_id, role_id),
--     FOREIGN KEY (user_id) REFERENCES users(id),
--     FOREIGN KEY (role_id) REFERENCES roles(id)
-- );

-- Insert default roles (Spring Boot will handle this via code)
-- INSERT IGNORE INTO roles (name) VALUES ('ROLE_USER');
-- INSERT IGNORE INTO roles (name) VALUES ('ROLE_TECHNICIAN');
-- INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');

-- Verify tables were created
SHOW TABLES;

-- Check roles
-- SELECT * FROM roles;
