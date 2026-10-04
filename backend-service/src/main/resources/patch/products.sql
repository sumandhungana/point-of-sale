CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
                          member_id BIGINT REFERENCES member(id) ON DELETE SET NULL,
                          customer_id BIGINT REFERENCES organization_customers(id) ON DELETE SET NULL,
                          supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
                          item_count DOUBLE PRECISION,
                          unit VARCHAR(50),
                          per_unit_purchase_price NUMERIC(19, 4),
                          gross_purchase_price NUMERIC(19, 4),
                          sales_price NUMERIC(19, 4),
                          is_tax_included BOOLEAN DEFAULT FALSE,
                          opening_stock DOUBLE PRECISION,
                          count_stock DOUBLE PRECISION,
                          low_stock_alert DOUBLE PRECISION,
                          vat_percentage DOUBLE PRECISION,
                          vat_date DATE,
                          image_url VARCHAR(2048),
                          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          created_by VARCHAR(255),
                          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_by VARCHAR(255)
);

-- Foreign Key Indexes for Performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_member_id ON products(member_id);
CREATE INDEX idx_products_customer_id ON products(customer_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);