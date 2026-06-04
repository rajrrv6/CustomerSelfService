'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  GitCommit,
  Code2,
  AlertTriangle,
  Users,
  Layers,
  CreditCard,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  HelpCircle,
  ClipboardCopy
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function HelpCenterTab() {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const ns = t.superAdmin.help;
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support ticket form state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketSeverity, setTicketSeverity] = useState('medium');
  const [ticketTenant, setTicketTenant] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Accordion FAQ states
  const [faqStates, setFaqStates] = useState<Record<string, boolean>>({
    faq_1: false,
    faq_2: false,
    faq_3: false,
  });

  const toggleFaq = (id: string) => {
    setFaqStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const quickLinks = [
    {
      id: 'docs',
      icon: <BookOpen className="w-5 h-5" />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: ns.links.docsTitle,
      description: ns.links.docsDesc,
      url: 'https://docs.platform.io/super-admin/core',
    },
    {
      id: 'release_notes',
      icon: <GitCommit className="w-5 h-5" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: ns.links.releaseNotesTitle,
      description: ns.links.releaseNotesDesc,
      url: 'https://docs.platform.io/super-admin/releases',
    },
    {
      id: 'api_ref',
      icon: <Code2 className="w-5 h-5" />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: ns.links.apiRefTitle,
      description: ns.links.apiRefDesc,
      url: 'https://api.platform.io/v1/endpoints',
    },
    {
      id: 'escalation_path',
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: ns.links.escalationPathTitle,
      description: ns.links.escalationPathDesc,
      url: 'https://status.platform.io/escalation-rules',
    },
  ];

  const guides = [
    {
      id: 'onboarding',
      icon: <Users className="w-4 h-4" />,
      title: ns.guides.onboardingTitle,
      description: ns.guides.onboardingDesc,
      content: isRtl
        ? 'لتهيئة مستأجر جديد بنجاح، اتبع المعالج المكون من 8 خطوات. تأكد من تحديد خطة ترخيص ملائمة وتعيين المشرف الافتراضي. سيقوم النظام تلقائياً بإنشاء فضاء العمل وعناوين البريد للتفعيل.'
        : 'To bootstrap a new tenant, follow the 8-step setup wizard. Assign a billing tier, define limits quotas, and register the admin credentials. The platform initializes namespaces in Pinecone and hooks up routing channels automatically.',
    },
    {
      id: 'rbac',
      icon: <Layers className="w-4 h-4" />,
      title: ns.guides.rbacTitle,
      description: ns.guides.rbacDesc,
      content: isRtl
        ? 'يتم استخدام الصلاحيات القائمة على الأدوار (RBAC) لتقييد الوصول. يتم منح مستخدمي "المشرف العام" حق التعديل والتحكم الكامل بالنظام، بينما يملك "مشرف العميل" الصلاحية لإدارة الروبوتات ضمن النطاق الخاص بمؤسسته.'
        : 'Role-Based Access Control filters core screens. Super Admins govern global models registries and cross-tenant logs, while Client Admins manage local bots flow nodes, intents slots, and safety filters templates under isolation.',
    },
    {
      id: 'billing',
      icon: <CreditCard className="w-4 h-4" />,
      title: ns.guides.billingTitle,
      description: ns.guides.billingDesc,
      content: isRtl
        ? 'تتم معالجة الفواتير وحساب الاستهلاك دورياً بناءً على عدد الطلبات الصادرة ونوع النموذج المستخدم. لمراجعة الفواتير المتأخرة أو جدولة خطة تحصيل الديون، توجه إلى لوحة الفوترة العامة واضغط على ترحيل المطالبات.'
        : 'Usage meters count token volumes, conversation quotas, and active telephony seat licenses. When payments fail, the dunning logs scheduler dispatches automatic email warnings and suspends features step-by-step.',
    },
    {
      id: 'sip',
      icon: <Phone className="w-4 h-4" />,
      title: ns.guides.sipTitle,
      description: ns.guides.sipDesc,
      content: isRtl
        ? 'لتوصيل قنوات الاتصال الصوتي SIP، اضبط عنوان خادم الاتصالات وبيانات الاعتماد. استخدم أداة فحص الاتصال للتأكد من استقرار الشبكة ومؤشر MOS (مقياس جودة الصوت)، وتتبع مسار الرقم الوارد لتأكيد سلامة التوجيه.'
        : 'SIP Trunking binds carrier signaling to tenant dial plan agents. Manage capacities, options pings diagnostics probes, and route testing simulators. Real voice path audio loopbacks run loopback tests at MOS targets of 4.4.',
    },
  ];

  const faqs: FaqItem[] = [
    {
      id: 'faq_1',
      question: isRtl ? 'كيف يتم تفعيل موصلات المعرفة للذكاء الاصطناعي؟' : 'How does the Knowledge Connector registry trigger updates?',
      answer: isRtl
        ? 'بمجرد ربط موصل المعرفة (مثل موقع ويب أو ملف PDF)، يقرأ النظام المحتويات ويقسمها إلى كتل نصية، ثم يستدعي نموذج التضمين ليحفظ الفهارس المتجهة في Pinecone. يمكنك تتبع التقدم خطوة بخطوة من لوحة البنية التحتية.'
        : 'Once linked (e.g., website crawlers or file uploads), indices chunks are fed into Pinecone vectors. Sync is monitored inside the connector registry logs drawer, showing progress from ingestion to embedding compaction sweeps.',
    },
    {
      id: 'faq_2',
      question: isRtl ? 'كيف يتم تعليق حساب مستأجر متأخر الدفع؟' : 'What happens during a manual tenant suspension block?',
      answer: isRtl
        ? 'عندما تنتهي فترة السماح في سياسة الفوترة دون دفع الرصيد، يرسل المشرف تنبيهاً يدوياً أو يضغط على تعليق المستأجر. يؤدي هذا لتقييد نفاذ مشرفي العميل والمستخدمين ومنع استدعاء روبوتات الدردشة، مع بقاء فضاء العمل آمناً.'
        : 'Suspension is triggered via Tenant List actions. It redirects tenant admins to access-denied pages and halts all LLM API endpoint invocations, while keeping data records and vectors index partitions intact for recovery.',
    },
    {
      id: 'faq_3',
      question: isRtl ? 'ما هو التردد الزمني لفحص الأنظمة والخدمات؟' : 'What is the system operations health diagnostics interval?',
      answer: isRtl
        ? 'تقوم أنظمة المراقبة بفحص مؤشرات Uptime والزمن المنقضي للاتصال OPTIONS Ping كل 15 ثانية. يتم توجيه التنبيهات فوراً إلى شريط الطوارئ في لوحة القيادة وإرسال نسخة منها عبر SIEM syslog فورا.'
        : 'Regional service uptime loops and OPTION ping indicators trace latency stats every 15 seconds. High latency exceptions raise urgent alerts in the Quick console, routing issues directly to audit Splunk forwarders.',
    },
  ];

  // Quick link copy simulation
  const handleLinkClick = (title: string, url: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(url);
    pushToast(
      'success',
      isRtl ? 'تم نسخ الرابط' : 'Link Copied to Clipboard',
      isRtl ? `تم نسخ رابط مستندات "${title}" للذاكرة.` : `Successfully copied documentation URL for "${title}".`
    );
    addAuditLog(`Copied documentation URL: ${title}`, 'success');
  };

  // Submit Support Ticket Form
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowTicketModal(false);
      pushToast(
        'success',
        isRtl ? 'تم إنشاء تذكرة الدعم' : 'Support Ticket Dispatched',
        isRtl 
          ? `تم إرسال التذكرة بالرقم #TK-${Date.now().toString().slice(-5)} لفرق العمل.` 
          : `Successfully escalated ticket #TK-${Date.now().toString().slice(-5)} to Level 3 operations.`
      );
      addAuditLog(`Escalated technical support ticket: ${ticketTitle}`, 'success');
      
      // Reset form
      setTicketTitle('');
      setTicketTenant('');
      setTicketDesc('');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <SectionHeader
        title={ns.title}
        description={ns.description}
      />

      {/* Quick Links */}
      <div>
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5 px-0.5">
          {ns.quickLinksTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <div
              key={link.id}
              onClick={(e) => handleLinkClick(link.title, link.url, e)}
              className="cursor-pointer group"
            >
              <OperationalCard hoverEffect>
                <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl ${link.iconBg} ${link.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {link.title}
                      </h4>
                      <ClipboardCopy className="w-3 h-3 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {link.description}
                    </p>
                  </div>
                </div>
              </OperationalCard>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic FAQs Section */}
      <div>
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5 px-0.5 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-450" />
          <span>{isRtl ? 'الأسئلة الشائعة والأدلة السريعة' : 'Operational FAQs & Troubleshooting'}</span>
        </h3>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = faqStates[faq.id];
            return (
              <div
                key={faq.id}
                onClick={() => toggleFaq(faq.id)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-200 dark:hover:border-slate-750 transition-colors"
              >
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-white select-none">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Guides */}
      <div>
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5 px-0.5">
          {ns.guidesTitle}
        </h3>
        <OperationalCard hoverEffect={false}>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => setActiveGuideId(guide.id)}
                className={`flex items-start gap-3 py-4 first:pt-0 last:pb-0 group cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-850 dark:text-white leading-tight mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {guide.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {guide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </OperationalCard>
      </div>

      {/* Escalation & Support */}
      <div>
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5 px-0.5">
          {ns.escalationTitle}
        </h3>
        <OperationalCard hoverEffect={false}>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-medium">
            {ns.escalationDesc}
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            {/* Email */}
            <a
              href={`mailto:${ns.escalationEmail}`}
              className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-750 dark:text-slate-300 transition-colors group"
            >
              <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
              <span className="font-mono">{ns.escalationEmail}</span>
            </a>
            {/* Open ticket */}
            <button
              type="button"
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-2.5 px-4 py-3 bg-blue-650 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>{ns.escalationTicket}</span>
            </button>
          </div>
        </OperationalCard>
      </div>

      {/* 1. Guide Details Reader Modal */}
      {activeGuideId && (() => {
        const guideObj = guides.find(g => g.id === activeGuideId);
        if (!guideObj) return null;
        return (
          <ModalWrapper
            isOpen={!!activeGuideId}
            onClose={() => setActiveGuideId(null)}
            title={guideObj.title}
          >
            <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  {guideObj.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">{guideObj.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{guideObj.description}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl border border-slate-100 dark:border-slate-850 leading-relaxed font-semibold text-slate-655 dark:text-slate-355">
                {guideObj.content}
              </div>

              {/* Mock Flow steps diagrams inside guide */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
                  {isRtl ? 'مخطط سير العمليات المقترح' : 'Recommended Operational Flow Checklist'}
                </span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 divide-y divide-slate-100 dark:divide-slate-800/60">
                  <div className="flex gap-2.5 py-2 first:pt-0">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold font-mono">1</span>
                    <div>
                      <span className="font-bold block">{isRtl ? 'التحقق من المتطلبات الفنية' : 'Validate settings prerequisites'}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{isRtl ? 'فحص الاتصال وتوفر التوجيه.' : 'Verify telemetry options ping results before proceeding.'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 py-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold font-mono">2</span>
                    <div>
                      <span className="font-bold block">{isRtl ? 'بدء معالج التهيئة' : 'Trigger onboarding sequence'}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{isRtl ? 'تعبئة حقول المنظمة والمعلومات.' : 'Input legal parameters inside Provisioning Wizard modal.'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 py-2 last:pb-0">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold font-mono">3</span>
                    <div>
                      <span className="font-bold block">{isRtl ? 'اختبار ترحيل البيانات للتدقيق' : 'Verify SIEM Syslog sync forwarder'}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{isRtl ? 'تدقيق العمليات في لوحة الإشراف.' : 'Check audit logs inspector payload results.'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveGuideId(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-800 dark:text-slate-250 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  {isRtl ? 'إغلاق القارئ' : 'Close Document'}
                </button>
              </div>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 2. Escalation Support Ticket Form Modal */}
      {showTicketModal && (
        <ModalWrapper
          isOpen={showTicketModal}
          onClose={() => {
            if (!isSubmitting) setShowTicketModal(false);
          }}
          title={isRtl ? 'فتح تذكرة دعم فني طارئة' : 'Escalate Support Ticket'}
        >
          <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'عنوان التذكرة' : 'Ticket Title'} *
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder={isRtl ? 'مثال: فشل ترحيل سجلات تدقيق SIEM' : 'e.g. Failure in SIEM Splunk Syslog sync forwarder'}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                  {isRtl ? 'مستوى الأهمية والاستجابة' : 'Ticket Severity SLA'}
                </label>
                <select
                  value={ticketSeverity}
                  onChange={(e) => setTicketSeverity(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="low">{isRtl ? 'منخفضة (SLA 48 ساعة)' : 'Low (SLA 48 hrs)'}</option>
                  <option value="medium">{isRtl ? 'متوسطة (SLA 24 ساعة)' : 'Medium (SLA 24 hrs)'}</option>
                  <option value="high">{isRtl ? 'عالية (SLA 4 ساعات)' : 'High (SLA 4 hrs)'}</option>
                  <option value="critical">{isRtl ? 'طارئة / توقف النظام (SLA ساعة واحدة)' : 'Critical / System Down (SLA 1 hr)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                  {isRtl ? 'اسم المستأجر المتأثر (اختياري)' : 'Affected Tenant Scope (Optional)'}
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={ticketTenant}
                  onChange={(e) => setTicketTenant(e.target.value)}
                  placeholder="e.g. Riyadh Financial"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'وصف المشكلة الفنية بالتفصيل' : 'Technical Description & Logs'} *
              </label>
              <textarea
                required
                disabled={isSubmitting}
                rows={4}
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder={isRtl ? 'أدخل تفاصيل الأخطاء وسجل الأحداث هنا...' : 'Provide specific error logs or telemetry inputs observed...'}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-slate-505 rounded-xl transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !ticketTitle.trim() || !ticketDesc.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'إرسال التذكرة' : 'Dispatch Ticket'}</span>
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}
    </div>
  );
}
