'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, AlertCircle, RefreshCw, Key, Link as LinkIcon } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

interface DatabaseConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onAddSource: (name: string, syncSchedule: string, type: 'database' | 'confluence') => void;
}

type ConnectorType = 'postgresql' | 'mysql' | 'mongodb' | 'salesforce' | 'zendesk';

export function DatabaseConnectorModal({ isOpen, onClose, lang, onAddSource }: DatabaseConnectorModalProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [connector, setConnector] = useState<ConnectorType>('postgresql');
  
  // Credentials fields
  const [dbHost, setDbHost] = useState('db-prod.internal.net');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('customers_metadata');
  const [dbUser, setDbUser] = useState('rag_loader');
  const [dbPassword, setDbPassword] = useState('••••••••••••');
  
  // Salesforce/Zendesk API details
  const [apiUrl, setApiUrl] = useState('https://eu12.salesforce.com/services/data/v60.0');
  const [apiKey, setApiKey] = useState('sf_token_live_89114acfb299e');

  const [syncSchedule, setSyncSchedule] = useState('daily');
  
  // Connection state
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnectorChange = (type: ConnectorType) => {
    setConnector(type);
    setTestState('idle');
    setErrorMessage(null);
    
    // Set appropriate defaults based on type
    if (type === 'postgresql') {
      setDbHost('db-prod.internal.net');
      setDbPort('5432');
      setDbName('customers_metadata');
    } else if (type === 'mysql') {
      setDbHost('mysql-cluster.internal.local');
      setDbPort('3306');
      setDbName('erp_orders');
    } else if (type === 'mongodb') {
      setDbHost('mongodb+srv://atlas-cluster-url');
      setDbPort('27017');
      setDbName('chat_transcripts');
    }
  };

  const handleTestConnection = () => {
    setTestState('testing');
    setErrorMessage(null);

    setTimeout(() => {
      // Postgres and Salesforce connect successfully, MySQL simulates credential error
      if (connector === 'mysql') {
        setTestState('failed');
        const err = isRtl
          ? 'تم رفض الوصول للمستخدم rag_loader@192.168.10.150 (باستخدام كلمة مرور: نعم)'
          : 'Access denied for user \'rag_loader\'@\'192.168.10.150\' (using password: YES)';
        setErrorMessage(err);
        pushToast(
          'error',
          isRtl ? 'فشل الاتصال بقاعدة البيانات' : 'DB Handshake Failed',
          isRtl ? 'الرجاء التحقق من اسم المستخدم أو كلمة المرور للمنفذ 3306.' : 'Credentials denied by MySQL server gateway.'
        );
      } else {
        setTestState('success');
        pushToast(
          'success',
          isRtl ? 'تم الاتصال بنجاح' : 'Connection Handshake Succeeded',
          isRtl ? 'صحة المنفذ جيدة ومعدلات الاستجابة ممتازة.' : 'Credentials authenticated. Ping latency: 12ms.'
        );
      }
    }, 1500);
  };

  const handleSaveConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (testState !== 'success') {
      pushToast(
        'error',
        isRtl ? 'يجب اختبار الاتصال أولاً' : 'Connection Verification Required',
        isRtl ? 'الرجاء اختبار صحة الاتصال بنجاح قبل الحفظ.' : 'Please pass the connection test validation step first.'
      );
      return;
    }

    const sourceName = connector.toUpperCase() + ': ' + (connector.startsWith('salesforce') || connector.startsWith('zendesk') ? 'CRM Cloud sync' : dbName);
    onAddSource(sourceName, syncSchedule, 'database');
    
    pushToast(
      'success',
      isRtl ? 'تم حفظ الرابط بنجاح' : 'Integration Synchronized',
      isRtl ? 'جاري بدء جدول المزامنة وتصفية الفهرس.' : `Activated integration table mapping for ${sourceName}`
    );
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'ربط موصل قاعدة بيانات / CRM' : 'Connect Database / CRM Endpoint'}
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSaveConnector} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        
        {/* Connector selector grid */}
        <div className="space-y-1.5">
          <span className="block text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wide">
            Select Connector Provider
          </span>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'postgresql', name: 'Postgres' },
              { id: 'mysql', name: 'MySQL' },
              { id: 'mongodb', name: 'MongoDB' },
              { id: 'salesforce', name: 'Salesforce' },
              { id: 'zendesk', name: 'Zendesk' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleConnectorChange(item.id as ConnectorType)}
                className={`py-2 px-1 text-center rounded-xl border flex flex-col items-center gap-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                  connector === item.id
                    ? 'border-blue-550 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-transparent hover:border-slate-350 dark:hover:border-slate-700 text-slate-655 dark:text-slate-400'
                }`}
              >
                <Database className="w-4.5 h-4.5 shrink-0" />
                <span className="text-[9px] font-bold tracking-tight truncate max-w-full">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields */}
        {(connector === 'postgresql' || connector === 'mysql' || connector === 'mongodb') ? (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="db-host-field" className="block text-[9px] font-bold text-slate-450 uppercase font-mono mb-1">
                  Database Server Host
                </label>
                <input
                  id="db-host-field"
                  type="text"
                  required
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
                />
              </div>
              <div>
                <label htmlFor="db-port-field" className="block text-[9px] font-bold text-slate-455 uppercase font-mono mb-1">
                  Port
                </label>
                <input
                  id="db-port-field"
                  type="text"
                  required
                  value={dbPort}
                  onChange={(e) => setDbPort(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="db-name-field" className="block text-[9px] font-bold text-slate-450 uppercase font-mono mb-1">
                  DB Name
                </label>
                <input
                  id="db-name-field"
                  type="text"
                  required
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
                />
              </div>
              <div>
                <label htmlFor="db-user-field" className="block text-[9px] font-bold text-slate-450 uppercase font-mono mb-1">
                  User
                </label>
                <input
                  id="db-user-field"
                  type="text"
                  required
                  value={dbUser}
                  onChange={(e) => setDbUser(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
                />
              </div>
              <div>
                <label htmlFor="db-pass-field" className="block text-[9px] font-bold text-slate-455 uppercase font-mono mb-1">
                  Password
                </label>
                <input
                  id="db-pass-field"
                  type="password"
                  required
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label htmlFor="api-url-field" className="block text-[9px] font-bold text-slate-450 uppercase font-mono mb-1">
                API Endpoint URL
              </label>
              <input
                id="api-url-field"
                type="text"
                required
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
              />
            </div>

            <div>
              <label htmlFor="api-key-field" className="block text-[9px] font-bold text-slate-450 uppercase font-mono mb-1">
                OAuth Token / API Key
              </label>
              <div className="relative">
                <input
                  id="api-key-field"
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-[10px]"
                />
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {/* Sync schedule selection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
            Auto-Sync Synchronization Frequency
          </label>
          <select
            value={syncSchedule}
            onChange={(e) => setSyncSchedule(e.target.value)}
            className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
          >
            <option value="hourly">Hourly (Active event streams)</option>
            <option value="daily">Daily (Nightly automated cron)</option>
            <option value="weekly">Weekly (Standard policy updates)</option>
            <option value="manual">Manual (No Schedule)</option>
          </select>
        </div>

        {/* Connection status result panel */}
        {testState !== 'idle' && (
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-[10px] font-mono leading-normal animate-in slide-in-from-top-1 ${
            testState === 'testing'
              ? 'bg-blue-500/5 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-450'
              : testState === 'success'
              ? 'bg-emerald-500/5 border-emerald-200 dark:border-emerald-900/40 text-emerald-650 dark:text-emerald-400'
              : 'bg-rose-500/5 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-455'
          }`}>
            <div className="flex items-center gap-2">
              {testState === 'testing' && <RefreshCw className="w-4.5 h-4.5 animate-spin" />}
              {testState === 'success' && <ShieldCheck className="w-4.5 h-4.5 shrink-0" />}
              {testState === 'failed' && <AlertCircle className="w-4.5 h-4.5 shrink-0 animate-pulse" />}
              
              <div className="space-y-0.5">
                <span className="font-bold block uppercase">
                  {testState === 'testing' && (isRtl ? 'جاري الاتصال...' : 'Testing Handshake...')}
                  {testState === 'success' && (isRtl ? 'اتصال سليم نشط' : 'Active Connection Validated')}
                  {testState === 'failed' && (isRtl ? 'فشل المصادقة' : 'Verification Denied')}
                </span>
                {testState === 'testing' && <span className="text-[9px] text-slate-400">Verifying network routing credentials...</span>}
                {testState === 'success' && <span className="text-[9px] text-slate-400">Ping latency: 12ms. Cluster index: healthy.</span>}
                {errorMessage && <span className="text-[9px] text-rose-500 block leading-tight font-sans italic">{errorMessage}</span>}
              </div>
            </div>

            {testState === 'failed' && (
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-2 py-1 bg-rose-500 text-white rounded font-sans font-bold uppercase hover:bg-rose-600"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={testState === 'testing'}
            onClick={handleTestConnection}
            className="px-3.5 py-2 border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500/10 cursor-pointer disabled:opacity-50"
          >
            {isRtl ? 'اختبار الاتصال' : 'Test Connection'}
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={testState !== 'success'}
              className="px-4 py-2 bg-blue-650 hover:bg-blue-700 disabled:opacity-55 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isRtl ? 'ربط الموصل وحفظه' : 'Activate Connector'}
            </button>
          </div>
        </div>

      </form>
    </ModalWrapper>
  );
}
