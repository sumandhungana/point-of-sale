CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            member_id BIGINT NOT NULL,
                            name VARCHAR(255) NOT NULL,
                            description TEXT,
                            category_type INT NOT NULL DEFAULT 0,
                            created_at TIMESTAMP WITH TIME ZONE,
                            updated_at TIMESTAMP WITH TIME ZONE,
                            created_by VARCHAR(255),
                            updated_by VARCHAR(255),

    -- Foreign key constraint referencing MemberEntity table
                            CONSTRAINT fk_categories_member
                                FOREIGN KEY (member_id)
                                    REFERENCES members(id)
                                    ON DELETE CASCADE
);

-- Index for fast lookup by member and category type
CREATE INDEX idx_categories_member_type ON categories(member_id, category_type);
INSERT INTO categories (
    member_id,
    name,
    description,
    category_type,
    created_at,
    updated_at,
    created_by,
    updated_by
)
VALUES
-- Category Type 0: General (Inventory Products & Services)
(26, 'Electronics', 'Gadgets, devices, and electronic accessories', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(26, 'Groceries', 'Packaged food items and everyday essential goods', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(26, 'Clothing & Apparel', 'Shirts, pants, and general garments', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),

-- Category Type 1: Income
(26, 'Sales Revenue', 'Direct revenue earned from inventory and goods sales', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(26, 'Rental Income', 'Income generated from renting assets or properties', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),

-- Category Type 2: Expense
(26, 'Office Utilities', 'Electricity, water, internet, and office operational bills', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(26, 'Staff Salaries', 'Monthly payroll, bonuses, and staff allowances', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(26, 'Rent & Maintenance', 'Store or warehouse rental fees and maintenance expenses', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),

-- Category Type 3: Purchase
(26, 'Wholesale Stock', 'Bulk inventory purchases from suppliers', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(16, 'Raw Materials', 'Primary goods purchased for manufacturing/assembly', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),

-- Category Type 4: Cashbook
(26, 'Petty Cash In', 'Daily cash receipts and petty cash top-ups', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin'),
(26, 'Petty Cash Out', 'Small daily cash payouts and miscellaneous expenses', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin');