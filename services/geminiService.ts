import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    fraudIndex: {
      type: Type.INTEGER,
      description: "詐騙指數，範圍 0-100。0代表絕對安全，100代表極高詐騙風險。",
    },
    analysis: {
      type: Type.STRING,
      description: "對提供的內容的詳細詐騙風險分析摘要，說明判斷依據。",
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "給使用者的具體建議清單，說明如何應對這種情況。",
    },
  },
  required: ["fraudIndex", "analysis", "suggestions"],
};

export const analyzeContent = async (type: 'URL' | 'Text' | 'Conversation', content: string) => {
  let prompt: string;

  if (type === 'Conversation') {
    prompt = `你是一位資深的網路安全與詐騙分析專家。請分析以下這段對話紀錄的詐騙風險。請仔細檢查對話中的所有可疑跡象，例如：
- **建立信任感**: 是否過於迅速地建立親密關係或信任？
- **製造緊急性**: 是否有任何製造時間壓力或緊急情況的說詞？
- **情感操控**: 是否利用同情心、恐懼、貪婪或興奮等情緒來影響判斷？
- **要求個資或金錢**: 是否有不尋常地要求個人資訊、帳戶密碼、或直接要求匯款/購買點數卡？
- **不一致的說詞**: 對話前後是否有矛盾或不合常理之處？
- **模糊不清的回答**: 對方是否迴避關鍵問題？

基於你的分析，請以 JSON 格式回傳結果，須包含詐騙指數 (0-100)、詳細分析摘要和給使用者的具體建議。

對話紀錄:
"""
${content}
"""
`;
  } else {
    prompt = `你是一位資深的網路安全與詐騙分析專家。請分析以下${type === 'URL' ? '網站 URL' : '文字內容'}的詐騙風險。檢查所有可能的危險信號，例如：不安全的連結、可疑的網域、文法錯誤、緊急或威脅的語氣、不合理的要求、釣魚企圖等。
    
    基於你的分析，請以 JSON 格式回傳結果，須包含詐騙指數 (0-100)、詳細分析摘要和給使用者的具體建議。
    
    ${type === 'URL' ? '網址' : '文字內容'}: "${content}"
    `;
  }


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    // It's good practice to parse it to ensure it's valid JSON
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw new Error("無法分析內容，請稍後再試。");
  }
};


let chatInstance: Chat | null = null;

const getChatInstance = () => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "你是一位專業、有同理心且謹慎的防詐騙專家顧問。你的任務是與使用者對話，分析他們遇到的情況，評估詐騙風險，並提供清晰、可行的建議。請以友善且專業的語氣回應。當使用者描述一個情境時，你可以追問細節以釐清狀況，然後提供一個0到100的詐騙指數，並解釋你為什麼給出這個分數，最後提供具體建議。",
      },
    });
  }
  return chatInstance;
}

export const sendChatMessage = async (message: string): Promise<string> => {
    try {
        const chat = getChatInstance();
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw new Error("訊息發送失敗，請稍後再試。");
    }
};


export const getOfficialResources = async (country: string): Promise<string> => {
    const prompt = `請提供在 "${country}" 地區的官方政府反詐騙單位或相關機構的查詢方式。請提供官方網站連結、聯絡電話（如果有的話）和簡要說明。如果有多個單位，請列出主要的1-2個。請以清晰的 Markdown 格式回覆。`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching resources:", error);
        throw new Error("查詢資源失敗，請稍後再試。");
    }
};