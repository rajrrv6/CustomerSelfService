'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, AlertCircle, RefreshCw, Key, Link as LinkIcon, Globe, Files } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

interface SourceConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onAddSource: (name: string, syncSchedule: string, type: 'database' | 'confluence') => void;
}

type CloudConnectorType = 'notion' | 'drive';

export function SourceConnectorModal({ isOpen, onClose, lang, onAddSource }: SourceConnectorModalProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [connector, setConnector] = useState<CloudConnectorType>('notion');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [syncSchedule, setSyncSchedule] = useState('daily');
  const [scope, setScope] = useState('all'); // all, selected

  // Simulated Connection State
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'success' | 'failed'>('idle');
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  const handleConnectorChange = (type: CloudConnectorType) => {
    setConnector(type);
    setAuthState('idle');
    setSelectedWorkspace('');
    setSelectedFolders([]);
  };

  const handleStartOAuth = () => {
    setAuthState('authenticating');
    pushToast(
      'info',
      isRtl ? 'جاري فتح بوابة المصادقة OAuth' : 'Redirecting to OAuth Gateway',
      isRtl ? 'جاري التوجيه إلى صفحة المصادقة الآمنة...' : 'Opening secure authentication window...'
    );

    setTimeout(() => {
      setAuthState('success');
      setSelectedWorkspace(connector === 'notion' ? 'My Notion Workspace' : 'My Google Drive Team Disk');
      pushToast(
        'success',
        isRtl ? 'تمت المصادقة بنجاح' : 'OAuth Authentication Succeeded',
        isRtl
          ? 'تم التحقق من الرمز المميز وتخويل الوصول إلى الملفات.'
          : 'Access token acquired. Integration scopes initialized successfully.'
      );
    }, 1500);
  };

  const handleToggleFolder = (folderName: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folderName) ? prev.filter((f) => f !== folderName) : [...prev, folderName]
    );
  };

  const handleSaveConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (authState !== 'success') {
      pushToast(
        'error',
        isRtl ? 'المصادقة مطلوبة' : 'Authorization Required',
        isRtl
          ? 'الرجاء إتمام عملية المصادقة الأمنية مع المزود قبل الحفظ.'
          : 'Please authenticate with the cloud provider first.'
      );
      return;
    }

    const displayName =
      connector === 'notion'
        ? `Notion Workspace: ${selectedWorkspace}`
        : `Google Drive: ${selectedWorkspace}`;

    // Map cloud source types to existing mock types for ingestion (use Confluence/URL/PDF simulation logic)
    // We pass Confluence as a fallback/simulation target for scheduling
    onAddSource(displayName, syncSchedule, 'confluence');
    onClose();
  };

  const folderOptions =
    connector === 'notion'
      ? ['Engineering Wiki', 'Customer Support Guidelines', 'Product Specifications', 'API Changelogs']
      : ['Support Assets', 'Standard Operating Procedures', 'Billing FAQs 2026', 'Customer Templates'];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'ربط مصدر سحابي (Cloud Source)' : 'Connect Cloud Knowledge Source'}
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSaveConnector} className="space-y-4 text-xs font-semibold text-slate-805 dark:text-slate-205">
        {/* Connector Selectors */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">
            {isRtl ? 'اختر المزود السحابي:' : 'Select Cloud Provider'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleConnectorChange('notion')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                connector === 'notion'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <LinkIcon className="w-5 h-5 mb-1.5" />
              <span className="font-extrabold text-[11px]">Notion Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => handleConnectorChange('drive')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                connector === 'drive'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Globe className="w-5 h-5 mb-1.5" />
              <span className="font-extrabold text-[11px]">Google Drive</span>
            </button>
          </div>
        </div>

        {/* OAuth Authentication Area */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/60 dark:border-slate-850 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                {connector === 'notion' ? 'Notion API Integration' : 'Google Workspace Client'}
              </h4>
              <p className="text-[10px] text-slate-500 font-normal">
                {isRtl ? 'يتطلب هذا التوصيل تفويضاً عبر بروتوكول OAuth2' : 'Requires OAuth2 scope permissions authorization.'}
              </p>
            </div>
            {authState === 'success' ? (
              <span className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-lg font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AUTHORIZED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg font-mono">
                <span>PENDING</span>
              </span>
            )}
          </div>

          {authState !== 'success' ? (
            <button
              type="button"
              onClick={handleStartOAuth}
              disabled={authState === 'authenticating'}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {authState === 'authenticating' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? 'جاري الاتصال بالمزود...' : 'Authorizing via OAuth...'}</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>{isRtl ? 'تفويض الحساب' : 'Authenticate & Link Account'}</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{isRtl ? 'تم التوصيل بنجاح' : 'Access Token Active'}</span>
              </div>
              <p className="text-[10px] font-normal">
                {isRtl 
                  ? `اسم مساحة العمل المرتبطة: ${selectedWorkspace}`
                  : `Successfully fetched files scope registry for workspace: "${selectedWorkspace}"`}
              </p>
            </div>
          )}
        </div>

        {/* Configuration fields - only visible after auth */}
        {authState === 'success' && (
          <div className="space-y-4 animate-fade-in">
            {/* Scope Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                  {isRtl ? 'نطاق المزامنة:' : 'Ingestion Scope'}
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="all">{isRtl ? 'مزامنة كل الملفات' : 'Sync Entire Account'}</option>
                  <option value="selected">{isRtl ? 'تحديد مجلدات مخصصة' : 'Select Target Folders'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                  {isRtl ? 'دورة التحديث التلقائي:' : 'Sync Schedule Frequency'}
                </label>
                <select
                  value={syncSchedule}
                  onChange={(e) => setSyncSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="hourly">Hourly Sync Pipeline</option>
                  <option value="daily">Daily Incremental Sync</option>
                  <option value="weekly">Weekly Core Refresh</option>
                  <option value="manual">Manual Execution Only</option>
                </select>
              </div>
            </div>

            {/* Folder Selectors */}
            {scope === 'selected' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                  {isRtl ? 'اختر المجلدات أو الصفحات:' : 'Select Folders/Pages to Index'}
                </label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/40 dark:bg-slate-950/20 max-h-36 overflow-y-auto space-y-2.5">
                  {folderOptions.map((folder) => {
                    const isSelected = selectedFolders.includes(folder);
                    return (
                      <div
                        key={folder}
                        onClick={() => handleToggleFolder(folder)}
                        className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by div click
                          className="rounded border-slate-250 dark:border-slate-800 text-blue-600 focus:ring-blue-500/50"
                        />
                        <span className="text-[10.5px] font-semibold">{folder}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={authState !== 'success'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-750 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            {isRtl ? 'ربط المزامنة السحابية' : 'Link Cloud Source'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
