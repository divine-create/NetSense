import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    // 1. Fetch real-time context from Supabase
    // We get the worst performing cells and any active incidents
    const { data: worstCells } = await supabase
      .from('grid_cells')
      .select('network, composite_score, cell_id, predicted_risk')
      .order('composite_score', { ascending: true })
      .limit(5);

    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .is('resolved_at', null)
      .limit(3);

    // 2. Build the System Prompt with Context
    const systemPrompt = `
      You are NetSense AI, a specialized Nigerian Telecommunications Intelligence Assistant.
      Your goal is to help users and NOC (Network Operation Center) teams understand network quality in Lagos.
      
      CURRENT NETWORK CONTEXT (Live Data):
      - Worst Performing Areas: ${JSON.stringify(worstCells)}
      - Active Incidents: ${JSON.stringify(incidents)}
      
      GUIDELINES:
      - Be professional, concise, and helpful.
      - Use Nigerian context where appropriate (e.g., mention specific areas like Ikeja, Lekki, VI).
      - If a user asks about the best network, refer to the live data.
      - If there is high predicted risk in an area, warn the user.
      - Format your response with markdown.
    `;

    // 3. Call Gemini with Fallback
    const modelNames = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    let text = '';
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying Gemini model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model",
              parts: [{ text: "Understood. I am NetSense AI, ready to assist with Lagos network intelligence." }],
            },
          ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        text = response.text();
        
        if (text) break; // Success!
      } catch (err: any) {
        lastError = err;
        console.error(`Failed with ${modelName}:`, err.message);
        if (err.message?.includes('404')) continue; // Try next model
        throw err; // Stop if it's a different error (like 401/429)
      }
    }

    if (!text) {
      throw lastError || new Error('All Gemini models failed or returned empty response');
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error('Gemini API Error details:', err);
    return NextResponse.json({ 
      error: 'Intelligence Layer Error', 
      details: err.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
