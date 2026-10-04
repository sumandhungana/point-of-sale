-- 1. Create primary key sequence for SalesBillEntity (@GeneratedValue(GeneratedValue.Type.SEQUENCE))
CREATE SEQUENCE IF NOT EXISTS sales_bill_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 2. Create sales_bill table
CREATE TABLE IF NOT EXISTS sales_bill (
                                          id BIGINT NOT NULL DEFAULT nextval('sales_bill_seq'),
    bill_number VARCHAR(255),
    bill_date DATE,
    product_id BIGINT,
    customer_id BIGINT,
    member_id BIGINT,
    payment_mode VARCHAR(10),
    amount NUMERIC(19, 2),
    remarks VARCHAR(255),
    photo_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                             created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Primary Key Constraint
    CONSTRAINT pk_sales_bill PRIMARY KEY (id),

    -- Foreign Key Constraints (@Relation)
    CONSTRAINT fk_sales_bill_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_sales_bill_customer FOREIGN KEY (customer_id) REFERENCES organization_customer(id),
    CONSTRAINT fk_sales_bill_member FOREIGN KEY (member_id) REFERENCES member(id)
    );

-- 3. Indexes for performance on Foreign Keys & sequential searches
CREATE INDEX IF NOT EXISTS idx_sales_bill_member_id ON sales_bill(member_id);
CREATE INDEX IF NOT EXISTS idx_sales_bill_customer_id ON sales_bill(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_bill_product_id ON sales_bill(product_id);

-- Optional: Speeds up querying member bill numbers (BILL-{memberId}-{seq})
CREATE INDEX IF NOT EXISTS idx_sales_bill_member_bill_number ON sales_bill(member_id, bill_number);