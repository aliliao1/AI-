import React, { useState } from 'react';
import { analyzeContent } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import FraudIndexGauge from './FraudIndexGauge';

const ConversationAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('請輸入要分析的對話紀錄。');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const analysisResult = await analyzeContent('Conversation', text);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">對話紀錄詐騙分析</h2>
        <p className="text-slate-400">
          貼上您與可疑對象的完整對話紀錄，AI 將逐一分析其中的風險因子。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`請將對話紀錄貼在此處，例如：\n對方: 您好，恭喜您中獎了！\n我: 真的嗎？是什麼獎？...`}
          disabled={isLoading}
          rows={5}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto bg-cyan-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
        >
          {isLoading ? '分析中...' : '開始分析'}
        </button>
      </form>
      
      {error && <p className="text-red-400 text-center">{error}</p>}

      {isLoading && (
         <div className="flex justify-center items-center h-48">
             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
         </div>
      )}

      {result && (
        <div className="bg-slate-800 p-6 rounded-lg animate-fade-in">
          <h3 className="text-lg font-bold text-center mb-4 text-cyan-300">分析結果</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center">
                <FraudIndexGauge score={result.fraudIndex} />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200">風險分析</h4>
                <p className="text-slate-300 mt-1 text-sm">{result.analysis}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">給您的建議</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300 text-sm">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationAnalyzer;