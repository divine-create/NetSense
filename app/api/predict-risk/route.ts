import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * ML Prediction API (Heuristic-based for Phase 1)
 * Calculates predicted_risk for all grid cells based on current state and trends.
 */
export async function POST() {
  try {
    // 1. Fetch current cell states
    const { data: cells, error: fetchError } = await supabase
      .from('grid_cells')
      .select('cell_id, composite_score, network');

    if (fetchError) throw fetchError;

    // 2. Simple Heuristic Calculation
    // In a real ML scenario, this would call a pre-trained model with historical features
    const updates = cells.map(cell => {
      let risk = 0;
      
      // If score is already low (< 0.5), risk of total degradation is high
      if (cell.composite_score < 0.5) {
        risk = Math.min(1, (1 - cell.composite_score) * 0.8 + Math.random() * 0.2);
      } else {
        // Even for good cells, add some "background" noise/risk
        risk = Math.random() * 0.15;
      }

      return {
        cell_id: cell.cell_id,
        predicted_risk: parseFloat(risk.toFixed(2))
      };
    });

    // 3. Update DB (batch update)
    // Supabase 'upsert' can be used for batch updates if cell_id is provided
    const { error: updateError } = await supabase
      .from('grid_cells')
      .upsert(updates);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      updated_cells: updates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Prediction API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
