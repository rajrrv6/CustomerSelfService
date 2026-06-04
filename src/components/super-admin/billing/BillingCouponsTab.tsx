'use client';

import React, { useState } from 'react';
import { CouponCampaign } from '@/types/billing';
import { mockCoupons } from './mockBillingData';
import { BillingStatusBadge } from './BillingStatusBadge';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Search, Plus, Calendar, Tag, Trash2, Power, AlertTriangle, RefreshCw } from 'lucide-react';

export function BillingCouponsTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [coupons, setCoupons] = useState<CouponCampaign[]>(mockCoupons);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCouponForExtend, setSelectedCouponForExtend] = useState<CouponCampaign | null>(null);

  // Form State for Add Coupon
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [minSpend, setMinSpend] = useState('0');

  // Form State for Extension
  const [newExpiryDate, setNewExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expiredCouponsCount = coupons.filter(c => c.status === 'expired').length;

  const handleToggleStatus = (coupon: CouponCampaign) => {
    const nextStatus = coupon.status === 'active' ? 'inactive' : 'active';
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: nextStatus } : c));
    
    pushToast(
      'success',
      isRtl ? 'تم تحديث حالة القسيمة' : 'Coupon Status Updated',
      isRtl
        ? `تم تحديث قسيمة التخفيض "${coupon.code}" لتصبح ${nextStatus === 'active' ? 'نشطة' : 'معطلة'}.`
        : `Coupon campaign "${coupon.code}" set to ${nextStatus}.`
    );
    addAuditLog(`Toggled coupon campaign status: ${coupon.code} (${nextStatus})`, 'success');
  };

  const handleExtendCoupon = (coupon: CouponCampaign) => {
    setSelectedCouponForExtend(coupon);
    setNewExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  };

  const submitExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCouponForExtend) return;

    setCoupons(prev => prev.map(c => 
      c.id === selectedCouponForExtend.id 
        ? { ...c, status: 'active', expiryDate: newExpiryDate } 
        : c
    ));

    pushToast(
      'success',
      isRtl ? 'تم تمديد وتنشيط الحملة' : 'Campaign Reactivated & Extended',
      isRtl
        ? `تم تنشيط قسيمة "${selectedCouponForExtend.code}" وتمديد تاريخ الصلاحية إلى ${newExpiryDate}.`
        : `Reactivated campaign "${selectedCouponForExtend.code}" and extended expiry to ${newExpiryDate}.`
    );
    addAuditLog(`Reactivated & extended coupon campaign: ${selectedCouponForExtend.code} (new expiry: ${newExpiryDate})`, 'success');

    setSelectedCouponForExtend(null);
  };

  const handleDelete = (coupon: CouponCampaign) => {
    const confirmed = window.confirm(
      isRtl 
        ? `هل أنت متأكد من حذف قسيمة التخفيض "${coupon.code}" نهائياً؟` 
        : `Are you sure you want to permanently delete coupon "${coupon.code}"?`
    );
    if (!confirmed) return;

    setCoupons(prev => prev.filter(c => c.id !== coupon.id));
    pushToast(
      'success',
      isRtl ? 'تم حذف القسيمة بنجاح' : 'Coupon Deleted',
      isRtl ? `تم مسح كود التخفيض "${coupon.code}" من النظام.` : `Removed coupon campaign "${coupon.code}" successfully.`
    );
    addAuditLog(`Deleted coupon campaign: ${coupon.code}`, 'success');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCpn: CouponCampaign = {
      id: `cpn-${Date.now()}`,
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountType,
      discountValue: parseFloat(discountValue),
      status: 'active',
      expiryDate,
      usageCount: 0,
      minSpend: parseFloat(minSpend)
    };

    setCoupons(prev => [newCpn, ...prev]);
    pushToast(
      'success',
      isRtl ? 'تم إنشاء القسيمة بنجاح' : 'Coupon Created Successfully',
      isRtl 
        ? `كود التخفيض الجديد "${newCpn.code}" متاح الآن للعملاء.` 
        : `Successfully launched new campaign "${newCpn.code}".`
    );
    addAuditLog(`Created coupon campaign: ${newCpn.code}`, 'success');
    
    // Reset Form
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinSpend('0');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Alert Banner for Expired Coupons */}
      {expiredCouponsCount > 0 && (
        <div className="p-3.5 bg-amber-50/60 dark:bg-amber-955/10 border border-amber-205 dark:border-amber-900/35 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-400">
            <h5 className="font-extrabold">{isRtl ? 'تنبيه: قسائم ترويجية منتهية الصلاحية' : 'System Alert: Expired Voucher Campaigns'}</h5>
            <p className="leading-relaxed mt-0.5 text-[11px] font-normal">
              {isRtl
                ? `هناك عدد (${expiredCouponsCount}) من قسائم الخصم منتهية الصلاحية. يرجى تمديد أو حذف القسائم لمنع خلط حسابات المبيعات.`
                : `There are ${expiredCouponsCount} coupon campaigns flagged as expired. Reactivate or extend campaign timelines to restore user redemption functionality.`}
            </p>
          </div>
        </div>
      )}

      {/* Filtering HUD */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-805 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'البحث عن قسيمة...' : 'Search coupons by code...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer ml-auto md:ml-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إنشاء قسيمة جديدة' : 'Create Coupon'}</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                {['Coupon Code', 'Discount Type', 'Discount Value', 'Minimum Spend', 'Expiry Date', 'Usage Count', 'Status', 'Actions'].map((h, idx) => (
                  <th key={idx} className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? (
                      h === 'Coupon Code' ? 'كود القسيمة' :
                      h === 'Discount Type' ? 'نوع الخصم' :
                      h === 'Discount Value' ? 'قيمة الخصم' :
                      h === 'Minimum Spend' ? 'الحد الأدنى للإنفاق' :
                      h === 'Expiry Date' ? 'تاريخ انتهاء الصلاحية' :
                      h === 'Usage Count' ? 'مرات الاستخدام' :
                      h === 'Status' ? 'الحالة' : 'الإجراءات'
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {coupon.discountType === 'percentage' 
                        ? (isRtl ? 'نسبة مئوية' : 'Percentage') 
                        : (isRtl ? 'مبلغ ثابت' : 'Fixed Amount')}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      ${coupon.minSpend}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {coupon.expiryDate}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {coupon.usageCount}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <BillingStatusBadge status={coupon.status === 'active' ? 'coupon_active' : 'coupon_expired'} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        {/* Toggle active / inactive (Only if not expired) */}
                        {coupon.status !== 'expired' ? (
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className={`p-1.5 rounded-lg border cursor-pointer ${
                              coupon.status === 'active'
                                ? 'border-amber-200 bg-amber-50/20 text-amber-600 hover:bg-amber-50/50'
                                : 'border-emerald-200 bg-emerald-50/20 text-emerald-600 hover:bg-emerald-50/50'
                            }`}
                            title={coupon.status === 'active' ? (isRtl ? 'تعطيل القسيمة' : 'Deactivate') : (isRtl ? 'تنشيط القسيمة' : 'Activate')}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          /* Extend / Reactivate for expired coupon */
                          <button
                            onClick={() => handleExtendCoupon(coupon)}
                            className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/20 text-indigo-600 hover:bg-indigo-50/50 cursor-pointer"
                            title={isRtl ? 'تمديد وتنشيط' : 'Extend & Reactivate'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50/20 text-red-600 hover:bg-red-50/50 cursor-pointer"
                          title={isRtl ? 'حذف القسيمة' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {isRtl ? 'لا توجد قسائم تخفيض' : 'No Coupons Found'}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {isRtl ? 'لم يتم العثور على قسائم مطابقة لبحثك.' : 'Try adjusting your search criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <ModalWrapper
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isRtl ? 'إنشاء قسيمة تخفيض جديدة' : 'Create Discount Campaign'}
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'كود القسيمة الفريد' : 'Unique Coupon Code'} *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SUMMER25"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'نوع الخصم' : 'Discount Type'}
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="percentage">{isRtl ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                <option value="fixed">{isRtl ? 'مبلغ ثابت ($)' : 'Fixed Dollar ($)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'قيمة الخصم' : 'Discount Value'} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'الحد الأدنى للإنفاق ($)' : 'Min Spend Threshold ($)'}
              </label>
              <input
                type="number"
                min="0"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isRtl ? 'تأكيد النشر' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* Reactivate & Extend Modal */}
      <ModalWrapper
        isOpen={!!selectedCouponForExtend}
        onClose={() => setSelectedCouponForExtend(null)}
        title={isRtl ? 'تمديد وتنشيط حملة القسيمة' : 'Reactivate & Extend Coupon Campaign'}
      >
        {selectedCouponForExtend && (
          <form onSubmit={submitExtension} className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-955/10 border border-indigo-200 dark:border-indigo-900/35 rounded-xl text-[11px]">
              <p className="leading-relaxed">
                {isRtl
                  ? `أنت تقوم بتمديد صلاحية كود الخصم "${selectedCouponForExtend.code}" المنتهي حالياً. سيتم إعادة تفعيل القسيمة للاستخدام فوراً بعد تعديل تاريخ الانتهاء.`
                  : `You are reactivating the expired coupon code "${selectedCouponForExtend.code}". Updating the expiry date will restore voucher redemption limits.`}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                {isRtl ? 'تاريخ انتهاء الصلاحية الجديد' : 'New Expiry Date'} *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCouponForExtend(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
              >
                {isRtl ? 'تنشيط وتمديد' : 'Reactivate & Extend'}
              </button>
            </div>
          </form>
        )}
      </ModalWrapper>
    </div>
  );
}
