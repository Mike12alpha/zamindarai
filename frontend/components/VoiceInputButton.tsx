'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

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

function isSecureContext(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

export default function VoiceInputButton({ onResult, locale, disabled, className = '' }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [needsHttps, setNeedsHttps] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
      (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      setIsSupported(true);
      if (!isSecureContext()) {
        setNeedsHttps(true);
      }
      const rec = new SpeechRecognition() as SpeechRecognitionInstance;
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update recognition language when locale changes without creating a new instance
  useEffect(() => {
    if (recognition) {
      recognition.lang = getSpeechLang(locale);
    }
  }, [locale, recognition]);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionDenied(false);
        return true;
      }
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
      }
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognition) return;

    if (needsHttps) {
      alert(
        locale === 'ur'
          ? 'آواز کا ان پٹ استعمال کرنے کے لیے براہ کرم HTTPS پر سوئچ کریں۔'
          : 'Please switch to HTTPS to use voice input.'
      );
      return;
    }

    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      alert(
        locale === 'ur'
          ? 'مائیکروفون کی اجازت دی گئی نہیں۔ براہ کرم براؤزر کی ترتیبات چیک کریں۔'
          : 'Microphone permission was denied. Please check your browser settings.'
      );
      return;
    }

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
      if (event.error === 'not-allowed') {
        setPermissionDenied(true);
      }
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
  }, [recognition, locale, onResult, needsHttps, requestMicPermission]);

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
        className={`p-3 text-slate-600 rounded-xl cursor-not-allowed border border-transparent ${className}`}
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
      className={`p-3 rounded-xl transition-all duration-300 relative border ${className} ${
        isListening
          ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
          : needsHttps || permissionDenied
            ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
            : 'text-slate-500 border-white/10 hover:bg-white/5 hover:text-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : needsHttps || permissionDenied ? <AlertCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
