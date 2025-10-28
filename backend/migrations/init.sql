CREATE DATABASE IF NOT EXISTS smart_tax;
USE smart_tax;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  passwordHash VARCHAR(255),
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255),
  filepath VARCHAR(1024),
  ocrText LONGTEXT,
  extractedJson JSON,
  createdAt DATETIME,
  updatedAt DATETIME,
  UserId INT,
  FOREIGN KEY (UserId) REFERENCES users(id)
);

CREATE TABLE tax_returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assessmentYear VARCHAR(20),
  regime VARCHAR(20),
  computedTax JSON,
  itrJson JSON,
  pdfPath VARCHAR(1024),
  createdAt DATETIME,
  updatedAt DATETIME,
  UserId INT,
  DocumentId INT,
  FOREIGN KEY (UserId) REFERENCES users(id),
  FOREIGN KEY (DocumentId) REFERENCES documents(id)
);
