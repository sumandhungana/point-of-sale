-- App Settings Table & Audit
CREATE TABLE IF NOT EXISTS app_settings (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT UNIQUE,
    side_menu_bg_color VARCHAR(30) NOT NULL DEFAULT '#010A2E',
    side_menu_bg_end_color VARCHAR(30) NOT NULL DEFAULT '#06164A',
    side_menu_font_color VARCHAR(30) NOT NULL DEFAULT '#ffffff',
    side_menu_hover_font_color VARCHAR(30) NOT NULL DEFAULT '#ffffff',
    side_menu_hover_bg_color VARCHAR(30) NOT NULL DEFAULT '#495057',
    top_menu_bg_color VARCHAR(30) NOT NULL DEFAULT '#ffffff',
    top_menu_font_color VARCHAR(30) NOT NULL DEFAULT '#212529',
    app_bg_color VARCHAR(30) NOT NULL DEFAULT '#f8f9fa',
    app_foreground_color VARCHAR(30) NOT NULL DEFAULT '#212529',
    logo_path TEXT,
    favicon_path TEXT,
    login_bg_path TEXT,
    currency VARCHAR(20) NOT NULL DEFAULT 'रु',
    currency_position VARCHAR(20) NOT NULL DEFAULT 'before',
    date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(20) NOT NULL DEFAULT 'HH:mm',
    number_format VARCHAR(20) NOT NULL DEFAULT '1,234.56',
    language VARCHAR(50) NOT NULL DEFAULT 'English',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    CONSTRAINT fk_app_settings_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_settings_member_id ON app_settings(member_id);

CREATE TABLE IF NOT EXISTS app_settings_audit (
    id BIGSERIAL PRIMARY KEY,
    app_settings_id BIGINT REFERENCES app_settings(id) ON DELETE CASCADE,
    member_id BIGINT,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50) NOT NULL,
    previous_values JSONB,
    new_values JSONB
);

CREATE INDEX IF NOT EXISTS idx_app_settings_audit_settings_id ON app_settings_audit(app_settings_id);

-- Seed global default settings (member_id = NULL)
INSERT INTO app_settings (
    member_id,
    side_menu_bg_color,
    side_menu_bg_end_color,
    side_menu_font_color,
    side_menu_hover_font_color,
    side_menu_hover_bg_color,
    top_menu_bg_color,
    top_menu_font_color,
    app_bg_color,
    app_foreground_color,
    currency,
    currency_position,
    date_format,
    time_format,
    number_format,
    language,
    created_at,
    updated_at
)
SELECT 
    NULL,
    '#010A2E',
    '#06164A',
    '#ffffff',
    '#ffffff',
    '#495057',
    '#ffffff',
    '#212529',
    '#f8f9fa',
    '#212529',
    'रु',
    'before',
    'DD/MM/YYYY',
    'HH:mm',
    '1,234.56',
    'English',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM app_settings WHERE member_id IS NULL
);

