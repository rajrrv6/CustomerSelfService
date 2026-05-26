'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  EyeOff, 
  Layers, 
  Globe, 
  Check, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Info, 
  Lock,
  Search,
  CheckCircle,
  Database
} from 'lucide-react';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';

interface IndustryIntent {
  name: string;
  threshold: number;
  phrases: string[];
  phrasesAr: string[];
}

export function NluGovernanceTab() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];

  // Governance tabs
  const [activeSubTab, setActiveSubTab] = useState<'industries' | 'templates' | 'blocklists' | 'pii'>('industries');

  // Distribution sync loading state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Intent libraries
  const [selectedIndustry, setSelectedIndustry] = useState<'Banking' | 'Telecom' | 'Retail' | 'Healthcare' | 'Logistics'>('Banking');
  const [industryLibraries, setIndustryLibraries] = useState<Record<string, IndustryIntent[]>>({
    Banking: [
      { name: 'balance_inquiry', threshold: 0.85, phrases: ['What is my balance?', 'Show my bank statement'], phrasesAr: ['ما هو رصيدي الحالي؟', 'عرض كشف حسابي'] },
      { name: 'transfer_funds', threshold: 0.90, phrases: ['Send money to Khalid', 'Wire 500 dollars'], phrasesAr: ['أرسل أموالاً إلى خالد', 'تحويل 500 دولار'] },
      { name: 'card_activation', threshold: 0.88, phrases: ['Activate my credit card', 'Unlock debit card'], phrasesAr: ['تفعيل بطاقتي الائتمانية', 'إلغاء قفل بطاقة مدى'] }
    ],
    Telecom: [
      { name: 'data_upgrade', threshold: 0.85, phrases: ['Add 5GB roaming data', 'I need more high speed plan'], phrasesAr: ['إضافة 5 جيجابايت تجوال', 'أحتاج باقة إنترنت أسرع'] },
      { name: 'roaming_activation', threshold: 0.90, phrases: ['Enable international calls', 'Activate roaming packages'], phrasesAr: ['تفعيل المكالمات الدولية', 'تشغيل باقة التجوال الدولي'] },
      { name: 'network_trouble', threshold: 0.82, phrases: ['No signal in Riyadh', 'LTE keeps dropping'], phrasesAr: ['لا توجد شبكة في الرياض', 'انقطاع الجيل الرابع المستمر'] }
    ],
    Retail: [
      { name: 'order_cancel', threshold: 0.88, phrases: ['Cancel my subscription package', 'Stop order shipment'], phrasesAr: ['إلغاء اشتراكي الحالي', 'إيقاف شحن الطلب'] },
      { name: 'discount_code', threshold: 0.80, phrases: ['Coupon code not working', 'Where is my promo discount'], phrasesAr: ['كود الخصم لا يعمل', 'أين هو خصم الترويج'] },
      { name: 'return_request', threshold: 0.85, phrases: ['I want to return a shoe', 'Initiate return refund'], phrasesAr: ['أريد إرجاع الحذاء', 'بدء عملية استرجاع الأموال'] }
    ],
    Healthcare: [
      { name: 'book_appointment', threshold: 0.85, phrases: ['Schedule clinic visit', 'Find dermatologist tomorrow'], phrasesAr: ['حجز موعد في العيادة', 'البحث عن طبيب جلدية غداً'] },
      { name: 'prescription_renew', threshold: 0.90, phrases: ['Refill my pharmacy order', 'Send insulin prescription renewal'], phrasesAr: ['إعادة تعبئة الطلب الدوائي', 'تجديد وصفة الأنسولين'] },
      { name: 'medical_report', threshold: 0.88, phrases: ['Download lab results', 'Get blood test summary'], phrasesAr: ['تحميل نتائج المختبر', 'الحصول على ملخص تحليل الدم'] }
    ],
    Logistics: [
      { name: 'track_delivery', threshold: 0.82, phrases: ['Where is my parcel tracking?', 'Locate shipping container'], phrasesAr: ['أين هو تتبع شحنتي؟', 'تحديد موقع حاوية الشحن'] },
      { name: 'address_redirect', threshold: 0.88, phrases: ['Deliver to my office instead', 'Change delivery home address'], phrasesAr: ['التوصيل إلى مكتبي بدلاً من البيت', 'تغيير عنوان الشحن المنزلي'] },
      { name: 'delay_complaint', threshold: 0.85, phrases: ['Shipment is late 3 days', 'Why package is stuck in customs'], phrasesAr: ['الشحنة متأخرة 3 أيام', 'لماذا الطرد عالق في الجمارك'] }
    ]
  });

  // Global Response Templates
  const [responseTemplates, setResponseTemplates] = useState([
    { id: 'tmpl-1', name: 'Escalation Alert Handoff', text: 'Connecting you to a supervisor immediately. Current wait is {{sla_time}} mins.', textAr: 'جاري توصيلك بمشرف الدعم فوراً. وقت الانتظار الحالي هو {{sla_time}} دقيقة.' },
    { id: 'tmpl-2', name: 'Refund Acknowledgement', text: 'Your refund request for order {{order_id}} has been synced successfully.', textAr: 'تمت مزامنة طلب استرداد الأموال للطلب ذو الرقم {{order_id}} بنجاح.' },
    { id: 'tmpl-3', name: 'OTP SMS Verification Challenge', text: 'Your secure verification code is {{verification_code}}. Do not share.', textAr: 'رمز التحقق الآمن الخاص بك هو {{verification_code}}. لا تقم بمشاركته.' },
    { id: 'tmpl-4', name: 'SLA Breach Apology Statement', text: 'We apologize for the delays. Our team will resolve your ticket within 2 hours.', textAr: 'نعتذر بشدة عن التأخير. سيقوم فريقنا بحل التذكرة الخاصة بك خلال ساعتين.' }
  ]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTextEn, setEditTextEn] = useState('');
  const [editTextAr, setEditTextAr] = useState('');

  // Profanity Blocklist
  const [blocklist, setBlocklist] = useState([
    { phrase: 'spam_bot', severity: 'High', action: 'Block & Mask', mask: '***' },
    { phrase: 'hack_admin', severity: 'Critical', action: 'Supervisor Lock', mask: '[REDACTED]' },
    { phrase: 'scam_link', severity: 'Critical', action: 'Supervisor Lock', mask: '[ALERT]' },
    { phrase: 'profanity_vulgar', severity: 'Medium', action: 'Mask Only', mask: '☀️☀️☀️' }
  ]);
  const [newBlockedPhrase, setNewBlockedPhrase] = useState('');
  const [newBlockSeverity, setNewBlockSeverity] = useState('High');
  const [newBlockAction, setNewBlockAction] = useState('Block & Mask');

  // PII Redaction Rules
  const [piiPolicies, setPiiPolicies] = useState([
    { id: 'phone', name: 'Phone number redaction', regex: '(\\+?\\d{1,3})?[ -]?\\d{3}[ -]?\\d{3}[ -]?\\d{4}', active: true, count: 412 },
    { id: 'email', name: 'Email address masking', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', active: true, count: 188 },
    { id: 'iban', name: 'IBAN Banking identifiers', regex: '[A-Z]{2}\\d{2}[A-Z0-9]{11,30}', active: true, count: 74 },
    { id: 'credit', name: 'Visa/Mastercard masking', regex: '\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b', active: true, count: 654 },
    { id: 'civil_id', name: 'Saudi Civil Registry ID', regex: '\\b[12]\\d{9}\\b', active: true, count: 32 }
  ]);
  const [piiLogs, setPiiLogs] = useState([
    { timestamp: '17:42:01', client: 'CLIENT-MP-RETAIL', policy: 'Visa/Mastercard masking', text: 'Customer entered credit card ****-****-****-4242' },
    { timestamp: '17:39:14', client: 'CLIENT-KSA-TELECOM', policy: 'Saudi Civil Registry ID', text: 'Redacted Civil ID 109******5 in incoming chat widget' },
    { timestamp: '17:35:48', client: 'CLIENT-WORLD-BANK', policy: 'IBAN Banking identifiers', text: 'IBAN SA80****************41 masked securely' }
  ]);

  const handleSyncToTenants = () => {
    setIsSyncing(true);
    setSyncStatus(lang === 'ar' ? 'جاري التحقق من التراخيص...' : 'Verifying tenant secure gateways...');
    
    setTimeout(() => {
      setSyncStatus(lang === 'ar' ? 'جاري تصدير الفهارس لـ Pinecone...' : 'Rebuilding index schemas for all tenant spaces...');
      setTimeout(() => {
        setSyncStatus(lang === 'ar' ? 'جاري بث القواعد وتحديث ذاكرة كاش NLU...' : 'Broadcasting policy schemas & clearing NLU cache...');
        setTimeout(() => {
          setIsSyncing(false);
          setSyncStatus(null);
          addAuditLog(`Synchronized global NLU library updates to all active client tenants.`, 'success');
          alert(lang === 'ar' ? 'تم مزامنة قواعد NLU وبث السياسات لجميع المستأجرين بنجاح!' : 'Successfully synchronized all global NLU libraries and Safety parameters to active client spaces!');
        }, 800);
      }, 800);
    }, 800);
  };

  const handleAddBlockedPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedPhrase) return;
    setBlocklist((prev) => [
      ...prev,
      { phrase: newBlockedPhrase, severity: newBlockSeverity, action: newBlockAction, mask: '***' }
    ]);
    addAuditLog(`Added global profanity override: "${newBlockedPhrase}"`, 'success');
    setNewBlockedPhrase('');
  };

  const handleDeleteBlockedPhrase = (phrase: string) => {
    setBlocklist((prev) => prev.filter((b) => b.phrase !== phrase));
    addAuditLog(`Removed global profanity override: "${phrase}"`, 'success');
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateId) return;
    setResponseTemplates((prev) =>
      prev.map((t) => (t.id === editingTemplateId ? { ...t, text: editTextEn, textAr: editTextAr } : t))
    );
    addAuditLog(`Updated global response template: ${editingTemplateId}`, 'success');
    setEditingTemplateId(null);
  };

  const handleTogglePii = (id: string) => {
    setPiiPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    addAuditLog(`Toggled global PII redaction policy: ${id}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 glow-active animate-pulse" />
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              {lang === 'ar' ? 'إدارة حوكمة المنصة' : 'Global Platform Master Data'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {lang === 'ar' ? 'حوكمة NLU والذكاء الاصطناعي العالمية' : 'Global NLU Governance Libraries'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {lang === 'ar' 
              ? 'مجموعة تحكم مركزية لتوزيع نوايا الصناعة الافتراضية، قوالب الاستجابة الدولية، ضوابط الأمان، وتشفير بيانات الهوية الشخصية عبر جميع بوابات المستأجرين.' 
              : 'Enterprise-wide master console to compile, validate, and broadcast baseline industry intents, response templates, safety blocklists, and PII anonymizers across all tenants.'}
          </p>
        </div>

        <button
          onClick={handleSyncToTenants}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 shrink-0 z-10 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing ? (lang === 'ar' ? 'جاري المزامنة...' : 'Broadcasting policies...') : (lang === 'ar' ? 'تحديث ومزامنة المستأجرين' : 'Sync & Broaden to Tenants')}
          </span>
        </button>
      </div>

      {isSyncing && (
        <div className="bg-blue-600/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">{syncStatus}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar Tabs Selector */}
        <div className="xl:col-span-1 space-y-2">
          {[
            { id: 'industries', label: lang === 'ar' ? 'نوايا قطاعات الأعمال' : 'Industry Intents', icon: Briefcase, desc: lang === 'ar' ? 'مكتبات النوايا الجاهزة' : 'Pre-built domain vocabularies' },
            { id: 'templates', label: lang === 'ar' ? 'قوالب الاستجابة العامة' : 'Global Templates', icon: FileText, desc: lang === 'ar' ? 'محرر القوالب الموحدة' : 'Corporate response skeletons' },
            { id: 'blocklists', label: lang === 'ar' ? 'قوائم الحجب والسلامة' : 'Safety Blocklists', icon: ShieldAlert, desc: lang === 'ar' ? 'مراقبة الكلمات والألفاظ' : 'Profanity & toxic word limits' },
            { id: 'pii', label: lang === 'ar' ? 'تشفير بيانات الهوية PII' : 'PII Redaction Policy', icon: EyeOff, desc: lang === 'ar' ? 'حماية بيانات المستهلك' : 'Global compliance filters' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10' 
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                <div>
                  <h4 className="font-bold text-xs leading-none">{tab.label}</h4>
                  <span className={`text-[9px] block mt-1 leading-normal ${isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab content viewer */}
        <div className="xl:col-span-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-96">
          
          {/* TAB 1: Industry Intents */}
          {activeSubTab === 'industries' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white">{lang === 'ar' ? 'مكتبات النوايا حسب قطاع الأعمال' : 'Tenant Industry Intent Catalog'}</h3>
                  <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'اختر قطاعاً مسبق التعريف لتعديل معايير الثقة وعرض نماذج الكلمات.' : 'Select a domain to inspect intent definitions, matching thresholds, and bilingual utterances.'}</p>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {(['Banking', 'Telecom', 'Retail', 'Healthcare', 'Logistics'] as const).map((ind) => {
                    const isSelected = selectedIndustry === ind;
                    return (
                      <button
                        key={ind}
                        onClick={() => setSelectedIndustry(ind)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                        }`}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {industryLibraries[selectedIndustry].map((intent) => (
                  <div 
                    key={intent.name} 
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono">#{intent.name}</h4>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{lang === 'ar' ? 'نية قطاع معتمدة مسبقاً' : 'Pre-approved corporate NLU intent'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-bold font-mono">MATCH THRESHOLD</span>
                        <span className="font-bold text-xs font-mono text-slate-800 dark:text-white">{(intent.threshold * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-905">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">English phrases:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {intent.phrases.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] text-slate-600 dark:text-slate-350">
                              "{p}"
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">العبارات العربية:</span>
                        <div className="flex flex-wrap gap-1.5" dir="rtl">
                          {intent.phrasesAr.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] text-slate-600 dark:text-slate-350">
                              "{p}"
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Global Templates */}
          {activeSubTab === 'templates' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-slate-850 dark:text-white">{lang === 'ar' ? 'قوالب الاستجابة العالمية الموزعة' : 'Baseline Platform Response Templates'}</h3>
                <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'عدل نصوص قوالب الأنظمة الحساسة التي تلتزم بها البوتات عبر كافة المستأجرين.' : 'Edit master response templates broadcast to all tenant databases for SLA notifications, refund checks, and OTP logs.'}</p>
              </div>

              <div className="space-y-4">
                {responseTemplates.map((tmpl) => {
                  const isEditing = editingTemplateId === tmpl.id;
                  return (
                    <div 
                      key={tmpl.id} 
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">{tmpl.name}</span>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingTemplateId(null);
                            } else {
                              setEditingTemplateId(tmpl.id);
                              setEditTextEn(tmpl.text);
                              setEditTextAr(tmpl.textAr);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
                        >
                          {isEditing ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : (lang === 'ar' ? 'تعديل القالب' : 'Edit template')}
                        </button>
                      </div>

                      {isEditing ? (
                        <form onSubmit={handleSaveTemplate} className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-450 uppercase block">English body:</span>
                            <textarea
                              rows={2}
                              value={editTextEn}
                              onChange={(e) => setEditTextEn(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-450 uppercase block">النص العربي:</span>
                            <textarea
                              rows={2}
                              value={editTextAr}
                              onChange={(e) => setEditTextAr(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-right"
                              dir="rtl"
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <button 
                              type="submit" 
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold"
                            >
                              {lang === 'ar' ? 'حفظ وحقن القالب' : 'Save & Inject Template'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900 leading-relaxed">
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-400 mr-2">EN:</strong> "{tmpl.text}"
                          </p>
                          <p className="text-[11px] text-slate-650 dark:text-slate-400 text-right" dir="rtl">
                            <strong className="text-slate-400 ml-2">ع:</strong> "{tmpl.textAr}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Safety Blocklists */}
          {activeSubTab === 'blocklists' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-slate-850 dark:text-white">{lang === 'ar' ? 'قوائم الحجب وتطهير النصوص العامة' : 'Profanity & Toxic Sanitizers blocklist'}</h3>
                <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'تمنع هذه الكلمات والألفاظ وتصفي الرسائل تلقائياً لحماية المشرفين والمستهلكين.' : 'Define global rules, sensitivity parameters, and custom masking replacements before requests enter pipeline gateways.'}</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddBlockedPhrase} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الكلمة المحظورة / العبارة' : 'Blocked Keyword / Phrase'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hack_sql"
                    value={newBlockedPhrase}
                    onChange={(e) => setNewBlockedPhrase(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الخطورة' : 'Severity'}</label>
                  <select
                    value={newBlockSeverity}
                    onChange={(e) => setNewBlockSeverity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                  >
                    {['Medium', 'High', 'Critical'].map((sev) => (
                      <option key={sev} value={sev}>{sev}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] cursor-pointer"
                  >
                    {lang === 'ar' ? 'إدراج بالقائمة' : 'Add Blocklist'}
                  </button>
                </div>
              </form>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-2xl">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-855 text-slate-400 font-bold uppercase text-[9px] font-mono">
                      <th className="p-3 text-start">{lang === 'ar' ? 'الكلمة / التعبير' : 'Phrase'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'مستوى الخطورة' : 'Severity'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'الإجراء الأمني' : 'Enforcement'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'القناع' : 'Mask Pattern'}</th>
                      <th className="p-3 text-center">{lang === 'ar' ? 'إجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                    {blocklist.map((item) => (
                      <tr key={item.phrase} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-slate-850 dark:text-white font-mono">"{item.phrase}"</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                            item.severity === 'Critical' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' 
                              : item.severity === 'High'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600 dark:text-slate-350">{item.action}</td>
                        <td className="p-3 font-mono text-slate-400">{item.mask}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteBlockedPhrase(item.phrase)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PII Redaction Policy */}
          {activeSubTab === 'pii' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-slate-850 dark:text-white">{lang === 'ar' ? 'حوكمة وتشفير بيانات الهوية الشخصية (PII)' : 'Enterprise PII Privacy Sanitizer Rules'}</h3>
                <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'تخفي هذه القواعد البيانات الحساسة قبل إرسال الطلبات إلى موفري خدمات الذكاء الاصطناعي الخارجيين.' : 'Global standard rules to mask customer credit cards, civil registry numbers, phone and IBAN details before outbound network hits.'}</p>
              </div>

              {/* Grid of policies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{lang === 'ar' ? 'سياسات التشفير والأنماط الكاشفة' : 'Detection Rules & RegEx'}</h4>
                  
                  <div className="space-y-2.5">
                    {piiPolicies.map((policy) => (
                      <div 
                        key={policy.id} 
                        className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-slate-850 dark:text-white block">{policy.name}</span>
                          <span className="font-mono text-[9px] text-slate-400 block max-w-56 truncate" title={policy.regex}>{policy.regex}</span>
                          <span className="text-[8px] text-blue-500 font-bold uppercase font-mono">{lang === 'ar' ? `تم تشفير: ${policy.count}` : `Interventions: ${policy.count}`}</span>
                        </div>

                        <button
                          onClick={() => handleTogglePii(policy.id)}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                            policy.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                            policy.active ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit streams logs */}
                <div className="bg-slate-100/50 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-4">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span>{lang === 'ar' ? 'سجل تصفية PII المباشر (Audit Log)' : 'Live PII Interceptor Audit Trail'}</span>
                  </h4>

                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {piiLogs.map((log, i) => (
                      <div 
                        key={i} 
                        className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1 text-[10px]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono uppercase">{log.client}</span>
                          <span className="font-mono text-slate-400">{log.timestamp}</span>
                        </div>
                        <span className="font-bold text-slate-450 block">{log.policy}</span>
                        <p className="text-slate-500 leading-relaxed font-mono">{log.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
