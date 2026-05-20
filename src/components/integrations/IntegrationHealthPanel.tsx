import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';
import { ConnectorHealthMetrics } from '@/data/seed/integrationHealthSeed';
import { CRMConnector } from '@/data/seed/crmConnectorsSeed';

interface IntegrationHealthPanelProps {
  connectors: CRMConnector[];
  healthMetrics: ConnectorHealthMetrics[];
  getRateLimit: (connectorId: string, used: number, max: number) => { used: number, max: number, percentage: number };
  isRtl?: boolean;
}

export function IntegrationHealthPanel({ connectors, healthMetrics, getRateLimit, isRtl = false }: IntegrationHealthPanelProps) {
  // Find only connected connectors
  const activeConns = connectors.filter(c => c.status !== 'disconnected');

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-350">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeConns.map(conn => {
          const metrics = healthMetrics.find(m => m.connectorId === conn.id);
          if (!metrics) return null;

          const rate = getRateLimit(conn.id, conn.rateLimitUsed, conn.rateLimitMax);
          const isDegraded = conn.status === 'degraded';
          const isFailed = rate.percentage >= 100;

          // Latency chart calculations (SVG line builder)
          const latencyValues = metrics.history24h.map(h => h.latencyMs);
          const maxVal = Math.max(...latencyValues, 100);
          const minVal = Math.min(...latencyValues, 20);
          const valRange = maxVal - minVal || 1;

          // Build SVG path
          const pathPoints = metrics.history24h.map((h, i) => {
            const x = (i / (metrics.history24h.length - 1)) * 140;
            const y = 38 - ((h.latencyMs - minVal) / valRange) * 28;
            return `${x},${y}`;
          }).join(' L ');
          const sparklinePath = pathPoints ? `M ${pathPoints}` : '';

          return (
            <div
              key={conn.id}
              className="bg-[#0b0f19]/35 border border-slate-850 rounded-3xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between"
            >
              {/* Connector Card Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-[11px]">{conn.name}</h4>
                  <span className="text-[9px] text-slate-500 font-mono block">Uptime (24h): {metrics.uptime24h}%</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase ${
                  isFailed
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450'
                    : isDegraded
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-450'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450'
                }`}>
                  {isFailed ? 'LIMIT EXCEEDED' : isDegraded ? 'DEGRADED' : 'OPERATIONAL'}
                </span>
              </div>

              {/* Progress & Telemetry */}
              <div className="grid grid-cols-2 gap-4 py-4.5 border-y border-slate-850/60 my-4">
                {/* Rate limit Gauge */}
                <div className="space-y-1.5 flex flex-col justify-center">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{isRtl ? 'حصة API' : 'API Quota'}</span>
                    <span className="font-mono">{rate.percentage}%</span>
                  </div>
                  {/* Gauge bar */}
                  <div className="w-full h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        rate.percentage > 90 ? 'bg-rose-500' : rate.percentage > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${rate.percentage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {rate.used.toLocaleString()} / {rate.max.toLocaleString()} reqs
                  </span>
                </div>

                {/* Avg Latency & sparkline */}
                <div className="space-y-1.5 flex flex-col justify-center items-end text-right">
                  <div className="flex gap-1 items-center text-[10px] text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isRtl ? 'الاستجابة' : 'Latency'}</span>
                  </div>
                  
                  <span className="font-mono font-bold text-white text-[12px]">
                    {metrics.avgLatency}ms
                  </span>

                  {/* Sparkline Canvas */}
                  <div className="w-[140px] h-[38px] opacity-70">
                    <svg className="w-full h-full overflow-visible">
                      <path
                        d={sparklinePath}
                        fill="none"
                        stroke={isDegraded ? '#f59e0b' : '#3b82f6'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status details footer */}
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>TOTAL CALLS: {metrics.totalCalls24h.toLocaleString()}</span>
                <span>ERRORS: {metrics.errorCount24h}</span>
              </div>
            </div>
          );
        })}

        {activeConns.length === 0 && (
          <div className="col-span-full text-center py-10 bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl text-slate-500">
            {isRtl ? 'لا توجد موصلات نشطة. اربط الموصلات لرؤية مؤشرات الصحة.' : 'No active connectors. Establish API connections to observe health diagnostics.'}
          </div>
        )}
      </div>
    </div>
  );
}
