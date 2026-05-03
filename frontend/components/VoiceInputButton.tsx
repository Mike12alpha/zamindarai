'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  locale: string;
  disabled?: boolean;
  className?: string;
}

function getSpeechLang(locale: string): string {
  if (locale === 'ur') return 'ur-PK';
  return 'en-US';
}

export default function VoiceInputButton({ onResult, locale, disabled, className = '' }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
      (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition() as SpeechRecognitionInstance;
      rec.lang = getSpeechLang(locale);
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    }
  }, [locale]);

  const startListening = useCallback(() => {
    if (!recognition) return;

    recognition.lang = getSpeechLang(locale);

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  }, [recognition, locale, onResult]);

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, [recognition]);

  if (!isSupported) {
    return (
      <button
        disabled
        title={locale === 'ur' ? 'آواز کا ان پٹ دستیاب نہیں' : 'Voice input not supported'}
        className={`p-2.5 text-slate-300 rounded-lg cursor-not-allowed ${className}`}
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      title={isListening
        ? (locale === 'ur' ? 'سن رہے ہیں...' : 'Listening...')
        : (locale === 'ur' ? 'آواز کا ان پٹ' : 'Voice Input')
      }
      className={`p-2.5 rounded-lg transition-colors relative ${className} ${
        isListening
          ? 'bg-red-50 text-red-600 animate-pulse'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
