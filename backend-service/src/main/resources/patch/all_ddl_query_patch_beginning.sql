CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          category_id BIGINT,
                          member_id BIGINT,
                          supplier_id BIGINT,
                          item_count DOUBLE PRECISION,
                          unit VARCHAR(50),
                          per_unit_purchase_price NUMERIC(19, 4),
                          gross_purchase_price NUMERIC(19, 4),
                          fixed_selling_price NUMERIC(19, 4),
                          is_tax_included BOOLEAN DEFAULT FALSE,
                          low_stock_alert DOUBLE PRECISION,
                          vat_percentage DOUBLE PRECISION,
                          tax_percentage DOUBLE PRECISION,
                          image_url VARCHAR(500),
                          created_at TIMESTAMPTZ NOT NULL,
                          created_by VARCHAR(255),
                          updated_at TIMESTAMPTZ,
                          updated_by VARCHAR(255),

    -- Foreign Key Constraints
                          CONSTRAINT fk_products_category
                              FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
                          CONSTRAINT fk_products_member
                              FOREIGN KEY (member_id) REFERENCES member (id) ON DELETE SET NULL,

                          CONSTRAINT fk_products_supplier
                              FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
);

-- Indexing foreign keys for optimized queries
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_member_id ON products(member_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);


-- sales bill


-- 1. Create primary key sequence for SalesBillEntity (@GeneratedValue(GeneratedValue.Type.SEQUENCE))
CREATE SEQUENCE IF NOT EXISTS sales_bill_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 2. Create sales_bill table

CREATE TABLE IF NOT EXISTS sales_bill (
                                          id BIGINT PRIMARY KEY DEFAULT nextval('sales_bill_seq'),
                                          bill_number VARCHAR(100) NOT NULL,
                                          bill_date DATE NOT NULL,
                                          product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                                          customer_id INT REFERENCES organization_customers(id) ON DELETE SET NULL,
                                          customer_name VARCHAR(255),
                                          member_id BIGINT NOT NULL REFERENCES member(id) ON DELETE CASCADE,
                                          payment_mode VARCHAR(20) NOT NULL,
                                          quantity DOUBLE PRECISION NOT NULL DEFAULT 1.0,
                                          unit_price NUMERIC(19, 4) NOT NULL DEFAULT 0.0,
                                          tax_percentage DOUBLE PRECISION,
                                          vat_percentage DOUBLE PRECISION,
                                          tax_amount NUMERIC(19, 4),
                                          vat_amount NUMERIC(19, 4),
                                          amount NUMERIC(19, 4) NOT NULL DEFAULT 0.0, -- Stores total line-item amount
                                          remarks TEXT,
                                          photo_path VARCHAR(255),
                                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                          created_by VARCHAR(255),
                                          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                          updated_by VARCHAR(255)
);

-- Index for invoice lookups by member & bill number
CREATE INDEX IF NOT EXISTS idx_sales_bill_member_bill_no
    ON sales_bill (member_id, bill_number);

-- 3. Indexes for performance on Foreign Keys & sequential searches
CREATE INDEX IF NOT EXISTS idx_sales_bill_member_id ON sales_bill(member_id);
CREATE INDEX IF NOT EXISTS idx_sales_bill_customer_id ON sales_bill(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_bill_product_id ON sales_bill(product_id);

-- Optional: Speeds up querying member bill numbers (BILL-{memberId}-{seq})
CREATE INDEX IF NOT EXISTS idx_sales_bill_member_bill_number ON sales_bill(member_id, bill_number);

CREATE SEQUENCE IF NOT EXISTS purchase_bill_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
-- Purchase Bill
CREATE TABLE purchase_bill (
                               id BIGINT PRIMARY KEY DEFAULT nextval('purchase_bill_seq'),
                               product_id BIGINT,
                               supplier_id BIGINT,
                               supplier_name VARCHAR(255),
                               member_id BIGINT,
                               purchase_no VARCHAR(100),
                               purchase_date DATE,
                               payment_mode VARCHAR(50),
                               amount NUMERIC(15, 4),
                               remarks TEXT,
                               photo_path VARCHAR(512),
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               created_by VARCHAR(255),
                               updated_by VARCHAR(255),

                               CONSTRAINT fk_purchase_bill_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
                               CONSTRAINT fk_purchase_bill_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
                               CONSTRAINT fk_purchase_bill_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE SET NULL
);

-- Optional: Create an index on purchase_no for faster search queries
CREATE INDEX idx_purchase_bill_purchase_no ON purchase_bill (purchase_no);

