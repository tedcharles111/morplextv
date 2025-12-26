
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from '../types';

/**
 * Converts a file object to a base64 encoded string.
 */
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

/**
 * Analyzes a bank receipt image using Gemini 3 Flash to extract transaction details.
 */
export const analyzeReceipt = async (file: File): Promise<ReceiptData | null> => {
  try {
    // Initialize GoogleGenAI directly with the API key from environment variables.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    // Using 'gemini-3-flash-preview' for efficient and accurate vision/text processing.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
                transactionRef: { 
                  type: Type.STRING,
                  description: 'The unique reference number of the bank transaction.'
                },
                amount: { 
                  type: Type.NUMBER,
                  description: 'The total amount transferred.'
                },
                date: { 
                  type: Type.STRING,
                  description: 'The date and time of the transaction.'
                },
                senderName: { 
                  type: Type.STRING,
                  description: 'The name of the person or entity who sent the money.'
                },
                decoderCode: { 
                  type: Type.STRING,
                  description: 'The Moreplex decoder IUC or smart card number (e.g., MPX-123456).'
                },
            },
            propertyOrdering: ["transactionRef", "amount", "date", "senderName", "decoderCode"]
        }
      }
    });

    // Directly access the text property as per the latest SDK guidelines.
    const textOutput = response.text;
    if (textOutput) {
        return JSON.parse(textOutput.trim()) as ReceiptData;
    }
    return null;

  } catch (error) {
    console.error("OCR Analysis Error:", error);
    // Gracefully handle API errors by returning null.
    return null;
  }
};
