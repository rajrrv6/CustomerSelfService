import React, { useState } from 'react';
import { Key, Plus, RefreshCw, Trash2, Copy, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { ApiCredential } from '@/hooks/useIntegrationState';

interface ApiCredentialVaultProps {
  credentials: ApiCredential[];
  onGenerate: (name: string, scopes: string[]) => string;
  onRevoke: (id: string) => void;
  onRotate: (id: string) => void;
  isRtl?: boolean;
}

export function ApiCredentialVault({ credentials, onGenerate, onRevoke, onRotate, isRtl = false }: ApiCredentialVaultProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['customer.read']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const scopeOptions = [
    { value: 'customer.read', desc: 'Read customer profiles & attributes' },
    { value: 'customer.write', desc: 'Write / Merge customer entries' },
    { value: 'tickets.write', desc: 'Escalate & write client ticket state' },
    { value: 'dialog.read', desc: 'Inspect Dialog tree nodes' },
    { value: 'orders.read', desc: 'Pull product shipping metadata' }
  ];

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const rawKey = onGenerate(newKeyName, selectedScopes);
    setNewlyCreatedKey(rawKey);
    setNewKeyName('');
    setSelectedScopes(['customer.read']);
  };

  const handleCopyToClipboard = (keyStr: string, id: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-5 text-xs font-semibold shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-500" />
            {isRtl ? 'خزنة مفاتيح الـ API و رموز الوصول' : 'Client API Credentials Vault'}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Issue, rotate, and deprecate developer authentication tokens</p>
        </div>

        {!showGenerator && (
          <button
            onClick={() => {
              setShowGenerator(true);
              setNewlyCreatedKey(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            {isRtl ? 'إنشاء مفتاح API' : 'Generate API Key'}
          </button>
        )}
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/20">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                {isRtl ? 'إنشاء مفتاح وصول API جديد' : 'Generate New API Token'}
              </h4>
              <button 
                onClick={() => setShowGenerator(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {!newlyCreatedKey ? (
                <form onSubmit={handleGenerateSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Token Name / Client Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jenkins BI Sync Service"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Select API Scopes</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl">
                      {scopeOptions.map((scope) => {
                        const isChecked = selectedScopes.includes(scope.value);
                        return (
                          <label
                            key={scope.value}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400'
                                : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleScopeToggle(scope.value)}
                              className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                            />
                            <div>
                              <span className="font-mono text-[10px] font-bold block">{scope.value}</span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block font-sans mt-0.5">{scope.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowGenerator(false)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all text-center"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-500/10 text-center"
                    >
                      {isRtl ? 'إنشاء وتأمين' : 'Generate Token'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-800 dark:text-white text-[11px]">API Key Generated Successfully</h5>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Copy this token now. For security purposes, this secret key will NOT be displayed again once you close this window.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 select-all truncate flex-1 text-left font-bold pl-2">
                      {newlyCreatedKey}
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(newlyCreatedKey, 'new-gen-key')}
                      className={`p-2 rounded-xl border transition-all ${
                        copiedKeyId === 'new-gen-key'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white'
                      }`}
                    >
                      {copiedKeyId === 'new-gen-key' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowGenerator(false);
                      setNewlyCreatedKey(null);
                    }}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold transition-all text-xs"
                  >
                    {isRtl ? 'إغلاق الخزنة' : 'I Have Saved the Key'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credentials Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950">
                <th className="p-4">{isRtl ? 'الاسم والرمز المعرف' : 'Token Name / Client ID'}</th>
                <th className="p-4">{isRtl ? 'مفتاح الـ API' : 'Bearer Key (Masked)'}</th>
                <th className="p-4">{isRtl ? 'نطاقات الوصول' : 'Scopes'}</th>
                <th className="p-4">{isRtl ? 'آخر استخدام' : 'Last Active'}</th>
                <th className="p-4 text-right">{isRtl ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              {credentials.map((cred) => {
                const isRevoked = cred.status === 'revoked';

                return (
                  <tr key={cred.id} className={isRevoked ? 'opacity-40' : 'hover:bg-slate-50 dark:hover:bg-slate-900/10'}>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 dark:text-white text-[11px] block">{cred.name}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block">Issued: {cred.createdAt}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">{cred.keyMasked}</span>
                        {!isRevoked && (
                          <button
                            onClick={() => handleCopyToClipboard(cred.keyFull, cred.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Copy Key"
                          >
                            {copiedKeyId === cred.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cred.scopes.map((s) => (
                          <span
                            key={s}
                            className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {cred.lastUsed}
                    </td>
                    <td className="p-4 text-right">
                      {!isRevoked ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onRotate(cred.id)}
                            className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-all"
                            title="Rotate Key Secrets"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRevoke(cred.id)}
                            className="p-2 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/25 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                            title="Revoke Key Access"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2 py-0.5 rounded-md font-mono">
                          {isRtl ? 'تم سحب الصلاحية' : 'REVOKED'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
