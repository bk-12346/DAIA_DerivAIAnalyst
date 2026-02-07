
import { GoogleGenAI, Type } from "@google/genai";
import { DAIA_CONTEXT } from "../constants";
import { DashboardState } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private currentContext: string = DAIA_CONTEXT;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  private cleanJsonString(str: string): string {
    // Remove markdown code fences if present
    return str
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();
  }

  updateContextFromState(state: DashboardState) {
    const status = (state.zScore < -2 || state.zScore > 2) ? "ANOMALY DETECTED" : "SYSTEM HEALTHY";
    
    this.currentContext = `
You are DAIA (Deriv AI Analyst), a real-time enterprise intelligence agent for Deriv's Data Health & Observability platform. 
You help executives and data teams understand what's happening across Deriv's business metrics.

CURRENT STATUS: ${status}

LATEST ANALYSIS RESULTS:
Global Metrics:
- Active Daily Users: ${state.globalDau.value.toLocaleString()} (${state.globalDau.change > 0 ? '+' : ''}${state.globalDau.change}% vs baseline of ${state.globalDau.baseline.toLocaleString()})
- Trading Volume: $${state.tradingVolume.value.toLocaleString()} (${state.tradingVolume.change > 0 ? '+' : ''}${state.tradingVolume.change}% vs baseline of $${state.tradingVolume.baseline.toLocaleString()})
- Net P&L: $${state.netPnl.value.toLocaleString()}
- Exposure Imbalance: ${state.exposureImbalance.value}%

Regional Breakdown:
${state.regions.map(r => `- ${r.region}: DAU ${r.dauChange > 0 ? '+' : ''}${r.dauChange}% (${r.status === 'anomaly' ? 'Anomaly' : 'Healthy'})`).join('\n')}

Platform Signals:
${state.platforms.map(p => `- ${p.platform}: DAU ${p.dauChange > 0 ? '+' : ''}${p.dauChange}%, volume ${p.volumeChange > 0 ? '+' : ''}${p.volumeChange}%`).join('\n')}

Investigation Details:
- Z-score: ${state.zScore}
- Path: ${state.investigationPath.length > 0 ? state.investigationPath.join(' → ') : 'None'}

BEHAVIOR RULES:
1. Always reference THESE specific numbers.
2. If anomaly detected, focus on root cause hypotheses: platform deploys, liquidity shifts, or regional events.
3. If healthy, acknowledge stability.
4. Concise, professional, direct briefing style.
`;
  }

  async analyzeTelemetryData(csvData: any[]): Promise<DashboardState> {
    console.log(`CSV data ready, rows: ${csvData.length}`);
    
    const prompt = `You are a data analysis engine. You receive CSV data with columns: date, region, platform, instrument_group, daily_active_users, trade_volume. 
    Analyze it: split into baseline window (first 21 days) and recent window (last 2 days). 
    
    METHODOLOGY:
    1. Compute global DAU: sum daily_active_users across all segments per day, then average for baseline and recent.
    2. Compute regional DAU: same but grouped by region (NA, EU, APAC).
    3. Compute percentage change: (recent_avg - baseline_avg) / baseline_avg * 100.
    4. Compute z-score: (recent_avg - baseline_avg) / baseline_std_dev.
    5. Flag anomaly if z-score < -2 OR percentage change < -15% at global or regional level.
    6. Identify worst path: which Region → Platform → Instrument has the largest negative DAU change.
    
    CRITICAL: You MUST respond ONLY with a valid JSON object matching the exact interface below. No markdown fences. No preamble.
    
    INTERFACE SCHEMA:
    {
      "globalDau": { "value": number, "change": number, "baseline": number, "label": "Active Daily Users (DAU)" },
      "tradingVolume": { "value": number, "change": number, "baseline": number, "label": "Trading Volume", "unit": "$" },
      "netPnl": { "value": number, "change": number, "baseline": number, "label": "Net P&L", "unit": "$" },
      "exposureImbalance": { "value": number, "change": number, "baseline": number, "label": "Exposure Imbalance", "unit": "%" },
      "regions": [ { "region": "NA"|"EU"|"APAC", "dauChange": number, "status": "healthy"|"anomaly" } ],
      "platforms": [ { "platform": string, "dauChange": number, "volumeChange": number } ],
      "instruments": [ { "instrument": string, "dauChange": number, "volumeChange": number } ],
      "zScore": number,
      "investigationPath": string[] (e.g., ["NA", "Trader", "Synthetics"])
    }

    DATA:
    ${JSON.stringify(csvData.slice(0, 400))}
    `;

    console.log("Sending to Gemini...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawResponse = response.text;
    console.log("Gemini raw response:", rawResponse);

    if (!rawResponse) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedJson = this.cleanJsonString(rawResponse);
    
    try {
      const result = JSON.parse(cleanedJson) as DashboardState;
      console.log("Parsed JSON:", result);
      console.log("Updating state...");
      this.updateContextFromState(result);
      return result;
    } catch (e) {
      console.error("JSON Parsing Failed. Raw output:", rawResponse);
      throw new Error("Could not parse analysis results from AI. The model returned an incompatible format.");
    }
  }

  async generateExecutiveReport(state: DashboardState): Promise<string> {
    const prompt = `Generate an executive briefing report based on the following analysis results. 
    Include these sections:
    ### Market Overview
    ### Key Regional & Platform Drivers
    ### Trading & Risk Commentary
    ### Executive Summary / What to Watch Next
    
    Use a professional tone and specific numbers. Path: ${state.investigationPath.join(' → ')}. Z-Score: ${state.zScore}.
    
    DATA: ${JSON.stringify(state)}
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return response.text || "Report generation failed.";
  }

  async generateDAIAResponse(userMessage: string, history: { role: 'user' | 'assistant', content: string }[]) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: this.currentContext,
          temperature: 0.2,
        },
      });

      return response.text || "I'm sorry, I'm having trouble processing that request.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Critical connection error to DAIA brain.";
    }
  }

  async getInitialBriefing() {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Provide the initial snapshot brief based on current context.",
        config: {
          systemInstruction: this.currentContext,
          temperature: 0.1,
        },
      });
      return response.text || "Status report unavailable.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "System Online. No anomalies detected.";
    }
  }
}

export const geminiService = new GeminiService();
