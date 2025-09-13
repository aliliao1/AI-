export enum AppTab {
  Chatbot,
  URLAnalyzer,
  TextAnalyzer,
  ConversationAnalyzer,
  Resources,
}

export interface AnalysisResult {
  fraudIndex: number;
  analysis: string;
  suggestions: string[];
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}