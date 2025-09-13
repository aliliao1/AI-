
import React, { useState } from 'react';
import { getOfficialResources } from '../services/geminiService';

const Resources: React.FC = () => {
  const [country, setCountry] = useState('台灣');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) {
      setError('請輸入要查詢的國家或地區。');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const resourceResult = await getOfficialResources(country);
      setResult(resourceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">官方防詐資源查詢</h2>
        <p className="text-slate-400">
          輸入您所在的國家或地區，查詢當地的官方反詐騙機構與聯絡方式。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="例如：台灣、香港、美國"
          disabled={isLoading}
          className="flex-1 w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto bg-cyan-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
        >
          {isLoading ? '查詢中...' : '查詢資源'}
        </button>
      </form>

      {error && <p className="text-red-400 text-center">{error}</p>}

      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      )}

      {result && (
        <div className="bg-slate-800 p-6 rounded-lg animate-fade-in prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
            <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
};

export default Resources;
