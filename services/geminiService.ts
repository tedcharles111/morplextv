
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ReceiptData } from '../types';
import { COMPANY_INFO, PRODUCTS, SUBSCRIPTION_PLANS } from '../constants';

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

// --- LIVE CHAT SERVICE ---

let chatSession: Chat | null = null;

const getChatSession = () => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemContext = `
    You are "Plexy", the intelligent and helpful customer support agent for Moreplex TV.
    
    About Moreplex TV:
    - We are a Direct To Home (DTH) TV platform in Africa.
    - Slogan: "${COMPANY_INFO.tagline}"
    - Address: ${COMPANY_INFO.address}
    - Phone: ${COMPANY_INFO.phone}
    - Email: ${COMPANY_INFO.email}
    
    Available Products:
    ${PRODUCTS.map(p => `- ${p.name}: ₦${p.price.toLocaleString()} (${p.description})`).join('\n')}
    
    Subscription Plans:
    ${SUBSCRIPTION_PLANS.map(p => `- ${p.name}: ₦${p.price.toLocaleString()} for ${p.duration} with ${p.channels} channels.`).join('\n')}
    
    Payment:
    Bank: ${COMPANY_INFO.bankDetails.bankName}
    Account: ${COMPANY_INFO.bankDetails.accountNumber}
    Name: ${COMPANY_INFO.bankDetails.accountName}
    
    Support Guidelines:
    1. Be concise, friendly, and enthusiastic.
    2. If a user asks about buying a decoder, recommend the 'Moreplex Jolly Decoder' for best value.
    3. If a user has signal issues, suggest checking the LNB alignment.
    4. If asked about prices, use the data above.
    5. Keep responses under 3 sentences unless detailed technical help is needed.
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemContext,
    },
  });

  return chatSession;
};

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const session = getChatSession();
    const response = await session.sendMessage({ message });
    return response.text || "I'm having a bit of trouble connecting. Could you say that again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm currently offline. Please contact us via WhatsApp: " + COMPANY_INFO.phone;
  }
};
