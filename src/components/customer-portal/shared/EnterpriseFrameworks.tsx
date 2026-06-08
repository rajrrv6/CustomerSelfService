'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, X, AlertTriangle, CheckCircle, RefreshCw, Calendar, 
  Smile, Settings, ShieldAlert, Sparkles, Clock 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

// ----------------------------------------------------------------------
// 1. Upload Dropzone Simulator
// ----------------------------------------------------------------------
interface UploadDropzoneProps {
  onUploadSuccess: (fileInfo: { name: string; size: string }) => void;
  allowedExtensions?: string[];
  maxSizeMB?: number;
}

export function UploadDropzone({
  onUploadSuccess,
  allowedExtensions = ['pdf', 'txt', 'png', 'jpg'],
  maxSizeMB = 5
}: UploadDropzoneProps) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext && !allowedExtensions.includes(ext)) {
      alert(isRtl ? `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedExtensions.join(', ')}` : `File extension not supported. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(isRtl ? `حجم الملف يتجاوز الحد المسموح به (${maxSizeMB} ميجابايت).` : `File size exceeds max limit (${maxSizeMB} MB).`);
      return;
    }

    setUploadingName(file.name);
    setUploadProgress(10);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onUploadSuccess({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` });
            setUploadingName(null);
            setUploadProgress(0);
            addAuditLog(`Uploaded document ${file.name} successfully`, 'success');
          }, 300);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
        isDragActive 
          ? 'border-blue-500 bg-blue-500/5' 
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20'
      } text-xs font-semibold`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        onChange={handleSelect}
      />
      
      {uploadingName ? (
        <div className="space-y-3">
          <Clock className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
          <div className="space-y-1">
            <p className="truncate max-w-[200px] mx-auto text-slate-700 dark:text-slate-350">{uploadingName}</p>
            <div className="w-32 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mx-auto overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className="text-[9px] text-slate-450 font-mono block font-bold">{uploadProgress}% uploaded</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Upload className="w-8 h-8 mx-auto text-slate-400 stroke-1" />
          <div className="space-y-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 dark:text-blue-450 hover:underline font-bold cursor-pointer"
            >
              {isRtl ? 'اختر ملفاً' : 'Upload a file'}
            </button>
            <span className="text-slate-450 font-medium"> {isRtl ? 'أو اسحبه وأفلته هنا' : 'or drag and drop it here'}</span>
            <span className="text-[9px] text-slate-400 font-normal block pt-1 leading-normal">
              {isRtl ? `الامتدادات المدعومة: ${allowedExtensions.join(', ')} (بحد أقصى ${maxSizeMB} ميجابايت)` : `Supported extensions: ${allowedExtensions.join(', ')} (Max: ${maxSizeMB}MB)`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Confirm Delete Modal
// ----------------------------------------------------------------------
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}: ConfirmDeleteModalProps) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-xs font-semibold"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer transition-all bg-white dark:bg-slate-900"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-500/10"
          >
            {isRtl ? 'تأكيد الحذف' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Unsaved Changes Modal Warning
// ----------------------------------------------------------------------
export function UnsavedChangesModal({
  isOpen,
  onDiscard,
  onKeepEditing
}: {
  isOpen: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
}) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onKeepEditing} />
      
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-xs font-semibold"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {isRtl ? 'تغييرات غير محفوظة' : 'Unsaved Modifications'}
          </h4>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium leading-relaxed">
            {isRtl 
              ? 'أنت على وشك مغادرة الصفحة وإلغاء التعديلات التي قمت بها. هل تود تجاهل التعديلات؟' 
              : 'You have modified settings that are not committed. Navigating away will discard edits.'}
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onKeepEditing}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer transition-all bg-white dark:bg-slate-900"
          >
            {isRtl ? 'متابعة التعديل' : 'Keep Editing'}
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-500/10"
          >
            {isRtl ? 'تجاهل التغييرات' : 'Discard changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. Custom Accent Color Picker
// ----------------------------------------------------------------------
export function AccentColorPicker({
  selectedColor,
  onColorSelect
}: {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const colors = [
    { value: 'blue', class: 'bg-blue-600' },
    { value: 'indigo', class: 'bg-indigo-600' },
    { value: 'emerald', class: 'bg-emerald-600' },
    { value: 'purple', class: 'bg-purple-600' },
    { value: 'rose', class: 'bg-rose-600' }
  ];

  return (
    <div className="space-y-1.5" dir={isRtl ? 'rtl' : 'ltr'}>
      <span className="block text-[10px] text-slate-400 font-bold uppercase font-mono">{isRtl ? 'اللون التفاعلي للموقع' : 'Accent Theme Color'}</span>
      
      <div className="flex gap-2.5">
        {colors.map(col => {
          const isSelected = selectedColor === col.value;
          return (
            <button
              key={col.value}
              onClick={() => {
                onColorSelect(col.value);
                addAuditLog(`Changed theme accent color to: ${col.value}`, 'success');
              }}
              className={`w-6 h-6 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-90 ${col.class} ${
                isSelected ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''
              }`}
              title={col.value}
            />
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. DatePicker Component
// ----------------------------------------------------------------------
export function DatePicker({
  selectedDate,
  onDateChange
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
}) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [dateVal, setDateVal] = useState(selectedDate || '2026-06-08');

  return (
    <div className="space-y-1" dir={isRtl ? 'rtl' : 'ltr'}>
      <label className="block text-[9px] text-slate-400 font-bold uppercase font-mono">{isRtl ? 'تاريخ التصفية' : 'Filter Date Limit'}</label>
      <div className="relative max-w-[150px]">
        <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-450 pointer-events-none" />
        <input
          type="date"
          value={dateVal}
          onChange={(e) => {
            setDateVal(e.target.value);
            onDateChange(e.target.value);
          }}
          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs font-mono font-semibold"
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. Emoji Picker Selector overlay
// ----------------------------------------------------------------------
export function EmojiPicker({
  onEmojiSelect
}: {
  onEmojiSelect: (emoji: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const emojis = ['😀', '👍', '👎', '🎉', '💡', '🔥', '📌', '❤️', '⚠️', '✅'];

  return (
    <div className="relative inline-block text-xs font-semibold">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        title="Add emoji reaction"
      >
        <Smile className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-9 right-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2 rounded-xl grid grid-cols-5 gap-1.5 shadow-2xl z-30 animate-in zoom-in-95 duration-100 w-36">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
                setIsOpen(false);
              }}
              className="text-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer transition-colors text-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
