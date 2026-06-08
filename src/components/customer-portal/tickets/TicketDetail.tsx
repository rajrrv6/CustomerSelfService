'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Send, Upload, Star, CheckCircle, Paperclip, 
  Clock, ShieldAlert, Award, FileText, Download, RefreshCw, Sparkles 
} from 'lucide-react';
import { Ticket } from '@/types';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { TicketTimeline } from './TicketTimeline';
import { TicketSLAWidget } from './TicketSLAWidget';
import { TicketTimelineStep } from '../support/types';

interface TicketDetailProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  setActiveSubScreen: (sub: string) => void;
  ticketReplyText: string;
  setTicketReplyText: (val: string) => void;
  handlePostReply: (e: React.FormEvent) => void;
}

export function TicketDetail({
  tickets,
  selectedTicketId,
  setActiveSubScreen,
  ticketReplyText,
  setTicketReplyText,
  handlePostReply
}: TicketDetailProps) {
  const { addAuditLog, lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [csatRating, setCsatRating] = useState(0);
  const [csatHover, setCsatHover] = useState(0);
  const [npsRating, setNpsRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Custom mock attachments for ticket context
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; date: string; status: 'uploaded' | 'uploading' | 'failed' }>>([
    { name: 'payment_receipt.pdf', size: '1.2 MB', date: '2026-05-18', status: 'uploaded' },
    { name: 'error_log.txt', size: '42 KB', date: '2026-05-18', status: 'uploaded' }
  ]);

  const ticket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const getPriorityLabel = (priority: string) => {
    if (priority === 'low') return t.portal.tickets.priorityLow;
    if (priority === 'medium') return t.portal.tickets.priorityMedium;
    if (priority === 'high') return t.portal.tickets.priorityHigh;
    if (priority === 'urgent') return t.portal.tickets.priorityUrgent;
    return priority;
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'Billing & Payments') return t.portal.tickets.categoryBilling;
    if (category === 'User Authentication') return t.portal.tickets.categoryAuth;
    if (category === 'API Integrations') return t.portal.tickets.categoryApi;
    if (category === 'Shipments & Delivery') return t.portal.tickets.categoryShipment;
    return category;
  };

  if (!ticket) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubScreen('customer_my_tickets')}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h2 className="text-base font-bold">{t.portal.tickets.detailTitle}</h2>
            <p className="text-xs text-slate-400">{t.portal.tickets.detailSubtitle}</p>
          </div>
        </div>
        <div className="text-center py-10 text-slate-400 font-semibold text-xs">
          <span>{t.portal.tickets.ticketNotFound}</span>
        </div>
      </div>
    );
  }

  // Generate dynamic timeline steps based on status
  const steps: TicketTimelineStep[] = [
    {
      id: 'step-1',
      label: isRtl ? 'تم فتح التذكرة' : 'Ticket Created',
      timestamp: '2026-05-18 14:15',
      status: 'completed',
      description: isRtl ? 'تم إنشاء التذكرة وإرسالها لبوابة الدعم' : 'Case initiated and queued in support system'
    },
    {
      id: 'step-2',
      label: isRtl ? 'تم تعيين موظف الدعم' : 'Agent Assigned',
      timestamp: ticket.status !== 'open' ? '2026-05-18 14:30' : undefined,
      status: ticket.status !== 'open' ? 'completed' : 'current',
      description: ticket.status !== 'open' 
        ? (isRtl ? 'تم التخصيص للمهندس ليام بينيت' : 'Allocated to engineer Liam Bennett')
        : (isRtl ? 'بانتظار تخصيص التذكرة للوكيل' : 'Awaiting assignment queue allocation')
    },
    {
      id: 'step-3',
      label: isRtl ? 'تحت المعالجة والدراسة' : 'Under Investigation',
      timestamp: ticket.status === 'solved' ? '2026-05-18 15:00' : ticket.status === 'open' ? undefined : 'Active',
      status: ticket.status === 'solved' ? 'completed' : ticket.status === 'open' ? 'pending' : 'current',
      description: ticket.status === 'solved' 
        ? (isRtl ? 'تم فحص سجلات المعاملات' : 'Stripe log diagnostic complete')
        : ticket.status === 'open' 
        ? (isRtl ? 'بانتظار بدء التحقيق الفني' : 'Pending developer logs pull')
        : (isRtl ? 'مراجعة موصلات Stripe النشطة' : 'Tracing live Stripe gateway parameters')
    },
    {
      id: 'step-4',
      label: isRtl ? 'تم الحل بنجاح' : 'Case Resolved',
      timestamp: ticket.status === 'solved' ? '2026-05-18 16:30' : undefined,
      status: ticket.status === 'solved' ? 'completed' : 'pending',
      description: ticket.status === 'solved'
        ? (isRtl ? 'تم إيداع مبلغ الاسترداد وتأكيد المعاملة' : 'Refund processed and credits committed')
        : (isRtl ? 'بانتظار اتخاذ الإجراء النهائي للحل' : 'Pending resolution approval')
    }
  ];

  // Handle local reply post to update UI instantly
  const onLocalPostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim()) return;
    
    // Call parent handler
    handlePostReply(e);
    
    // Simulate agent auto acknowledgement
    setTimeout(() => {
      addAuditLog(`Support agent Liam Bennett acknowledged reply on ${ticket.id}`, 'success');
    }, 2000);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        // Simulate a small upload lag
        const newFileId = `file-${Date.now()}`;
        const newFile = {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          date: new Date().toISOString().split('T')[0],
          status: 'uploading' as const
        };
        setUploadedFiles(prev => [...prev, newFile]);

        setTimeout(() => {
          setUploadedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'uploaded' as const } : f));
          addAuditLog(`Uploaded attachment ${file.name} to ticket ${ticket.id}`, 'success');
        }, 1500);
      }
    };
    input.click();
  };

  const handleRetryUpload = (fileName: string) => {
    setUploadedFiles(prev => prev.map(f => f.name === fileName ? { ...f, status: 'uploading' as const } : f));
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(f => f.name === fileName ? { ...f, status: 'uploaded' as const } : f));
    }, 1200);
  };

  const handleSuggestedAIAction = (text: string) => {
    setTicketReplyText(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubScreen('customer_my_tickets')}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              {isRtl ? 'تفاصيل تذكرة الدعم الفني' : 'Support Case Timeline'}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 font-mono">
              CASE: {ticket.id} • STATUS: {ticket.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
          <span className="text-slate-400">{isRtl ? 'تصنيف الحالة:' : 'Case Class:'}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600">
            {getCategoryLabel(ticket.category)}
          </span>
        </div>
      </div>

      {/* Redesigned 3-column split support workspace layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start text-slate-800 dark:text-slate-200">
        
        {/* Left Panel: Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs md:col-span-1">
          <TicketTimeline isRtl={isRtl} steps={steps} />
        </div>

        {/* Center Panel: Ticket conversation and composer */}
        <div className="space-y-4 md:col-span-2">
          
          {/* Main Case Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                {ticket.title}
              </h4>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black font-mono uppercase ${
                ticket.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {getPriorityLabel(ticket.priority)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl">
              {ticket.description}
            </p>
          </div>

          {/* Conversation history bubbles */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
              {t.portal.tickets.conversationHistory}
            </span>

            {/* Farah Bot welcome reply */}
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-xs space-y-1">
                <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 font-bold mb-1">
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {isRtl ? 'المساعد الذكي Farah AI' : 'Farah AI Assistant'}
                  </span>
                  <span>2026-05-18 14:15</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
                  {isRtl 
                    ? `مرحباً ديفيد! تم تسجيل تذكرتك بنجاح برقم ${ticket.id} وتصنيفها تحت ${getCategoryLabel(ticket.category)}. سنقوم بالتحقق خلال 24 ساعة.` 
                    : `Hi David. I have logged ticket ${ticket.id} and categorized it under ${ticket.category}. Our support desk will respond shortly.`}
                </p>
              </div>
            </div>

            {/* Agent response reply */}
            {ticket.status !== 'open' && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-200">
                <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-xs space-y-1">
                  <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 font-bold mb-1">
                    <span>{isRtl ? 'ليام بينيت (مكتب الدعم البشري)' : 'Liam Bennett (Support Desk)'}</span>
                    <span>2026-05-18 16:30</span>
                  </div>
                  <p className="text-xs font-medium text-slate-655 dark:text-slate-300 leading-relaxed">
                    {isRtl 
                      ? 'لقد راجعت سجلات Stripe المرفقة. تبين وجود عملية سحب مزدوجة بسبب خطأ بالشبكة. قمت بإعفاء الرسوم الثانية وعمل استرداد مالي فوري لحسابك.' 
                      : 'I have checked your duplicate transaction logs inside Stripe. I can confirm the second charge has been exempted and refunded. It will reflect in your statements shortly.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Solved CSAT / NPS Survey block */}
          {ticket.status === 'solved' && (
            feedbackSubmitted ? (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                <h5 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{t.portal.tickets.feedbackThankYou}</h5>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {isRtl ? 'تم حفظ التقييم بنجاح. نشكرك لمساعدتنا في تحسين الأداء.' : 'Your survey outcomes have been committed to mPaaS satisfaction analytics logs.'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-2 flex justify-between items-center">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase font-mono">{t.portal.tickets.resolutionFeedback}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{isRtl ? 'أخبرنا عن رأيك في حل التذكرة' : 'Please rate your experience'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black font-mono bg-emerald-500/10 text-emerald-500">
                    {t.portal.tickets.solved}
                  </span>
                </div>

                {/* CSAT Stars */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">{t.portal.tickets.csatLabel}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCsatRating(star)}
                        onMouseEnter={() => setCsatHover(star)}
                        onMouseLeave={() => setCsatHover(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded"
                      >
                        <Star className={`w-5 h-5 ${
                          (csatHover || csatRating) >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* NPS buttons */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">{t.portal.tickets.npsLabel}</span>
                  <p className="text-[10px] text-slate-400">{t.portal.tickets.npsQuestion}</p>
                  <div className="grid grid-cols-10 gap-1 pt-1.5">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const val = i + 1;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNpsRating(val)}
                          className={`py-1 text-[10px] font-bold font-mono border rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            npsRating === val 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">{t.portal.tickets.commentsLabel}</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t.portal.tickets.commentsPlaceholder}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-xs text-slate-850 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSubmitted(true);
                    addAuditLog(`CSAT Feedback submitted for ${ticket.id}`, 'success');
                  }}
                  disabled={csatRating === 0 || npsRating === 0}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {t.portal.tickets.submitFeedback}
                </button>
              </div>
            )
          )}

          {/* Composer Reply field */}
          <form onSubmit={onLocalPostReply} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-2.5 shadow-xs">
            <textarea
              rows={3}
              placeholder={t.portal.tickets.replyPlaceholder}
              value={ticketReplyText}
              onChange={(e) => setTicketReplyText(e.target.value)}
              className="w-full bg-transparent text-xs p-2 focus:outline-none text-slate-850 dark:text-white placeholder-slate-400 font-semibold resize-none"
            />
            
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={handleFileUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.portal.tickets.attachFile}</span>
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.portal.tickets.sendMessage}</span>
              </button>
            </div>
          </form>

        </div>

        {/* Right Panel: Specifications & SLA countdown */}
        <div className="space-y-4 md:col-span-1">
          
          {/* SLA Countdown Timer Widget */}
          <div className="space-y-2">
            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider font-mono block">
              ⏱️ {isRtl ? 'اتفاقية مستوى الخدمة' : 'SLA Performance Indicator'}
            </span>
            <TicketSLAWidget 
              isRtl={isRtl}
              limitMinutes={120}
              initialSecondsRemaining={ticket.status === 'solved' ? 0 : 3600}
            />
          </div>

          {/* Ticket Category details specs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {t.portal.tickets.caseSpecs}
            </h4>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">{t.portal.tickets.categoryLabel}</span>
                <span className="truncate max-w-[120px]">{getCategoryLabel(ticket.category)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">{isRtl ? 'الفريق المعين' : 'Assigned Team'}</span>
                <span>Tier-2 Support</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">{t.portal.tickets.statusLabel}</span>
                <span className="font-mono text-blue-500 font-bold uppercase">{ticket.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">{isRtl ? 'الوقت المتوقع للحل' : 'Resolution Est'}</span>
                <span>2 hours</span>
              </div>
            </div>
          </div>

          {/* Suggested AI Action Prompts */}
          {ticket.status !== 'solved' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1 text-purple-500">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>{isRtl ? 'إجراءات ذكاء مقترحة' : 'AI Suggested Prompts'}</span>
              </h4>

              <div className="space-y-2">
                <button
                  onClick={() => handleSuggestedAIAction(isRtl ? 'هل تم إرجاع المبلغ لبطاقتي؟' : 'Has the duplicate Stripe transaction refund cleared?')}
                  className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-purple-500/5 hover:border-purple-500 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-semibold leading-normal"
                >
                  🔍 {isRtl ? 'الاستفسار عن تأكيد استرداد Stripe' : 'Verify Stripe credit status'}
                </button>
                <button
                  onClick={() => handleSuggestedAIAction(isRtl ? 'أرجو إرفاق سجل الفواتير المحدث' : 'Please supply my updated billing statement.')}
                  className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-955 dark:bg-slate-950 hover:bg-purple-500/5 hover:border-purple-500 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-semibold leading-normal"
                >
                  📄 {isRtl ? 'طلب كشف الحساب الفواتير المحدث' : 'Request billing log copy'}
                </button>
              </div>
            </div>
          )}

          {/* Ticket Attachments list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3.5">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {isRtl ? 'ملفات التذكرة المرفقة' : 'Ticket Attachments'}
            </h4>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-[10px] font-medium">
                {isRtl ? 'لا توجد مرفقات بالتذكرة.' : 'No files attached to this case.'}
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-semibold gap-2">
                    <div className="flex items-center gap-2 truncate flex-1 pr-1">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={file.name}>{file.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[8px] text-slate-400 font-mono font-bold">{file.size}</span>
                      {file.status === 'uploading' ? (
                        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                      ) : file.status === 'failed' ? (
                        <button 
                          type="button" 
                          onClick={() => handleRetryUpload(file.name)}
                          className="p-0.5 text-rose-500 hover:bg-rose-500/10 rounded"
                          title="Retry Upload"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Download File"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
export default TicketDetail;
