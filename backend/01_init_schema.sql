-- Create Database
CREATE DATABASE occ_mill_sizer;
\c occ_mill_sizer;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Projects Table
CREATE TABLE User_Projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(255) NOT NULL,
    target_capacity_adt INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Furnish Specifications Table
CREATE TABLE Furnish_Specifications (
    furnish_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g., 'AOCC', 'LOCC'
    base_long_fiber_pct DECIMAL(5,2) DEFAULT 0.0,
    base_ash_pct DECIMAL(5,2) DEFAULT 0.0,
    base_yield_factor DECIMAL(3,2) DEFAULT 0.85
);

-- 3. Contamination Matrix Table
CREATE TABLE Contamination_Matrix (
    matrix_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES User_Projects(project_id) ON DELETE CASCADE,
    metals INT DEFAULT 1 CHECK (metals BETWEEN 1 AND 10),
    plastics INT DEFAULT 1 CHECK (plastics BETWEEN 1 AND 10),
    stickies INT DEFAULT 1 CHECK (stickies BETWEEN 1 AND 10),
    ash INT DEFAULT 1 CHECK (ash BETWEEN 1 AND 10)
);

-- 4. OEM Equipment Catalog Table
CREATE TABLE OEM_Equipment_Catalog (
    equip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oem_name VARCHAR(100) NOT NULL, -- Andritz, Voith, Valmet, Kadant, etc.
    category VARCHAR(100) NOT NULL, -- Pulper, Screen, Cleaner, Press
    model_name VARCHAR(100) NOT NULL,
    min_capacity_m3h DECIMAL(10,2),
    max_capacity_m3h DECIMAL(10,2),
    vendor_specs JSONB
);

-- 5. Sizing Algorithms Table
CREATE TABLE Sizing_Algorithms (
    algo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_category VARCHAR(100) NOT NULL,
    formula_logic JSONB NOT NULL
);

-- 6. Generated Schemes Table
CREATE TABLE Generated_Schemes (
    scheme_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES User_Projects(project_id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL, -- 'Basic', 'Essential', 'Full-Fledged'
    equipment_list_json JSONB NOT NULL,
    pfd_topology_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERT FOUNDATIONAL DATA
-- ==========================================

-- Insert Furnish Types
INSERT INTO Furnish_Specifications (name, base_long_fiber_pct, base_ash_pct, base_yield_factor) VALUES
('LOCC', 65.00, 15.00, 0.82),
('AOCC', 75.00, 12.00, 0.88),
('Mixed Waste', 40.00, 25.00, 0.75);

-- Insert OEM Equipment (Samples)
INSERT INTO OEM_Equipment_Catalog (oem_name, category, model_name, min_capacity_m3h, max_capacity_m3h, vendor_specs) VALUES
('Andritz', 'Pulper', 'FibreFlow Drum Pulper', 50.0, 500.0, '{"consistency": 0.04, "type": "drum"}'),
('Voith', 'Pulper', 'IntensaMaule Pulper', 30.0, 400.0, '{"consistency": 0.08, "type": "hicon"}'),
('Kadant', 'Screen', 'Pressure Screen PSV', 20.0, 150.0, '{"screen_type": "fine", "hole_size": "0.15mm"}'),
('Valmet', 'Cleaner', 'OptiCycle MC', 10.0, 120.0, '{"cleaner_type": "heavy", "stages": 3}'),
('Bellmer', 'Press', 'TwinWire Press', 5.0, 80.0, '{"output_consistency": 0.35}');

-- Insert Sizing Algorithm Logic
-- Pulper Sizing Logic: Volume = (ADT/day * 1000 / 24) / (Consistency * 1000) * Retention_Time
INSERT INTO Sizing_Algorithms (equipment_category, formula_logic) VALUES
('Pulper', '{"variables": {"adt": "input", "consistency": 0.08, "retention_time_hours": 1.5}, "calculation": "(adt * 1000 / 24) / (consistency * 1000) * retention_time_hours"}');

-- Screen Sizing Logic: Area = Flow_m3h / Capacity_Rate
INSERT INTO Sizing_Algorithms (equipment_category, formula_logic) VALUES
('Screen', '{"variables": {"flow_m3h": "calculated", "capacity_rate_m3_m2_h": 45.0}, "calculation": "flow_m3h / capacity_rate_m3_m2_h"}');
