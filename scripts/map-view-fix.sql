-- Create a view to easily extract lat/lng for MapView visualization
CREATE OR REPLACE VIEW grid_cells_view AS
SELECT 
    cell_id,
    composite_score,
    predicted_risk,
    network,
    updated_at,
    ST_Y(ST_Centroid(bounds)) as lat,
    ST_X(ST_Centroid(bounds)) as lng
FROM grid_cells;
