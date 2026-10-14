-- Migration patch to add RENTAL payment support to the shared payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rental_id BIGINT;

-- Foreign key referencing rental items (supports either "RentalItems" or rental_item table depending on environment)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'RentalItems') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_payments_rental') THEN
            ALTER TABLE payments ADD CONSTRAINT fk_payments_rental FOREIGN KEY (rental_id) REFERENCES "RentalItems"(id) ON DELETE SET NULL;
        END IF;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rental_item') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_payments_rental') THEN
            ALTER TABLE payments ADD CONSTRAINT fk_payments_rental FOREIGN KEY (rental_id) REFERENCES rental_item(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Partial index for fast lookups by rental_id
CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments(rental_id) WHERE rental_id IS NOT NULL;

-- Update payment_party check constraint to include RENTAL
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_party;
ALTER TABLE payments ADD CONSTRAINT chk_payments_party CHECK (payment_party IN ('CUSTOMER', 'SUPPLIER', 'AUDIT', 'STAFF', 'RENTAL'));

-- Update payment party relation check constraint to enforce rental_id IS NOT NULL for RENTAL
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_party_relation;
ALTER TABLE payments ADD CONSTRAINT chk_payments_party_relation CHECK (
    (payment_party = 'CUSTOMER' AND customer_id IS NOT NULL) OR
    (payment_party = 'SUPPLIER' AND supplier_id IS NOT NULL) OR
    (payment_party = 'STAFF'    AND staff_id IS NOT NULL)    OR
    (payment_party = 'RENTAL'   AND rental_id IS NOT NULL)   OR
    (payment_party = 'AUDIT')
);
