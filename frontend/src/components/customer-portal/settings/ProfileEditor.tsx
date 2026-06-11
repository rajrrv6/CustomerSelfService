'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Clock, Sparkles, CheckCircle, Upload } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useUIStore } from '@/stores/uiStore';
import { 
  FOCUS_RING, INTERACTIVE_BTN_PRIMARY, SURFACE_PANEL 
} from '@/design-system/tokens';
import { TIMEZONES } from '../personalization/constants';

export function ProfileEditor() {
  const { lang, addAuditLog } = useApp();
  const { setLang } = useUIStore();
  const isRtl = lang === 'ar';

  const [name, setName] = useState('David Miller');
  const [email, setEmail] = useState('david.miller@yahoo.com');
  const [phone, setPhone] = useState('+966 50 882 1993');
  const [prefLang, setPrefLang] = useState<'en' | 'ar'>('en');
  const [timezone, setTimezone] = useState('Asia/Riyadh');
  const [avatar, setAvatar] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedProfile = localStorage.getItem('user-profile-data');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.language) {
          setPrefLang(parsed.language);
        }
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.avatar) setAvatar(parsed.avatar);
      } catch (err) {
        console.error('Failed to parse user profile details', err);
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        addAuditLog('Uploaded new customer profile avatar icon', 'success');
        triggerToast(isRtl ? 'تم تحميل الصورة الشخصية بنجاح.' : 'Avatar uploaded successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = { name, email, phone, language: prefLang, timezone, avatar };
    localStorage.setItem('user-profile-data', JSON.stringify(profileData));
    
    // Apply language changes
    setLang(prefLang);
    addAuditLog(`Updated profile details for customer portal: ${name}`, 'success');
    triggerToast(isRtl ? 'تم حفظ بيانات الملف الشخصي بنجاح.' : 'Profile settings saved successfully.');
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <form 
      onSubmit={handleSave} 
      className={`p-6 rounded-3xl border text-slate-800 dark:text-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 ${SURFACE_PANEL}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Info */}
      <div className="md:col-span-3">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
          {isRtl ? 'الملف الشخصي والبيانات الأساسية' : 'Personal Profile Settings'}
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
          {isRtl 
            ? 'قم بتحديث معلومات الاتصال، صورتك الرمزية، ولغة العرض والتوقيت الزمني للمؤسسة.' 
            : 'Update your corporate communication details, profile avatar, language preference, and timezone offset.'}
        </span>
      </div>

      {/* Avatar Column */}
      <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl text-center space-y-4 md:col-span-1">
        <div className="relative group">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md transition-all group-hover:opacity-75"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md transition-all group-hover:bg-blue-700">
              {getInitials(name)}
            </div>
          )}
          
          <label 
            htmlFor="avatar-upload-file"
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
          >
            <Upload className="w-4 h-4 mr-1" />
            {isRtl ? 'تحميل' : 'Upload'}
          </label>
          <input
            id="avatar-upload-file"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{name}</h5>
          <span className="text-[9px] text-slate-400 font-bold block mt-1 font-mono uppercase">Role: Portal Owner</span>
        </div>

        {avatar && (
          <button
            type="button"
            onClick={() => {
              setAvatar('');
              addAuditLog('Removed avatar icon', 'success');
              triggerToast(isRtl ? 'تم حذف الصورة الشخصية.' : 'Avatar removed.');
            }}
            className="text-[9px] text-rose-500 hover:text-rose-600 font-bold cursor-pointer transition-colors"
          >
            {isRtl ? 'حذف الصورة' : 'Remove Avatar'}
          </button>
        )}
      </div>

      {/* Inputs Column */}
      <div className="space-y-4 md:col-span-2 text-xs font-semibold">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-mono block">
              {isRtl ? 'الاسم بالكامل' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING}`}
              aria-label={isRtl ? 'الاسم بالكامل' : 'Full Name'}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-mono block">
              {isRtl ? 'البريد الإلكتروني للشركة' : 'Corporate Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING}`}
              aria-label={isRtl ? 'البريد الإلكتروني للشركة' : 'Corporate Email'}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-mono block">
              {isRtl ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING}`}
              aria-label={isRtl ? 'رقم الهاتف' : 'Phone Number'}
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-mono block">
              {isRtl ? 'اللغة المفضلة' : 'Preferred Language'}
            </label>
            <select
              value={prefLang}
              onChange={(e) => setPrefLang(e.target.value as 'en' | 'ar')}
              className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING} cursor-pointer`}
              aria-label={isRtl ? 'اللغة المفضلة' : 'Preferred Language'}
            >
              <option value="en">English (EN)</option>
              <option value="ar">العربية (AR)</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-mono block">
              {isRtl ? 'التوقيت المحلي للمؤسسة' : 'Corporate Timezone'}
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING} cursor-pointer`}
              aria-label={isRtl ? 'التوقيت المحلي للمؤسسة' : 'Corporate Timezone'}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className={`py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/15 cursor-pointer ${INTERACTIVE_BTN_PRIMARY}`}
          >
            {isRtl ? 'حفظ معلومات الملف الشخصي' : 'Save Profile Changes'}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 border border-slate-800 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </form>
  );
}
