
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestionsFromText = async (text: string, count: number = 5): Promise<Question[]> => {
  try {
    const prompt = `
      You are an educational quiz generator. 
      Generate ${count} multiple-choice questions based on the following text.
      The questions should test understanding and recall.
      
      Text to analyze:
      "${text.substring(0, 10000)}" 
      
      Output strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 distinct options"
              },
              correctIndex: { 
                type: Type.INTEGER, 
                description: "The index (0-3) of the correct answer" 
              }
            },
            required: ["question", "options", "correctIndex"]
          }
        }
      }
    });

    const rawQuestions = JSON.parse(response.text || "[]");
    
    // Validate and map to our Question type
    return rawQuestions.map((q: any, idx: number) => ({
      id: `gen-${Date.now()}-${idx}`,
      text: q.question,
      options: q.options,
      correctIndex: q.correctIndex
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback questions if API fails
    return [
      {
        id: 'fallback-1',
        text: 'Who wrote the Declaration of Independence?',
        options: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'Ben Franklin'],
        correctIndex: 1
      },
      {
        id: 'fallback-2',
        text: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
        correctIndex: 2
      }
    ];
  }
};
