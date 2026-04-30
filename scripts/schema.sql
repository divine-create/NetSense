-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Signal Readings Table
CREATE TABLE signal_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    network TEXT NOT NULL, -- MTN, Airtel, Glo, 9mobile
    signal_strength INT NOT NULL, -- -120 to -40 dBm
    download_mbps FLOAT8,
    upload_mbps FLOAT8,
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED
);

-- Index for spatial queries
CREATE INDEX signal_readings_geom_idx ON signal_readings USING GIST (geom);

-- 2. Grid Cells Table (Aggregated View)
CREATE TABLE grid_cells (
    cell_id TEXT PRIMARY KEY, -- Based on ST_SnapToGrid
    bounds GEOMETRY(Polygon, 4326),
    composite_score FLOAT8, -- 0 to 1
    network TEXT NOT NULL,
    predicted_risk FLOAT8 DEFAULT 0, -- 0 to 1
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for spatial queries
CREATE INDEX grid_cells_bounds_idx ON grid_cells USING GIST (bounds);

-- 3. Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone TEXT NOT NULL,
    severity TEXT NOT NULL, -- Low, Medium, High, Critical
    description TEXT,
    affected_network TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 4. Context Events (External context like concerts/weather)
CREATE TABLE context_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    lat FLOAT8,
    lng FLOAT8,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    event_type TEXT, -- weather, concert, market, protest
    impact_radius_meters INT DEFAULT 1000,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED
);
