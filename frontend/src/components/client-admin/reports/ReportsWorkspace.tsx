'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, FileText, Calendar, BarChart2, CheckCircle2, TrendingUp, Plus, Clock, FileSpreadsheet, Loader2, Search, Trash2, X 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { useClientAdminStore, ExportHistoryItem, ReportSchedule } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { translations } from '@/i18n/translations';

interface StandardReport {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  format: 'PDF' | 'CSV';
  category: string;
}

export function ReportsWorkspace() {
  const schedules = useClientAdminStore((state) => state.schedules);
  const exportHistory = useClientAdminStore((state) => state.exportHistory);
  
  const addReportSchedule = useClientAdminStore((state) => state.addReportSchedule);
  const deleteReportSchedule = useClientAdminStore((state) => state.deleteReportSchedule);
  const addExportHistory = useClientAdminStore((state) => state.addExportHistory);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);

  const isAr = lang === 'ar';
  const t = translations[lang];

  // Hydration safety
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Exporters progress loaders map
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filters state
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'CSV' | 'PDF'>('all');
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');

  // Scheduling Form Inputs
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleCron, setNewScheduleCron] = useState('Weekly (Every Mon)');
  const [newScheduleFormat, setNewScheduleFormat] = useState<'PDF' | 'CSV'>('CSV');
  const [newScheduleEmail, setNewScheduleEmail] = useState('');

  const reports: StandardReport[] = [
    {
      id: 'rep-1',
      name: 'NLU Intent & Deflection Analytics',
      nameAr: 'تحليل دقة نية المحادثة والاحتواء',
      description: 'Breakdown of deflected chats, top intent triggers, and deflection accuracy scores.',
      descriptionAr: 'تفصيل للمحادثات المحتواة تلقائياً، والنيات الأكثر تكراراً، ودقة الاحتواء.',
      format: 'CSV',
      category: 'Conversational Performance',
    },
    {
      id: 'rep-2',
      name: 'Monthly LLM Token & Budget Consumption',
      nameAr: 'تقرير استهلاك رموز LLM والميزانية',
      description: 'Audit tracking of prompt/completion tokens, pricing per LLM, and cost allocation tags.',
      descriptionAr: 'متابعة تفصيلية لرموز المدخلات والمخرجات، وتكلفة استدعاءات نماذج الذكاء الاصطناعي.',
      format: 'CSV',
      category: 'Financial Analytics',
    },
    {
      id: 'rep-3',
      name: 'Support Agent SLA compliance Roster',
      nameAr: 'سجل التزام الموظفين باتفاقية SLA',
      description: 'Resolution times, live agent occupancy rates, queue wait times, and CSAT scores.',
      descriptionAr: 'أوقات الحل، نسب انشغال الموظفين، أوقات الانتظار، واستبيانات الرضا للعملاء.',
      format: 'CSV',
      category: 'Operations Roster',
    },
  ];

  const handleDownload = (report: StandardReport) => {
    setDownloadingId(report.id);
    useNotificationsStore.getState().addAuditLog(`Started report export preparation: "${report.name}"`, 'success');

    setTimeout(() => {
      // Setup CSV download parameters
      let headers: string[] = [];
      let rows: string[][] = [];
      const filename = `${report.name.toLowerCase().replace(/\s+/g, '_')}_export.csv`;

      if (report.id === 'rep-1') {
        // Deflection Report
        headers = ['Timestamp', 'Intent ID', 'Matches Count', 'Deflection Rate %', 'Confidence Status'];
        rows = [
          ['2026-06-04 17:00', 'request_refund', '1042', '88.5%', 'Optimal'],
          ['2026-06-04 16:30', 'cancel_order', '520', '94.2%', 'Optimal'],
          ['2026-06-04 15:00', 'update_address', '154', '74.8%', 'Review Required']
        ];
      } else if (report.id === 'rep-2') {
        // Token Report
        headers = ['Model Name', 'Provider', 'Audited Tokens', 'Cost per 1k', 'Allocated Cost USD'];
        rows = [
          ['Gemini 1.5 Flash', 'Google DeepMind', '14.2M', '0.0003', '4.26'],
          ['Gemini 1.5 Pro', 'Google DeepMind', '42.5M', '0.0030', '127.50'],
          ['DeepSeek-V3 (Self-Hosted)', 'DeepSeek LLC', '5.0M', '0.0002', '1.00']
        ];
      } else {
        // SLA Roster
        headers = ['Queue Name', 'Target SLA Wait', 'Actual Avg Wait', 'Total Case Count', 'Compliance Rate %'];
        rows = [
          ['VIP Support Queue', '1m 30s', '52s', '120', '97.5%'],
          ['General Helpdesk Line', '3m 00s', '2m 15s', '850', '95.0%'],
          ['Tech Support Level 2', '5m 00s', '4m 02s', '310', '95.1%']
        ];
      }

      // Execute browser download
      const content = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Add to exported history ledger
      const newExport: ExportHistoryItem = {
        id: `exp-${Date.now()}`,
        fileName: filename,
        format: 'CSV',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        size: `${parseFloat((blob.size / 1024).toFixed(1))} KB`,
        status: 'ready',
      };

      addExportHistory(newExport);
      setDownloadingId(null);
      
      useNotificationsStore.getState().addAlert({
        category: 'operations',
        source: 'analytics',
        severity: 'success',
        alertCode: 'REPORT_EXPORTED',
        sourceEntity: report.name,
        title: t.clientAdmin.persistence.reports.exportSuccess,
        message: isAr 
          ? `تم تحميل ملف الفوترة "${filename}" بنجاح في متصفحك.` 
          : `Report file "${filename}" generated and downloaded.`,
        metadata: { filename }
      });

      useNotificationsStore.getState().addAuditLog(`Successfully compiled and downloaded report: "${report.name}"`, 'success');
    }, 1500);
  };

  const handleCreateReportSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleName.trim() || !newScheduleEmail.trim()) return;

    const newSchedule: ReportSchedule = {
      id: `sch-${Date.now()}`,
      name: newScheduleName.trim(),
      schedule: newScheduleCron,
      format: newScheduleFormat,
      sendTo: newScheduleEmail.trim(),
      nextTrigger: '2026-06-10 00:00'
    };

    addReportSchedule(newSchedule);
    setNewScheduleName('');
    setNewScheduleEmail('');
    setShowScheduleForm(false);

    useNotificationsStore.getState().addAlert({
      category: 'operations',
      source: 'analytics',
      severity: 'success',
      alertCode: 'REPORT_SCHEDULED',
      sourceEntity: newSchedule.name,
      title: isAr ? 'تم حفظ جدولة التقرير' : 'Report Schedule Registered',
      message: isAr 
        ? `تم تفعيل الجدولة الدورية للتقرير "${newSchedule.name}" بنجاح.` 
        : `Report schedule "${newSchedule.name}" set up successfully.`,
      metadata: { scheduleId: newSchedule.id }
    });
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Reports...</span>
      </div>
    );
  }

  // Filter history
  const filteredHistory = exportHistory.filter(h => {
    const matchSearch = h.fileName.toLowerCase().includes(searchHistoryQuery.toLowerCase());
    const matchFormat = formatFilter === 'all' || h.format === formatFilter;
    
    // Date filter simulation
    let matchDate = true;
    if (dateFilter === '7d') {
      matchDate = !h.timestamp.includes('05-15') && !h.timestamp.includes('05-01');
    } else if (dateFilter === '30d') {
      matchDate = !h.timestamp.includes('05-01');
    }

    return matchSearch && matchFormat && matchDate;
  });

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={isAr ? 'مركز التقارير والتصدير' : 'Performance Reports'}
        description={isAr ? 'تصدير سجلات النظام التفصيلية، وتحميل تقارير استهلاك الميزانية، وتتبع التزام SLA.' : 'Compile and export detailed operational reports, LLM token metrics, and SLA rosters.'}
        action={
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? 'جدولة التقارير تلقائياً' : 'Schedule Auto-Report'}</span>
          </button>
        }
      />

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-emerald-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'إجمالي المحادثات المحتواة' : 'Deflected Conversational Volume'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              84.5%
            </span>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-blue-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'إجمالي رموز الذكاء الاصطناعي' : 'Tokens Consumed YTD'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              1.24 M
            </span>
          </div>
          <BarChart2 className="w-5 h-5 text-blue-500" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-indigo-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'مخالفات SLA النشطة' : 'Active SLA Compliance Rate'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              96.2%
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
        </OperationalCard>
      </div>

      {showScheduleForm && (
        <OperationalCard className="p-5 border border-blue-500/20 bg-blue-500/5 animate-fade-in text-xs max-w-xl">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-slate-800 dark:text-white">{isAr ? 'تكوين جدولة تقارير دورية' : 'Configure Scheduled Automated Exporter'}</h4>
            <button 
              onClick={() => setShowScheduleForm(false)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleCreateReportSchedule} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Report Target Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly CSAT Ledger"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Cron Cycle:</label>
                <select
                  value={newScheduleCron}
                  onChange={(e) => setNewScheduleCron(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-slate-350"
                >
                  <option value="Daily (00:00 UTC)">Daily (00:00 UTC)</option>
                  <option value="Weekly (Every Mon)">Weekly (Every Mon)</option>
                  <option value="Monthly (1st of Month)">Monthly (1st of Month)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Target Format:</label>
                <select
                  value={newScheduleFormat}
                  onChange={(e) => setNewScheduleFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-slate-350"
                >
                  <option value="CSV">CSV Spreadsheet</option>
                  <option value="PDF">PDF Document</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Registry Email Contact:</label>
                <input
                  type="email"
                  placeholder="e.g. operations@stc.sa"
                  value={newScheduleEmail}
                  onChange={(e) => setNewScheduleEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-200"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </form>
        </OperationalCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: Reports list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              {isAr ? 'كتالوج التقارير القياسية الجاهزة' : 'Standard Enterprise Reports Catalog'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.map((r) => (
                <OperationalCard key={r.id} className="p-4 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <Badge type={r.format === 'PDF' ? 'error' : 'success'}>
                        {r.format}
                      </Badge>
                      <span className="text-[8.5px] font-bold font-mono text-slate-400 uppercase tracking-wide truncate max-w-28">
                        {r.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-tight">
                        {isAr ? r.nameAr : r.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-normal leading-relaxed">
                        {isAr ? r.descriptionAr : r.description}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={downloadingId !== null}
                    onClick={() => handleDownload(r)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {downloadingId === r.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.clientAdmin.persistence.reports.exportWarning}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.clientAdmin.persistence.reports.exportTrigger}</span>
                      </>
                    )}
                  </button>
                </OperationalCard>
              ))}
            </div>
          </div>

          {/* Export logs table with filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className={`w-3.5 h-3.5 text-slate-450 absolute top-2.5 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'البحث عن ملف مصدر...' : 'Search exported files...'}
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 ${
                    isAr ? 'pr-8 pl-3' : 'pl-8 pr-3'
                  } text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100`}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-250 focus:outline-none"
                >
                  <option value="all">{isAr ? 'كل الفترات' : 'All Time'}</option>
                  <option value="7d">{isAr ? 'آخر ٧ أيام' : 'Last 7 Days'}</option>
                  <option value="30d">{isAr ? 'آخر ٣٠ يوم' : 'Last 30 Days'}</option>
                </select>

                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-250 focus:outline-none"
                >
                  <option value="all">Formats</option>
                  <option value="CSV">CSV</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
            </div>

            <EnterpriseTable
              headers={[
                isAr ? 'اسم الملف' : 'Export File Name',
                isAr ? 'تنسيق الملف' : 'Format',
                isAr ? 'تاريخ التصدير' : 'Generated Date',
                isAr ? 'حجم الملف' : 'Size',
                isAr ? 'الحالة' : 'Status',
                isAr ? 'تحميل' : 'Download'
              ]}
              empty={filteredHistory.length === 0}
            >
              {filteredHistory.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                    {h.fileName}
                  </td>
                  <td className="px-6 py-4.5 font-black font-mono text-[10px] text-slate-450">
                    {h.format}
                  </td>
                  <td className="px-6 py-4.5 font-semibold font-mono text-[10px] text-slate-500">
                    {h.timestamp}
                  </td>
                  <td className="px-6 py-4.5 font-bold font-mono text-[10px] text-slate-650">
                    {h.size}
                  </td>
                  <td className="px-6 py-4.5">
                    <Badge type={h.status === 'ready' ? 'success' : 'neutral'}>
                      {h.status === 'ready' ? (isAr ? 'جاهز' : 'Ready') : (isAr ? 'منتهي' : 'Expired')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4.5">
                    {h.status === 'ready' ? (
                      <button
                        onClick={() => {
                          const blob = new Blob([`Timestamp,Details\n${h.timestamp},Simulated pull check`], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', h.fileName);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="p-1 text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </EnterpriseTable>
          </div>
        </div>

        {/* Right pane: scheduled summary alerts */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider font-sans">
            {isAr ? 'التقارير المجدولة القادمة' : 'Upcoming Scheduled Report Triggers'}
          </h4>
          
          <div className="space-y-3.5">
            {schedules.map((sch) => (
              <OperationalCard key={sch.id} className="p-4 space-y-2 relative group hover:border-slate-350 dark:hover:border-slate-800 transition-all">
                <button
                  onClick={() => deleteReportSchedule(sch.id)}
                  className="absolute top-3.5 end-3.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Cancel Schedule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase">{sch.schedule}</span>
                  <Badge type={sch.format === 'PDF' ? 'error' : 'success'}>{sch.format}</Badge>
                </div>
                <h4 className="text-xs font-black text-slate-850 dark:text-white pr-6 rtl:pl-6">{sch.name}</h4>
                <div className="flex gap-2.5 text-[9px] font-mono text-slate-450 dark:text-slate-500 mt-1 uppercase">
                  <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {sch.nextTrigger}</span>
                  <span>•</span>
                  <span className="max-w-[120px] truncate" title={sch.sendTo}>{sch.sendTo}</span>
                </div>
              </OperationalCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ReportsWorkspace;
