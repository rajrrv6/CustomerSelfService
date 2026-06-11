'use client';

import React, { useState } from 'react';
import { TaxRule } from '@/types/billing';
import { mockTaxRules } from './mockBillingData';
import { BillingStatusBadge } from './BillingStatusBadge';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Search, Plus, Edit3, Trash2, Power, Globe, ShieldAlert } from 'lucide-react';

export function TaxConfigurationTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [rules, setRules] = useState<TaxRule[]>(mockTaxRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form states
  const [region, setRegion] = useState('');
  const [taxRate, setTaxRate] = useState('15');
  const [invoiceLabel, setInvoiceLabel] = useState('VAT 15%');
  const [exempt, setExempt] = useState(false);

  const filteredRules = rules.filter(r => 
    r.region.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.invoiceLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (rule: TaxRule) => {
    setEditingRule(rule);
    setRegion(rule.region);
    setTaxRate(rule.taxRate.toString());
    setInvoiceLabel(rule.invoiceLabel);
    setExempt(rule.exempt);
    setValidationError(null);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingRule(null);
    setRegion('');
    setTaxRate('15');
    setInvoiceLabel('VAT 15%');
    setExempt(false);
    setValidationError(null);
    setShowModal(true);
  };

  const handleToggleStatus = (rule: TaxRule) => {
    const nextStatus = rule.status === 'active' ? 'inactive' : 'active';
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: nextStatus } : r));
    pushToast(
      'success',
      isRtl ? 'تم تحديث حالة الضريبة' : 'Tax Status Updated',
      isRtl 
        ? `تم تحديث القاعدة "${rule.region}" لتصبح ${nextStatus === 'active' ? 'نشطة' : 'معطلة'}.`
        : `Tax rule "${rule.region}" set to ${nextStatus}.`
    );
    addAuditLog(`Toggled status of tax rule: ${rule.region} (${nextStatus})`, 'success');
  };

  const handleDelete = (rule: TaxRule) => {
    const confirmed = window.confirm(
      isRtl ? `هل أنت متأكد من حذف قاعدة الضرائب "${rule.region}"؟` : `Are you sure you want to delete tax rule "${rule.region}"?`
    );
    if (!confirmed) return;

    setRules(prev => prev.filter(r => r.id !== rule.id));
    pushToast(
      'success',
      isRtl ? 'تم حذف قاعدة الضرائب' : 'Tax Rule Deleted',
      isRtl ? `تم مسح القاعدة "${rule.region}" من حسابات الفوترة.` : `Removed tax configuration "${rule.region}".`
    );
    addAuditLog(`Deleted tax rule: ${rule.region}`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!region.trim()) return;

    setValidationError(null);

    // Validate duplicate jurisdiction
    const isDuplicateRegion = rules.some(r => 
      r.region.trim().toLowerCase() === region.trim().toLowerCase() && 
      r.id !== editingRule?.id
    );
    const isDuplicateLabel = rules.some(r => 
      r.invoiceLabel.trim().toLowerCase() === invoiceLabel.trim().toLowerCase() && 
      r.id !== editingRule?.id
    );

    if (isDuplicateRegion) {
      const err = isRtl 
        ? 'المنطقة أو الولاية الضريبية مضافة مسبقاً.' 
        : 'This regional jurisdiction is already configured.';
      setValidationError(err);
      pushToast('error', isRtl ? 'قاعدة مكررة' : 'Duplicate Rule', err);
      return;
    }

    if (isDuplicateLabel) {
      const err = isRtl 
        ? 'تسمية الفاتورة هذه مستخدمة في قاعدة أخرى.' 
        : 'This invoice label is already used by another active tax rule.';
      setValidationError(err);
      pushToast('error', isRtl ? 'تسمية مكررة' : 'Duplicate Label', err);
      return;
    }

    const rate = exempt ? 0 : parseFloat(taxRate);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      const err = isRtl 
        ? 'يجب أن تكون نسبة الضريبة بين 0% و 50%.' 
        : 'Tax rate percentage must be between 0% and 50%.';
      setValidationError(err);
      pushToast('error', isRtl ? 'نسبة ضريبية خاطئة' : 'Invalid Tax Rate', err);
      return;
    }

    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? {
        ...r,
        region,
        taxRate: rate,
        invoiceLabel,
        exempt
      } : r));

      pushToast(
        'success',
        isRtl ? 'تم تعديل قاعدة الضرائب' : 'Tax Rule Updated',
        isRtl ? `تم حفظ التغييرات على القاعدة "${region}".` : `Successfully updated configuration for "${region}".`
      );
      addAuditLog(`Updated tax configuration rule: ${region}`, 'success');
    } else {
      const newRule: TaxRule = {
        id: `tax-${Date.now()}`,
        region,
        taxRate: rate,
        invoiceLabel,
        status: 'active',
        exempt
      };

      setRules(prev => [...prev, newRule]);
      pushToast(
        'success',
        isRtl ? 'تم إنشاء قاعدة الضرائب' : 'Tax Rule Created',
        isRtl ? `تم إضافة قاعدة الضرائب الجديدة لـ "${region}".` : `Added tax rule code "${region}".`
      );
      addAuditLog(`Created tax configuration rule: ${region}`, 'success');
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'البحث عن بلد أو فئة ضريبية...' : 'Search tax regions or labels...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer ml-auto md:ml-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة قاعدة ضريبية' : 'Add Tax Rule'}</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                {['Regional Jurisdiction', 'Tax Percentage', 'Invoice Label', 'Tax Exempt', 'Status', 'Actions'].map((h, idx) => (
                  <th key={idx} className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? (
                      h === 'Regional Jurisdiction' ? 'الولاية الضريبية / المنطقة' :
                      h === 'Tax Percentage' ? 'نسبة الضريبة' :
                      h === 'Invoice Label' ? 'تسمية الفاتورة' :
                      h === 'Tax Exempt' ? 'إعفاء ضريبي' :
                      h === 'Status' ? 'الحالة' : 'الإجراءات'
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">{rule.region}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                      {rule.exempt ? '0.0%' : `${rule.taxRate}%`}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {rule.invoiceLabel}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {rule.exempt ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-250 text-[10px]">
                          {isRtl ? 'معفى' : 'EXEMPT'}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[10px]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <BillingStatusBadge status={rule.status === 'active' ? 'coupon_active' : 'coupon_expired'} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(rule)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-850 cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-850 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50/20 text-red-600 hover:bg-red-50/50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-3">
                        <Globe className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {isRtl ? 'لا توجد قواعد ضريبية مضافة' : 'No Tax Rules Configured'}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {isRtl ? 'قم بإضافة لوائح الضرائب الإقليمية لبدء الفوترة.' : 'No active regional rules match your query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ModalWrapper
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRule ? (isRtl ? 'تعديل لائحة الضرائب' : 'Edit Tax Configuration') : (isRtl ? 'إضافة ولاية ضريبية جديدة' : 'Create Tax Rule')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-955/10 border border-red-200 dark:border-red-900/30 rounded-xl text-red-655 text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'المنطقة أو الولاية الضريبية' : 'Regional Jurisdiction'} *
            </label>
            <input
              type="text"
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. EU Digital Goods VAT"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'تسمية الفاتورة المطبوعة' : 'Invoice Label'} *
              </label>
              <input
                type="text"
                required
                value={invoiceLabel}
                onChange={(e) => setInvoiceLabel(e.target.value)}
                placeholder="e.g. VAT 15%"
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'نسبة الضريبة (%)' : 'Tax Percentage (%)'} *
              </label>
              <input
                type="number"
                required={!exempt}
                disabled={exempt}
                min="0"
                max="50"
                step="any"
                value={exempt ? '0' : taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-950/40 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="exempt-toggle"
              type="checkbox"
              checked={exempt}
              onChange={(e) => setExempt(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="exempt-toggle" className="text-xs text-slate-700 dark:text-slate-300 font-bold select-none cursor-pointer">
              {isRtl ? 'ولاية معفاة من الضرائب (Tax Exempt)' : 'This jurisdiction is tax-exempt'}
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              {editingRule ? (isRtl ? 'حفظ اللائحة' : 'Save Changes') : (isRtl ? 'إضافة اللائحة' : 'Add Rule')}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
