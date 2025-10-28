CREATE DATABASE smart_tax_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_tax_assistant;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  pan VARCHAR(10),
  aadhaar VARCHAR(12),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(512),
  original_name VARCHAR(512),
  file_path VARCHAR(1024),
  doc_type VARCHAR(100), -- e.g., FORM16, BANK_STMT, 26AS
  parsed JSON, -- store parsed JSON output from Gemini/ocr
  status ENUM('uploaded','parsed','error') DEFAULT 'uploaded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tax_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  assessment_year VARCHAR(9), -- e.g., "2024-25"
  taxable_income DECIMAL(15,2),
  tax_liability DECIMAL(15,2),
  tax_payable DECIMAL(15,2),
  tax_paid DECIMAL(15,2),
  details JSON, -- calculations, selected regime, deduction breakdown
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
