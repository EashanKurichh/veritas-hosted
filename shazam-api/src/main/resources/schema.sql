-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    is_oauth_user BOOLEAN DEFAULT FALSE,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    otp VARCHAR(6),
    otp_expiry TIMESTAMP
);

-- Concerts table
CREATE TABLE IF NOT EXISTS concerts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    short_description TEXT,
    artists VARCHAR(255),
    image VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    ticket_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concert gradients table
CREATE TABLE IF NOT EXISTS concert_gradient (
    concert_id VARCHAR(36) NOT NULL,
    gradient VARCHAR(50) NOT NULL,
    FOREIGN KEY (concert_id) REFERENCES concerts(id)
);

-- Ticket types table
CREATE TABLE IF NOT EXISTS ticket_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    concert_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_available INT NOT NULL,
    tickets_sold INT NOT NULL DEFAULT 0,
    FOREIGN KEY (concert_id) REFERENCES concerts(id),
    CONSTRAINT unique_concert_type UNIQUE (concert_id, type)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    concert_id VARCHAR(36) NOT NULL,
    ticket_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    booked_at DATETIME NOT NULL,
    booking_code VARCHAR(36) NOT NULL UNIQUE,
    FOREIGN KEY (concert_id) REFERENCES concerts(id),
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 