import React, { useState } from 'react';
import { Shield, Key, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { CRMConnector } from '@/data/seed/crmConnectorsSeed';

interface OAuthConnectModalProps {
  connector: CRMConnector;
  onClose: () => void;
  onConnect: (clientId: string, clientSecret: string, scopes: string[]) => void;
  isRtl?: boolean;
}

export function OAuthConnectModal({ connector, onClose, onConnect, isRtl = false }: OAuthConnectModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  
  const defaultScopes = connector.id === 'salesforce' 
    ? ['read_contacts', 'write_accounts', 'refresh_token']
    : connector.id === 'hubspot'
    ? ['contacts', 'deals', 'oauth']
    : connector.id === 'zendesk'
    ? ['read_tickets', 'write_tickets', 'offline_access']
    : connector.id === 'shopify'
    ? ['read_orders', 'read_customers']
    : connector.id === 'stripe'
    ? ['charges_read', 'customers_read_write']
    : ['read_profile', 'sync_records'];

  const [selectedScopes, setSelectedScopes] = useState<string[]>(defaultScopes);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const handleStartConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !clientSecret) {
      setErrorMessage(isRtl ? 'الرجاء إدخال معرف العميل والمفتاح السري.' : 'Client ID and Secret are required.');
      return;
    }
    setErrorMessage('');
    setStep(2);

    const steps = [
      { msg: isRtl ? 'بدء طلب المصافحة الآمنة...' : 'Initiating secure handshake request...', delay: 800 },
      { msg: isRtl ? 'إعادة التوجيه إلى خادم تفويض المعرف...' : 'Redirecting to OAuth authorization server...', delay: 1600 },
      { msg: isRtl ? 'التحقق من توقيع العميل ونطاقات الوصول...' : 'Verifying client signature and permissions...', delay: 2400 },
      { msg: isRtl ? 'استبدال رمز التفويض برمز الوصول...' : 'Exchanging authorization code for token...', delay: 3200 }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setStatusMessage(s.msg);
      }, s.delay);
    });

    setTimeout(() => {
      setStep(3);
    }, 4000);
  };

  const handleFinalize = () => {
    onConnect(clientId, clientSecret, selectedScopes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                {isRtl ? `ربط ${connector.name}` : `Connect ${connector.name}`}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">OAuth 2.0 Auth Code Flow Grant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleStartConnection} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300" noValidate>
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="client-id" className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {isRtl ? 'معرف العميل (Client ID)' : 'Client Identifier (ID)'}
                </label>
                <input
                  id="client-id"
                  type="text"
                  required
                  placeholder="e.g. mpaas_sf_client_10293"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="client-secret" className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {isRtl ? 'المفتاح السري للعميل (Client Secret)' : 'Client Secret Key'}
                </label>
                <input
                  id="client-secret"
                  type="password"
                  required
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {isRtl ? 'نطاقات الوصول (Scopes)' : 'Requested API Permissions (Scopes)'}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl">
                  {defaultScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope);
                    return (
                      <label
                        key={scope}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleScopeToggle(scope)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                        />
                        <span className="font-mono text-[10px] font-bold">{scope}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all text-center"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-500/10 text-center"
                >
                  {isRtl ? 'تفويض وربط API' : 'Authorize API Link'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                <Key className="w-6 h-6 text-blue-500 dark:text-blue-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{isRtl ? 'تحقق OAuth قيد التنفيذ' : 'OAuth Verification in Progress'}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-mono min-h-[16px] transition-all">
                  {statusMessage || (isRtl ? 'يرجى الانتظار...' : 'Contacting oauth server...')}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-4 space-y-5 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                  {isRtl ? 'تم الاتصال بالموصل بنجاح!' : 'Integration Linked Successfully!'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                  {isRtl 
                    ? `تبادل رموز الوصول بنجاح. تم تخزين الرموز وتأمينها داخل خزنة المفاتيح.`
                    : `Access tokens have been securely exchanged and stored within the credentials vault for ${connector.name}.`}
                </p>
              </div>

              <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl text-left space-y-1 font-mono text-[9px] text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>TOKEN_STATUS:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">GRANTED</span>
                </div>
                <div className="flex justify-between">
                  <span>EXPIRES_IN:</span>
                  <span>3599 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>REFRESH_TOKEN:</span>
                  <span>rt_sim_88a912a772f9a...</span>
                </div>
              </div>

              <button
                onClick={handleFinalize}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10 text-xs"
              >
                {isRtl ? 'حفظ وإكمال' : 'Finalize & Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
