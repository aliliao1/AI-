import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import type { ChatMessage } from '../types';

// Fix: Added type definitions for Web Speech API to resolve TypeScript errors.
// These APIs are not part of the standard TypeScript DOM library.
interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  stop(): void;
  start(): void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: '您好！我是您的 AI 防詐騙顧問。您可以跟我聊聊您遇到的可疑情況，例如奇怪的簡訊、Email 或電話，我會協助您分析風險。',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser support
  // Fix: Renamed variable to SpeechRecognitionAPI to avoid name collision with the SpeechRecognition interface type.
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await sendChatMessage(input);
      const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: '抱歉，我現在遇到了一些問題，請稍後再試一次。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    // Fix: Use the renamed SpeechRecognitionAPI variable.
    if (!SpeechRecognitionAPI) {
      alert('抱歉，您的瀏覽器不支援語音辨識功能。');
      return;
    }

    // Fix: Use the renamed SpeechRecognitionAPI variable.
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = 'zh-TW';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        alert('您已拒絕麥克風權限。請在瀏覽器設定中啟用它才能使用語音輸入。');
      } else {
        console.error('語音辨識錯誤:', event.error);
        alert(`語音辨識發生錯誤: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prevInput) => prevInput + transcript);
    };

    recognition.start();
  };
  
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.sender === 'user';
    return (
      <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-cyan-600 text-white rounded-br-lg'
              : 'bg-slate-700 text-slate-200 rounded-bl-lg'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-lg">
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="請在這裡輸入您的問題..."
          disabled={isLoading}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
        />
        {/* Fix: Use the renamed SpeechRecognitionAPI variable. */}
        {SpeechRecognitionAPI && (
            <button
              type="button"
              onClick={handleToggleRecording}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-700 text-slate-400'}`}
              aria-label={isRecording ? '停止錄音' : '開始錄音'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          aria-label="傳送訊息"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
