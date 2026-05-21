import React, { useState } from 'react';
import { Layers, Plus, Save, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CRMConnector, ConnectorMapping, ConnectorField } from '@/data/seed/crmConnectorsSeed';

interface MappingBuilderProps {
  connector: CRMConnector;
  onSave: (id: string, mappings: ConnectorMapping[]) => void;
  isRtl?: boolean;
}

export function MappingBuilder({ connector, onSave, isRtl = false }: MappingBuilderProps) {
  const localDbFields = [
    { key: 'firstName', label: 'Local Profile: Given Name' },
    { key: 'lastName', label: 'Local Profile: Surname' },
    { key: 'email', label: 'Local Profile: Primary Email' },
    { key: 'phone', label: 'Local Profile: Mobile Phone' },
    { key: 'orderId', label: 'Local Order: Transaction ID' },
    { key: 'orderAmount', label: 'Local Order: Total Price' },
    { key: 'orderStatus', label: 'Local Order: Ship Status' },
    { key: 'billingStatus', label: 'Local Billing: Sub Plan Tier' },
    { key: 'isOverdue', label: 'Local Billing: Payment Overdue' }
  ];

  const [mappings, setMappings] = useState<ConnectorMapping[]>(connector.mappings);
  const [selectedLocal, setSelectedLocal] = useState('');
  const [selectedExternal, setSelectedExternal] = useState('');
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocal || !selectedExternal) return;

    if (mappings.some(m => m.localField === selectedLocal)) {
      alert(isRtl ? 'هذا الحقل المحلي مبرمج مسبقاً.' : 'This local field is already mapped.');
      return;
    }

    const newRule: ConnectorMapping = {
      localField: selectedLocal,
      externalField: selectedExternal
    };

    setMappings(prev => [...prev, newRule]);
    setSelectedLocal('');
    setSelectedExternal('');
  };

  const handleRemoveRule = (localField: string) => {
    setMappings(prev => prev.filter(m => m.localField !== localField));
  };

  const handleSave = () => {
    onSave(connector.id, mappings);
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-6 text-xs font-semibold shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            {isRtl ? `هيكل مطابقة البيانات لـ ${connector.name}` : `${connector.name} Data Schema Mapping`}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bind external attributes to Customer Portal schemas</p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-500/10 shrink-0"
        >
          <Save className="w-4 h-4" />
          {isRtl ? 'حفظ خريطة البيانات' : 'Save Mapping Config'}
        </button>
      </div>

      {showSavedNotification && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isRtl ? 'تم حفظ هيكل مطابقة الحقول ومزامنة الموصل!' : 'Field mappings saved and connector synchronized successfully!'}</span>
        </div>
      )}

      {/* Add mapping rule form */}
      <form onSubmit={handleAddRule} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wide">
            {isRtl ? 'الحقل المحلي (Local System Field)' : 'Local System Field'}
          </label>
          <select
            value={selectedLocal}
            onChange={(e) => setSelectedLocal(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">{isRtl ? '-- اختر حقل محلي --' : '-- Choose Local Attribute --'}</option>
            {localDbFields.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center items-center py-2 text-slate-400 dark:text-slate-500">
          {isRtl ? <ArrowLeft className="w-5 h-5 hidden md:block" /> : <ArrowRight className="w-5 h-5 hidden md:block" />}
        </div>

        <div className="flex-1 space-y-1.5">
          <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wide">
            {isRtl ? 'حقل API الخارجي (External API Key)' : 'External API Key'}
          </label>
          <select
            value={selectedExternal}
            onChange={(e) => setSelectedExternal(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">{isRtl ? '-- اختر حقل خارجي --' : '-- Choose External Parameter --'}</option>
            {connector.fields.map((f: ConnectorField) => (
              <option key={f.key} value={f.key}>
                {f.key} ({f.label} {f.required ? '*' : ''})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedLocal || !selectedExternal}
          className="py-2 px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {isRtl ? 'إضافة مطابقة' : 'Add Rule'}
        </button>
      </form>

      {/* Rules list */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold font-mono">Active Mapped Parameters ({mappings.length})</h4>
        
        {mappings.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
            {isRtl ? 'لا توجد حقول مطابقة حالياً لهذا الموصل. ابدأ في تكوين حقول المزامنة.' : 'No schema mappings found. Begin by mapping attributes above.'}
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {mappings.map(map => {
              const localLabel = localDbFields.find(f => f.key === map.localField)?.label || map.localField;
              const externalLabel = connector.fields.find(f => f.key === map.externalField)?.label || map.externalField;

              return (
                <div key={map.localField} className="flex justify-between items-center p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                    <span className="font-mono text-slate-800 dark:text-white text-[10px] font-bold py-1 px-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      {map.localField}
                    </span>
                    <div className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                        {map.externalField}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium ml-2 font-sans">
                        ({externalLabel})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveRule(map.localField)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 border border-transparent hover:border-red-200 dark:hover:border-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
