'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { DrawerWrapper } from '@/components/shared/DrawerWrapper';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/shared/BadgeSystem';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Laptop,
  Smartphone,
  Tablet,
  Ruler,
  Languages,
  Moon,
  Sun,
  Shield,
  Eye,
  CheckCircle,
  HelpCircle,
  Play,
  Settings,
  ArrowRight,
  Maximize2
} from 'lucide-react';

type ShowcaseCategory = 'cards' | 'modals' | 'drawers' | 'tables' | 'dialog_nodes' | 'charts' | 'forms' | 'widgets';

export default function ComponentShowcasePage() {
  const { lang, theme } = useApp();
  const [activeCategory, setActiveCategory] = useState<ShowcaseCategory>('cards');
  const [previewWidth, setPreviewWidth] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [previewDir, setPreviewDir] = useState<'ltr' | 'rtl'>('ltr');
  const [previewDark, setPreviewDark] = useState<boolean>(true);
  const [showA11yOutlines, setShowA11yOutlines] = useState<boolean>(false);

  // Component Knobs / States
  const [cardLoading, setCardLoading] = useState(false);
  const [cardHoverable, setCardHoverable] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreventClose, setModalPreventClose] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>('right');
  const [tableLoading, setTableLoading] = useState(false);
  const [tableEmpty, setTableEmpty] = useState(false);
  const [nodeType, setNodeType] = useState<'trigger' | 'action' | 'condition'>('action');
  const [chartPulse, setChartPulse] = useState(true);
  const [formError, setFormError] = useState(false);

  // Dummy table headers and data
  const tableHeaders = ['ID', 'Name', 'Status', 'Channel', 'Deflection'];
  const tableData = [
    { id: '1', name: 'Farah AI Billing Bot', status: <Badge type="success">Active</Badge>, channel: 'WhatsApp', deflection: '82%' },
    { id: '2', name: 'Refund Handler Bot', status: <Badge type="warning">Syncing</Badge>, channel: 'Web Chat', deflection: '45%' },
    { id: '3', name: 'SIP Telephony Bot', status: <Badge type="neutral">Disabled</Badge>, channel: 'Voice SIP', deflection: '0%' }
  ];

  // Viewport sizes
  const widthClasses = {
    mobile: 'max-w-[375px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-full'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar: Navigation & Controls */}
      <aside className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/20">
              QA
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Component Showcase</h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold">
                Storybook Workspace
              </span>
            </div>
          </div>

          {/* Categories Selector */}
          <nav className="p-4 space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Component Groups
            </div>
            {[
              { id: 'cards', label: 'Operational Cards', icon: <Maximize2 className="w-4 h-4" /> },
              { id: 'modals', label: 'Modals & Overlays', icon: <Maximize2 className="w-4 h-4" /> },
              { id: 'drawers', label: 'Slide Drawers', icon: <Settings className="w-4 h-4" /> },
              { id: 'tables', label: 'Enterprise Tables', icon: <ArrowRight className="w-4 h-4" /> },
              { id: 'dialog_nodes', label: 'Workflow Nodes', icon: <Play className="w-4 h-4" /> },
              { id: 'charts', label: 'Sparklines & Pulses', icon: <Ruler className="w-4 h-4" /> },
              { id: 'forms', label: 'Forms & OTP', icon: <Shield className="w-4 h-4" /> },
              { id: 'widgets', label: 'Interactive Widgets', icon: <Eye className="w-4 h-4" /> }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ShowcaseCategory)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </nav>

          {/* Interactive Knobs Panel */}
          <div className="p-4 border-t border-slate-850 mt-auto bg-slate-950/80">
            <div className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Props Knobs (Live Modifiers)
            </div>
            
            {activeCategory === 'cards' && (
              <div className="space-y-3 px-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cardLoading} onChange={(e) => setCardLoading(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Loading State</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cardHoverable} onChange={(e) => setCardHoverable(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Hover Actions</span>
                </label>
              </div>
            )}

            {activeCategory === 'modals' && (
              <div className="space-y-3 px-3 text-xs">
                <button onClick={() => setModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded font-bold text-white text-xs">
                  Trigger Modal Wrapper
                </button>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" checked={modalPreventClose} onChange={(e) => setModalPreventClose(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Prevent Close on Esc/Overlay</span>
                </label>
              </div>
            )}

            {activeCategory === 'drawers' && (
              <div className="space-y-3 px-3 text-xs">
                <button onClick={() => setDrawerOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded font-bold text-white text-xs">
                  Open Drawer
                </button>
                <div className="flex gap-2 items-center">
                  <span>Anchor:</span>
                  <button onClick={() => setDrawerPosition('left')} className={`px-2 py-0.5 rounded text-[10px] ${drawerPosition === 'left' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Left</button>
                  <button onClick={() => setDrawerPosition('right')} className={`px-2 py-0.5 rounded text-[10px] ${drawerPosition === 'right' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Right</button>
                </div>
              </div>
            )}

            {activeCategory === 'tables' && (
              <div className="space-y-3 px-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tableLoading} onChange={(e) => setTableLoading(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Loading Indicator</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tableEmpty} onChange={(e) => setTableEmpty(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Empty Placeholder</span>
                </label>
              </div>
            )}

            {activeCategory === 'dialog_nodes' && (
              <div className="space-y-3 px-3 text-xs">
                <div>NodeType:</div>
                <div className="flex gap-1.5">
                  {(['trigger', 'action', 'condition'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNodeType(type)}
                      className={`flex-1 py-1 rounded text-[10px] capitalize ${nodeType === type ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCategory === 'charts' && (
              <div className="space-y-3 px-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={chartPulse} onChange={(e) => setChartPulse(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Pulsing Animations</span>
                </label>
              </div>
            )}

            {activeCategory === 'forms' && (
              <div className="space-y-3 px-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formError} onChange={(e) => setFormError(e.target.checked)} className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <span>Validation Error Border</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Global Toolbar Toggle */}
        <div className="p-4 border-t border-slate-850 bg-slate-950 flex justify-around text-slate-400">
          <button onClick={() => setPreviewDark(!previewDark)} title="Toggle Dark/Light Mode" className="p-2 hover:bg-slate-800 hover:text-white rounded-lg">
            {previewDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setPreviewDir(previewDir === 'ltr' ? 'rtl' : 'ltr')} title="Toggle LTR/RTL Layout" className="p-2 hover:bg-slate-800 hover:text-white rounded-lg">
            <Languages className="w-4 h-4" />
          </button>
          <button onClick={() => setShowA11yOutlines(!showA11yOutlines)} title="Toggle A11y Outlines Checker" className={`p-2 rounded-lg hover:bg-slate-800 ${showA11yOutlines ? 'text-emerald-500 bg-slate-800/80' : 'hover:text-white'}`}>
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Preview Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-slate-800 px-6 bg-slate-950/40 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-widest font-mono">Sandbox Viewport:</span>
            <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-800/80 flex">
              {[
                { id: 'mobile', label: 'Mobile (375px)', icon: <Smartphone className="w-3.5 h-3.5" /> },
                { id: 'tablet', label: 'Tablet (768px)', icon: <Tablet className="w-3.5 h-3.5" /> },
                { id: 'desktop', label: 'Desktop (100%)', icon: <Laptop className="w-3.5 h-3.5" /> }
              ].map((vp) => (
                <button
                  key={vp.id}
                  onClick={() => setPreviewWidth(vp.id as 'mobile' | 'tablet' | 'desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    previewWidth === vp.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={vp.label}
                >
                  {vp.icon}
                  <span>{vp.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-850 font-bold">DIR: {previewDir.toUpperCase()}</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-850 font-bold">THEME: {previewDark ? 'DARK' : 'LIGHT'}</span>
          </div>
        </header>

        {/* Dynamic Sandbox Frame Viewport */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-900/50 flex justify-center items-start">
          <div
            className={`w-full ${widthClasses[previewWidth]} transition-all duration-300 border border-dashed border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-950 ${
              previewDark ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'
            } ${showA11yOutlines ? '[&_*]:outline-1 [&_*]:outline-dashed [&_*]:outline-teal-500 [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-blue-500' : ''}`}
            dir={previewDir}
          >
            {/* Viewport Frame Header */}
            <div className="h-8 bg-slate-900 dark:bg-slate-980 border-b border-slate-850 flex items-center px-4 gap-1.5 select-none shrink-0 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="text-[10px] font-mono ml-4 truncate">{`Frame Viewport: ${previewWidth === 'desktop' ? 'Fluid Window' : previewWidth === 'tablet' ? '768px Width' : '375px Mobile'}`}</span>
            </div>

            {/* Sandbox Canvas */}
            <div className="p-8">
              {activeCategory === 'cards' && (
                <div className="space-y-6">
                  <SectionHeader title={previewDir === 'rtl' ? 'بطاقات العمليات' : 'Operational Card Showcase'} description="Visual containment surface units matching system rhythm." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OperationalCard className="border-rose-500/30">
                      <h4 className="font-bold text-slate-800 dark:text-white">SLA Compliance Warning</h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400">Warning: Inbound queue has crossed breach limits. Queue size: 14 callers waiting.</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-rose-500 font-bold font-mono">12m response breach time</span>
                          <Badge type="error">Breached</Badge>
                        </div>
                      </div>
                    </OperationalCard>

                    <OperationalCard className="border-indigo-500/20">
                      <h4 className="font-bold text-slate-800 dark:text-white">Farah AI Status</h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400">Farah AI is listening to active workspace calls. Deflection rate remains steady.</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-indigo-400 font-bold font-mono">Deflected: 82% today</span>
                          <Badge type="success">Healthy</Badge>
                        </div>
                      </div>
                    </OperationalCard>
                  </div>
                </div>
              )}

              {activeCategory === 'modals' && (
                <div className="space-y-6">
                  <SectionHeader title="Modals Overlay System" description="Interactive focus restoration overlays." />
                  <div className="p-8 border border-slate-800 rounded-2xl text-center bg-slate-900/30">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg"
                    >
                      Open Test Modal
                    </button>
                    {modalOpen && (
                      <ModalWrapper
                        isOpen={modalOpen}
                        title="Showcase Test Modal"
                        onClose={() => setModalOpen(false)}
                        preventCloseOnOverlayClick={modalPreventClose}
                        preventCloseOnEsc={modalPreventClose}
                      >
                        <div className="space-y-4 py-2 text-xs">
                          <p className="text-slate-400 leading-relaxed">
                            This modal forces keyboard focus bounds (Focus Trapped). Hit Tab or Shift+Tab to verify focus rings cycling back to input elements.
                          </p>
                          <div className="space-y-2">
                            <label className="block text-slate-500 font-bold">Input Field 1</label>
                            <input type="text" placeholder="Type something..." className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                            <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold">Cancel</button>
                            <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-bold">Save Changes</button>
                          </div>
                        </div>
                      </ModalWrapper>
                    )}
                  </div>
                </div>
              )}

              {activeCategory === 'drawers' && (
                <div className="space-y-6">
                  <SectionHeader title="Slide-Over Drawers" description="Edge-aligned settings panels." />
                  <div className="p-8 border border-slate-800 rounded-2xl text-center bg-slate-900/30">
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg"
                    >
                      Open Settings Drawer
                    </button>
                    {drawerOpen && (
                      <DrawerWrapper
                        title="Showcase Settings Panel"
                        isOpen={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        maxWidthClass="max-w-md"
                      >
                        <div className="space-y-4 py-4 text-xs">
                          <p className="text-slate-400 leading-relaxed">
                            This sliding drawer is configured with an edge anchor. It blocks focus from escaping to the main canvas.
                          </p>
                          <div className="space-y-2">
                            <label className="block text-slate-500 font-bold">Configuration Option A</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200">
                              <option>Option 1</option>
                              <option>Option 2</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-20">
                            <button onClick={() => setDrawerOpen(false)} className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 rounded text-slate-400 font-bold">Discard</button>
                            <button onClick={() => setDrawerOpen(false)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-bold">Apply Options</button>
                          </div>
                        </div>
                      </DrawerWrapper>
                    )}
                  </div>
                </div>
              )}

              {activeCategory === 'tables' && (
                <div className="space-y-6">
                  <SectionHeader title="Enterprise Grids" description="Dense data presentation with pagination styles." />
                  <EnterpriseTable
                    headers={tableHeaders}
                    loading={tableLoading}
                    empty={tableEmpty}
                  >
                    {!tableLoading && !tableEmpty && tableData.map((row) => (
                      <tr key={row.id} className="border-b border-slate-800/80 hover:bg-slate-900/40 text-xs">
                        <td className="p-3 font-mono text-slate-500">{row.id}</td>
                        <td className="p-3 font-bold text-slate-350">{row.name}</td>
                        <td className="p-3">{row.status}</td>
                        <td className="p-3 font-semibold text-slate-450">{row.channel}</td>
                        <td className="p-3 font-mono text-right text-slate-350">{row.deflection}</td>
                      </tr>
                    ))}
                  </EnterpriseTable>
                </div>
              )}

              {activeCategory === 'dialog_nodes' && (
                <div className="space-y-6">
                  <SectionHeader title="Dialog Builder Flow Elements" description="Visual editor components representing decision states." />
                  <div className="p-6 border border-slate-850 rounded-2xl flex justify-center bg-slate-900/10">
                    <div className={`p-4 rounded-2xl border-2 shadow-md w-60 space-y-2 ${
                      nodeType === 'trigger' ? 'border-amber-500 bg-amber-500/5' :
                      nodeType === 'condition' ? 'border-indigo-500 bg-indigo-500/5' :
                      'border-emerald-500 bg-emerald-500/5'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">{nodeType}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          nodeType === 'trigger' ? 'bg-amber-500' :
                          nodeType === 'condition' ? 'bg-indigo-500' :
                          'bg-emerald-500'
                        }`} />
                      </div>
                      <h4 className="font-bold text-xs">
                        {nodeType === 'trigger' ? 'Inbound SIP Trigger' :
                         nodeType === 'condition' ? 'SLA Queue Threshold' :
                         'Route to Human Agent'}
                      </h4>
                      <p className="text-[10px] text-slate-450">
                        {nodeType === 'trigger' ? 'Triggers chatbot initialization on inbound call session request.' :
                         nodeType === 'condition' ? 'Checks if queue size exceeds 12. Else routes to Bot.' :
                         'Transfers caller data to Liam Bennett.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'charts' && (
                <div className="space-y-6">
                  <SectionHeader title="Observability Pulse Units" description="Mini inline graphs and status widgets." />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/30 space-y-2">
                      <div className="text-[10px] font-bold text-slate-500">Live API Signal</div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-emerald-500 ${chartPulse ? 'animate-ping' : ''}`} />
                        <span className="text-xs font-bold font-mono">Ping: 12ms (Ready)</span>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/30 space-y-2">
                      <div className="text-[10px] font-bold text-slate-500">Deflection History</div>
                      <div className="h-8 w-32">
                        {/* Mini SVG Sparkline */}
                        <svg className="w-full h-full" viewBox="0 0 100 20">
                          <path d="M 0,10 L 20,15 L 40,5 L 60,18 L 80,8 L 100,12" fill="none" stroke="#6366f1" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/30 space-y-2">
                      <div className="text-[10px] font-bold text-slate-500">Trunk Call Load</div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full w-3/5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'forms' && (
                <div className="space-y-6">
                  <SectionHeader title="Credential Forms & Fields" description="Input boxes matching accessibility rules." />
                  <div className="max-w-md mx-auto p-6 border border-slate-800 rounded-2xl bg-slate-900/20 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400">Administrative Login ID</label>
                      <input
                        type="text"
                        defaultValue="admin@mpaas.com"
                        className={`w-full bg-slate-900 border text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 ${
                          formError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-850 focus:ring-indigo-500'
                        }`}
                      />
                      {formError && <span className="text-[10px] text-rose-500 font-bold block">Invalid format. Please supply a valid domain address.</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400">One-Time-Password (MFA)</label>
                      <div className="flex gap-2 justify-between">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            placeholder="•"
                            className="w-10 h-10 bg-slate-900 border border-slate-850 rounded-xl text-center font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'widgets' && (
                <div className="space-y-6">
                  <SectionHeader title="Operational Layout Controls" description="Interactive queue tabs and status selectors." />
                  <div className="p-6 border border-slate-850 rounded-2xl bg-slate-900/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-350">Active Queue Filter:</span>
                      <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button className="px-2.5 py-1 text-[10px] bg-indigo-600 text-white rounded font-bold">Standard</button>
                        <button className="px-2.5 py-1 text-[10px] text-slate-450 hover:text-slate-300">SLA Priority</button>
                        <button className="px-2.5 py-1 text-[10px] text-slate-450 hover:text-slate-300">VIP Clients</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Workforce Node</span>
                        <span>Agent Utilization</span>
                      </div>
                      <div className="p-3 bg-slate-900/40 rounded-xl flex items-center justify-between border border-slate-850">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold">Liam Bennett (Voice Agent)</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">88% active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
