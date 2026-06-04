'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { mockTenantMetering, mockTenants } from './mockTenantData';
import { SVGLineChart, SVGBarChart } from '@/components/dashboard/Charts';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Activity, Database, Key, Server, Cpu, AlertTriangle } from 'lucide-react';

export function TenantMeteringTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const tmT = (t.superAdmin as any).tenantManagement || {
    metering: {
      title: 'Resource Consumption & Utilization',
      desc: 'Real-time telemetry of CPU, memory, API traffic, and conversational token usage.',
      apiCalls: 'API Gateway Requests',
      tokenUsage: 'LLM Inference Tokens',
      cpuUsage: 'Database CPU Load',
      dbSize: 'Vector DB Row Count',
      periodWeek: 'Last 7 Days',
      periodMonth: 'Last 30 Days',
      consumptionCap: 'Consumption Budget',
      warningThreshold: 'Quota Warning (80% reached)'
    }
  };

  const [selectedTenantId, setSelectedTenantId] = useState(mockTenants[0].id);

  const selectedMetering = mockTenantMetering.find(m => m.tenantId === selectedTenantId) || mockTenantMetering[0];
  const selectedTenant = mockTenants.find(t => t.id === selectedTenantId) || mockTenants[0];

  // Aggregate Metrics (Sums across all tenants)
  const totalApiCallSum = mockTenantMetering.reduce((sum, tm) => sum + tm.history.reduce((a, h) => a + h.apiRequests, 0), 0);
  const totalTokenSum = mockTenantMetering.reduce((sum, tm) => sum + tm.history.reduce((a, h) => a + h.tokenUsage, 0), 0);
  const totalDbRowsSum = mockTenantMetering.reduce((sum, tm) => sum + tm.dbRowsCount, 0);

  // Math formatting helpers
  const formatNumber = (num: number) => {
    return num.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  const formatMillions = (num: number) => {
    const val = num / 1000000;
    return val.toFixed(2) + (isRtl ? ' مليون' : 'M');
  };

  const formatThousands = (num: number) => {
    const val = num / 1000;
    return val.toFixed(1) + (isRtl ? ' ألف' : 'k');
  };

  // Quota percentage calculations
  const dbPercent = Math.min(100, Math.round((selectedMetering.dbRowsCount / selectedMetering.dbRowsLimit) * 100));
  
  // Total API requests in the last 7 days for the selected tenant
  const selectedTenant7dRequests = selectedMetering.history.reduce((a, h) => a + h.apiRequests, 0);
  const apiPercent = Math.min(100, Math.round((selectedTenant7dRequests / selectedMetering.apiCallsLimit) * 100));

  // Total tokens in the last 7 days for the selected tenant
  const selectedTenant7dTokens = selectedMetering.history.reduce((a, h) => a + h.tokenUsage, 0);
  const tokenPercent = Math.min(100, Math.round((selectedTenant7dTokens / selectedMetering.tokensLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard hoverEffect={false} className="border-l-4 border-l-blue-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {isRtl ? 'إجمالي طلبات البوابة (آخر 7 أيام)' : 'Global API Requests (7d)'}
              </span>
              <Activity className="w-4 h-4 text-blue-500 opacity-70" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white font-mono">
                {formatNumber(totalApiCallSum)}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-3 block font-semibold">
            {isRtl ? 'مجموع استهلاك بوابة API لكافة المستأجرين.' : 'Combined gateway calls across active workspaces.'}
          </span>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-purple-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {isRtl ? 'إجمالي استهلاك الرموز المميزة (7d)' : 'Global Token Vol (7d)'}
              </span>
              <Key className="w-4 h-4 text-purple-500 opacity-70" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white font-mono">
                {formatMillions(totalTokenSum)}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-3 block font-semibold">
            {isRtl ? 'حجم رموز استدلال LLM التي تم توليدها.' : 'Aggregated inference tokens processed.'}
          </span>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-emerald-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {isRtl ? 'إجمالي السجلات المتجهة في المجموعات' : 'Global Vector Vectors'}
              </span>
              <Database className="w-4 h-4 text-emerald-500 opacity-70" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white font-mono">
                {formatThousands(totalDbRowsSum)}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-3 block font-semibold">
            {isRtl ? 'إجمالي متجهات Pinecone عبر كافة الفهارس.' : 'Total document vectors in Pinecone indexes.'}
          </span>
        </OperationalCard>
      </div>

      {/* Tenant Selector panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white">
            {isRtl ? 'تحليلات استهلاك المستأجر المنفرد' : 'Single-Tenant Analytics telemetry'}
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isRtl ? 'اختر مستأجراً لعرض بيانات استهلاك موارد الخوادم والـ API.' : 'Select a tenant from the registry to view isolated compute consumption.'}
          </p>
        </div>

        <select
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          className="text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64 cursor-pointer"
        >
          {mockTenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.domain})
            </option>
          ))}
        </select>
      </div>

      {/* Tenant Specific Charts & Quotas grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <SVGLineChart
            data={selectedMetering.history.map(pt => pt.apiRequests)}
            labels={selectedMetering.history.map(pt => pt.date)}
            title={`${isRtl ? 'حجم طلبات البوابة اليومي لـ' : 'Daily API Gateway Volume —'} ${selectedMetering.tenantName}`}
            gradientColor="#3b82f6"
          />

          <SVGBarChart
            data={selectedMetering.history.map(pt => Math.round(pt.tokenUsage / 1000))}
            labels={selectedMetering.history.map(pt => pt.date)}
            title={`${isRtl ? 'استهلاك الرموز اليومي (بالألف) لـ' : 'Daily LLM Tokens Consumption (K Tokens) —'} ${selectedMetering.tenantName}`}
            barColor="#8b5cf6"
          />
        </div>

        {/* Right column: Quota HUD */}
        <div className="space-y-6">
          {/* Quotas panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'حدود الحصص المستهلكة' : 'Allocated Compute Quotas'}</span>
            </h4>

            {/* Quota 1: Vector Storage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-350">{isRtl ? 'سجلات قاعدة البيانات المتجهة' : 'Vector DB Records'}</span>
                <span className="font-mono text-slate-500">{formatNumber(selectedMetering.dbRowsCount)} / {formatNumber(selectedMetering.dbRowsLimit)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    dbPercent > 80 ? 'bg-red-500' : dbPercent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${dbPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span>{isRtl ? 'الحد المخصص للبيانات' : 'Allocated Index Cap'}</span>
                <span>{dbPercent}%</span>
              </div>
            </div>

            {/* Quota 2: API Requests */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-350">{isRtl ? 'حجم اتصالات البوابة (7 أيام)' : '7d API Call Limit'}</span>
                <span className="font-mono text-slate-500">{formatNumber(selectedTenant7dRequests)} / {formatNumber(selectedMetering.apiCallsLimit)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    apiPercent > 80 ? 'bg-red-500' : apiPercent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${apiPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span>{isRtl ? 'حصة الاستدعاء الأسبوعية' : 'Rolling Weekly Limit'}</span>
                <span>{apiPercent}%</span>
              </div>
            </div>

            {/* Quota 3: Token Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-350">{isRtl ? 'رموز استدلال LLM المسموحة (7 أيام)' : '7d LLM Token Quota'}</span>
                <span className="font-mono text-slate-500">{formatNumber(selectedTenant7dTokens)} / {formatNumber(selectedMetering.tokensLimit)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    tokenPercent > 80 ? 'bg-red-500' : tokenPercent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${tokenPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span>{isRtl ? 'حصة استهلاك النماذج' : 'Rolling Inference Limit'}</span>
                <span>{tokenPercent}%</span>
              </div>
            </div>
          </div>

          {/* Alert panel for high utilization */}
          {(dbPercent > 80 || apiPercent > 80 || tokenPercent > 80) && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide font-mono">
                  {isRtl ? 'تنبيه تجاوز الحصة النسبية!' : 'Resource Threshold Warning!'}
                </h5>
                <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 leading-relaxed font-semibold">
                  {isRtl
                    ? `المستأجر "${selectedTenant.name}" تجاوز عتبة 80% المسموحة في بعض موارد النظام. قد يتم تقييد عمليات استعلام البوابة قريباً.`
                    : `Tenant "${selectedTenant.name}" has breached the 80% advisory utilization threshold on allocated resources. Limits may apply soon.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Compute Spec */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
            <h5 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>{isRtl ? 'مواصفات موارد الاستدلال' : 'Inference Node Specification'}</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
              <div>
                <p className="text-slate-400">{isRtl ? 'أقصى تزامن للطلبات' : 'Max Concurrency'}</p>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">50 req/sec</p>
              </div>
              <div>
                <p className="text-slate-400">{isRtl ? 'مجموعة عقد الحوسبة' : 'Compute Zone'}</p>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">me-central-1</p>
              </div>
              <div className="mt-1">
                <p className="text-slate-400">{isRtl ? 'عزل البيانات' : 'Data Residency'}</p>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{isRtl ? 'المملكة العربية السعودية' : 'KSA (Local Cloud)'}</p>
              </div>
              <div className="mt-1">
                <p className="text-slate-400">{isRtl ? 'آلية التشفير' : 'Encryption State'}</p>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">AES-256 GCM</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
