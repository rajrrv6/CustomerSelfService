import React, { useState } from 'react';
import { useWebhookSimulator } from '@/hooks/useWebhookSimulator';
import { EventLogTable } from './EventLogTable';
import { Radio, Plus, Trash2, Send, ShieldCheck, Eye, ToggleLeft, ToggleRight, X, Info } from 'lucide-react';

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

  // Manual Trigger parameters
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
    <div className="space-y-6 text-xs font-semibold text-slate-350">
      {/* Overview & Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            {isRtl ? 'لوحة تحكم الويب هوك (Webhooks Console)' : 'Outgoing Webhooks Console'}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">Broadcast support transactions to external endpoints in near real-time</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          {isRtl ? 'إضافة مستمع ويب هوك' : 'Register Webhook'}
        </button>
      </div>

      {/* Endpoints and Trigger panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhook Endpoints registry list */}
        <div className="lg:col-span-2 bg-[#0b0f19]/35 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
          <h4 className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Configured Listeners ({endpoints.length})</h4>

          {endpoints.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl text-slate-500">
              {isRtl ? 'لا توجد روابط مستمعة مبرمجة حالياً.' : 'No webhook listeners configured. Get started by registering one.'}
            </div>
          ) : (
            <div className="space-y-3">
              {endpoints.map(end => (
                <div
                  key={end.id}
                  className={`bg-slate-950/20 border border-slate-850/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-800 ${
                    !end.active ? 'opacity-55' : ''
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="font-mono text-white text-[10.5px] select-all truncate block pr-4" title={end.url}>
                      {end.url}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Secret Token:</span>
                      <span className="font-mono text-[9px] text-slate-450">{end.secret}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[9.5px] text-slate-400">
                        {isRtl ? `مشترك بـ ${end.events.length} أحداث` : `Listening to: ${end.events.length} events`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {end.events.map(ev => (
                        <span key={ev} className="font-mono text-[8.5px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 border-slate-850 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => toggleEndpoint(end.id)}
                      className="p-2 border border-slate-850 hover:border-slate-750 rounded-xl text-slate-400 hover:text-white transition-all"
                      title={end.active ? 'Pause Endpoint' : 'Activate Endpoint'}
                    >
                      {end.active ? <ToggleRight className="w-5 h-5 text-blue-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                    </button>
                    <button
                      onClick={() => deleteEndpoint(end.id)}
                      className="p-2 border border-slate-850 hover:border-rose-500/25 rounded-xl text-slate-500 hover:text-rose-405 transition-all"
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

        {/* Webhook dynamic Event Test Launcher */}
        <div className="bg-[#0b0f19]/35 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4 h-fit">
          <h4 className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Simulated Event Fire Tester</h4>
          <p className="text-[9.5px] text-slate-500 font-normal leading-relaxed">
            Dispatch mock event payloads onto active configured endpoints to debug listener servers.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <label className="block text-slate-450 text-[10px] uppercase font-bold tracking-wider">Event Trigger Type</label>
              <select
                value={triggerEventType}
                onChange={(e) => setTriggerEventType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-350 focus:outline-none focus:border-blue-500 font-medium"
              >
                {webhookCatalog.map(cat => (
                  <option key={cat.type} value={cat.type}>
                    #{cat.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-450 text-[10px] uppercase font-bold tracking-wider">Target Endpoint</label>
              <select
                value={triggerTargetEndpoint}
                onChange={(e) => setTriggerTargetEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-350 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">{isRtl ? 'إرسال لجميع المشتركين' : 'Broadcast to all listeners'}</option>
                {endpoints.filter(e => e.active).map(e => (
                  <option key={e.id} value={e.id}>
                    {e.url.substring(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Catalog Info block */}
            <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex gap-2 font-normal leading-relaxed text-slate-400">
              <Info className="w-4 h-4 text-blue-450 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-[9.5px]">Trigger Context:</span>
                {webhookCatalog.find(c => c.type === triggerEventType)?.description}
              </div>
            </div>

            <button
              onClick={handleLaunchTrigger}
              disabled={endpoints.filter(e => e.active).length === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              <Send className="w-4 h-4" />
              {isRtl ? 'إرسال حدث الويب هوك' : 'Fire Test Payload'}
            </button>
          </div>
        </div>
      </div>

      {/* Webhook Delivery logs table underneath */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Webhook Activity Logs</h4>
          <button
            onClick={clearLogs}
            className="text-[10px] font-bold text-rose-455 hover:underline"
          >
            {isRtl ? 'مسح السجلات' : 'Clear logs history'}
          </button>
        </div>

        <EventLogTable
          logs={logs}
          onRetryLog={(type, url) => {
            // Find appropriate endpoint id to trigger test
            const end = endpoints.find(e => e.url === url);
            triggerMockEvent(type, end?.id);
          }}
          isRtl={isRtl}
        />
      </div>

      {/* Webhook Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center bg-slate-950/40">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                {isRtl ? 'تسجيل مستمع ويب هوك جديد' : 'Register Webhook Listener'}
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Endpoint Receiver URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.domain.com/v1/webhook"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Event Subscriptions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-850 bg-slate-900/60 p-3.5 rounded-2xl">
                  {webhookCatalog.map((cat) => {
                    const isChecked = selectedEvents.includes(cat.type);
                    return (
                      <label
                        key={cat.type}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'border-blue-500/20 bg-blue-500/5 text-blue-400'
                            : 'border-slate-800 bg-transparent text-slate-450 hover:border-slate-750'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEventCheckbox(cat.type)}
                          className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                        />
                        <div>
                          <span className="font-mono text-[10px] font-bold block">#{cat.type}</span>
                          <span className="text-[9px] text-slate-500 font-medium block font-sans mt-0.5">{cat.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white font-bold transition-all text-center"
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
