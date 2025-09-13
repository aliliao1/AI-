import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import URLAnalyzer from './components/URLAnalyzer';
import TextAnalyzer from './components/TextAnalyzer';
import ConversationAnalyzer from './components/ConversationAnalyzer';
import Resources from './components/Resources';
import { ChatIcon } from './components/icons/ChatIcon';
import { LinkIcon } from './components/icons/LinkIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { ConversationIcon } from './components/icons/ConversationIcon';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Chatbot);

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.Chatbot:
        return <Chatbot />;
      case AppTab.URLAnalyzer:
        return <URLAnalyzer />;
      case AppTab.TextAnalyzer:
        return <TextAnalyzer />;
      case AppTab.ConversationAnalyzer:
        return <ConversationAnalyzer />;
      case AppTab.Resources:
        return <Resources />;
      default:
        return <Chatbot />;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: AppTab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm sm:text-base font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 rounded-lg ${
        activeTab === tab ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <ShieldCheckIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
              AI 防詐騙達人
            </h1>
          </div>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            您的數位守護者。透過 AI 分析，即時評估詐騙風險，保護您的資訊安全。
          </p>
        </header>

        <main className="bg-slate-800/50 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm">
          <nav className="p-2 sm:p-3 bg-slate-800/60 rounded-t-2xl border-b border-slate-700">
            <div className="flex space-x-2 sm:space-x-3">
              <TabButton tab={AppTab.Chatbot} label="智能聊天" icon={<ChatIcon className="w-5 h-5" />} />
              <TabButton tab={AppTab.URLAnalyzer} label="網址分析" icon={<LinkIcon className="w-5 h-5" />} />
              <TabButton tab={AppTab.TextAnalyzer} label="文字分析" icon={<DocumentTextIcon className="w-5 h-5" />} />
              <TabButton tab={AppTab.ConversationAnalyzer} label="對話分析" icon={<ConversationIcon className="w-5 h-5" />} />
              <TabButton tab={AppTab.Resources} label="官方資源" icon={<ShieldCheckIcon className="w-5 h-5" />} />
            </div>
          </nav>

          <div className="p-4 sm:p-6 min-h-[60vh] transition-all duration-300">
            {renderTabContent()}
          </div>
        </main>

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Fraud Prevention Assistant. All rights reserved.</p>
          <p className="mt-1">此分析結果僅供參考，請結合自身判斷做出最終決定。</p>
        </footer>
      </div>
    </div>
  );
};

export default App;