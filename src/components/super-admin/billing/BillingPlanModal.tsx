'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { SubscriptionPlan, PlanStatus } from '@/types/billing';
import { useUIStore } from '@/stores/uiStore';

interface BillingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onSave: (planData: Omit<SubscriptionPlan, 'id'> & { id?: string }) => void;
}

export function BillingPlanModal({ isOpen, onClose, plan, onSave }: BillingPlanModalProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('0');
  const [annualPrice, setAnnualPrice] = useState('0');
  const [includedSeats, setIncludedSeats] = useState('5');
  const [usageTier, setUsageTier] = useState<'free' | 'growth' | 'enterprise'>('growth');
  const [aiCredits, setAiCredits] = useState('1000000');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PlanStatus>('active');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setName(plan.name);
        setMonthlyPrice(plan.monthlyPrice.toString());
        setAnnualPrice(plan.annualPrice.toString());
        setIncludedSeats(plan.includedSeats.toString());
        setUsageTier(plan.usageTier);
        setAiCredits(plan.aiCredits.toString());
        setDescription(plan.description || '');
        setStatus(plan.status);
      } else {
        setName('');
        setMonthlyPrice('199');
        setAnnualPrice('1990');
        setIncludedSeats('10');
        setUsageTier('growth');
        setAiCredits('5000000');
        setDescription('');
        setStatus('draft');
      }
      setErrors({});
    }
  }, [isOpen, plan]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = isRtl ? 'اسم الخطة مطلوب' : 'Plan Name is required';
    }

    const mPrice = parseFloat(monthlyPrice);
    if (isNaN(mPrice) || mPrice < 0) {
      newErrors.monthlyPrice = isRtl ? 'يجب أن يكون السعر الشهري رقماً موجباً' : 'Monthly price must be a positive number';
    }

    const aPrice = parseFloat(annualPrice);
    if (isNaN(aPrice) || aPrice < 0) {
      newErrors.annualPrice = isRtl ? 'يجب أن يكون السعر السنوي رقماً موجباً' : 'Annual price must be a positive number';
    }

    const seats = parseInt(includedSeats);
    if (isNaN(seats) || seats < 0) {
      newErrors.includedSeats = isRtl ? 'يجب أن يكون عدد المقاعد رقماً موجباً' : 'Seats must be a positive integer';
    }

    const credits = parseInt(aiCredits);
    if (isNaN(credits) || credits < 0) {
      newErrors.aiCredits = isRtl ? 'يجب أن يكون رصيد الرموز رقماً موجباً' : 'AI credits must be a positive integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: plan?.id,
      name,
      monthlyPrice: parseFloat(monthlyPrice),
      annualPrice: parseFloat(annualPrice),
      includedSeats: parseInt(includedSeats),
      usageTier,
      aiCredits: parseInt(aiCredits),
      description,
      status
    });

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? (isRtl ? 'تعديل خطة الأسعار' : 'Edit Subscription Plan') : (isRtl ? 'إضافة خطة أسعار جديدة' : 'Create Billing Plan')}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label htmlFor="plan-name" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
            {isRtl ? 'اسم الخطة' : 'Plan Name'} *
          </label>
          <input
            id="plan-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
            placeholder={isRtl ? 'مثال: خطة النمو المتقدمة' : 'e.g. Pro Growth Edition'}
          />
          {errors.name && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.name}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="plan-monthly" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'السعر الشهري ($)' : 'Monthly Price ($)'} *
            </label>
            <input
              id="plan-monthly"
              type="number"
              required
              min="0"
              step="any"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold font-mono text-slate-900 dark:text-white"
            />
            {errors.monthlyPrice && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.monthlyPrice}</span>}
          </div>

          <div>
            <label htmlFor="plan-annual" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'السعر السنوي ($)' : 'Annual Price ($)'} *
            </label>
            <input
              id="plan-annual"
              type="number"
              required
              min="0"
              step="any"
              value={annualPrice}
              onChange={(e) => setAnnualPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold font-mono text-slate-900 dark:text-white"
            />
            {errors.annualPrice && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.annualPrice}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="plan-seats" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'المقاعد المضمنة' : 'Included Seats'} *
            </label>
            <input
              id="plan-seats"
              type="number"
              required
              min="0"
              value={includedSeats}
              onChange={(e) => setIncludedSeats(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold font-mono text-slate-900 dark:text-white"
            />
            {errors.includedSeats && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.includedSeats}</span>}
          </div>

          <div>
            <label htmlFor="plan-tier" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'فئة الاستخدام' : 'Usage Tier'} *
            </label>
            <select
              id="plan-tier"
              value={usageTier}
              onChange={(e) => setUsageTier(e.target.value as any)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
            >
              <option value="free">Free / Trial</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="plan-credits" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'رموز الذكاء الاصطناعي (Tokens)' : 'AI Credits (Tokens)'} *
            </label>
            <input
              id="plan-credits"
              type="number"
              required
              min="0"
              value={aiCredits}
              onChange={(e) => setAiCredits(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold font-mono text-slate-900 dark:text-white"
            />
            {errors.aiCredits && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.aiCredits}</span>}
          </div>

          <div>
            <label htmlFor="plan-status" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'الحالة' : 'Status'} *
            </label>
            <select
              id="plan-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PlanStatus)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
            >
              <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
              <option value="draft">{isRtl ? 'مسودة' : 'Draft'}</option>
              <option value="archived">{isRtl ? 'مؤرشف' : 'Archived'}</option>
              <option value="disabled">{isRtl ? 'معطل' : 'Disabled'}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="plan-desc" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
            {isRtl ? 'وصف الخطة' : 'Description'}
          </label>
          <textarea
            id="plan-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white resize-none"
            placeholder={isRtl ? 'أدخل تفاصيل ومميزات خطة الأسعار هذه...' : 'Describe the limits and features of this billing plan...'}
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {plan ? (isRtl ? 'حفظ التعديلات' : 'Save Changes') : (isRtl ? 'إنشاء الخطة' : 'Create Plan')}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
