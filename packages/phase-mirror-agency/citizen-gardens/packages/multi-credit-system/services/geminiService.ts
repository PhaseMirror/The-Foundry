
import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY directly for initialization as per guidelines
export const getGeminiExplanation = async (topic: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the following Citizen Gardens concept based on official bylaws: ${topic}. Keep it professional, encouraging, and brief. Mention how it impacts the credit economy.`,
      config: {
        systemInstruction: "You are an expert on Citizen Gardens bylaws and the multi-credit participation economy."
      }
    });
    // The .text property directly returns the string output; fallback provided if undefined
    return response.text || "No explanation available at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The credit system is the circulatory system of the entire organization, recognizing and routing member participation toward community benefit.";
  }
};
