'use client';

import React, { useState } from 'react';
import { SVGDonutChart, SVGLineChart } from '@/components/dashboard/Charts';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { 
  TrendingUp, 
  Star, 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';

export function SurveysTab() {
  const { lang } = useApp();
  const t = translations[lang];

  // Filters State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'whatsapp' | 'web' | 'voice' | 'email'>('all');

  const dict = {
    en: {
      timeRangeLabel: 'Date Range',
      channelLabel: 'Channel Source',
      allChannels: 'All Channels',
      whatsapp: 'WhatsApp',
      web: 'Web Chat',
      voice: 'Voice Call',
      email: 'Email',
      range7d: 'Last 7 Days',
      range30d: 'Last 30 Days',
      range90d: 'Last 90 Days',
      csatKpi: 'CSAT Index',
      csatGoal: 'Target: 90% satisfied',
      npsKpi: 'NPS Score',
      npsGoal: 'Target: +50 score',
      responseRateKpi: 'Response Rate',
      responseRateGoal: 'Average sent: 1,480',
      sentimentKpi: 'Positive Sentiment',
      sentimentGoal: 'AI Tone Classification',
      channelBreakdownTitle: 'Channel Satisfaction Metrics',
      channelScore: 'CSAT Score',
      positiveTone: 'Positive Tone',
      aiInsightsTitle: 'AI Sentiment & Operational Insights',
      driverPositiveTitle: 'Positive Sentiment Driver (Auto-Refunds)',
      driverPositiveDesc: 'WhatsApp automated refunds account for 68% of 5/5 stars CSAT responses. Fast resolution loops keep customer sentiment high.',
      driverNegativeTitle: 'Dissatisfaction Spike Warning (SLA & Transfers)',
      driverNegativeDesc: 'OAuth registration mismatches and multiple human desk transfers show a 40% drop in CSAT. Time-to-resolution sensitivity is critical.',
      driverCorrelationTitle: 'SLA vs CSAT Correlation',
      driverCorrelationDesc: 'SLA-adherent resolutions score a 4.7/5 average CSAT, while breached tickets fall to 2.2/5, indicating low user tolerance for latency.',
      recentLogsTitle: 'Recent Surveys Feedback Logs',
      recentLogsSubtitle: 'Granular CSAT scores, sentiment tags, and verbatim customer comments.',
      colTicket: 'Ticket ID',
      colCustomer: 'Customer Name',
      colChannel: 'Channel',
      colCsat: 'CSAT',
      colSentiment: 'Sentiment',
      colComment: 'Customer Feedback Comment',
      colTime: 'Completed',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative'
    },
    ar: {
      timeRangeLabel: 'النطاق الزمني',
      channelLabel: 'قناة الاتصال',
      allChannels: 'جميع القنوات',
      whatsapp: 'واتساب',
      web: 'محادثة الويب',
      voice: 'مكالمة صوتية',
      email: 'البريد الإلكتروني',
      range7d: 'آخر 7 أيام',
      range30d: 'آخر 30 يوماً',
      range90d: 'آخر 90 يوماً',
      csatKpi: 'مؤشر رضا العملاء CSAT',
      csatGoal: 'الهدف: 90% رضا عملاء',
      npsKpi: 'مؤشر الترويج NPS',
      npsGoal: 'الهدف: تقييم أعلى من +50',
      responseRateKpi: 'معدل الاستجابة للاستبيان',
      responseRateGoal: 'متوسط الإرسال: 1,480',
      sentimentKpi: 'الإنطباع الإيجابي العام',
      sentimentGoal: 'تصنيف نبرة الذكاء الاصطناعي',
      channelBreakdownTitle: 'مقاييس رضا العملاء حسب القنوات',
      channelScore: 'تقييم CSAT',
      positiveTone: 'نبرة إيجابية',
      aiInsightsTitle: 'رؤى الذكاء الاصطناعي والإنطباعات التشغيلية',
      driverPositiveTitle: 'محفز الرضا الإيجابي (الاسترداد التلقائي)',
      driverPositiveDesc: 'مبيعات استرداد الأموال التلقائية عبر واتساب تشكل 68% من تقييمات CSAT الكاملة. الاستجابة السريعة تحافظ على رضا العميل.',
      driverNegativeTitle: 'تحذير ارتفاع عدم الرضا (المهلة والتنقلات)',
      driverNegativeDesc: 'مشكلات فحص OAuth والتنقلات المتعددة بين الوكلاء تؤدي إلى انخفاض CSAT بنسبة 40%. سرعة حل التذكرة أمر جوهري.',
      driverCorrelationTitle: 'مزامنة الـ SLA مع رضا العملاء',
      driverCorrelationDesc: 'الحالات التي تحل خلال اتفاقية مستوى الخدمة تسجل معدل CSAT 4.7/5، بينما الحالات المتجاوزة للمهلة تهبط إلى 2.2/5.',
      recentLogsTitle: 'سجلات ملاحظات واستبيانات العملاء الأخيرة',
      recentLogsSubtitle: 'تقييمات CSAT التفصيلية، تصنيفات الانطباع، وتعليقات العملاء المباشرة.',
      colTicket: 'معرف التذكرة',
      colCustomer: 'اسم العميل',
      colChannel: 'القناة',
      colCsat: 'التقييم',
      colSentiment: 'الإنطباع',
      colComment: 'تعليق ملاحظات العميل',
      colTime: 'تم الإكمال',
      positive: 'إيجابي',
      neutral: 'محايد',
      negative: 'سلبي'
    }
  };

  const d = dict[lang];

  // Dynamic Data Calculation Helpers
  const getCsatBreakdown = () => {
    let base = [82, 12, 6];
    if (selectedChannel === 'whatsapp') base = [88, 8, 4];
    if (selectedChannel === 'web') base = [76, 16, 8];
    if (selectedChannel === 'voice') base = [73, 17, 10];
    if (selectedChannel === 'email') base = [62, 18, 20];

    let multiplier = 1;
    if (timeRange === '7d') multiplier = 0.25;
    if (timeRange === '90d') multiplier = 3;

    return base.map(val => Math.round(val * 10 * multiplier));
  };

  const getNpsData = () => {
    let baseData = [50, 52, 55, 54, 56];
    let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    
    if (timeRange === '7d') {
      labels = lang === 'ar' 
        ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      baseData = [52, 54, 53, 55, 57];
    } else if (timeRange === '90d') {
      labels = ['Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26'];
      baseData = [48, 51, 53, 52, 54];
    }

    if (selectedChannel === 'whatsapp') {
      baseData = baseData.map(v => v + 12);
    } else if (selectedChannel === 'email') {
      baseData = baseData.map(v => v - 8);
    } else if (selectedChannel === 'voice') {
      baseData = baseData.map(v => v + 2);
    } else if (selectedChannel === 'web') {
      baseData = baseData.map(v => v - 2);
    }

    return { data: baseData, labels };
  };

  const breakdown = getCsatBreakdown();
  const totalResponses = breakdown.reduce((a, b) => a + b, 0);
  const avgCsat = totalResponses > 0 
    ? ((breakdown[0] * 5 + breakdown[1] * 3 + breakdown[2] * 1.5) / totalResponses).toFixed(1)
    : '4.6';
  
  const npsInfo = getNpsData();
  const currentNps = npsInfo.data[npsInfo.data.length - 1];
  
  const responseRate = selectedChannel === 'whatsapp' 
    ? '34.2%' 
    : selectedChannel === 'web' 
    ? '22.8%' 
    : selectedChannel === 'voice' 
    ? '18.5%' 
    : selectedChannel === 'email' 
    ? '11.6%' 
    : '24.5%';
    
  const positiveSentimentPercent = totalResponses > 0 
    ? Math.round((breakdown[0] / totalResponses) * 100) 
    : 80;

  const csatLabels = lang === 'ar'
    ? ['راضٍ جداً (CSAT 4-5)', 'محايد (CSAT 3)', 'غير راضٍ (CSAT 1-2)']
    : ['Satisfied (CSAT 4-5)', 'Neutral (CSAT 3)', 'Unsatisfied (CSAT 1-2)'];

  // Channel Satisfaction list
  const channelStats = [
    { id: 'whatsapp', name: d.whatsapp, score: '4.8', percent: 96, icon: <MessageSquare className="w-4.5 h-4.5 text-emerald-500" />, colorClass: 'bg-emerald-500', bgClass: 'bg-emerald-500/10' },
    { id: 'web', name: d.web, score: '4.4', percent: 88, icon: <Globe className="w-4.5 h-4.5 text-sky-500" />, colorClass: 'bg-sky-500', bgClass: 'bg-sky-500/10' },
    { id: 'voice', name: d.voice, score: '4.3', percent: 86, icon: <Phone className="w-4.5 h-4.5 text-blue-500" />, colorClass: 'bg-blue-500', bgClass: 'bg-blue-500/10' },
    { id: 'email', name: d.email, score: '4.1', percent: 82, icon: <Mail className="w-4.5 h-4.5 text-violet-500" />, colorClass: 'bg-violet-500', bgClass: 'bg-violet-500/10' },
  ];

  // Mock surveys completed
  const mockSurveys = [
    { id: 'srv-1', ticketId: 'TCK-892', name: 'Juliana Carter', channel: 'email', csat: 5, sentiment: 'success', comment: lang === 'ar' ? 'تم حل مشكلة مزامنة إيصال الدفع بسرعة. خدمة ممتازة.' : 'The payment receipt sync problem was solved quickly. Excellent tier-1 support.', date: '2 hours ago' },
    { id: 'srv-2', ticketId: 'TCK-776', name: 'Amina Al-Fayed', channel: 'whatsapp', csat: 5, sentiment: 'success', comment: 'تحديث عنوان التوصيل وتعديل الفاتورة الضريبية تم في ثوانٍ معدودة. شكراً للمساعدة السريعة!', date: '4 hours ago' },
    { id: 'srv-3', ticketId: 'TCK-998', name: 'David Miller', channel: 'web', csat: 4, sentiment: 'success', comment: lang === 'ar' ? 'تم تحويلي للوكيل بسرعة. خدمة استرداد الأموال كانت مؤتمتة وسريعة.' : 'Redirected to Nadia quickly. The return refund exception on my damaged unit was automated.', date: '1 day ago' },
    { id: 'srv-4', ticketId: 'TCK-102', name: 'Marcus Aurelius', channel: 'voice', csat: 2, sentiment: 'error', comment: lang === 'ar' ? 'تأخرت مزامنة بوابة الدفع وتجاوزت الوقت المحدد للدعم.' : 'OAuth token validation error locked my account. Breached SLA timeline twice.', date: '1 day ago' },
    { id: 'srv-5', ticketId: 'TCK-432', name: 'Sarah Connor', channel: 'whatsapp', csat: 5, sentiment: 'success', comment: lang === 'ar' ? 'التحقق من سياسة الاسترجاع كان سهلاً جداً عبر الواتساب.' : 'Quickly verified return policy rules. Best support experience via WhatsApp!', date: '2 days ago' },
    { id: 'srv-6', ticketId: 'TCK-512', name: 'Ahmed Al-Shehri', channel: 'web', csat: 3, sentiment: 'warning', comment: 'المحادثة جيدة ولكن استغرق الرد وقتاً أطول من المتوقع بانتظار المشرف.', date: '3 days ago' },
    { id: 'srv-7', ticketId: 'TCK-621', name: 'Liam Bennett', channel: 'email', csat: 1, sentiment: 'error', comment: lang === 'ar' ? 'فشل النظام في مزامنة بوابة المستندات وتأخر الدعم لأيام.' : 'SLA resolution deadline breached. ERP database took two days to sync accounts.', date: '4 days ago' }
  ];

  const filteredSurveys = mockSurveys.filter(s => selectedChannel === 'all' || s.channel === selectedChannel);

  const tableHeaders = [
    d.colTicket,
    d.colCustomer,
    d.colChannel,
    d.colCsat,
    d.colSentiment,
    d.colComment,
    d.colTime
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500 font-mono text-xs select-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'text-amber-500' : 'text-slate-200 dark:text-slate-800'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const getChannelBadge = (ch: string) => {
    if (ch === 'whatsapp') return <Badge type="success">{d.whatsapp}</Badge>;
    if (ch === 'email') return <Badge type="billing">{d.email}</Badge>;
    if (ch === 'voice') return <Badge type="info">{d.voice}</Badge>;
    return <Badge type="neutral">{d.web}</Badge>;
  };

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      <SectionHeader
        title={t.clientAdmin.surveys.title}
        description={t.clientAdmin.surveys.description}
      />

      {/* Control Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider font-mono">{d.timeRangeLabel}:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="7d">{d.range7d}</option>
              <option value="30d">{d.range30d}</option>
              <option value="90d">{d.range90d}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider font-mono">{d.channelLabel}:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{d.allChannels}</option>
              <option value="whatsapp">{d.whatsapp}</option>
              <option value="web">{d.web}</option>
              <option value="voice">{d.voice}</option>
              <option value="email">{d.email}</option>
            </select>
          </div>
        </div>

        <div className="text-[10px] font-mono font-bold text-slate-400">
          Showing {totalResponses} total survey logs
        </div>
      </div>

      {/* KPI Stats HUD Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: CSAT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5 duration-250">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono tracking-wider block">{d.csatKpi}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">{avgCsat} <span className="text-[10px] font-normal text-slate-400">/ 5.0</span></span>
            <span className="block text-[8px] text-emerald-500 font-bold">{d.csatGoal}</span>
          </div>
          <Star className="w-8 h-8 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        {/* Card 2: NPS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5 duration-250">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono tracking-wider block">{d.npsKpi}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">+{currentNps}</span>
            <span className="block text-[8px] text-purple-500 font-bold">{d.npsGoal}</span>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-500 bg-purple-50 dark:bg-purple-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        {/* Card 3: Response Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5 duration-250">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono tracking-wider block">{d.responseRateKpi}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">{responseRate}</span>
            <span className="block text-[8px] text-slate-400 font-bold">{d.responseRateGoal}</span>
          </div>
          <Clock className="w-8 h-8 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        {/* Card 4: Sentiment */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5 duration-250">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono tracking-wider block">{d.sentimentKpi}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">{positiveSentimentPercent}%</span>
            <span className="block text-[8px] text-emerald-500 font-bold">{d.sentimentGoal}</span>
          </div>
          <Sparkles className="w-8 h-8 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SVGDonutChart
          data={breakdown}
          labels={csatLabels}
          colors={['#10b981', '#6b7280', '#f43f5e']}
          title={t.clientAdmin.surveys.csatBreakdown}
        />
        <SVGLineChart
          data={npsInfo.data}
          labels={npsInfo.labels}
          title={t.clientAdmin.surveys.npsTrend}
          gradientColor="#a855f7"
        />
      </div>

      {/* Row 3: Channels satisfaction comparison + AI Insights drivers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Channels progress bars */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono leading-none">{d.channelBreakdownTitle}</h4>
            <p className="text-[10px] text-slate-400 mt-1">Cross-channel satisfaction indices comparison</p>
          </div>
          <div className="space-y-3.5 pt-2">
            {channelStats.map((cs) => {
              const isSelected = selectedChannel === cs.id;
              return (
                <div 
                  key={cs.id} 
                  className={`space-y-1 p-2 rounded-xl border transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-950/20' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${cs.bgClass} shrink-0`}>
                        {cs.icon}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{cs.name}</span>
                    </div>
                    <div className="text-right font-mono font-black text-slate-900 dark:text-white">
                      {cs.score} <span className="text-[9px] font-normal text-slate-400">/ 5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${cs.colorClass}`}
                        style={{ width: `${cs.percent}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-slate-400">{cs.percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI sentiment driver alerts */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono leading-none">{d.aiInsightsTitle}</h4>
            <p className="text-[10px] text-slate-400 mt-1">AI classification anomalies, feedback correlations, and driver parameters</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="border border-emerald-200 dark:border-emerald-950/30 bg-emerald-500/5 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-450 font-bold">
                <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                <span>{d.driverPositiveTitle}</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {d.driverPositiveDesc}
              </p>
            </div>

            <div className="border border-red-200 dark:border-red-950/30 bg-red-500/5 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-450 font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{d.driverNegativeTitle}</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {d.driverNegativeDesc}
              </p>
            </div>

            <div className="border border-blue-200 dark:border-blue-950/30 bg-blue-500/5 p-3 rounded-2xl sm:col-span-2 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-450 font-bold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{d.driverCorrelationTitle}</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {d.driverCorrelationDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent feedback log table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{d.recentLogsTitle}</h4>
          <p className="text-[10px] text-slate-400 mt-1">{d.recentLogsSubtitle}</p>
        </div>

        <EnterpriseTable headers={tableHeaders} empty={filteredSurveys.length === 0} emptyTitle="No surveys logged" emptyDesc="No responses matched this channel filter.">
          {filteredSurveys.map((srv) => (
            <tr key={srv.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 font-normal">
              <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 font-mono">{srv.ticketId}</td>
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{srv.name}</td>
              <td className="px-6 py-4">
                {getChannelBadge(srv.channel)}
              </td>
              <td className="px-6 py-4">
                {renderStars(srv.csat)}
              </td>
              <td className="px-6 py-4">
                <Badge type={srv.sentiment}>
                  {srv.sentiment === 'success' ? d.positive : srv.sentiment === 'warning' ? d.neutral : d.negative}
                </Badge>
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-350 leading-relaxed max-w-sm font-medium">
                {srv.comment}
              </td>
              <td className="px-6 py-4 font-mono font-bold text-slate-400">{srv.date}</td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>
    </div>
  );
}
