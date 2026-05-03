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
        className={`w-full px-3 py-2 pr-9 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}
