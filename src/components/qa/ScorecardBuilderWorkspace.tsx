'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Sliders, 
  Search, 
  Trash2, 
  Plus, 
  Copy, 
  Save, 
  Check, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Archive, 
  CheckCircle,
  FileText,
  FileCheck,
  Zap,
  Gauge,
  Loader2
} from 'lucide-react';

interface ScorecardSection {
  id: string;
  name: string;
  nameAr: string;
  weight: number;
  fatalError: boolean;
  required: boolean;
  tag: string;
}

interface ScorecardTemplate {
  id: string;
  name: string;
  nameAr: string;
  status: 'draft' | 'published' | 'archived';
  lastModified: string;
  sections: ScorecardSection[];
}

export function ScorecardBuilderWorkspace() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  // ─── Local Multi-Language Dictionary ───
  const t = {
    en: {
      title: 'Scorecard Template Builder',
      desc: 'Orchestrate quality compliance templates, evaluation criteria, and fatal-error trigger rules.',
      templates: 'Scorecard Templates',
      searchPlaceholder: 'Search template names...',
      newTemplate: 'Create Template',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      sectionsTitle: 'Evaluation Criteria Sections',
      complianceWeight: 'Compliance Weight',
      fatalError: 'Fatal Error Trigger (Auto-Fail)',
      required: 'Required Criteria',
      tag: 'Compliance Category',
      inspectorTitle: 'Audit Calibration Dials',
      totalWeight: 'Total Configured Weight',
      passThreshold: 'Passing compliance grade',
      warnings: 'Calibration Health Warnings',
      warningsClear: 'All configurations look calibrated and balanced.',
      warningsSum: 'Target criteria weights must sum to exactly 100%. Current sum: {sum}%.',
      previewTitle: 'Live Scoring Simulator',
      previewDesc: 'Input scores to test calibration threshold logic dynamically.',
      simulateScore: 'Simulated Audit Grade',
      saveDraft: 'Save Draft',
      publish: 'Publish Template',
      clone: 'Duplicate',
      archive: 'Archive',
      exportPdf: 'Export Schema',
      pdfPreparing: 'Preparing PDF schema dispatch...',
      successPublish: 'Scorecard template published to QA evaluation registry.',
      successSave: 'Saved scorecard draft successfully.',
      successClone: 'Duplicated template config.'
    },
    ar: {
      title: 'منشئ قوالب بطاقات التقييم',
      desc: 'صياغة معايير التقييم، وتحديد أوزان الامتثال، ووضع شروط الفشل التلقائي عند الكشف عن أخطاء فادحة.',
      templates: 'قوالب بطاقات التقييم',
      searchPlaceholder: 'البحث في القوالب...',
      newTemplate: 'قالب جديد',
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف',
      sectionsTitle: 'أقسام معايير تقييم الجودة',
      complianceWeight: 'وزن الامتثال',
      fatalError: 'خطأ فادح (فشل تلقائي)',
      required: 'معيار إجباري',
      tag: 'تصنيف الامتثال',
      inspectorTitle: 'مؤشرات معايير الجودة',
      totalWeight: 'إجمالي الوزن المحدد',
      passThreshold: 'الحد الأدنى للنجاح',
      warnings: 'تنبيهات ومعايرة الأوزان',
      warningsClear: 'جميع الأوزان مضبوطة وموزعة بشكل سليم.',
      warningsSum: 'يجب أن يساوي مجموع الأوزان 100% تماماً. المجموع الحالي: {sum}%.',
      previewTitle: 'محاكي تقييم المحادثة',
      previewDesc: 'أدخل درجات افتراضية لتجربة دقة الحساب وتأثير الأخطاء الفادحة.',
      simulateScore: 'النتيجة التقديرية للتقييم',
      saveDraft: 'حفظ كمسودة',
      publish: 'نشر القالب',
      clone: 'نسخ القالب',
      archive: 'أرشفة',
      exportPdf: 'تصدير الهيكل',
      pdfPreparing: 'جاري إعداد مستند هيكل التقييم...',
      successPublish: 'تم نشر قالب بطاقة التقييم في سجل الامتثال بنجاح.',
      successSave: 'تم حفظ مسودة القالب بنجاح.',
      successClone: 'تم تكرار ونسخ إعدادات القالب.'
    }
  }[lang === 'ar' ? 'ar' : 'en'];

  // Default mock templates datasets
  const [templates, setTemplates] = useState<ScorecardTemplate[]>([
    {
      id: 'sc-1',
      name: 'General Chat Evaluation Grid v2.1',
      nameAr: 'مصفوفة تقييم المحادثات العامة v2.1',
      status: 'published',
      lastModified: '2026-06-04 15:40',
      sections: [
        { id: 'sec-1', name: 'Greeting & Branding Compliance', nameAr: 'الترحيب والامتثال للهوية التجارية', weight: 15, fatalError: false, required: true, tag: 'Branding' },
        { id: 'sec-2', name: 'Customer Verification Verification Check', nameAr: 'التحقق من هوية العميل والخصوصية', weight: 20, fatalError: true, required: true, tag: 'Verification' },
        { id: 'sec-3', name: 'Resolution & Problem Solving Skills', nameAr: 'مهارات الحل وحل المشكلات للعميل', weight: 30, fatalError: false, required: true, tag: 'Resolution' },
        { id: 'sec-4', name: 'Tone, Professionalism & Empathy', nameAr: 'نبرة الصوت والاحترافية والتعاطف', weight: 20, fatalError: false, required: false, tag: 'Soft Skills' },
        { id: 'sec-5', name: 'Interaction Documentation quality', nameAr: 'توثيق المحادثة في أنظمة CRM/SAP', weight: 15, fatalError: false, required: false, tag: 'Documentation' }
      ]
    },
    {
      id: 'sc-2',
      name: 'VIP High-Priority Line Scorecard',
      nameAr: 'بطاقة تقييم خط كبار الشخصيات VIP',
      status: 'draft',
      lastModified: '2026-06-04 22:15',
      sections: [
        { id: 'sec-2-1', name: 'Greeting Compliance', nameAr: 'الترحيب بالعميل', weight: 20, fatalError: false, required: true, tag: 'Branding' },
        { id: 'sec-2-2', name: 'Authentication Check', nameAr: 'التحقق والمطابقة', weight: 30, fatalError: true, required: true, tag: 'Security' },
        { id: 'sec-2-3', name: 'Escalation & SLA adherence', nameAr: 'الالتزام باتفاقيات الخدمة والتصعيد', weight: 50, fatalError: true, required: true, tag: 'SLA Compliance' }
      ]
    },
    {
      id: 'sc-3',
      name: 'Refund & Exemption Audit Template',
      nameAr: 'قالب تدقيق طلبات استرجاع الأموال',
      status: 'archived',
      lastModified: '2026-05-15 11:30',
      sections: [
        { id: 'sec-3-1', name: 'Order Validation Check', nameAr: 'التحقق من تفاصيل الطلب', weight: 40, fatalError: true, required: true, tag: 'Verification' },
        { id: 'sec-3-2', name: 'Refund Exemption Rules adherence', nameAr: 'تطبيق قواعد الإعفاء والسياسة المالية', weight: 60, fatalError: true, required: true, tag: 'Finance Policy' }
      ]
    }
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sc-1');
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const [sections, setSections] = useState<ScorecardSection[]>(activeTemplate?.sections || []);

  // Update sections when switching templates
  React.useEffect(() => {
    if (activeTemplate) {
      setSections(activeTemplate.sections);
    }
  }, [selectedTemplateId]);

  // Simulator grades state
  const [simulatorScores, setSimulatorScores] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState(false);

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.nameAr.includes(searchQuery)
  );

  // Calibration weight sum
  const totalWeightSum = sections.reduce((acc, s) => acc + s.weight, 0);

  // Criteria Simulator Grade Calculation
  const calculateSimulatedGrade = () => {
    let scoreAccumulator = 0;
    let autoFailed = false;

    sections.forEach(sec => {
      const inputVal = simulatorScores[sec.id] !== undefined ? simulatorScores[sec.id] : 100;
      scoreAccumulator += (inputVal * (sec.weight / 100));

      if (sec.fatalError && inputVal < 70) {
        autoFailed = true;
      }
    });

    return {
      score: autoFailed ? 0 : Math.round(scoreAccumulator),
      autoFailed
    };
  };

  const simResult = calculateSimulatedGrade();

  // Drag reorder array moves
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setSections(updated);
    addAuditLog(`Reordered scorecard criteria section positions`, 'success');
  };

  const handleUpdateSectionWeight = (id: string, weight: number) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, weight: Math.max(0, Math.min(100, weight)) } : s)
    );
  };

  const handleToggleFatal = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, fatalError: !s.fatalError } : s)
    );
  };

  const handleToggleRequired = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, required: !s.required } : s)
    );
  };

  const handleUpdateSectionLabel = (id: string, text: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, name: text } : s)
    );
  };

  const handleUpdateSectionTag = (id: string, tag: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, tag } : s)
    );
  };

  const handleAddNewCriteriaSection = () => {
    const newSec: ScorecardSection = {
      id: `sec-${Date.now()}`,
      name: 'New Compliance Evaluation Rule',
      nameAr: 'قاعدة امتثال جديدة للتقييم',
      weight: 10,
      fatalError: false,
      required: false,
      tag: 'Quality Compliance'
    };
    setSections(prev => [...prev, newSec]);
    addAuditLog(`Added new compliance criteria section to template`, 'success');
  };

  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    addAuditLog(`Removed compliance criteria section`, 'success');
  };

  const handlePublishTemplate = () => {
    if (totalWeightSum !== 100) return;
    setTemplates(prev =>
      prev.map(t => t.id === selectedTemplateId ? { ...t, status: 'published', lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16), sections } : t)
    );
    addAuditLog(`Published QA scorecard template: ${activeTemplate.name}`, 'success');
    alert(t.successPublish);
  };

  const handleSaveDraft = () => {
    setTemplates(prev =>
      prev.map(t => t.id === selectedTemplateId ? { ...t, status: 'draft', lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16), sections } : t)
    );
    addAuditLog(`Saved draft version of QA scorecard template: ${activeTemplate.name}`, 'success');
    alert(t.successSave);
  };

  const handleDuplicateTemplate = () => {
    const copy: ScorecardTemplate = {
      id: `sc-dup-${Date.now()}`,
      name: `Copy of ${activeTemplate.name}`,
      nameAr: `نسخة من ${activeTemplate.nameAr}`,
      status: 'draft',
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sections: [...sections]
    };
    setTemplates(prev => [...prev, copy]);
    setSelectedTemplateId(copy.id);
    addAuditLog(`Duplicated scorecard template config to ${copy.name}`, 'success');
    alert(t.successClone);
  };

  const handleArchiveTemplate = () => {
    setTemplates(prev =>
      prev.map(t => t.id === selectedTemplateId ? { ...t, status: 'archived', lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16) } : t)
    );
    addAuditLog(`Archived QA scorecard template: ${activeTemplate.name}`, 'success');
  };

  const handleExportPDF = () => {
    if (isExporting) return;
    setIsExporting(true);
    addAuditLog(`Initiated print/export schema for ${activeTemplate.name}`, 'success');

    setTimeout(() => {
      const mockPdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`
        + `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`
        + `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n`
        + `4 0 obj\n<< /Length 200 >>\nstream\n`
        + `BT\n/F1 12 Tf\n70 700 Td\n(QA Scorecard Schema: ${activeTemplate.name}) Tj\n`
        + `0 -20 Td\n(Status: ${activeTemplate.status}) Tj\n`
        + `0 -20 Td\n(Total Sections Configured: ${sections.length}) Tj\n`
        + `0 -20 Td\n(Configured Weight: ${totalWeightSum}%) Tj\n`
        + `0 -20 Td\n(Generated: ${new Date().toLocaleString()})\n`
        + `ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000202 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF`;

      const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `scorecard_schema_${activeTemplate.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    }, 1200);
  };

  const complianceCategories = [
    'Branding', 'Verification', 'Resolution', 'Soft Skills', 'Documentation', 'Security', 'SLA Compliance'
  ];

  return (
    <div className="space-y-6 min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            {t.title}
          </h2>
          <p className="text-xs text-slate-455">
            {t.desc}
          </p>
        </div>

        {/* Toolbar Action Panels */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {t.saveDraft}
          </button>
          
          <button
            onClick={handlePublishTemplate}
            disabled={totalWeightSum !== 100}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t.publish}
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={handleDuplicateTemplate}
            title={t.clone}
            className="p-2 rounded-xl border border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleArchiveTemplate}
            title={t.archive}
            className="p-2 rounded-xl border border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            title={t.exportPdf}
            className="p-2 rounded-xl border border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Registry Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
              {t.templates}
            </h3>
            <span className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-lg border border-blue-200/40">
              {filteredTemplates.length} total
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>

          {/* Templates list */}
          <div className="space-y-2">
            {filteredTemplates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`w-full text-left p-3 border rounded-2xl flex flex-col justify-between transition-all gap-2 text-start select-none cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/40 dark:bg-blue-955/10 border-blue-500 shadow-xs'
                      : 'border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950/40'
                  }`}
                >
                  <div className="flex justify-between items-start w-full gap-2">
                    <strong className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                      {isRtl ? tpl.nameAr : tpl.name}
                    </strong>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase shrink-0 ${
                      tpl.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold border border-emerald-200/30'
                        : tpl.status === 'draft'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {tpl.status}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Modified: {tpl.lastModified}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Grid Builder */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
              {t.sectionsTitle}
            </h3>

            <button
              onClick={handleAddNewCriteriaSection}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-205 dark:border-slate-850 rounded-xl transition-all cursor-pointer select-none active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              Add Section Criteria
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                draggable
                className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-4"
              >
                {/* Header row with arrows & delete */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      #{idx + 1}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={sec.name}
                    onChange={(e) => handleUpdateSectionLabel(sec.id, e.target.value)}
                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-blue-500 px-1 py-0.5 text-xs font-bold text-slate-800 dark:text-white transition-colors focus:outline-none"
                  />

                  <button
                    onClick={() => handleDeleteSection(sec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weights Sliders and Fatal error triggers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-900 text-[11px] font-semibold leading-relaxed">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-550">
                      <span>{t.complianceWeight}</span>
                      <span className="font-mono text-blue-500">{sec.weight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="5"
                      value={sec.weight}
                      onChange={(e) => handleUpdateSectionWeight(sec.id, Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 justify-center md:pl-4">
                    {/* Fatal error checklist */}
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-350 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.fatalError}
                        onChange={() => handleToggleFatal(sec.id)}
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {t.fatalError}
                      </span>
                    </label>

                    {/* Required checklist */}
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-350 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.required}
                        onChange={() => handleToggleRequired(sec.id)}
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span>{t.required}</span>
                    </label>
                  </div>
                </div>

                {/* Category tags */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{t.tag}:</span>
                  <select
                    value={sec.tag}
                    onChange={(e) => handleUpdateSectionTag(sec.id, e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {complianceCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Audit Inspector Panel */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-500" />
            {t.inspectorTitle}
          </h3>

          <div className="bg-slate-50 dark:bg-slate-900/55 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold">
            {/* Total weight sum */}
            <div className="p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono uppercase">{t.totalWeight}</span>
                <strong className={`text-xl font-bold font-mono block mt-1 ${totalWeightSum === 100 ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                  {totalWeightSum}% / 100%
                </strong>
              </div>
              <FileCheck className={`w-8 h-8 ${totalWeightSum === 100 ? 'text-emerald-500' : 'text-rose-500'} opacity-80`} />
            </div>

            {/* Health Calibration Warnings */}
            <div className="space-y-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
                {t.warnings}
              </span>
              
              {totalWeightSum === 100 ? (
                <div className="flex items-start gap-2 p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-450 rounded-2xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed font-normal">{t.warningsClear}</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-rose-50/40 dark:bg-rose-955/10 border border-rose-250 dark:border-rose-900/40 text-rose-800 dark:text-rose-455 rounded-2xl animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed font-normal">
                    {t.warningsSum.replace('{sum}', totalWeightSum.toString())}
                  </p>
                </div>
              )}
            </div>

            {/* Live Scoring Calibration Simulator */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-750 dark:text-white uppercase font-mono tracking-wide block">
                  {t.previewTitle}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal font-normal">
                  {t.previewDesc}
                </p>
              </div>

              {/* Dials sliders per criteria section */}
              <div className="space-y-3.5 pt-1">
                {sections.map((sec) => {
                  const score = simulatorScores[sec.id] !== undefined ? simulatorScores[sec.id] : 100;
                  return (
                    <div key={sec.id} className="space-y-1 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                        <span className="truncate max-w-[150px]">{sec.name}</span>
                        <span>{score}/100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setSimulatorScores({ ...simulatorScores, [sec.id]: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Simulated Output Grade Box */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                simResult.autoFailed 
                  ? 'bg-rose-50/40 dark:bg-rose-955/15 border-rose-250 text-rose-800 dark:text-rose-455' 
                  : simResult.score >= 80 
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-250 text-emerald-800 dark:text-emerald-450' 
                  : 'bg-amber-50/40 dark:bg-amber-955/15 border-amber-250 text-amber-800 dark:text-amber-450'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider block opacity-75">{t.simulateScore}</span>
                  <strong className="text-xl font-bold font-mono block mt-1">
                    {simResult.score}%
                  </strong>
                </div>

                {simResult.autoFailed ? (
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-rose-600 text-white block uppercase">AUTO-FAIL</span>
                    <span className="text-[9px] block mt-0.5 font-normal opacity-85">Fatal Error triggered</span>
                  </div>
                ) : (
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono text-white block uppercase ${
                      simResult.score >= 80 ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {simResult.score >= 80 ? 'PASS' : 'COACHING DUE'}
                    </span>
                    <span className="text-[9px] block mt-0.5 font-normal opacity-85">{t.passThreshold}: 80%</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScorecardBuilderWorkspace;
