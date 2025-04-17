CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enable BOOLEAN DEFAULT FALSE,
    
    branch VARCHAR(50),
    permission ENUM('admin', 'user', 'manager') DEFAULT 'user',
    parent VARCHAR(50), -- Can be a foreign key if referencing another user or table

    name VARCHAR(100),
    address TEXT,
    company VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    pan VARCHAR(20),
    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Customers and Suppliers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    company VARCHAR(100),
    pan VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    company VARCHAR(100),
    pan VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Items and Inventory
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    primary_unit VARCHAR(20) NOT NULL,
    secondary_unit VARCHAR(20),
    is_secondary_unit_enabled BOOLEAN DEFAULT false,
    category_id INTEGER REFERENCES categories(id),
    sales_price DECIMAL(10,2),
    purchase_price DECIMAL(10,2),
    tax_included BOOLEAN DEFAULT false,
    opening_stock DECIMAL(10,2) DEFAULT 0,
    low_stock_alert DECIMAL(10,2),
    vat_percentage DECIMAL(5,2),
    vat_percentage_today DECIMAL(5,2),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bill (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rental Items
CREATE TABLE rental_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rental_item_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    rental_amount DECIMAL(10, 2) NOT NULL,
    rental_period ENUM('hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- App Settings
CREATE TABLE app_settings (
    id SERIAL PRIMARY KEY,
    setting_name VARCHAR(50) NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE app_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,

  -- Side Menu Style
  side_menu_bg_color VARCHAR(7) NOT NULL DEFAULT '#343a40',
  side_menu_bg_end_color VARCHAR(7) NOT NULL DEFAULT '#212529',
  side_menu_font_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  side_menu_hover_font_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  side_menu_hover_bg_color VARCHAR(7) NOT NULL DEFAULT '#495057',

  -- Top Menu Bar Style
  top_menu_bg_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  top_menu_font_color VARCHAR(7) NOT NULL DEFAULT '#212529',

  -- App Content Style
  app_bg_color VARCHAR(7) NOT NULL DEFAULT '#f8f9fa',
  app_foreground_color VARCHAR(7) NOT NULL DEFAULT '#212529',

  -- Images (can be file path or base64 or URL)
  logo_path VARCHAR(255) DEFAULT NULL,
  favicon_path VARCHAR(255) DEFAULT NULL,
  login_bg_path VARCHAR(255) DEFAULT NULL,

  -- General Settings
  currency VARCHAR(10) NOT NULL DEFAULT '₹',
  currency_position ENUM('before', 'after') NOT NULL DEFAULT 'before',
  date_format ENUM('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD') NOT NULL DEFAULT 'DD/MM/YYYY',
  time_format ENUM('HH:mm', 'hh:mm A') NOT NULL DEFAULT 'HH:mm',
  number_format ENUM('1,234.56', '1.234,56', '1234.56') NOT NULL DEFAULT '1,234.56',
  language VARCHAR(50) NOT NULL DEFAULT 'English',

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE invoice_settings (
  id SERIAL PRIMARY KEY,
  premium_bill TEXT,
  thermal_bill TEXT,
  basic_bill TEXT,

  -- Regular Printer
  regular_printer_field1 TEXT,
  regular_printer_field2 TEXT,
  regular_printer_field3 TEXT,

  -- Thermal Printer
  thermal_printer_field1 TEXT,
  thermal_printer_field2 TEXT,
  thermal_printer_field3 TEXT,

  -- Company Info Display Flags
  show_company_name BOOLEAN DEFAULT FALSE,
  show_company_logo BOOLEAN DEFAULT FALSE,
  show_address BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  show_pan_vat BOOLEAN DEFAULT FALSE, -- ask

  -- Company Values
  company_name TEXT,
  company_logo TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  pan_vat TEXT,

  -- Footer
  show_authorized_signature BOOLEAN DEFAULT FALSE,
  authorized_signature_text TEXT, -- ask
  change_signature TEXT, -- ask

  -- Paper Settings
  paper_size VARCHAR(20),
  orientation VARCHAR(20),
  company_name_text_size VARCHAR(20),
  invoice_tax_size VARCHAR(20),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- made

CREATE TABLE sms_gateways (
  id INT PRIMARY KEY AUTO_INCREMENT,
  partner_name VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  form VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  api_url TEXT NOT NULL,
  test_sms TEXT
);



CREATE TABLE payment_gateways (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  payment_mode ENUM('credit_card', 'debit_card', 'upi', 'net_banking') NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  image_path VARCHAR(255), -- or store base64 in a TEXT field if you plan to save it directly
  verification_url TEXT NOT NULL,
  public_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module VARCHAR(100) NOT NULL,       -- e.g., 'Organization', 'User'
  permission_name VARCHAR(100) NOT NULL,  -- e.g., 'view organization info'
  UNIQUE(module, permission_name),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  tax_included BOOLEAN DEFAULT FALSE,
  tax_included_amount DECIMAL(10, 2),
  tax DECIMAL(5, 2),
  vat DECIMAL(5, 2),
  image_path VARCHAR(255), -- stores uploaded image filename or path
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- staff.sql
CREATE TABLE staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  remarks TEXT,
  profile_image_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- staff_salary.sql
CREATE TABLE staff_salary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  month INT CHECK (month >= 0 AND month <= 11),
  year INT,
  selected_date DATE,
  is_slide_on BOOLEAN DEFAULT FALSE,
  calculation_date DATE NOT NULL,
  salary_type ENUM('monthly', 'weekly', 'daily') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  permission ENUM('full', 'limited', 'restricted') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- staff_attendance.sql
CREATE TABLE staff_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'leave') NOT NULL DEFAULT 'absent',
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (staff_id, date),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);


CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DECIMAL(10, 2) NOT NULL,                    -- The payment amount
  notes TEXT,                                        -- Optional notes
  payment_date DATE NOT NULL,                        -- The date of the payment
  payment_mode ENUM('cash', 'online') NOT NULL,      -- Mode of payment
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,     -- When the entry was created
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sales_bills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bill_number VARCHAR(100) NOT NULL UNIQUE,
  bill_date DATE NOT NULL,
  customer_id INT NOT NULL,
  payment_mode ENUM('cash', 'card', 'upi', 'bank') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  remarks TEXT,
  photo_path VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id)
);


CREATE TABLE sales_bill_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bill_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT DEFAULT 1,
  rate DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (bill_id) REFERENCES sales_bills(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)
);



-- done

CREATE TABLE Cashbook (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cashbook_no VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  category_id INT NOT NULL,
  item_id INT NOT NULL,
  payment_mode ENUM('cash', 'card', 'bank_transfer', 'upi') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  remarks TEXT,
  photo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES Categories(id),
  FOREIGN KEY (item_id) REFERENCES Items(id)
);
CREATE TABLE Income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  income_no VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  category_id INT NOT NULL,
  item_id INT NOT NULL,
  payment_mode ENUM('cash', 'card', 'bank_transfer', 'upi') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  remarks TEXT,
  photo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES Categories(id),
  FOREIGN KEY (item_id) REFERENCES Items(id)
);
CREATE TABLE Expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expenses_no VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  category_id INT NOT NULL,
  item_id INT NOT NULL,
  payment_mode ENUM('cash', 'card', 'bank_transfer', 'upi') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  remarks TEXT,
  photo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES Categories(id),
  FOREIGN KEY (item_id) REFERENCES Items(id)
);

CREATE TABLE Purchase (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_no VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  category_id INT NOT NULL,
  item_id INT NOT NULL,
  payment_mode ENUM('cash', 'card', 'bank_transfer', 'upi') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  remarks TEXT,
  photo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES Categories(id),
  FOREIGN KEY (item_id) REFERENCES Items(id)
);








-- seed data





INSERT INTO permissions (module, permission_name) VALUES
-- Organization
('Organization', 'view organization info'),
('Organization', 'update organization info'),
('Organization', 'view search'),
('Organization', 'view an branch'),
('Organization', 'create branch'),
('Organization', 'update branch'),
('Organization', 'delete branch'),

-- Reseller
('Reseller', 'view reseller'),
('Reseller', 'add reseller'),
('Reseller', 'edit reseller'),
('Reseller', 'update reseller'),
('Reseller', 'delete reseller'),

-- User
('User', 'view user'),
('User', 'add user'),
('User', 'edit user'),
('User', 'update user'),
('User', 'reset user password'),

-- Report
('Report', 'view report'),
('Report', 'view all report'),

-- Staff
('Staff', 'view entry'),
('Staff', 'add entry'),
('Staff', 'edit entry'),
('Staff', 'delete entry'),
('Staff', 'Update entry'),

-- Notification
('Notification', 'view notification'),
('Notification', 'delete notification'),

-- Customer
('Customer', 'view Customer'),
('Customer', 'create Customer'),
('Customer', 'edit Customer'),
('Customer', 'update Customer'),
('Customer', 'delete Customer'),

-- Suppliers
('Suppliers', 'view Supplier'),
('Suppliers', 'create Supplier'),
('Suppliers', 'edit Supplier'),
('Suppliers', 'update Supplier'),
('Suppliers', 'delete Supplier'),

-- Bill
('Bill', 'view bill'),
('Bill', 'add bill'),
('Bill', 'edit bill'),
('Bill', 'update bill'),
('Bill', 'delete bill'),

-- Inventory
('Inventory', 'view inventory'),
('Inventory', 'add inventory'),
('Inventory', 'edit inventory'),
('Inventory', 'update inventory'),
('Inventory', 'delete inventory');
