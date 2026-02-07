
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { GeminiService } from '../services/geminiService';

const gemini = new GeminiService();

const DAIAChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      const initial = await gemini.getInitialBriefing();
      setMessages([{
        role: 'assistant',
        content: initial,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await gemini.generateDAIAResponse(input, history);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }]);
    setIsLoading(false);
  };

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-xl shadow-red-900/20 hover:bg-red-500 transition-all flex items-center gap-2 group"
      >
        <Bot className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">DAIA Briefing</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#1a1d23] border border-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-[#2a2e35] p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">DAIA Agent</h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">Live Observability</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-gray-700 rounded-md transition-colors">
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-[#16181d]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
              m.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-[#2a2e35] text-gray-200 border border-gray-700 rounded-tl-none prose prose-invert prose-xs'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div className={`text-[10px] mt-1.5 opacity-40 font-mono ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2e35] border border-gray-700 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">DAIA is analyzing logs...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#1a1d23] border-t border-gray-800">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about NA anomaly or root causes..."
            className="w-full bg-[#0f1115] border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DAIAChat;
