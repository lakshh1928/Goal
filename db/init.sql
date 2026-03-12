CREATE DATABASE IF NOT EXISTS goal_list;
USE goal_list;

CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('Financial','Academic','Health','Personal','Other') NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_progress DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
