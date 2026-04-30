-- SQL Function to aggregate signals into grid cells
CREATE OR REPLACE FUNCTION aggregate_signals()
RETURNS void AS $$
BEGIN
    INSERT INTO grid_cells (cell_id, bounds, composite_score, network, updated_at)
    SELECT 
        -- Create a unique ID for the cell based on rounded lat/lng and network
        CONCAT(FLOOR(lat * 200), '_', FLOOR(lng * 200), '_', network) as cell_id,
        -- Create a 500m-ish square polygon for the cell
        ST_MakeEnvelope(
            FLOOR(lng * 200) / 200.0, 
            FLOOR(lat * 200) / 200.0, 
            (FLOOR(lng * 200) + 1) / 200.0, 
            (FLOOR(lat * 200) + 1) / 200.0, 
            4326
        ) as bounds,
        -- Composite score: normalized signal strength (-120 to -40)
        -- Formula: (signal + 120) / 80, clamped 0 to 1
        AVG(LEAST(GREATEST((signal_strength + 120) / 80.0, 0), 1)) as composite_score,
        network,
        now() as updated_at
    FROM signal_readings
    WHERE created_at > now() - interval '24 hours'
    GROUP BY FLOOR(lat * 200), FLOOR(lng * 200), network
    ON CONFLICT (cell_id) DO UPDATE SET
        composite_score = EXCLUDED.composite_score,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run every minute (requires pg_cron or similar in Supabase)
-- SELECT cron.schedule('aggregate-signals-every-minute', '* * * * *', 'SELECT aggregate_signals()');
