import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function GET() {
  try {
    // 1. Fetch critical data from DB
    const { data: cells } = await supabase
      .from('grid_cells')
      .select('*')
      .order('composite_score', { ascending: true })
      .limit(10);

    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .is('resolved_at', null)
      .limit(5);

    // 2. Prepare prompt
    const context = {
      worst_performing_cells: cells?.map(c => ({
        network: c.network,
        score: c.composite_score,
        risk: c.predicted_risk
      })),
      active_incidents: incidents?.map(i => ({
        zone: i.zone,
        severity: i.severity,
        desc: i.description
      }))
    };

    const prompt = `
      You are a Network Operations Center (NOC) AI Assistant for NetSense, a network intelligence platform in Nigeria.
      Analyze the following live network data and provide a concise, professional, and actionable summary for the dashboard.
      Focus on critical failures, trends in network quality, and potential risks.
      
      DATA:
      ${JSON.stringify(context, null, 2)}
      
      Your summary should be 2-3 sentences max. Be specific about networks (MTN, Airtel, etc.) and zones if available.
      Avoid introductory filler like "Based on the data...". Start directly with the insights.
    `;

    // 3. Generate Summary
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI Summary Error:', error);
    return NextResponse.json({ 
      summary: "AI Summary temporarily unavailable. Monitoring system active. Please check the incident feed manually." 
    }, { status: 500 });
  }
}
