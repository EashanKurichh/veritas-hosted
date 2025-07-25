-- Drop any foreign key constraints
SET FOREIGN_KEY_CHECKS=0;

-- Create a temporary table with the correct structure
CREATE TABLE ticket_assignment_temp (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    concert_id VARCHAR(255) NOT NULL,
    concert_name VARCHAR(255) NOT NULL,
    issued_at DATETIME,
    order_entity_id BIGINT,
    order_id VARCHAR(255) NOT NULL,
    ticket_code VARCHAR(255) NOT NULL UNIQUE,
    ticket_type VARCHAR(255) NOT NULL,
    used BIT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL
);

-- Copy data from the old table to the new one
INSERT INTO ticket_assignment_temp 
SELECT * FROM ticket_assignment;

-- Drop the old table
DROP TABLE ticket_assignment;

-- Rename the temporary table to the original name
RENAME TABLE ticket_assignment_temp TO ticket_assignment;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1; 