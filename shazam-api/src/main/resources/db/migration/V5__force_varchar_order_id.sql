-- First drop any foreign key constraints if they exist
SET FOREIGN_KEY_CHECKS=0;

-- Drop the column
ALTER TABLE ticket_assignment DROP COLUMN order_id;

-- Add it back as VARCHAR, explicitly cast any existing values
ALTER TABLE ticket_assignment ADD COLUMN order_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1; 