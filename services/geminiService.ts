import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const schema = {
  type: Type.OBJECT,
  properties: {
    disease: {
      type: Type.STRING,
      description: "The identified disease. Must be one of: Healthy, Leaf Curl, Blight, or Leaf Spot."
    },
    confidence: {
      type: Type.NUMBER,
      description: "The confidence score of the prediction, as a percentage from 0 to 100."
    },
    explanation: {
      type: Type.STRING,
      description: "A brief, one-paragraph explanation for the diagnosis, highlighting key visual indicators from the image."
    }
  },
  required: ["disease", "confidence", "explanation"]
};

export const analyzeChilliLeaf = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const prompt = `You are an expert agricultural AI specializing in plant pathology, with a focus on chilli plants. Analyze the following chilli leaf image.
  
  Your task is to:
  1. Classify the disease from one of the following categories: Healthy, Leaf Curl, Blight, or Leaf Spot.
  2. Provide a confidence score for your classification (e.g., 95).
  3. Write a brief, user-friendly explanation for your diagnosis, mentioning the visual evidence you see in the image.
  
  Return the result in a structured JSON format.`;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.2, // Lower temperature for more deterministic classification
        }
    });
    
    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    // Basic validation
    if (!result.disease || typeof result.confidence !== 'number' || !result.explanation) {
        throw new Error("Invalid response format from API");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};
