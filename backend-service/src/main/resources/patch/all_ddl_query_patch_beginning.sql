CREATE TABLE user_info
(
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_name    VARCHAR(255),
    user_id      VARCHAR(255) CONSTRAINT uk_users_user_id UNIQUE,
    password     VARCHAR(255),
    phone_number VARCHAR(255),
    email        VARCHAR(255) CONSTRAINT uk_users_email UNIQUE,
    enable       BOOLEAN,
    permission   VARCHAR(255),
    role         VARCHAR(255),
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP,
    created_by   VARCHAR(255),
    updated_by   VARCHAR(255)
);


CREATE TABLE member
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ref_member_id               BIGINT,
    organization_name           VARCHAR(255),
    pan_vat_number              VARCHAR(255),
    organization_type            VARCHAR(255),
    branch                      VARCHAR(255),
    organization_address        VARCHAR(255),
    notes                       VARCHAR(255),
    created_at                  TIMESTAMP,
    updated_at                  TIMESTAMP,
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    organization_contact_number VARCHAR(255),
    organization_email          VARCHAR(255)
);

CREATE TABLE user_members
(
    id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id    BIGINT       NOT NULL,
    member_id  BIGINT       NOT NULL,
    created_at TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE TABLE user_roles
(
    id          SERIAL
        PRIMARY KEY,
    member_id   BIGINT,
    name        varchar(255),
    description text,
    status      varchar(50),
    created_at  timestamp with time zone,
    updated_at  timestamp with time zone,
    role_order  numeric
);

create table user_permissions
(
    id          serial
        primary key,
    role_id     integer not null
        constraint fk_user_permissions_role
            references user_roles
            on delete cascade,
    module      varchar(255),
    permissions jsonb,
    created_at  timestamp with time zone,
    updated_at  timestamp with time zone
);

INSERT INTO public.user_info (user_name, user_id, password, phone_number, email, enable, permission, role, created_at, updated_at, created_by, updated_by)
VALUES ('Super Admin', 'superadmin@gmail.com', 'XSiXA8EzrmXMmQHcJa5H+Q==:6A4gAj28z/T0X9M2/TJh+jqyPjn5HjjF8OIojp/b298=', '9869047520', 'superadmin@gmail.com', true, '[1]', '1', '2026-10-11 08:59:51.477140', '2026-10-11 08:59:51.477140', 'Suman Dhungana', 'Suman Dhungana');

INSERT INTO public.member (ref_member_id, organization_name, pan_vat_number, organization_type, branch, organization_address, notes, created_at, updated_at, created_by, updated_by, organization_contact_number, organization_email)
VALUES (0, 'Super Admin Organization', '11111111111', 'Partnership', 'Main', 'Balaju Kathmandu', 'This is Super Admin User', '2026-10-11 08:59:51.562889', '2026-10-11 08:59:51.562889', 'System', 'Suman Dhungana', '9869047520', 'superorgn@gmail.com');


INSERT INTO public.user_members (user_id, member_id, created_at, created_by)
VALUES (1, 1, '2026-10-11 08:59:51.582932', 'Suman Dhungana');


INSERT INTO public.user_roles (id, member_id, name, description, status, created_at, updated_at, role_order)
VALUES (1, 1, 'Super Admin', 'Super Admin Role', 'ACTIVE', '2026-10-11 05:53:58.557665 +00:00', '2026-10-11 15:57:35.129003 +00:00', 1);


INSERT INTO public.user_permissions (id, role_id, module, permissions, created_at, updated_at) VALUES
 (1, 1, 'roleAndPermissions', '["roleAndPermissions:create", "roleAndPermissions:update", "roleAndPermissions:delete", "roleAndPermissions:single", "roleAndPermissions:list"]', '2026-10-11 15:24:19.665013 +00:00', '2026-10-11 15:24:19.665013 +00:00');


create table organization_customers
(
    id                        integer generated always as identity
        primary key,
    member_id                 bigint       not null,
    name                      varchar(255) not null,
    phone                     varchar(255) not null,
    email                     varchar(255) not null,
    address                   varchar(255) not null,
    company                   varchar(255) not null,
    pan                       varchar(255) ,
    contact_person            varchar(255) ,
    supplier                  boolean      not null,
    bank_account              varchar(255) ,
    cash_balance              numeric      not null,
    profile_image             text         not null,
    customer_sms_setting      boolean      not null,
    sms_language              boolean      ,
    transaction_history_check boolean     ,
    created_by                varchar(255) ,
    updated_by                varchar(255),
    created_at                timestamp,
    updated_at                timestamp
);

create table organization_staff
(
    id                integer generated always as identity
        primary key,
    name              varchar(255) not null,
    address           varchar(255) not null,
    phone             varchar(255) not null,
    email             varchar(255) not null,
    remarks           varchar(255) not null,
    profile_image_url varchar(255) not null,
    member_id         bigint       not null,
    created_at        timestamp,
    updated_at        timestamp
);

create table suppliers
(
    id             integer generated always as identity
        primary key,
    member_id      bigint       not null,
    name           varchar(255) not null,
    phone          varchar(255) not null,
    email          varchar(255) not null,
    address        varchar(255) not null,
    company        varchar(255) not null,
    pan            varchar(255) not null,
    contact_person varchar(255) not null,
    profile_image  text         not null,
    created_by     varchar(255) not null,
    updated_by     varchar(255) not null,
    created_at     timestamp,
    updated_at     timestamp
);


create table payments
(
    id               bigserial
        primary key,
    member_id        bigint                                             not null
        constraint fk_payments_member
            references member
            on delete restrict,
    user_id          bigint                                             not null
        constraint fk_payments_user
            references user_info
            on delete restrict,
    payment_party    varchar(32)                                        not null
        constraint chk_payments_party
            check ((payment_party)::text = ANY
                   ((ARRAY ['CUSTOMER'::character varying, 'SUPPLIER'::character varying, 'AUDIT'::character varying, 'STAFF'::character varying])::text[])),
    customer_id      bigint
        constraint fk_payments_customer
            references organization_customers
            on delete set null,
    staff_id         bigint
        constraint fk_payments_staff
            references organization_staff
            on delete set null,
    supplier_id      bigint
        constraint fk_payments_supplier
            references suppliers
            on delete set null,
    amount           numeric(19, 4)                                     not null
        constraint chk_payments_amount_positive
            check (amount > (0)::numeric),
    payment_type     varchar(32)                                        not null
        constraint chk_payments_type
            check ((payment_type)::text = ANY
                   ((ARRAY ['CARD'::character varying, 'QR'::character varying, 'CASH'::character varying])::text[])),
    payment_category varchar(32)                                        not null
        constraint chk_payments_category
            check ((payment_category)::text = ANY
                   ((ARRAY ['GIVEN'::character varying, 'RECEIVED'::character varying])::text[])),
    bill_path        varchar(512),
    remarks          varchar(1000),
    created_at       timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at       timestamp with time zone,
    created_by       varchar(255)                                       not null,
    updated_by       varchar(255),
    constraint chk_payments_party_relation
        check ((((payment_party)::text = 'CUSTOMER'::text) AND (customer_id IS NOT NULL)) OR
               (((payment_party)::text = 'SUPPLIER'::text) AND (supplier_id IS NOT NULL)) OR
               (((payment_party)::text = 'STAFF'::text) AND (staff_id IS NOT NULL)) OR
               ((payment_party)::text = 'AUDIT'::text))
);


create index idx_payments_member_id
    on payments (member_id);

create index idx_payments_user_id
    on payments (user_id);

create index idx_payments_customer_id
    on payments (customer_id)
    where (customer_id IS NOT NULL);

create index idx_payments_supplier_id
    on payments (supplier_id)
    where (supplier_id IS NOT NULL);

create index idx_payments_staff_id
    on payments (staff_id)
    where (staff_id IS NOT NULL);

create index idx_payments_party
    on payments (payment_party);

create index idx_payments_created_at
    on payments (created_at);


create table categories
(
    id            bigserial
        primary key,
    member_id     bigint            not null
        constraint fk_categories_member
            references member
            on delete cascade,
    name          varchar(255)      not null,
    description   text,
    category_type integer default 0 not null,
    created_at    timestamp with time zone,
    updated_at    timestamp with time zone,
    created_by    varchar(255),
    updated_by    varchar(255)
);


create index idx_categories_member_type
    on categories (member_id, category_type);
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



-- Payment

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

-- RENTAL MANAGEMENT

CREATE TABLE rental_item (
                             id BIGSERIAL PRIMARY KEY,
                             member_id BIGINT,
                             rental_item_name VARCHAR(255) NOT NULL,
                             phone_number VARCHAR(50),
                             address VARCHAR(255),
                             rental_amount NUMERIC(15, 4) NOT NULL,
                             rental_period VARCHAR(50),
                             start_date TIMESTAMP WITH TIME ZONE,
                             end_date TIMESTAMP WITH TIME ZONE,
                             remarks TEXT,
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             created_by VARCHAR(255),
                             updated_by VARCHAR(255),

                             CONSTRAINT fk_rental_item_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE SET NULL
);

-- Index for searching rental items quickly by name
CREATE INDEX idx_rental_item_name ON rental_item (rental_item_name);