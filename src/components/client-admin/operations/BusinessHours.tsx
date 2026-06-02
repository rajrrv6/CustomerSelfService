'use client';

import React from 'react';
import { Clock, Globe, Plus, Calendar, Trash2 } from 'lucide-react';
import { OperationalCard } from '@/components/shared/OperationalCard';

export interface HolidayItem {
  id: string;
  nameEn: string;
  nameAr: string;
  date: string;
  active: boolean;
}

interface ChannelHourItem {
  id: string;
  labelEn: string;
  labelAr: string;
  enabled: boolean;
  start: string;
  end: string;
  allDay: boolean;
}

interface BusinessHoursProps {
  lang: 'en' | 'ar';
  timezone: string;
  setTimezone: (val: string) => void;
  channelHours: ChannelHourItem[];
  onToggleChannelHours: (id: string) => void;
  onChannelTimeChange: (id: string, field: 'start' | 'end', value: string) => void;
  onChannelAllDayToggle: (id: string) => void;
  holidays: HolidayItem[];
  newHolidayNameEn: string;
  setNewHolidayNameEn: (val: string) => void;
  newHolidayNameAr: string;
  setNewHolidayNameAr: (val: string) => void;
  newHolidayDate: string;
  setNewHolidayDate: (val: string) => void;
  onAddHoliday: (e: React.FormEvent) => void;
  onToggleHoliday: (id: string) => void;
  onDeleteHoliday: (id: string) => void;
  addAuditLog: (msg: string, type: 'success' | 'failed') => void;
}

export function BusinessHours({
  lang,
  timezone,
  setTimezone,
  channelHours,
  onToggleChannelHours,
  onChannelTimeChange,
  onChannelAllDayToggle,
  holidays,
  newHolidayNameEn,
  setNewHolidayNameEn,
  newHolidayNameAr,
  setNewHolidayNameAr,
  newHolidayDate,
  setNewHolidayDate,
  onAddHoliday,
  onToggleHoliday,
  onDeleteHoliday,
  addAuditLog
}: BusinessHoursProps) {
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Business Hours scheduler */}
        <div className="lg:col-span-7 space-y-6">
          <OperationalCard className="p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>{isRtl ? 'ساعات العمل والتشغيل لقنوات الدعم' : 'Operational Channels Support Business Hours'}</span>
              </h3>
              
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-850 text-[10px] font-bold text-slate-350">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    addAuditLog(`Changed global timezone index to: ${e.target.value}`, 'success');
                  }}
                  className="bg-transparent border-none text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="Asia/Riyadh (AST)">{isRtl ? 'آسيا/الرياض (AST)' : 'Asia/Riyadh (AST)'}</option>
                  <option value="Asia/Dubai (GST)">{isRtl ? 'آسيا/دبي (GST)' : 'Asia/Dubai (GST)'}</option>
                  <option value="Europe/London (GMT)">{isRtl ? 'أوروبا/لندن (GMT)' : 'Europe/London (GMT)'}</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {channelHours.map((ch) => (
                <div key={ch.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={ch.enabled}
                        onChange={() => onToggleChannelHours(ch.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-3.5 rtl:peer-checked:after:-translate-x-3.5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                    </label>

                    <span className={`font-bold text-xs ${ch.enabled ? 'text-slate-850 dark:text-slate-205' : 'text-slate-500 dark:text-slate-600'}`}>
                      {isRtl ? ch.labelAr : ch.labelEn}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10px]">
                    <button
                      type="button"
                      disabled={!ch.enabled}
                      onClick={() => onChannelAllDayToggle(ch.id)}
                      className={`px-2 py-1.5 rounded-lg border text-[9px] font-bold tracking-wide transition-all cursor-pointer ${
                        ch.allDay && ch.enabled
                          ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                          : 'border-slate-800 text-slate-405 hover:text-slate-200 disabled:opacity-40'
                      }`}
                    >
                      {isRtl ? 'مفتوح 24/7' : '24/7 SCHEDULE'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        disabled={!ch.enabled || ch.allDay}
                        value={ch.start}
                        onChange={(e) => onChannelTimeChange(ch.id, 'start', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 font-bold focus:outline-none disabled:opacity-40 font-mono text-xs"
                      />
                      <span className="text-slate-600 font-bold font-mono">/</span>
                      <input
                        type="time"
                        disabled={!ch.enabled || ch.allDay}
                        value={ch.end}
                        onChange={(e) => onChannelTimeChange(ch.id, 'end', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 font-bold focus:outline-none disabled:opacity-40 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </OperationalCard>
        </div>

        {/* Holiday schedule manager */}
        <div className="lg:col-span-5 space-y-6">
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-855 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>{isRtl ? 'جدول العطلات والإغلاق السنوي' : 'Holiday Calendar Exceptions Scheduler'}</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {isRtl
                  ? 'حدد فترات العطلات الرسمية لتغيير استجابة النظام تلقائياً إلى رسائل الإغلاق خارج أوقات العمل.'
                  : 'Define specific calendar events to automatically routing sessions into voicemail queues.'}
              </p>
            </div>

            {/* Holiday CRUD creation form */}
            <form onSubmit={onAddHoliday} className="space-y-3 p-3 bg-slate-950/60 border border-slate-850 rounded-2xl text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'اسم العطلة (إنجليزي):' : 'Name (EN):'}</label>
                  <input
                    type="text"
                    required
                    value={newHolidayNameEn}
                    onChange={(e) => setNewHolidayNameEn(e.target.value)}
                    placeholder="National Holiday"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-slate-200 placeholder-slate-600 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'اسم العطلة (عربي):' : 'Name (AR):'}</label>
                  <input
                    type="text"
                    required
                    value={newHolidayNameAr}
                    onChange={(e) => setNewHolidayNameAr(e.target.value)}
                    placeholder="عطلة رسمية"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-slate-200 placeholder-slate-600 text-end text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'التاريخ المحدود:' : 'Holiday Date:'}</label>
                  <input
                    type="date"
                    required
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-slate-250 focus:outline-none text-xs font-semibold font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'جدولة' : 'Schedule'}</span>
                </button>
              </div>
            </form>

            {/* Scheduled Holiday items List */}
            <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto pr-1">
              {holidays.map((h) => (
                <div key={h.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={h.active}
                        onChange={() => onToggleHoliday(h.id)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                    </label>

                    <div>
                      <h4 className={`font-bold text-[11px] leading-tight ${h.active ? 'text-slate-850 dark:text-slate-200' : 'text-slate-500'}`}>
                        {isRtl ? h.nameAr : h.nameEn}
                      </h4>
                      <span className="text-[9px] text-slate-450 dark:text-slate-500 font-mono block mt-0.5">{h.date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteHoliday(h.id)}
                    className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </OperationalCard>
        </div>
      </div>
    </div>
  );
}
