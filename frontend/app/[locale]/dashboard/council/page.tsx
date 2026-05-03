'use client';

import { useState, useRef, useEffect } from 'react';
import { apiUpload } from '@/lib/api';
import { useT, useLocale } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, ImageIcon, X, User, Bot } from 'lucide-react';
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
      <div className="p-4 md:p-6 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-600" /> {t('council.title')}
        </h1>
        <p className="text-sm text-slate-500">{t('council.subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Bot className="w-12 h-12 mb-3" />
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.plan && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">{t('council.agentsCalled')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.plan.agents_needed?.map((a: string) => (
                        <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>
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
            <Loader2 className="w-4 h-4 animate-spin" /> {t('council.thinking')}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        {file && (
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex">
            <ImageIcon className="w-4 h-4" /> {file.name}
            <button onClick={() => setFile(null)}><X className="w-3 h-3" /></button>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
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
            className="flex-1 resize-none px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !file)}
            className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
