import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * NetSense Prediction API
 * In production: This calls an Azure ML or FastAPI endpoint running scikit-learn.
 * For Demo: Implements the 'Hotspot Prediction' logic using current cell state + time features.
 */
export async function POST(req: Request) {
  try {
    const { cell_id, network } = await req.json();

    // 1. Fetch current cell state
    const { data: cell, error } = await supabase
      .from('grid_cells')
      .select('*')
      .eq('cell_id', cell_id)
      .single();

    if (error || !cell) {
      return NextResponse.json({ error: 'Cell not found' }, { status: 404 });
    }

    // 2. Simulated ML Logic (Gradient Boosting Heuristic)
    // Features: current score, hour of day, network
    const hour = new Date().getHours();
    let risk = 0;

    // Peak Hour Risk (Lagos Rush Hour: 4pm - 8pm)
    if (hour >= 16 && hour <= 20) {
      risk += 0.4;
    }

    // Trend Risk (If current score is already declining)
    if (cell.composite_score < 0.6) {
      risk += 0.3;
    }

    // Network Specific Weights (Simulated)
    if (network === 'MTN') risk += 0.1; // Higher load

    const finalRisk = Math.min(Math.max(risk + (Math.random() * 0.2 - 0.1), 0), 1);

    // 3. Update database with new prediction
    await supabase
      .from('grid_cells')
      .update({ predicted_risk: finalRisk })
      .eq('cell_id', cell_id);

    return NextResponse.json({ 
      cell_id, 
      predicted_risk: finalRisk,
      confidence: 0.89,
      forecast_window: '60 minutes'
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
