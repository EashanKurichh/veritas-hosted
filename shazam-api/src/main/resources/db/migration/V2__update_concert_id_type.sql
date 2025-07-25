-- Drop dependent tables first
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS concert_gradient;
DROP TABLE IF EXISTS concerts;

-- Recreate concerts table with VARCHAR(36) ID
CREATE TABLE concerts (
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

-- Recreate concert_gradient table
CREATE TABLE concert_gradient (
    concert_id VARCHAR(36) NOT NULL,
    gradient VARCHAR(50) NOT NULL,
    FOREIGN KEY (concert_id) REFERENCES concerts(id)
);

-- Recreate ticket_types table
CREATE TABLE ticket_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    concert_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_available INT NOT NULL,
    tickets_sold INT NOT NULL DEFAULT 0,
    FOREIGN KEY (concert_id) REFERENCES concerts(id),
    CONSTRAINT unique_concert_type UNIQUE (concert_id, type)
);

-- Recreate bookings table
CREATE TABLE bookings (
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