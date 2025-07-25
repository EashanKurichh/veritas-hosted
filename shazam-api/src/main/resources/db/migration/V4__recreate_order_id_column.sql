-- Drop the existing column
ALTER TABLE ticket_assignment DROP COLUMN order_id;
 
-- Add the column back with correct type
ALTER TABLE ticket_assignment ADD COLUMN order_id VARCHAR(255) NOT NULL; 