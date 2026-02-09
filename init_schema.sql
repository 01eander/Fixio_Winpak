-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'OPERATOR');
CREATE TYPE asset_category AS ENUM ('PLANT', 'AREA', 'MACHINE', 'COMPONENT', 'TOOL');
CREATE TYPE asset_status AS ENUM ('ACTIVE', 'IN_REPAIR', 'DECOMMISSIONED', 'SCRAPPED');
CREATE TYPE asset_criticality AS ENUM ('A', 'B', 'C');
CREATE TYPE wo_status AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'REVIEW', 'CLOSED', 'CANCELLED');
CREATE TYPE wo_type AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'IMPROVEMENT');
CREATE TYPE wo_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');
CREATE TYPE movement_type AS ENUM ('PURCHASE', 'WO_CONSUMPTION', 'ADJUSTMENT', 'RETURN', 'TRANSFER');
CREATE TYPE audit_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'OPERATOR',
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSETS (Hierarchy)
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES assets(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    sku_code VARCHAR(50) UNIQUE,
    qr_code VARCHAR(255),
    category asset_category NOT NULL,
    status asset_status DEFAULT 'ACTIVE',
    criticality asset_criticality DEFAULT 'C',
    model VARCHAR(100),
    serial_number VARCHAR(100),
    manufacturer VARCHAR(100),
    installation_date DATE,
    warranty_expiration DATE,
    location_coords POINT,
    cost_center VARCHAR(50),
    image_url TEXT,
    specs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Failure Codes (referenced in WO)
CREATE TABLE failure_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50)
);

-- 3. WORK ORDERS
CREATE TABLE work_orders (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT REFERENCES assets(id) ON DELETE RESTRICT,
    requester_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    assigned_tech_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    closed_by_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    status wo_status DEFAULT 'DRAFT',
    type wo_type NOT NULL,
    priority wo_priority DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    failure_code_id INT REFERENCES failure_codes(id),
    scheduled_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    downtime_minutes INTEGER DEFAULT 0,
    labor_hours DECIMAL(5,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    solution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_activities (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT REFERENCES work_orders(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id)
);

-- 4. INVENTORY
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    manager_id UUID REFERENCES users(id)
);

CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT, -- Could be a separate table, using simple int for now or we could add category table
    min_stock INT DEFAULT 0,
    max_stock INT,
    current_stock DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    bin_location VARCHAR(50),
    is_tool BOOLEAN DEFAULT FALSE,
    default_warehouse_id INT REFERENCES warehouses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id BIGINT REFERENCES inventory_items(id) ON DELETE RESTRICT,
    warehouse_id INT REFERENCES warehouses(id) ON DELETE RESTRICT,
    type movement_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    reference_id VARCHAR(50),
    unit_cost_at_time DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- WO Resources (Consumption)
CREATE TABLE wo_resources (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT REFERENCES work_orders(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_planned DECIMAL(10,2),
    quantity_used DECIMAL(10,2),
    cost_at_time DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDITS
CREATE TABLE inventory_audits (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id INT REFERENCES warehouses(id),
    status audit_status DEFAULT 'DRAFT',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    accuracy_score DECIMAL(5,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_items (
    id BIGSERIAL PRIMARY KEY,
    audit_id BIGINT REFERENCES inventory_audits(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES inventory_items(id) ON DELETE RESTRICT,
    system_qty_snapshot DECIMAL(10,2),
    physical_qty DECIMAL(10,2),
    variance DECIMAL(10,2),
    variance_value DECIMAL(10,2)
);

-- Indexes for performance
CREATE INDEX idx_assets_parent ON assets(parent_id);
CREATE INDEX idx_wo_asset ON work_orders(asset_id);
CREATE INDEX idx_wo_assigned ON work_orders(assigned_tech_id);
CREATE INDEX idx_mv_item ON inventory_movements(item_id);
CREATE INDEX idx_mv_created ON inventory_movements(created_at);

-- Insert Default Admin User (Password: admin123)
-- Note: In production hashing should be done by app. Here providing a placeholder hash or plain for initial setup if env allows.
-- Using a dummy hash for example purposes.
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES ('admin@fixio.com', '$2b$10$EpIxT9...hashedpassword...', 'System Administrator', 'ADMIN', TRUE);

-- Insert default Warehouses
INSERT INTO warehouses (name, location) VALUES ('Almacén Central', 'Nave A'), ('Almacén Herramientas', 'Taller 1');
