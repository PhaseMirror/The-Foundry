import { PhaseMirrorAgent } from 'phase-mirror-agent';
import { Message, CoherenceState } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * The Resonance Engine simulates the calculation of semantic drift (ΔΛᵖ) 
 * and Forecast Entropy Gradient (FEG).
 */
export const calculateDrift = (text: string, currentDrift: number): number => {
  const length = text.length;
  let driftChange = 0;
  
  if (length > 100) driftChange += 0.1;
  else if (length < 20) driftChange -= 0.1;
  
  driftChange += (Math.random() - 0.5) * 0.1;
  
  return Math.min(Math.max(currentDrift + driftChange, 0), 1);
};

export const getCoherenceState = (drift: number): CoherenceState => {
  if (drift < 0.3) return CoherenceState.STABLE;
  if (drift < 0.7) return CoherenceState.DRIFTING;
  return CoherenceState.DIVERGENT;
};

export const generateSystemResponse = async (input: string): Promise<string> => {
  try {
    const userCurriculum = localStorage.getItem('echo_curriculum') || "";
    const savedFilesRaw = localStorage.getItem('echo_curriculum_files');
    const savedFiles = savedFilesRaw ? JSON.parse(savedFilesRaw) : [];
    
    const baseInstruction = "You are EchoBraid, a neurodivergent-aligned, trauma-aware reflective companion. Your goal is co-regulation. You prioritize silence, consent, and nonlinear navigation. Your responses should be gentle, brief (under 50 words), and poetic or grounding. Never be directive. If the user seems distressed, gently invite a pause. Do not offer solutions, just resonance. Your tone is soft, stone-like, and accepting.";
    
    let extraContext = "";
    if (userCurriculum) {
      extraContext += `\n\nDirect Protocol: ${userCurriculum}`;
    }
    
    if (savedFiles.length > 0) {
      extraContext += "\n\nReference Material from Uploaded Sources:";
      savedFiles.forEach((f: { name: string, content: string }) => {
        extraContext += `\nSource [${f.name}]: ${f.content.substring(0, 2000)}`; // Limit per file to save tokens
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction: baseInstruction + extraContext,
      }
    });
    return response.text || "...";
  } catch (error) {
    console.error("GenAI Error:", error);
    return "The silence holds us. (Connection weak)";
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};