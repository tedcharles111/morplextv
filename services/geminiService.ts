import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeReceipt = async (file: File): Promise<ReceiptData | null> => {
  try {
    const base64Data = await fileToBase64(file);

    const prompt = `
      Analyze this image of a bank transfer receipt or payment proof.
      Extract the following information in JSON format:
      1. transactionRef: The transaction reference number.
      2. amount: The amount paid (as a number).
      3. date: The date of transaction.
      4. senderName: The name of the sender.
      5. decoderCode: Look for a specific code labeled 'Decoder Code', 'Smart Card', 'IUC', or a pattern like 'MPX-' followed by alphanumerics. If written by hand, try to decipher it.
      
      If any field is not found, set it to null.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                transactionRef: { type: Type.STRING, nullable: true },
                amount: { type: Type.NUMBER, nullable: true },
                date: { type: Type.STRING, nullable: true },
                senderName: { type: Type.STRING, nullable: true },
                decoderCode: { type: Type.STRING, nullable: true },
            }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as ReceiptData;
    }
    return null;

  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to analyze receipt.");
  }
};
