import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWarningMessage = async (user: User, reason: string): Promise<string> => {
  try {
    const prompt = `
      Write a professional but firm warning message for a user named ${user.name} (Role: ${user.role}).
      The reason for the warning is: "${reason}".
      Keep it under 50 words. Be direct.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Warning: Please adhere to the community guidelines.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Warning: ${reason}`;
  }
};

export const analyzeUserActivity = async (user: User): Promise<string> => {
  try {
    const logsText = user.logs.map(l => `${l.timestamp}: ${l.action} (${l.details || ''})`).join('\n');
    const prompt = `
      Analyze the following activity logs for user ${user.name}.
      Identify any suspicious patterns or provide a brief summary of their engagement.
      
      Logs:
      ${logsText}
      
      Keep the analysis concise (max 2 sentences).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No specific patterns detected.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analysis unavailable.";
  }
};

export const getAIChatResponse = async (history: string, newMessage: string): Promise<string> => {
  try {
    const prompt = `
      You are a helpful support bot for the NexusAdmin platform.
      
      Conversation History:
      ${history}
      
      User: ${newMessage}
      
      Reply helpfully and briefly.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I'm here to help!";
  } catch (error) {
    return "I am currently having trouble connecting. Please try again later.";
  }
}
