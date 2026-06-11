'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface ComboboxOption {
  value: string;
  label: string;
}

interface SearchableComboboxFieldProps {
  id: string;
  name: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
  placeholder?: string;
}

export function SearchableComboboxField({
  id,
  name,
  options = [],
  value,
  onChange,
  label,
  required,
  description,
  error,
  lang = 'en',
  placeholder = 'Select option...',
}: SearchableComboboxFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      required={required}
      description={description}
      error={error}
      lang={lang}
    >
      <div ref={wrapperRef} className="relative w-full">
        {/* Toggle Button */}
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-full px-4 py-2 bg-white dark:bg-slate-950 border ${
            error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
          } rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className={`absolute z-50 mt-1.5 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2.5 space-y-2 animate-fade-in ${
            isRtl ? 'right-0 text-right' : 'left-0 text-left'
          }`}>
            <div className={`flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-900 ${
              isRtl ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث...' : 'Search options...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-transparent text-[11px] text-slate-800 dark:text-white focus:outline-none border-0 p-0 ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
                dir={isRtl ? 'rtl' : 'ltr'}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-405 dark:text-slate-500 text-center py-2">
                  {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No options found'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
}
