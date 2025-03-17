CREATE DATABASE IF NOT EXISTS `products_db`;
USE `products_db`;

CREATE TABLE IF NOT EXISTS `products` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

INSERT INTO users (username, password_hash) 
VALUES ('admin', SHA2('admin', 256));

INSERT INTO products (name, price, description) VALUES 
('Produit 1', 19.99, 'Description du produit 1'),
('Produit 2', 29.99, 'Description du produit 2'),
('Produit 3', 9.99, 'Description du produit 3');

