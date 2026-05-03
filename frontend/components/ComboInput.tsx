'use client';

import { ChevronDown } from 'lucide-react';

interface ComboInputProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  listId: string;
}

export default function ComboInput({
  name,
  value,
  onChange,
  options,
  placeholder,
  className = '',
  disabled,
  listId,
}: ComboInputProps) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        list={listId}
        autoComplete="off"
        className={`w-full px-4 py-3 pr-9 bg-white/5 border border-white/10 rounded-xl focus:outline-none input-glow text-sm text-white placeholder-slate-500 transition-all duration-300 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}
