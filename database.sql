CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_wa VARCHAR(20),
    total_amount INT,
    status VARCHAR(20) DEFAULT 'pending',
    items JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);