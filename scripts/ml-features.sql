-- Create a view for ML feature extraction
-- This view aggregates signals by hour and cell to create a training dataset
CREATE OR REPLACE VIEW ml_feature_set AS
SELECT 
    cell_id,
    network,
    EXTRACT(HOUR FROM updated_at) as hour_of_day,
    EXTRACT(DOW FROM updated_at) as day_of_week,
    composite_score,
    predicted_risk,
    -- Target: Did it degrade below 0.4 in the next hour? (This would be calculated from historical data)
    CASE WHEN composite_score < 0.4 THEN 1 ELSE 0 END as is_degraded
FROM grid_cells;

-- Add predicted_risk column to grid_cells if not already there
-- (Already added in initial schema, but ensuring it here)
ALTER TABLE grid_cells ADD COLUMN IF NOT EXISTS predicted_risk FLOAT8 DEFAULT 0;
