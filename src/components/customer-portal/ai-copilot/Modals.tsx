import React from 'react';
import { Mic, ShieldCheck, Download, Share2, RefreshCw } from 'lucide-react';
import { 
  VoiceListeningModalProps, 
  GDPRPrivacyModalProps, 
  ExportModalProps, 
  ShareModalProps 
} from './types';
import { EXPORT_FORMATS, ANIMATION_TRANSITIONS } from './constants';

export const VoiceListeningModal = React.memo(function VoiceListeningModal({
  isRtl,
  isVoiceActive,
  setIsVoiceActive,
  voiceWaveform,
  setVoiceWaveform,
  setChatInput,
  triggerToast
}: VoiceListeningModalProps) {
  if (!isVoiceActive) return null;

  return (
    <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-40 ${ANIMATION_TRANSITIONS}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-72 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-rose-600/10 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
          <Mic className="w-6 h-6 animate-bounce" />
        </div>
        
        <div className="space-y-1">
          <h5 className="font-extrabold text-xs">{isRtl ? 'جاري الاستماع صوتياً...' : 'Farah Voice Input active...'}</h5>
          <span className="text-[10px] text-slate-400 font-normal block rtl:leading-loose">
            {isRtl ? 'تحدث الآن وسيقوم البوت بنسخ صوتك.' : 'Speak your query to capture transcript context'}
          </span>
        </div>

        {/* Voice equalizer lines */}
        <div className="flex items-center justify-center gap-1 h-10 px-4">
          {voiceWaveform.map((h, i) => (
            <div 
              key={i} 
              className="w-1 bg-rose-500 rounded-full transition-all duration-100" 
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsVoiceActive(false);
              setVoiceWaveform([]);
            }}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-505 text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsVoiceActive(false);
              setVoiceWaveform([]);
              setChatInput(isRtl ? 'الطلب متأخر منذ ثلاثة أيام' : 'The delivery has been delayed for three days.');
              triggerToast(isRtl ? 'تم استقبال الصوت وترجمته.' : 'Voice transcript loaded.');
            }}
            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer transition-all active:scale-95 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
          >
            {isRtl ? 'إنهاء ونسخ' : 'Transcribe'}
          </button>
        </div>
      </div>
    </div>
  );
});

export const GDPRPrivacyModal = React.memo(function GDPRPrivacyModal({
  isRtl,
  showPrivacyModal,
  setShowPrivacyModal,
  addAuditLog
}: GDPRPrivacyModalProps) {
  if (!showPrivacyModal) return null;

  return (
    <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-45 ${ANIMATION_TRANSITIONS}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full mx-4 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-xs font-semibold">
        <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {isRtl ? 'بيان الخصوصية وحراس الأمان' : 'Privacy & LLM Safety Consent'}
          </h4>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium leading-relaxed font-sans rtl:leading-loose">
            {isRtl 
              ? 'يتم فحص جميع البيانات المدخلة وتصفيتها لحذف المعلومات الحساسة كأرقام الهوية أو تفاصيل الحساب البنكي قبل نقلها لمعالجة RAG الذكية لضمان سلامتك.' 
              : 'All inputs are parsed locally. PII parameters (like National IDs or billing credit card tokens) are redacted before transmitting to Pinecone DB or third-party LLMs.'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowPrivacyModal(false);
            localStorage.setItem('ai-privacy-consented', 'true');
            addAuditLog('Customer accepted AI safety compliance notice', 'success');
          }}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl cursor-pointer text-center focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        >
          {isRtl ? 'أوافق وأتفهم الشروط' : 'Acknowledge & Consent'}
        </button>
      </div>
    </div>
  );
});

export const ExportModal = React.memo(function ExportModal({
  isRtl,
  showExportModal,
  setShowExportModal,
  isExporting,
  handleExportSubmit,
  exportProgress,
  exportFormat,
  setExportFormat
}: ExportModalProps) {
  if (!showExportModal) return null;

  return (
    <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-40 ${ANIMATION_TRANSITIONS}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl w-72 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4 text-xs font-semibold">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Download className="w-4 h-4 text-blue-500" />
          <h4 className="font-extrabold text-xs">{isRtl ? 'تصدير سجل المحادثة' : 'Export Chat Thread'}</h4>
        </div>

        {isExporting ? (
          <div className="space-y-3 py-2 text-center">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <div className="w-36 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mx-auto overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${exportProgress}%` }} />
            </div>
            <span className="text-[9px] text-slate-450 dark:text-slate-400 block font-mono font-bold">{exportProgress}% generated</span>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono block">{isRtl ? 'اختر التنسيق' : 'Select Format'}</span>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_FORMATS.map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`py-2 border rounded-xl font-bold uppercase transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    exportFormat === fmt 
                      ? 'border-blue-600 text-blue-600 bg-blue-500/10' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(null)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleExportSubmit}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              >
                {isRtl ? 'تصدير' : 'Export'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const ShareModal = React.memo(function ShareModal({
  isRtl,
  showShareModal,
  setShowShareModal,
  shareExpiration,
  setShareExpiration,
  handleShareSubmit
}: ShareModalProps) {
  if (!showShareModal) return null;

  return (
    <div className={`absolute inset-0 bg-slate-955/65 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-40 ${ANIMATION_TRANSITIONS}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl w-72 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4 text-xs font-semibold">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Share2 className="w-4 h-4 text-blue-500" />
          <h4 className="font-extrabold text-xs">{isRtl ? 'مشاركة المحادثة' : 'Share Conversation'}</h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono mb-1">
              {isRtl ? 'مدة صلاحية الرابط' : 'Link Expiration'}
            </label>
            <select
              value={shareExpiration}
              onChange={(e) => setShareExpiration(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <option value="24h">{isRtl ? '24 ساعة' : '24 hours'}</option>
              <option value="7d">{isRtl ? '7 أيام' : '7 days'}</option>
              <option value="never">{isRtl ? 'صلاحية دائمة' : 'Never expires'}</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowShareModal(null)}
              className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleShareSubmit}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            >
              {isRtl ? 'توليد ونسخ' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
