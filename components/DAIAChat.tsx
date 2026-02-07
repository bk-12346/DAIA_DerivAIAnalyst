
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DashboardState } from '../types';
import { geminiService } from '../services/geminiService';

interface DAIAChatProps {
  currentData: DashboardState;
}

const DAIAChat: React.FC<DAIAChatProps> = ({ currentData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track the unique state to trigger resets
  const dataKey = JSON.stringify({ 
    z: currentData.zScore, 
    val: currentData.globalDau.value,
    path: currentData.investigationPath 
  });

  const initChat = async () => {
    setIsLoading(true);
    const initial = await geminiService.getInitialBriefing();
    setMessages([{
      role: 'assistant',
      content: initial,
      timestamp: new Date()
    }]);
    setIsLoading(false);
  };

  useEffect(() => {
    initChat();
  }, [dataKey]);

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
    const response = await geminiService.generateDAIAResponse(input, history);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 p-5 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">DAIA INTELLIGENCE</h3>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest animate-pulse">
              Active Briefing
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user' 
              ? 'bg-slate-900 text-white rounded-tr-none shadow-sm' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none prose prose-slate prose-xs shadow-sm'
            }`}>
              <div className="chat-markdown">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              <div className={`text-[10px] mt-2 opacity-60 font-mono ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 flex items-center gap-3 shadow-sm">
              <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">DAIA is analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-5 bg-white border-t border-slate-200">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask DAIA about root causes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-5 pr-14 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors shadow-lg shadow-red-600/10"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DAIAChat;
