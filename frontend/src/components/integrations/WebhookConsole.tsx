import React, { useState } from 'react';
import { useWebhookSimulator } from '@/hooks/useWebhookSimulator';
import { EventLogTable } from './EventLogTable';
import { Radio, Plus, Trash2, Send, ShieldCheck, ToggleLeft, ToggleRight, X, Info } from 'lucide-react';

interface WebhookConsoleProps {
  isRtl?: boolean;
}

export function WebhookConsole({ isRtl = false }: WebhookConsoleProps) {
  const {
    endpoints,
    addEndpoint,
    toggleEndpoint,
    deleteEndpoint,
    logs,
    triggerMockEvent,
    clearLogs,
    webhookCatalog
  } = useWebhookSimulator();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['ticket.created']);

  const [triggerEventType, setTriggerEventType] = useState('ticket.created');
  const [triggerTargetEndpoint, setTriggerTargetEndpoint] = useState('all');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    addEndpoint(newUrl, selectedEvents);
    setNewUrl('');
    setSelectedEvents(['ticket.created']);
    setShowAddModal(false);
  };

  const handleEventCheckbox = (type: string) => {
    setSelectedEvents(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleLaunchTrigger = () => {
    triggerMockEvent(
      triggerEventType,
      triggerTargetEndpoint === 'all' ? undefined : triggerTargetEndpoint
    );
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header & action button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-500" />
            {isRtl ? 'لوحة تحكم الويب هوك (Webhooks Console)' : 'Outgoing Webhooks Console'}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Broadcast support transactions to external endpoints in near real-time</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          {isRtl ? 'إضافة مستمع ويب هوك' : 'Register Webhook'}
        </button>
      </div>

      {/* Endpoints + Trigger panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint registry */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
          <h4 className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold font-mono">Configured Listeners ({endpoints.length})</h4>

          {endpoints.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
              {isRtl ? 'لا توجد روابط مستمعة مبرمجة حالياً.' : 'No webhook listeners configured. Get started by registering one.'}
            </div>
          ) : (
            <div className="space-y-3">
              {endpoints.map(end => (
                <div
                  key={end.id}
                  className={`bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                    !end.active ? 'opacity-55' : ''
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="font-mono text-slate-800 dark:text-white text-[10.5px] select-all truncate block pr-4" title={end.url}>
                      {end.url}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Secret Token:</span>
                      <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400">{end.secret}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400">
                        {isRtl ? `مشترك بـ ${end.events.length} أحداث` : `Listening to: ${end.events.length} events`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {end.events.map(ev => (
                        <span key={ev} className="font-mono text-[8.5px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => toggleEndpoint(end.id)}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                      title={end.active ? 'Pause Endpoint' : 'Activate Endpoint'}
                    >
                      {end.active ? <ToggleRight className="w-5 h-5 text-blue-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => deleteEndpoint(end.id)}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/25 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                      title="Delete Endpoint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Test Launcher */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 h-fit shadow-sm">
          <h4 className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold font-mono">Simulated Event Fire Tester</h4>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Dispatch mock event payloads onto active configured endpoints to debug listener servers.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Event Trigger Type</label>
              <select
                value={triggerEventType}
                onChange={(e) => setTriggerEventType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
              >
                {webhookCatalog.map(cat => (
                  <option key={cat.type} value={cat.type}>
                    #{cat.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Target Endpoint</label>
              <select
                value={triggerTargetEndpoint}
                onChange={(e) => setTriggerTargetEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">{isRtl ? 'إرسال لجميع المشتركين' : 'Broadcast to all listeners'}</option>
                {endpoints.filter(e => e.active).map(e => (
                  <option key={e.id} value={e.id}>
                    {e.url.substring(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Context info */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/15 rounded-xl flex gap-2 font-normal leading-relaxed text-slate-600 dark:text-slate-400">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200 block text-[9.5px]">Trigger Context:</span>
                <span className="text-[9px]">{webhookCatalog.find(c => c.type === triggerEventType)?.description}</span>
              </div>
            </div>

            <button
              onClick={handleLaunchTrigger}
              disabled={endpoints.filter(e => e.active).length === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              <Send className="w-4 h-4" />
              {isRtl ? 'إرسال حدث الويب هوك' : 'Fire Test Payload'}
            </button>
          </div>
        </div>
      </div>

      {/* Activity logs */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold font-mono">Webhook Activity Logs</h4>
          <button
            onClick={clearLogs}
            className="text-[10px] font-bold text-red-500 dark:text-red-400 hover:underline"
          >
            {isRtl ? 'مسح السجلات' : 'Clear logs history'}
          </button>
        </div>

        <EventLogTable
          logs={logs}
          onRetryLog={(type, url) => {
            const end = endpoints.find(e => e.url === url);
            triggerMockEvent(type, end?.id);
          }}
          isRtl={isRtl}
        />
      </div>

      {/* Webhook Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/20">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                {isRtl ? 'تسجيل مستمع ويب هوك جديد' : 'Register Webhook Listener'}
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Endpoint Receiver URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.domain.com/v1/webhook"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Event Subscriptions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl">
                  {webhookCatalog.map((cat) => {
                    const isChecked = selectedEvents.includes(cat.type);
                    return (
                      <label
                        key={cat.type}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEventCheckbox(cat.type)}
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                        />
                        <div>
                          <span className="font-mono text-[10px] font-bold block">#{cat.type}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block font-sans mt-0.5">{cat.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all text-center"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={selectedEvents.length === 0}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-500/10 text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isRtl ? 'تفعيل وتسجيل' : 'Register Receiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
