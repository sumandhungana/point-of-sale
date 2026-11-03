-- Dashboard Settings Table & Audit
CREATE TABLE IF NOT EXISTS dashboard_settings (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT,
    role_id INTEGER,
    role_name VARCHAR(100) ,
    role_order INTEGER  DEFAULT 3,
    dashboard_type VARCHAR(50)  DEFAULT 'admin',
    enabled BOOLEAN DEFAULT TRUE,
    rows_config JSONB,
    show_supplier_chart BOOLEAN NOT NULL DEFAULT TRUE,
    show_customer_chart BOOLEAN NOT NULL DEFAULT TRUE,
    show_inventory_chart BOOLEAN NOT NULL DEFAULT TRUE,
    show_system_monitor BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    CONSTRAINT fk_dashboard_settings_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
    CONSTRAINT uq_dashboard_settings_member_role UNIQUE (member_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_settings_member_id ON dashboard_settings(member_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_role_name ON dashboard_settings(role_name);
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_role_order ON dashboard_settings(role_order);

CREATE TABLE IF NOT EXISTS dashboard_settings_audit (
    id BIGSERIAL PRIMARY KEY,
    dashboard_settings_id BIGINT,
    member_id BIGINT,
    role_name VARCHAR(100),
    role_order INTEGER,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50) NOT NULL,
    previous_values JSONB,
    new_values JSONB
);

CREATE INDEX IF NOT EXISTS idx_dashboard_settings_audit_settings_id ON dashboard_settings_audit(dashboard_settings_id);

-- Seed global defaults for base roles if not existing
INSERT INTO dashboard_settings (
    member_id, role_name, role_order, dashboard_type, enabled,
    rows_config, show_supplier_chart, show_customer_chart,
    show_inventory_chart, show_system_monitor, updated_by
)
SELECT NULL, 'Super Admin', 1, 'Super Admin', TRUE,
       '[{"id":"row-1","widgets":["total_organizations","total_users","total_roles","total_staff"]},{"id":"row-2","widgets":["total_customers","total_suppliers","total_sales","total_purchase"]},{"id":"row-3","widgets":["total_due","total_paid","total_income","total_expenses"]}]',
       TRUE, TRUE, TRUE, TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_settings WHERE member_id IS NULL AND role_name = 'Super Admin');

INSERT INTO dashboard_settings (
    member_id, role_name, role_order, dashboard_type, enabled,
    rows_config, show_supplier_chart, show_customer_chart,
    show_inventory_chart, show_system_monitor, updated_by
)
SELECT NULL, 'Admin', 2, 'Admin', TRUE,
       '[{"id":"row-1","widgets":["total_organizations","total_users","total_roles","total_staff"]},{"id":"row-2","widgets":["total_customers","total_suppliers","total_sales","total_purchase"]},{"id":"row-3","widgets":["total_due","total_paid","total_income","total_expenses"]}]',
       TRUE, TRUE, TRUE, TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_settings WHERE member_id IS NULL AND role_name = 'Admin');

-- In case table previously existed with TEXT column, safely cast to JSONB
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dashboard_settings' 
          AND column_name = 'rows_config' 
          AND data_type IN ('text', 'character varying')
    ) THEN
        ALTER TABLE dashboard_settings ALTER COLUMN rows_config TYPE JSONB USING rows_config::jsonb;
    END IF;
END $$;

-- Correct existing rows with inaccurate dashboard_type according to role_order
UPDATE dashboard_settings 
SET dashboard_type = 'Super Admin' 
WHERE role_order = 1 AND (dashboard_type IS NULL OR dashboard_type <> 'Super Admin');

UPDATE dashboard_settings 
SET dashboard_type = 'Admin' 
WHERE role_order = 2 AND (dashboard_type IS NULL OR dashboard_type <> 'Admin');

UPDATE dashboard_settings 
SET dashboard_type = role_name 
WHERE role_order >= 3 AND (dashboard_type IS NULL OR dashboard_type = 'admin' OR dashboard_type = 'Admin');


