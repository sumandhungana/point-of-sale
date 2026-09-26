CREATE TABLE payments (
                          id BIGSERIAL PRIMARY KEY,
                          member_id BIGINT NOT NULL,
                          user_id BIGINT NOT NULL,
                          payment_party VARCHAR(32) NOT NULL,
                          customer_id BIGINT,
                          staff_id BIGINT,
                          supplier_id BIGINT,
                          amount NUMERIC(19, 4) NOT NULL,
                          payment_type VARCHAR(32) NOT NULL,
                          payment_category VARCHAR(32) NOT NULL,
                          bill_path VARCHAR(512),
                          remarks VARCHAR(1000),
                          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMPTZ,
                          created_by VARCHAR(255) NOT NULL,
                          updated_by VARCHAR(255),

    -- Foreign Key Constraints
                          CONSTRAINT fk_payments_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES organization_customers(id) ON DELETE SET NULL,
                          CONSTRAINT fk_payments_staff FOREIGN KEY (staff_id) REFERENCES organization_staff(id) ON DELETE SET NULL,
                          CONSTRAINT fk_payments_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,

    -- Data Integrity Constraints
                          CONSTRAINT chk_payments_amount_positive CHECK (amount > 0),
                          CONSTRAINT chk_payments_party CHECK (payment_party IN ('CUSTOMER', 'SUPPLIER', 'AUDIT', 'STAFF')),
                          CONSTRAINT chk_payments_type CHECK (payment_type IN ('CARD', 'QR', 'CASH')),
                          CONSTRAINT chk_payments_category CHECK (payment_category IN ('GIVEN', 'RECEIVED')),

    -- Conditional FK Nullability Check Constraint
                          CONSTRAINT chk_payments_party_relation CHECK (
                              (payment_party = 'CUSTOMER' AND customer_id IS NOT NULL) OR
                              (payment_party = 'SUPPLIER' AND supplier_id IS NOT NULL) OR
                              (payment_party = 'STAFF'    AND staff_id IS NOT NULL)    OR
                              (payment_party = 'AUDIT')
                              )
);

-- Indexes for optimal lookup performance
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_payments_supplier_id ON payments(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX idx_payments_staff_id ON payments(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX idx_payments_party ON payments(payment_party);
CREATE INDEX idx_payments_created_at ON payments(created_at);