'use client';

import React, { useState } from 'react';
import { RefundRequest } from '@/types/billing';
import { mockRefundRequests } from './mockBillingData';
import { BillingStatusBadge } from './BillingStatusBadge';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Search, Check, X, ShieldAlert, FileText, Calendar, DollarSign, Layers } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export function RefundQueueTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [refunds, setRefunds] = useState<RefundRequest[]>(mockRefundRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmDecision, setConfirmDecision] = useState<'approved' | 'rejected' | null>(null);
  const [activeRefund, setActiveRefund] = useState<RefundRequest | null>(null);

  const filteredRefunds = refunds.filter(r => 
    r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.billingReference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerRefundAction = (refund: RefundRequest, decision: 'approved' | 'rejected') => {
    setActiveRefund(refund);
    setConfirmDecision(decision);
    setShowConfirmModal(true);
  };

  const confirmRefundAction = () => {
    if (!activeRefund || !confirmDecision) return;

    const refund = activeRefund;
    const decision = confirmDecision;

    setRefunds(prev => prev.map(r => r.id === refund.id ? { ...r, status: decision } : r));

    // Update the drawer state if open
    if (selectedRefund && selectedRefund.id === refund.id) {
      setSelectedRefund(prev => prev ? { ...prev, status: decision } : null);
    }

    pushToast(
      'success',
      decision === 'approved'
        ? (isRtl ? 'تمت الموافقة على الاسترداد' : 'Refund Approved')
        : (isRtl ? 'تم رفض الاسترداد' : 'Refund Rejected'),
      decision === 'approved'
        ? (isRtl 
          ? `تم اعتماد صرف مبلغ $${refund.amount} للمستأجر "${refund.tenantName}".`
          : `Approved credit of $${refund.amount} to "${refund.tenantName}" account ledger.`)
        : (isRtl
          ? `تم رفض طلب الاسترداد للفاتورة "${refund.billingReference}".`
          : `Rejected refund request for invoice ${refund.billingReference}.`)
    );

    addAuditLog(
      `${decision.toUpperCase()} refund of $${refund.amount} for ${refund.tenantName} (${refund.billingReference})`,
      decision === 'approved' ? 'success' : 'failed'
    );

    setShowConfirmModal(false);
    setActiveRefund(null);
    setConfirmDecision(null);
  };

  const getStatusLabel = (status: RefundRequest['status']) => {
    switch (status) {
      case 'pending': return 'pending_refund';
      case 'approved': return 'refunded';
      case 'rejected': return 'expired';
      default: return 'archived';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search HUD */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'البحث في طلبات الاسترداد...' : 'Search refunds by tenant name or invoice...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Refunds table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                {['Client Tenant', 'Invoice Ref', 'Amount', 'Reason Code', 'Timestamp', 'Status', 'Actions'].map((h, idx) => (
                  <th key={idx} className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? (
                      h === 'Client Tenant' ? 'المستأجر / العميل' :
                      h === 'Invoice Ref' ? 'مرجع الفاتورة' :
                      h === 'Amount' ? 'مبلغ الاسترداد' :
                      h === 'Reason Code' ? 'السبب الموجب' :
                      h === 'Timestamp' ? 'طابع الوقت' :
                      h === 'Status' ? 'الحالة' : 'الإجراءات'
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.length > 0 ? (
                filteredRefunds.map((refund) => (
                  <tr 
                    key={refund.id} 
                    onClick={() => setSelectedRefund(refund)}
                    className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{refund.tenantName}</span>
                        <span className="text-[9px] font-mono text-slate-400 mt-0.5">ID: {refund.tenantId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {refund.billingReference}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                      -${refund.amount}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-655 dark:text-slate-350 max-w-xs truncate">
                      {refund.reason}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-400 dark:text-slate-500">
                      {refund.timestamp}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <BillingStatusBadge status={getStatusLabel(refund.status)} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      {refund.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerRefundAction(refund, 'approved');
                            }}
                            className="p-1.5 rounded-lg border border-emerald-250 bg-emerald-50/20 text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
                            title={isRtl ? 'موافقة وصرف' : 'Approve Refund'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerRefundAction(refund, 'rejected');
                            }}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50/20 text-red-600 hover:bg-red-50/50 cursor-pointer"
                            title={isRtl ? 'رفض الطلب' : 'Reject Refund'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          {refund.status === 'approved' ? (isRtl ? 'تم الاعتماد' : 'Approved') : (isRtl ? 'تم الرفض' : 'Rejected')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-3">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {isRtl ? 'لا توجد طلبات استرداد' : 'No Refund Requests'}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {isRtl ? 'قائمة الفوترة خالية من طلبات الاسترداد المعلقة.' : 'All refund requests have been processed.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Details Overlay Drawer */}
      <ModalWrapper
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title={isRtl ? 'تفاصيل طلب استرداد الرسوم المالي' : 'Refund Discrepancy & SLA Audit Details'}
      >
        {selectedRefund && (
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedRefund.tenantName}</h4>
                <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Invoice Reference: {selectedRefund.billingReference}</p>
              </div>
              <BillingStatusBadge status={getStatusLabel(selectedRefund.status)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">{isRtl ? 'قيمة الاسترداد المطلوبة' : 'Requested Refund Amount'}</span>
                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1 block font-mono">-${selectedRefund.amount} USD</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">{isRtl ? 'طابع تقديم الطلب' : 'Request Timestamp'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 block font-mono">{selectedRefund.timestamp}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'السبب المالي الموضح' : 'Stated Reason Code'}</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-100 dark:border-slate-900 font-normal leading-relaxed">
                {selectedRefund.reason}
              </p>
            </div>

            {/* SLA Breach Details section */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'مراجعة خرق SLA للخدمات المرتبطة' : 'System Operations SLA Breach Audit'}</span>
              <div className="p-3 bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/30 rounded-xl space-y-2 text-[10.5px]">
                {selectedRefund.reason.toLowerCase().includes('sla') || selectedRefund.amount > 100 ? (
                  <>
                    <div className="flex gap-2 text-amber-800 dark:text-amber-400">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="font-bold">{isRtl ? 'تم رصد حيود في الخدمة' : 'SLA Target Deviation Found'}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-normal font-normal">
                      {isRtl 
                        ? 'تظهر سجلات خادم الصوت KSA SIP trunk تعطلاً مستمراً لمدة 214 دقيقة بتاريخ 2026-06-02، وهو ما يخرق ضمان وقت الخدمة المتفق عليه (99.9%).'
                        : 'VoIP core voice trunk did_ksa_primary registered a 214-minute routing exception on 2026-06-02, triggering automated client-side service SLA violation claim threshold.'
                      }
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 italic font-normal">
                    {isRtl ? 'لم يتم العثور على خروقات مسجلة لوقت تشغيل النظام لهذه الفترة.' : 'No system outages or latency warnings recorded in System Logs for this billing period.'}
                  </p>
                )}
              </div>
            </div>

            {/* Seat limits and invoice logs */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'سجلات الفواتير ومقاعد المستخدمين' : 'Invoice Seats & Usage Reconciliation'}</span>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-xl space-y-2 text-[10.5px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan Seat Capacity:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">15 Seats (Growth Tier)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Peak Usage:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">11 Seats Used</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prior invoice invoice_ref:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">INV-2026-048 ($299.00 PAID)</span>
                </div>
              </div>
            </div>

            {/* Action buttons in details drawer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              {selectedRefund.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerRefundAction(selectedRefund, 'approved')}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'الموافقة على الاسترداد' : 'Approve Refund'}</span>
                  </button>
                  <button
                    onClick={() => triggerRefundAction(selectedRefund, 'rejected')}
                    className="flex items-center gap-1 px-3 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'رفض الطلب' : 'Reject Refund'}</span>
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">
                  {selectedRefund.status === 'approved' ? (isRtl ? 'تم الاعتماد والصرف' : 'Approved & Credited') : (isRtl ? 'تم رفض طلب الصرف' : 'Rejected Refund Request')}
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close details'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Confirmation Modal */}
      <ModalWrapper
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={
          confirmDecision === 'approved' ? (isRtl ? 'اعتماد وصرف الاسترداد المالي' : 'Approve Refund Request') :
          (isRtl ? 'رفض طلب الاسترداد المالي' : 'Reject Refund Request')
        }
      >
        {activeRefund && (
          <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
            <div className="flex gap-3 bg-blue-50/50 dark:bg-blue-955/10 border border-blue-200 dark:border-blue-900/30 p-3.5 rounded-xl text-[11px] text-blue-700 dark:text-blue-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed">
                {confirmDecision === 'approved' ? (
                  isRtl 
                    ? `هل أنت متأكد من رغبتك في الموافقة على استرداد مبلغ $${activeRefund.amount} لصالح "${activeRefund.tenantName}"؟ سيتم إضافة رصيد لحساب العميل فوراً.` 
                    : `Confirming this action will issue a ledger credit of $${activeRefund.amount} USD to the billing profile of "${activeRefund.tenantName}".`
                ) : (
                  isRtl 
                    ? `هل أنت متأكد من رغبتك في رفض طلب استرداد مبلغ $${activeRefund.amount} للمستأجر "${activeRefund.tenantName}"؟ سيتم إغلاق التذكرة المالية.` 
                    : `Confirming this action will deny the refund request for invoice reference ${activeRefund.billingReference}. The status will be logged in customer billing notes.`
                )}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmRefundAction}
                className={`px-4 py-2 text-white rounded-xl font-bold cursor-pointer ${
                  confirmDecision === 'rejected' ? 'bg-red-650 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isRtl ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
}

