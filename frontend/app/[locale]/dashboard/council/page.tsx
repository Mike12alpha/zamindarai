'use client';

import { useState, useRef, useEffect } from 'react';
import { apiUpload } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, ImageIcon, X, User, Bot, Sparkles } from 'lucide-react';
import VoiceInputButton from '@/components/VoiceInputButton';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  plan?: any;
}

export default function CouncilPage() {
  const t = useT();
  const locale = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    const userMsg = input.trim() || '[Image attached]';
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', userMsg);
      formData.append('language', locale);
      if (file) formData.append('image', file);

      const data = await apiUpload('/council/chat', formData);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, plan: data.plan }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: err.message || 'Error' }]);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="p-4 md:p-6 border-b border-white/5 glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-emerald-500/20 border border-primary-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('council.title')}</h1>
            <p className="text-sm text-slate-500">{t('council.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
              <Bot className="w-10 h-10" />
            </div>
            <p className="text-sm">{t('council.emptyState')}</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                  ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'glass border border-white/5 text-slate-200'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.plan && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-2">{t('council.agentsCalled')}:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.plan.agents_needed?.map((a: string) => (
                        <span key={a} className="text-xs bg-white/5 text-primary-400 border border-primary-500/20 px-2.5 py-1 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-primary-400" /> 
            <span className="text-slate-400">{t('council.thinking')}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 glass border-t border-white/5">
        {file && (
          <div className="flex items-center gap-2 mb-3 text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-xl inline-flex border border-white/5">
            <ImageIcon className="w-4 h-4 text-primary-400" /> {file.name}
            <button onClick={() => setFile(null)} className="hover:text-red-400 transition-colors ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} 
            className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <VoiceInputButton
            locale={locale}
            onResult={(text) => setInput((prev) => prev + (prev ? ' ' : '') + text)}
            disabled={loading}
            className="shrink-0"
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('council.placeholder')}
            rows={1}
            className="flex-1 resize-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none input-glow text-sm text-white placeholder-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !file)}
            className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-500 transition-all duration-300 disabled:opacity-50 shrink-0 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
