'use client';

import React, { useState } from 'react';
import { Clock, Sliders, AlertTriangle, ShieldCheck, Activity, Users, ArrowUpRight, TrendingUp } from 'lucide-react';

interface QueueHeatmapDashboardProps {
  lang: 'en' | 'ar';
}

interface CongestionCell {
  hour: string;
  loadPercent: number; // 0 - 100
  activeChats: number;
  avgWaitSec: number;
  slaPercent: number;
}

export function QueueHeatmapDashboard({ lang }: QueueHeatmapDashboardProps) {
  const isRtl = lang === 'ar';
  
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'general' | 'technical' | 'vip'>('all');
  const [hoveredCell, setHoveredCell] = useState<{ queueName: string; cell: CongestionCell } | null>(null);

  // Hour intervals list
  const hours = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  // Mock queues data containing the matrix
  const queueData = [
    {
      id: 'q-1',
      nameEn: 'Tier 1 General Support',
      nameAr: 'الدعم العام (المستوى الأول)',
      group: 'general',
      matrix: [
        { hour: '09:00 AM', loadPercent: 35, activeChats: 12, avgWaitSec: 45, slaPercent: 96 },
        { hour: '10:00 AM', loadPercent: 68, activeChats: 28, avgWaitSec: 110, slaPercent: 88 },
        { hour: '11:00 AM', loadPercent: 85, activeChats: 42, avgWaitSec: 195, slaPercent: 78 },
        { hour: '12:00 PM', loadPercent: 52, activeChats: 18, avgWaitSec: 72, slaPercent: 92 },
        { hour: '01:00 PM', loadPercent: 40, activeChats: 14, avgWaitSec: 50, slaPercent: 95 },
        { hour: '02:00 PM', loadPercent: 62, activeChats: 24, avgWaitSec: 98, slaPercent: 89 },
        { hour: '03:00 PM', loadPercent: 75, activeChats: 33, avgWaitSec: 140, slaPercent: 84 },
        { hour: '04:00 PM', loadPercent: 50, activeChats: 19, avgWaitSec: 65, slaPercent: 93 },
        { hour: '05:00 PM', loadPercent: 30, activeChats: 8, avgWaitSec: 38, slaPercent: 98 }
      ]
    },
    {
      id: 'q-2',
      nameEn: 'Technical Escalations (Tier 2)',
      nameAr: 'التصعيد الفني (المستوى الثاني)',
      group: 'technical',
      matrix: [
        { hour: '09:00 AM', loadPercent: 20, activeChats: 3, avgWaitSec: 40, slaPercent: 99 },
        { hour: '10:00 AM', loadPercent: 45, activeChats: 8, avgWaitSec: 105, slaPercent: 94 },
        { hour: '11:00 AM', loadPercent: 90, activeChats: 19, avgWaitSec: 290, slaPercent: 65 }, // High congestion
        { hour: '12:00 PM', loadPercent: 72, activeChats: 14, avgWaitSec: 180, slaPercent: 82 },
        { hour: '01:00 PM', loadPercent: 50, activeChats: 9, avgWaitSec: 95, slaPercent: 90 },
        { hour: '02:00 PM', loadPercent: 55, activeChats: 11, avgWaitSec: 112, slaPercent: 88 },
        { hour: '03:00 PM', loadPercent: 82, activeChats: 17, avgWaitSec: 240, slaPercent: 74 },
        { hour: '04:00 PM', loadPercent: 60, activeChats: 12, avgWaitSec: 130, slaPercent: 86 },
        { hour: '05:00 PM', loadPercent: 40, activeChats: 7, avgWaitSec: 75, slaPercent: 93 }
      ]
    },
    {
      id: 'q-3',
      nameEn: 'VIP Executive Line',
      nameAr: 'قناة كبار الشخصيات VIP',
      group: 'vip',
      matrix: [
        { hour: '09:00 AM', loadPercent: 15, activeChats: 1, avgWaitSec: 12, slaPercent: 100 },
        { hour: '10:00 AM', loadPercent: 25, activeChats: 2, avgWaitSec: 18, slaPercent: 100 },
        { hour: '11:00 AM', loadPercent: 78, activeChats: 7, avgWaitSec: 58, slaPercent: 92 },
        { hour: '12:00 PM', loadPercent: 60, activeChats: 5, avgWaitSec: 38, slaPercent: 96 },
        { hour: '01:00 PM', loadPercent: 30, activeChats: 2, avgWaitSec: 20, slaPercent: 100 },
        { hour: '02:00 PM', loadPercent: 42, activeChats: 4, avgWaitSec: 29, slaPercent: 98 },
        { hour: '03:00 PM', loadPercent: 65, activeChats: 6, avgWaitSec: 47, slaPercent: 95 },
        { hour: '04:00 PM', loadPercent: 38, activeChats: 3, avgWaitSec: 24, slaPercent: 100 },
        { hour: '05:00 PM', loadPercent: 20, activeChats: 1, avgWaitSec: 15, slaPercent: 100 }
      ]
    },
    {
      id: 'q-4',
      nameEn: 'Arabic Language Specialists',
      nameAr: 'متخصصي اللغة العربية',
      group: 'general',
      matrix: [
        { hour: '09:00 AM', loadPercent: 40, activeChats: 6, avgWaitSec: 32, slaPercent: 98 },
        { hour: '10:00 AM', loadPercent: 55, activeChats: 10, avgWaitSec: 68, slaPercent: 95 },
        { hour: '11:00 AM', loadPercent: 88, activeChats: 21, avgWaitSec: 215, slaPercent: 70 }, // Severe risk
        { hour: '12:00 PM', loadPercent: 65, activeChats: 13, avgWaitSec: 92, slaPercent: 88 },
        { hour: '01:00 PM', loadPercent: 45, activeChats: 7, avgWaitSec: 48, slaPercent: 97 },
        { hour: '02:00 PM', loadPercent: 50, activeChats: 9, avgWaitSec: 55, slaPercent: 96 },
        { hour: '03:00 PM', loadPercent: 70, activeChats: 16, avgWaitSec: 125, slaPercent: 85 },
        { hour: '04:00 PM', loadPercent: 52, activeChats: 11, avgWaitSec: 74, slaPercent: 93 },
        { hour: '05:00 PM', loadPercent: 25, activeChats: 4, avgWaitSec: 25, slaPercent: 99 }
      ]
    }
  ];

  // Filter queues
  const filteredQueues = queueData.filter(
    (q) => selectedGroup === 'all' || q.group === selectedGroup
  );

  const getHeatColor = (load: number) => {
    if (load < 30) {
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:scale-105';
    }
    if (load < 60) {
      return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:scale-105';
    }
    if (load < 80) {
      return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:scale-105 hover:shadow-md';
    }
    return 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-450 hover:scale-105 hover:shadow-lg animate-pulse'; // Peak load
  };

  const formatHour = (hr: string) => {
    if (isRtl) {
      return hr.replace('AM', 'ص').replace('PM', 'م');
    }
    return hr;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
            {isRtl ? 'خارطة الازدحام ونسب الأداء للطوابير' : 'Queue Congestion & SLA Risk Heatmap'}
          </h4>
          <p className="text-[10px] text-slate-455 mt-1.5">
            {isRtl 
              ? 'مراقبة توزيع حجم المكالمات خلال فترات نوبة العمل وتحديد مخاطر مستويات الخدمة.' 
              : 'Analyze caseload density curves and identify peak operational threshold risks.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-850/60 font-mono text-[9px] font-bold self-end sm:self-auto select-none">
          {[
            { id: 'all', label: isRtl ? 'الكل' : 'ALL' },
            { id: 'general', label: isRtl ? 'العام' : 'GENERAL' },
            { id: 'technical', label: isRtl ? 'الفني' : 'TECH' },
            { id: 'vip', label: isRtl ? 'كبار الشخصيات' : 'VIP' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGroup(tab.id as any)}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedGroup === tab.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/55'
                  : 'text-slate-450 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RAG details summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3">
          <Activity className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">{isRtl ? 'أعلى فترة ضغط' : 'Peak Roster Pressure'}</span>
            <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">11:00 AM - 12:00 PM</strong>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">{isRtl ? 'قنوات تحت خطر الـ SLA' : 'SLA Compliance Hazard'}</span>
            <strong className="text-xs font-bold text-slate-805 dark:text-slate-200 leading-none">{isRtl ? 'التصعيد الفني (الدرجة الثانية)' : 'Tech Escalations (Tier 2)'}</strong>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">{isRtl ? 'إجمالي المحادثات المعالجة' : 'Total Forecast Sessions'}</span>
            <strong className="text-xs font-bold text-slate-805 dark:text-slate-200 leading-none font-mono">348 chats / hr</strong>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Panel */}
      <div className="overflow-x-auto min-w-0">
        <div className="min-w-[720px] space-y-2 p-0.5 font-sans">
          {/* Header Row (Hours) */}
          <div className="grid grid-cols-10 gap-2 text-center font-bold font-mono text-[9px] uppercase tracking-wider text-slate-455 mb-2">
            <div className="text-start">{isRtl ? 'طابور الدعم' : 'Queue Name'}</div>
            {hours.map((h) => (
              <div key={h}>{formatHour(h)}</div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="space-y-2.5">
            {filteredQueues.map((queue) => (
              <div key={queue.id} className="grid grid-cols-10 gap-2 items-center">
                {/* Queue Label */}
                <div className="text-[10px] font-bold text-slate-800 dark:text-slate-300 text-start leading-tight truncate" title={isRtl ? queue.nameAr : queue.nameEn}>
                  {isRtl ? queue.nameAr : queue.nameEn}
                </div>

                {/* Cells */}
                {queue.matrix.map((cell, idx) => {
                  const isHovered = hoveredCell?.queueName === queue.nameEn && hoveredCell.cell.hour === cell.hour;
                  
                  return (
                    <div
                      key={idx}
                      tabIndex={0}
                      onMouseEnter={() => setHoveredCell({ queueName: queue.nameEn, cell })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-9 rounded-xl border flex flex-col justify-center items-center text-[10px] font-mono font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/60 cursor-help ${getHeatColor(
                        cell.loadPercent
                      )}`}
                    >
                      <span>{cell.loadPercent}%</span>
                      <span className="text-[7.5px] opacity-75">{cell.activeChats} {isRtl ? 'نشط' : 'ch'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850 select-none">
            {/* Hover Tooltip Overlay Panel */}
            <div className="text-[10px] text-slate-450 h-5 font-mono">
              {hoveredCell ? (
                <span className="animate-fade-in font-bold text-slate-700 dark:text-slate-300">
                  {hoveredCell.queueName} @ {formatHour(hoveredCell.cell.hour)}: {hoveredCell.cell.activeChats} chats | Wait: {hoveredCell.cell.avgWaitSec}s | SLA: {hoveredCell.cell.slaPercent}%
                </span>
              ) : (
                <span className="italic text-slate-400 font-medium">{isRtl ? 'مرر الماوس فوق خلايا الجدول لعرض تفاصيل إضافية' : 'Hover over cells to review analytics details'}</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md" />
                <span>{isRtl ? 'خفيف' : 'Low (<30%)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-blue-500/10 border border-blue-500/20 rounded-md" />
                <span>{isRtl ? 'معتدل' : 'Moderate (<60%)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-amber-500/10 border border-amber-500/20 rounded-md" />
                <span>{isRtl ? 'مرتفع' : 'High (<80%)'}</span>
              </div>
              <div className="flex items-center gap-1.5 animate-pulse">
                <span className="w-3.5 h-3.5 bg-rose-500/20 border border-rose-500/30 rounded-md" />
                <span>{isRtl ? 'حرج' : 'Peak (80%+)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
