
import { GoogleGenAI } from "@google/genai";
import { DAIA_CONTEXT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
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
          systemInstruction: DAIA_CONTEXT,
          temperature: 0.2, // Keep it precise
        },
      });

      return response.text || "I'm sorry, I'm having trouble processing that request.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Critical connection error to DAIA brain. Please check your connectivity and try again.";
    }
  }

  async getInitialBriefing() {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Provide the initial snapshot brief as specified in your instructions.",
        config: {
          systemInstruction: DAIA_CONTEXT,
          temperature: 0.1,
        },
      });
      return response.text || "Anomaly detected in North America. Global DAU down 10.5%.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "System Online. Anomaly detected in NA region. Please investigate.";
    }
  }
}
