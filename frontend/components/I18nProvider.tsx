'use client';

import React, { createContext, useContext } from 'react';

const I18nContext = createContext<{ messages: any; locale: string }>({ messages: {}, locale: 'en' });

export function useT() {
  const { messages, locale } = useContext(I18nContext);
  return (key: string) => {
    const parts = key.split('.');
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return typeof value === 'string' ? value : key;
  };
}

export function useLocale() {
  return useContext(I18nContext).locale;
}

export default function I18nProvider({
  children,
  messages,
  locale,
}: {
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {
  return (
    <I18nContext.Provider value={{ messages, locale }}>
      {children}
    </I18nContext.Provider>
  );
}
