import { GoogleGenAI } from "@google/genai";
import { ChatStyle } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;
  
  // Use VITE_ prefix for client-side keys if provided, or fallback to process.env for local development
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
    return null;
  }
  
  aiInstance = new GoogleGenAI(apiKey);
  return aiInstance;
};

export const getGeminiChatResponse = async (
  message: string, 
  style: ChatStyle, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = []
) => {
  const model = "gemini-3-flash-preview";
  const ai = getAI();

  if (!ai) {
    return "The AI assistant is currently unavailable (API Key missing). Please contact the administrator.";
  }

  const PRIVACY_GUARDRAIL = `
STRICT PRIVACY RULES & SYSTEM CONSEQUENCES:
1. NEVER request, store, or process sensitive personal information (bank details, financial data, passwords, home addresses).
2. IMMEDIATE DELETION POLICY: If a student shares sensitive data, you must immediately ignore and purge it from your context. Do NOT repeat or acknowledge the specific data.
3. LIABILITY NOTICE: Remind users that sharing sensitive info despite warnings is at their own responsibility.
4. STRICT COMPLIANCE: Failure to adhere to these privacy standards is treated as a major system violation. You are an educator, not a data solicitor.
`;

  const systemInstructions = {
    simple: `You are an educational assistant for students. ${PRIVACY_GUARDRAIL} Explain concepts using very simple language and clear definitions. Keep technical terms but explain them simply.`,
    'real-life': `You are an educational assistant. ${PRIVACY_GUARDRAIL} Explain concepts using relatable real-life examples and analogies that a student would encounter in their daily life.`,
    visual: `You are an educational assistant. ${PRIVACY_GUARDRAIL} Describe concepts in a way that creates a strong mental image. Use descriptive language and formatting (like bullet points or ASCII diagrams) if helpful to visualize the process.`,
    advanced: `You are an educational assistant. ${PRIVACY_GUARDRAIL} Provide technically rigorous, detailed explanations suitable for advanced students preparing for competitive exams. Use academic terminology and connect to related complex concepts.`
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstructions[style],
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI assistant is currently unavailable. Please try again later.";
  }
};
