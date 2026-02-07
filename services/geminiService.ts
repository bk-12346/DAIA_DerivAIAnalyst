
import { GoogleGenAI, Type } from "@google/genai";
import { DAIA_CONTEXT } from "../constants";
import { DashboardState } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private currentContext: string = DAIA_CONTEXT;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
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
    const prompt = `You are a data analysis engine. You receive CSV data with columns: date, region, platform, instrument_group, daily_active_users, trade_volume. 
    Analyze it: split into baseline (first 21 days) and recent (last 2 days). 
    Compute global DAU, regional DAU, percentage changes, z-scores. 
    Flag anomaly if z-score < -2 OR percentage change < -15%. 
    Identify worst path (Region -> Platform -> Instrument). 
    CRITICAL: Only include metrics present in the CSV. If no P&L column, set P&L to 0. If no exposure column, set exposure to 0.0%. 
    Never invent data. Respond ONLY with a JSON object (no markdown, no backticks, no extra text) matching the DashboardState TypeScript interface shape.
    
    DATA:
    ${JSON.stringify(csvData.slice(0, 500))} // Limit to 500 rows for token efficiency
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}") as DashboardState;
    this.updateContextFromState(result);
    return result;
  }

  async generateDAIAResponse(userMessage: string, history: { role: 'user' | 'assistant', content: string }[]) {
    try {
      const response = await this.ai.models.generateContent({
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
      const response = await this.ai.models.generateContent({
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

// Singleton for sharing between App and Chat
export const geminiService = new GeminiService();
