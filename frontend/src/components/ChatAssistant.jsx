import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Coffee, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SuggestionChip = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-slate-100 dark:border-slate-800 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-all active:scale-95 whitespace-nowrap"
  >
    {text}
  </button>
);

const ChatAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', message: `Hello ${user?.name || 'there'}! I'm SmartFlow AI. How can I help you today?` }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', message: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.chat({ 
        message: msg, 
        history: messages.slice(-5) // Send short history
      });
      setMessages([...newMessages, data.data]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "SmartFlow AI is temporarily taking a coffee break (unavailable).";
      setMessages([...newMessages, { 
        role: 'assistant', 
        message: errorMsg 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = user?.role === 'admin' 
    ? ["Show recent activity", "System health check", "Pending approvals"]
    : ["My expenses overview", "How to submit receipt?", "Current status of approvals"];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-2xl shadow-primary-500/40 flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-indigo-600" />
            <MessageSquare size={24} className="relative z-10 group-hover:hidden" />
            <Sparkles size={24} className="relative z-10 hidden group-hover:block transition-all" />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="window"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="w-[380px] h-[550px] bg-white/80 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-600/10 to-transparent flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">SmartFlow Intelligence</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Online Center</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide scroll-smooth"
            >
              <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800/20">
                <p className="text-[11px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest mb-1">AI Assistant Pro</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Welcome to the V2.0 SmartFlow assistant. I can help with analytics, approval workflows, and expenditure telemetry.
                </p>
              </div>

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-indigo-100' : 'bg-primary-50'
                    }`}>
                      {msg.role === 'user' ? <User size={14} className="text-indigo-600" /> : <Bot size={14} className="text-primary-600" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Bot size={14} className="text-primary-600" />
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions & Input */}
            <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {suggestions.map((s, i) => (
                  <SuggestionChip key={i} text={s} onClick={handleSend} />
                ))}
              </div>

              <div className="relative group">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask SmartFlow anything..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 pr-14 text-sm focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAssistant;
