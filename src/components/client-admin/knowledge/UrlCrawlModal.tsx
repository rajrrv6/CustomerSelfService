'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Link as LinkIcon, RefreshCw, AlertTriangle, ShieldCheck, Play, StopCircle } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

interface UrlCrawlModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onAddSource: (name: string, urlCount: number, depthLimit: number) => void;
}

interface LogEntry {
  url: string;
  status: 'pending' | 'crawled' | 'indexed' | 'skipped' | 'failed';
  chunks?: number;
  time: string;
}

export function UrlCrawlModal({ isOpen, onClose, lang, onAddSource }: UrlCrawlModalProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [urlInput, setUrlInput] = useState('');
  const [crawlDepth, setCrawlDepth] = useState<number>(3);
  const [includePattern, setIncludePattern] = useState('/docs/*, /help/*');
  const [excludePattern, setExcludePattern] = useState('/admin/*, /api/*, /oauth/*');
  
  // Crawler running states
  const [crawlState, setCrawlState] = useState<'idle' | 'crawling' | 'compiling' | 'success' | 'failed'>('idle');
  const [crawlerLogs, setCrawlerLogs] = useState<LogEntry[]>([]);
  const [crawledCount, setCrawledCount] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [simulateError, setSimulateError] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [crawlerLogs]);

  // Simulated web scraping steps
  useEffect(() => {
    if (crawlState !== 'crawling') return;

    let step = 0;
    const paths = [
      '/index.html',
      '/docs/introduction',
      '/docs/getting-started',
      '/docs/configuration/tokens',
      '/docs/security/pii-masking',
      '/help/kb-resolution-timings',
      '/docs/api-integrations/webhook-spikes',
      '/help/order-refund-exceptions',
    ];

    const interval = setInterval(() => {
      if (step >= paths.length) {
        clearInterval(interval);
        if (simulateError) {
          setCrawlState('failed');
          pushToast(
            'error',
            isRtl ? 'فشل الزحف الدلالي' : 'Crawler Terminated',
            isRtl ? 'واجه الزاحف خطأ 403 Forbidden في المضيف البعيد.' : 'Remote host refused gateway headers (403 Forbidden).'
          );
        } else {
          setCrawlState('compiling');
          setTimeout(() => {
            setCrawlState('success');
            pushToast(
              'success',
              isRtl ? 'اكتملت الفهرسة بنجاح' : 'Crawl Index Synthesized',
              isRtl ? 'تم تحديث قاعدة بيانات المتجهات لـ RAG.' : 'Completed HTML indexing for RAG compilation.'
            );
          }, 1500);
        }
        return;
      }

      const path = paths[step];
      const fullUrl = `${urlInput.replace(/\/$/, '')}${path}`;
      const generatedChunks = Math.floor(8 + Math.random() * 22);
      
      const newLog: LogEntry = {
        url: fullUrl,
        status: 'indexed',
        chunks: generatedChunks,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setCrawlerLogs((prev) => [...prev, newLog]);
      setCrawledCount((c) => c + 1);
      setTotalChunks((tc) => tc + generatedChunks);
      step++;
    }, 900);

    return () => clearInterval(interval);
  }, [crawlState, urlInput, simulateError, isRtl, pushToast]);

  const handleStartCrawl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    // Basic URL regex check
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!pattern.test(urlInput)) {
      pushToast(
        'error',
        isRtl ? 'رابط الموقع غير صالح' : 'Invalid URL String',
        isRtl ? 'يرجى إدخال رابط يبدأ بـ http:// أو https://' : 'Please provide a valid fully qualified website domain.'
      );
      return;
    }

    setCrawlerLogs([
      {
        url: `Initializing crawl for ${urlInput} (Depth limit: ${crawlDepth})`,
        status: 'pending',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      {
        url: 'Evaluating robots.txt schema rules... Allowed.',
        status: 'pending',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);
    setCrawledCount(0);
    setTotalChunks(0);
    setCrawlState('crawling');
  };

  const handleStopCrawl = () => {
    setCrawlState('idle');
    pushToast('info', isRtl ? 'تم إيقاف الزحف' : 'Crawler Halted', isRtl ? 'تم إيقاف عملية الزحف الفهرسي يدوياً.' : 'Web scraper loop suspended by supervisor.');
  };

  const handleCommitCrawl = () => {
    onAddSource(urlInput, crawledCount, crawlDepth);
    setCrawlerLogs([]);
    setUrlInput('');
    setCrawlState('idle');
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'زحف وفهرسة موقع ويب' : 'Ingest Website URL (Web Crawl)'}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-5 text-xs font-semibold text-slate-800 dark:text-slate-200">
        
        {crawlState === 'idle' ? (
          <form onSubmit={handleStartCrawl} className="space-y-4">
            <div>
              <label htmlFor="url-input-field" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
                Seed Site URL to Crawl
              </label>
              <div className="relative">
                <input
                  id="url-input-field"
                  type="text"
                  required
                  placeholder="https://docs.myproduct.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
                <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
                  Crawl Depth Threshold
                </label>
                <select
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value={1}>1 (Only seed page)</option>
                  <option value={2}>2 (Seed + child anchors)</option>
                  <option value={3}>3 (Recommended depth)</option>
                  <option value={4}>4 (Extended recursion)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase font-mono mb-1.5">
                  Simulate Scraping Error
                </label>
                <div className="flex items-center justify-between h-9 px-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-mono">FAIL WITH 403</span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={simulateError}
                      onChange={() => setSimulateError(!simulateError)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="url-include-rules" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
                  Include Rules (Prefix paths)
                </label>
                <input
                  id="url-include-rules"
                  type="text"
                  value={includePattern}
                  onChange={(e) => setIncludePattern(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-mono text-[10px]"
                />
              </div>

              <div>
                <label htmlFor="url-exclude-rules" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
                  Exclude Rules (Exclude regex)
                </label>
                <input
                  id="url-exclude-rules"
                  type="text"
                  value={excludePattern}
                  onChange={(e) => setExcludePattern(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-mono text-[10px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRtl ? 'بدء الزحف الدلالي' : 'Trigger Crawl Engine'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            
            {/* Scraper Header Stats */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 grid grid-cols-3 gap-4 text-center font-mono">
              <div className="space-y-1">
                <span className="text-[8px] text-slate-450 uppercase block">{isRtl ? 'حالة الزاحف' : 'Crawl Status'}</span>
                <span className={`text-[10px] font-bold uppercase ${
                  crawlState === 'crawling' ? 'text-blue-500' : crawlState === 'failed' ? 'text-rose-500' : 'text-emerald-500 animate-pulse'
                }`}>
                  {crawlState}
                </span>
              </div>
              <div className="space-y-1 border-l border-slate-200 dark:border-slate-850">
                <span className="text-[8px] text-slate-450 uppercase block">{isRtl ? 'الصفحات المفهرسة' : 'Pages Synced'}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{crawledCount}</span>
              </div>
              <div className="space-y-1 border-l border-slate-200 dark:border-slate-850">
                <span className="text-[8px] text-slate-450 uppercase block">{isRtl ? 'المقاطع المولدة' : 'RAG Chunks'}</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">+{totalChunks}</span>
              </div>
            </div>

            {/* Simulated Link Terminal Logs */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide block font-mono">
                Spider Gateway Execution Terminal Logs
              </span>
              <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-3 rounded-2xl h-44 overflow-y-auto space-y-2 border border-slate-850 select-text leading-relaxed">
                {crawlerLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-550 shrink-0 select-none">[{log.time}]</span>
                    {log.status === 'indexed' && (
                      <span className="text-emerald-450 shrink-0">[CRAWLED]</span>
                    )}
                    {log.status === 'pending' && (
                      <span className="text-blue-400 shrink-0">[INFO]</span>
                    )}
                    <span className="break-all">{log.url}</span>
                    {log.chunks ? (
                      <span className="text-amber-500 font-bold shrink-0">({log.chunks} chunks)</span>
                    ) : null}
                  </div>
                ))}
                {crawlState === 'crawling' && (
                  <div className="flex items-center gap-1.5 text-blue-400 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Scraping deep tree indexes...</span>
                  </div>
                )}
                {crawlState === 'compiling' && (
                  <div className="text-amber-500 flex items-center gap-1.5 animate-pulse font-bold">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Compiling vector clusters & partitions...</span>
                  </div>
                )}
                {crawlState === 'success' && (
                  <div className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>✓ Crawler success. Pipeline synchronized.</span>
                  </div>
                )}
                {crawlState === 'failed' && (
                  <div className="text-rose-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    <span>✗ Scraper fault. Handshake timeout from remote DNS.</span>
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Interactive controls */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                {crawlState === 'crawling' && (
                  <button
                    onClick={handleStopCrawl}
                    className="flex items-center gap-1 px-3 py-1.5 border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Stop Crawling</span>
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                {(crawlState === 'success' || crawlState === 'failed') && (
                  <button
                    onClick={() => setCrawlState('idle')}
                    className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    {isRtl ? 'الرجوع' : 'Back'}
                  </button>
                )}
                {crawlState === 'success' && (
                  <button
                    onClick={handleCommitCrawl}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {isRtl ? 'حفظ وتحديث الفهرس' : 'Add to Vector Index'}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </ModalWrapper>
  );
}
