import React, { useState } from 'react';
import { useIntegrationState } from '@/hooks/useIntegrationState';
import { useConnectorHealth } from '@/hooks/useConnectorHealth';
import { useSyncTimeline } from '@/hooks/useSyncTimeline';
import { MarketplaceGrid } from './MarketplaceGrid';
import { ConnectorRegistry } from './ConnectorRegistry';
import { OAuthConnectModal } from './OAuthConnectModal';
import { WebhookConsole } from './WebhookConsole';
import { SyncTimeline } from './SyncTimeline';
import { IntegrationHealthPanel } from './IntegrationHealthPanel';
import { ConflictResolutionDrawer } from './ConflictResolutionDrawer';
import { RetryQueuePanel } from './RetryQueuePanel';
import { ApiCredentialVault } from './ApiCredentialVault';
import { useApp } from '@/context/AppContext';
import { CRMConnector } from '@/data/seed/crmConnectorsSeed';
import { SyncConflict } from '@/data/seed/syncConflictSeed';
import { 
  Database, 
  Radio, 
  Key, 
  Activity, 
  ShieldAlert, 
  History, 
  Cpu, 
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Globe,
  Settings
} from 'lucide-react';

export function IntegrationsDashboard() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'webhooks' | 'vault' | 'audits'>('overview');
  
  // Custom states from hook
  const {
    connectors,
    connectConnector,
    disconnectConnector,
    saveMappings,
    conflicts,
    resolveConflict,
    apiCredentials,
    generateApiKey,
    revokeApiKey,
    rotateApiKey,
    auditLogs,
    retryQueue,
    triggerRetry
  } = useIntegrationState();

  // Connector health ticker drift
  const { metrics, getRateLimitStatus } = useConnectorHealth(connectors);

  // Sync timeline real-time log pushes
  const { events } = useSyncTimeline();

  // Dialog configurations
  const [selectedConnector, setSelectedConnector] = useState<CRMConnector | null>(null);
  const [activeOAuthConnector, setActiveOAuthConnector] = useState<CRMConnector | null>(null);
  const [activeResolutionConflict, setActiveResolutionConflict] = useState<SyncConflict | null>(null);

  const handleConnectorSelect = (conn: CRMConnector) => {
    // Sync selected connector object from current list state
    const current = connectors.find(c => c.id === conn.id);
    if (current) setSelectedConnector(current);
  };

  const handleDisconnect = (id: string) => {
    disconnectConnector(id);
    setSelectedConnector(null);
  };

  const handleSaveMappings = (id: string, mappings: any[]) => {
    saveMappings(id, mappings);
    // Refresh local selected connector state
    const current = connectors.find(c => c.id === id);
    if (current) setSelectedConnector({ ...current, mappings });
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-350">
      {/* Page Title & Main Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isRtl ? 'إدارة الربط و موصلات الأنظمة' : 'Ecosystem Integrations & CRM Connectors'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isRtl 
              ? 'تكوين ومزامنة حقول النظام مع قنوات CRM و الفوترة و مستمعي الويب هوك.' 
              : 'Synchronize ERP records, map Salesforce contacts, inspect outgoing webhooks, and issue client credentials.'}
          </p>
        </div>
      </div>

      {/* Main Tab Router Selectors (Hidden if deep configuring) */}
      {!selectedConnector && (
        <div className="flex border-b border-slate-200 dark:border-slate-850">
          {[
            { id: 'overview', label: isRtl ? 'لوحة التحكم والمزامنة' : 'Sync Console', icon: <Activity className="w-4 h-4" /> },
            { id: 'marketplace', label: isRtl ? 'سوق الموصلات' : 'App Marketplace', icon: <Database className="w-4 h-4" /> },
            { id: 'webhooks', label: isRtl ? 'الويب هوك' : 'Webhooks Console', icon: <Radio className="w-4 h-4" /> },
            { id: 'vault', label: isRtl ? 'خزنة المفاتيح API' : 'API Token Vault', icon: <Key className="w-4 h-4" /> },
            { id: 'audits', label: isRtl ? 'سجلات الرقابة والأمن' : 'Audit Trail Logs', icon: <History className="w-4 h-4" /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3.5 border-b-2 font-bold transition-all -mb-px text-[11px] ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-white'
                    : 'border-transparent text-slate-450 hover:text-slate-350'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* RENDER ACTIVE TAB VIEW */}
      {selectedConnector ? (
        <ConnectorRegistry
          connector={selectedConnector}
          onDisconnect={handleDisconnect}
          onSaveMappings={handleSaveMappings}
          onBack={() => setSelectedConnector(null)}
          isRtl={isRtl}
        />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Conflicts and Retry summary alert */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Sync Conflicts Drawer Trigger Box */}
                <div className="bg-[#0b0f19]/35 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
                  <h4 className="text-[10px] uppercase text-slate-500 tracking-wider font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    {isRtl ? 'التعارضات النشطة' : 'Database Sync Conflicts'}
                  </h4>
                  <p className="text-[9.5px] text-slate-500 font-normal leading-relaxed">
                    Merge schema discrepancies side-by-side to keep a single customer profile index.
                  </p>

                  {conflicts.length === 0 ? (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-2xl flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>{isRtl ? 'رائع! لا توجد أي تعارضات' : 'All customer profiles unified.'}</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {conflicts.map(conf => (
                        <div
                          key={conf.id}
                          onClick={() => setActiveResolutionConflict(conf)}
                          className="p-3 bg-slate-900/35 hover:bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-2xl flex justify-between items-center cursor-pointer transition-all"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-white text-[11px] block">{conf.customerName}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-mono">
                              Detected: {conf.sourceConnectorId}
                            </span>
                          </div>
                          <button className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5">
                            {isRtl ? 'حل التعارض' : 'Resolve'}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Retry monitor panel */}
                <div className="lg:col-span-2">
                  <RetryQueuePanel
                    queue={retryQueue}
                    onRetry={triggerRetry}
                    isRtl={isRtl}
                  />
                </div>
              </div>

              {/* Uptime Status Ring health monitor panel */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">API Operational Health Telemetry</h4>
                <IntegrationHealthPanel
                  connectors={connectors}
                  healthMetrics={metrics}
                  getRateLimit={getRateLimitStatus}
                  isRtl={isRtl}
                />
              </div>

              {/* Live sync timeline stream */}
              <SyncTimeline
                events={events}
                isRtl={isRtl}
              />
            </div>
          )}

          {activeTab === 'marketplace' && (
            <MarketplaceGrid
              connectors={connectors}
              onSelectConnector={handleConnectorSelect}
              onLaunchOAuth={setActiveOAuthConnector}
              isRtl={isRtl}
            />
          )}

          {activeTab === 'webhooks' && (
            <WebhookConsole
              isRtl={isRtl}
            />
          )}

          {activeTab === 'vault' && (
            <ApiCredentialVault
              credentials={apiCredentials}
              onGenerate={generateApiKey}
              onRevoke={revokeApiKey}
              onRotate={rotateApiKey}
              isRtl={isRtl}
            />
          )}

          {activeTab === 'audits' && (
            <div className="bg-[#0b0f19]/35 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-850 pb-4">
                <History className="w-5 h-5 text-blue-400" />
                {isRtl ? 'سجلات الرقابة الأمنية للمنظومة' : 'Ecosystem Integration Audit Log'}
              </h3>

              <div className="space-y-3.5">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-900/25 border border-slate-850/80 rounded-2xl space-y-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-slate-300 font-semibold leading-relaxed">
                        {log.action}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5 text-[9.5px] text-slate-500 font-mono">
                        <span className="text-white font-bold">{log.user}</span>
                        <span>•</span>
                        <span>{log.role}</span>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className="font-mono text-slate-500 text-[10px] whitespace-nowrap">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        log.status === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* OVERLAY MODALS & DRAWER PORTALS */}

      {/* 1. OAuth Setup Dialog */}
      {activeOAuthConnector && (
        <OAuthConnectModal
          connector={activeOAuthConnector}
          onClose={() => setActiveOAuthConnector(null)}
          onConnect={(cid, sec, scopes) => connectConnector(activeOAuthConnector.id, cid, sec, scopes)}
          isRtl={isRtl}
        />
      )}

      {/* 2. Database Discrepancy Merge drawer */}
      {activeResolutionConflict && (
        <ConflictResolutionDrawer
          conflict={activeResolutionConflict}
          onClose={() => setActiveResolutionConflict(null)}
          onResolve={resolveConflict}
          isRtl={isRtl}
        />
      )}
    </div>
  );
}
export default IntegrationsDashboard;
