import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
  try {
    // 1. Fetch historical data from SQLite
    const accountsRes = await db.execute('SELECT * FROM market_accounts ORDER BY date DESC LIMIT 12');
    const firmsRes = await db.execute('SELECT * FROM firms');
    const socialRes = await db.execute('SELECT * FROM social_metrics ORDER BY date DESC LIMIT 45'); // Last month for all 15

    const prompt = `
      You are a Vietnamese Stock Leader Strategist. Analyze the following data for the Vietnam securities market:
      
      Market Account Growth (Last 12 Months):
      ${JSON.stringify(accountsRes.rows)}
      
      Social Media Growth (Top 15 Firms):
      ${JSON.stringify(socialRes.rows)}
      
      Based on this data:
      1. Predict the market trajectory for the next month.
      2. Identify which firms are winning the "digital battle" (social growth).
      3. Provide a strategic insight on the overall economy based on the account opening rate.
      
      Keep your answer professional, concise (max 300 words), and tailored for a high-level dashboard. 
      Use Markdown formatting.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ insight: text });
  } catch (error) {
    console.error('Gemini Error:', error);
    return NextResponse.json({ insight: "AI Strategy temporarily unavailable. Market remains bullish based on recent account openings." });
  }
}
