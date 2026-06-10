'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Paperclip, AlertCircle, Share2, Download, Settings, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

// Import subcomponents
import { SidebarPanel } from './SidebarPanel';
import { ChatThread } from './ChatThread';
import { ChatComposer } from './ChatComposer';
import { CitationsDrawer } from './CitationsDrawer';
import { TraceLogsDrawer } from './TraceLogsDrawer';
import { VoiceListeningModal, GDPRPrivacyModal, ExportModal, ShareModal } from './Modals';

// Import types
import { Message, Conversation, AttachedFile } from './types';

// Import constants
import { getSlashCommands, EXPORT_FORMATS, ANIMATION_TRANSITIONS } from './constants';

export function AIWorkspace() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      title: isRtl ? 'طلب استرداد اشتراك SaaS' : 'SaaS Subscription Refund Request',
      date: '2026-06-05',
      pinned: true,
      messages: [
        { id: 'm1', sender: 'bot', text: isRtl ? 'مرحباً ديفيد! أنا فرح، مساعد الدعم الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Hi David! I am Farah, your AI Copilot. How can I help you today?', time: '10:00' },
        { id: 'm2', sender: 'user', text: isRtl ? 'أريد استرداد أموال طلبي ORD-99881' : 'I want a refund for my order ORD-99881', time: '10:01' },
        { id: 'm3', sender: 'bot', text: isRtl ? 'بالتأكيد، بموجب سياسة استرداد الأموال (ks-1)، يحق للعملاء استرداد الأموال بالكامل في غضون 30 يوماً. طلبت استرداد الأموال للطلب ORD-99881 مؤهل [1]. يمكنك إكماله في صفحة الطلبات والاسترداد.' : 'Certainly! Under the standard SaaS Refund Policy (ks-1), clients are eligible for full refunds within 30 days of shipment [1]. Order ORD-99881 is marked refund-eligible. You can complete the request via the Order & Refunds tab.', time: '10:02', citations: ['art-1'] }
      ]
    },
    {
      id: 'conv-2',
      title: isRtl ? 'صلاحيات مفاتيح الـ API' : 'API Auth Credentials Settings',
      date: '2026-06-03',
      pinned: false,
      messages: [
        { id: 'm4', sender: 'bot', text: isRtl ? 'مرحباً ديفيد! كيف يمكنني مساعدتك في ضبط الموصلات؟' : 'Hi David! How can I assist you with API connections today?', time: '14:20' },
        { id: 'm5', sender: 'user', text: isRtl ? 'أحصل على خطأ 403 عند استخدام موصلات Client-Gate' : 'I get a 403 Forbidden error using Client-Gate', time: '14:21' },
        { id: 'm6', sender: 'bot', text: isRtl ? 'يشير الخطأ 403 إلى عدم تطابق الصلاحيات. يرجى التأكد من تمكين نطاقات read:billing في توكنات العميل الخاصة بك [2].' : 'HTTP 403 Forbidden indicates invalid permission scopes. Verify your tenant tokens have read:billing scopes enabled [2].', time: '14:22', citations: ['art-2'] }
      ]
    }
  ]);

  // UI States
  const [activeConvId, setActiveConvId] = useState('conv-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  
  // Inline rename state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Context attachment states
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [attachedUrls, setAttachedUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Modals & Panels Toggles
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [showTracePanel, setShowTracePanel] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<string | null>(null);
  
  const [shareExpiration, setShareExpiration] = useState('24h');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'md' | 'json'>('pdf');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice simulation
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Keyboard navigation for slash commands
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);

  // Sidebar collapse states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refs
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  // First time mount consent check
  useEffect(() => {
    const hasConsented = localStorage.getItem('ai-privacy-consented') === 'true';
    if (!hasConsented) {
      setShowPrivacyModal(true);
    }
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Voice waveform simulation loop
  useEffect(() => {
    if (!isVoiceActive) return;
    const interval = setInterval(() => {
      const waves = Array.from({ length: 18 }, () => Math.floor(Math.random() * 26) + 4);
      setVoiceWaveform(waves);
    }, 100);
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Simulated Speaking equalizer loop
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (speakingMessageId) {
      triggerToast(isRtl ? '🔊 جاري توليد وتصفح الصوت التفاعلي...' : '🔊 Playing text-to-speech synthesize response...');
    } else {
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
    }
    return () => {
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
    };
  }, [speakingMessageId, isRtl]);

  // Helper: Trigger custom toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Auto-resize composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [chatInput]);

  const slashCommandsList = getSlashCommands(isRtl);

  const showSlashMenu = chatInput.startsWith('/');
  const filteredCommands = slashCommandsList.filter(item => 
    item.cmd.toLowerCase().includes(chatInput.split(' ')[0].toLowerCase())
  );

  const handleSlashSelect = (cmd: string) => {
    if (cmd === '/refund') {
      setChatInput('/refund ORD-');
    } else {
      setChatInput(`${cmd} `);
    }
    textareaRef.current?.focus();
  };

  // Keyboard navigation for slash commands suggestion list
  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashMenuIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashMenuIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSlashSelect(filteredCommands[slashMenuIndex].cmd);
        setSlashMenuIndex(0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setChatInput('');
      }
    } else {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  // Simulated AI response streaming tokens
  const simulateAiResponse = (userQuery: string) => {
    setIsStreaming(true);
    setStreamingText('');
    
    let answerText = isRtl
      ? `لقد قمت بتحليل استفسارك: "${userQuery}". بالرجوع إلى وثائق Pinecone RAG [1]، يجب التأكد من تطبيق حراس الأمان لخصوصية البيانات قبل معالجة العمليات.`
      : `I have processed your query: "${userQuery}". According to our Pinecone RAG semantic index [1], please verify that privacy filters are enabled before committing.`;
    
    if (userQuery.toLowerCase().includes('refund') || userQuery.includes('استرداد')) {
      answerText = isRtl
        ? `بناءً على وثيقة سياسة الاسترداد [1]، يرجى ملء نموذج الاسترداد للرقم ORD-99881. يتم مطابقة الشروط بنسبة 94% للطلبات التي تتم خلال 30 يوماً.`
        : `Based on standard refund policy document [1], please supply your Order ID. Refund exemptions run via Dubai ERP connector endpoints.`;
    } else if (userQuery.startsWith('/help')) {
      answerText = isRtl
        ? `مرحباً بك في لوحة المساعد الذكي. يمكنك الاستفسار عن التذاكر، حالة النظام، والبحث في مركز المعرفة. اكتب /ticket لرفع تذكرة دعم.`
        : `Welcome to the mPaaS AI Workspace. You can ask queries about SLAs, API connectors, search knowledge docs, or type /ticket to initiate a case file.`;
    } else if (userQuery.startsWith('/ticket')) {
      answerText = isRtl
        ? `لقد قمت بإنشاء رابط سريع لرفع تذكرة جديدة. [انقر هنا لفتح التذكرة] أو استفسر عن فئة التذكرة لفوترة الدفعات.`
        : `I have generated a shortcut to file a ticket. Please use the Quick Actions grid or proceed with '/refund' to verify transactions.`;
    } else if (userQuery.startsWith('/status')) {
      answerText = isRtl
        ? `حالة الأنظمة خضراء ومستقرة: Farah AI Gateway (استجابة 640ms)، Pinecone DB (استجابة 110ms)، موصل Stripe (استجابة 180ms).`
        : `Operational metrics are solid: Farah AI Gateway (640ms latency), Pinecone DB RAG (110ms latency), Stripe Billing (180ms latency).`;
    }

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += isRtl ? 5 : 9;
      if (currentLength >= answerText.length) {
        clearInterval(interval);
        
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: answerText,
          time: timeStr,
          citations: ['art-1'],
          feedback: null,
          isSpeaking: false
        };

        setConversations(prev => prev.map(c => {
          if (c.id === activeConvId) {
            return { ...c, messages: [...c.messages, newMsg] };
          }
          return c;
        }));

        setIsStreaming(false);
        setStreamingText('');
        addAuditLog(`Farah AI completed response to query: ${userQuery}`, 'success');

        if (isTtsEnabled) {
          setSpeakingMessageId(newMsg.id);
          setTimeout(() => setSpeakingMessageId(null), 5000);
        }
      } else {
        setStreamingText(answerText.substring(0, currentLength));
      }
    }, 45);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || isStreaming) return;
    
    const text = chatInput;
    setChatInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newUserMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: timeStr
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return { ...c, messages: [...c.messages, newUserMsg] };
      }
      return c;
    }));

    // Reset attachments
    setAttachedFiles([]);
    setAttachedUrls([]);

    setTimeout(() => {
      simulateAiResponse(text);
    }, 500);
  };

  // Start new conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: isRtl ? `محادثة جديدة #${conversations.length + 1}` : `New Conversation #${conversations.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      pinned: false,
      messages: [
        { id: 'm-init', sender: 'bot', text: isRtl ? 'مرحباً! أنا فرح المساعد الذكي. كيف يمكنني إرشادك اليوم؟' : 'Hello! I am Farah, your AI Copilot. How can I guide your request today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newId);
    addAuditLog('Customer initialized new AI conversation thread', 'success');
    setTimeout(() => textareaRef.current?.focus(), 150);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      triggerToast(isRtl ? 'لا يمكن حذف جميع المحادثات.' : 'Cannot delete all conversations.');
      return;
    }
    const filtered = conversations.filter(c => c.id !== id);
    setConversations(filtered);
    if (activeConvId === id) {
      setActiveConvId(filtered[0].id);
    }
    addAuditLog('Customer deleted conversation thread', 'success');
    triggerToast(isRtl ? 'تم حذف المحادثة بنجاح.' : 'Conversation thread deleted.');
  };

  // Pin/Unpin conversation
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    const isPinnedNow = !conversations.find(c => c.id === id)?.pinned;
    addAuditLog(`${isPinnedNow ? 'Pinned' : 'Unpinned'} conversation thread ${id}`, 'success');
    triggerToast(isPinnedNow ? (isRtl ? 'تم تثبيت المحادثة.' : 'Conversation pinned.') : (isRtl ? 'تم إلغاء التثبيت.' : 'Conversation unpinned.'));
  };

  // Inline rename activation
  const startRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditingTitle(title);
  };

  const saveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTitle.trim()) return;
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editingTitle.trim() } : c));
    setEditingConvId(null);
    addAuditLog(`Renamed conversation thread to: "${editingTitle.trim()}"`, 'success');
    triggerToast(isRtl ? 'تم تحديث عنوان المحادثة.' : 'Conversation renamed.');
  };

  // File context upload simulator
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      triggerToast(isRtl ? 'حجم الملف يتجاوز الحد المسموح (5 ميجابايت).' : 'File size exceeds 5MB limit.');
      return;
    }

    const newAttached = { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, progress: 10 };
    setAttachedFiles(prev => [...prev, newAttached]);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      setAttachedFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: Math.min(progress, 100) } : f));
      if (progress >= 100) {
        clearInterval(interval);
        addAuditLog(`Uploaded custom context file: ${file.name}`, 'success');
      }
    }, 120);
  };

  const handleUrlAttach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAttachedUrls(prev => [...prev, urlInput]);
    setUrlInput('');
    setShowUrlInput(false);
    addAuditLog(`Attached URL context link: ${urlInput}`, 'success');
  };

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const newAttached = { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, progress: 10 };
      setAttachedFiles(prev => [...prev, newAttached]);
      
      let progress = 10;
      const interval = setInterval(() => {
        progress += 30;
        setAttachedFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: Math.min(progress, 100) } : f));
        if (progress >= 100) {
          clearInterval(interval);
          addAuditLog(`Dropped custom context file: ${file.name}`, 'success');
        }
      }, 100);
    }
  };

  // Copy response utility
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(isRtl ? 'تم نسخ النص إلى الحافظة.' : 'Response copied to clipboard.');
    addAuditLog('Copied AI response text to clipboard', 'success');
  };

  // Rate response action
  const handleRateResponse = (msgId: string, rating: 'up' | 'down') => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        const nextMsgs = c.messages.map(m => m.id === msgId ? { ...m, feedback: m.feedback === rating ? null : rating } : m);
        return { ...c, messages: nextMsgs };
      }
      return c;
    }));
    addAuditLog(`Customer rated AI response ${msgId} as ${rating}`, 'success');
    triggerToast(isRtl ? 'شكراً لتقييمك!' : 'Thank you for your feedback!');
  };

  // Share link handler
  const handleShareSubmit = () => {
    const mockLink = `https://mpaas.ai/share/${activeConvId}?exp=${shareExpiration}`;
    navigator.clipboard.writeText(mockLink);
    setShowShareModal(null);
    triggerToast(isRtl ? 'تم توليد ونسخ رابط المشاركة بنجاح.' : 'Share link generated and copied.');
    addAuditLog(`Generated shareable link for AI thread ${activeConvId}`, 'success');
  };

  const handleExportSubmit = () => {
    setIsExporting(true);
    setExportProgress(10);
    
    let progress = 10;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          setShowExportModal(null);
          triggerToast(isRtl ? `تم التصدير بتنسيق ${exportFormat.toUpperCase()} بنجاح.` : `Thread exported as ${exportFormat.toUpperCase()} successfully.`);
          addAuditLog(`Exported AI conversation thread in ${exportFormat} format`, 'success');
        }, 300);
      } else {
        setExportProgress(progress);
      }
    }, 150);
  };

  return (
    <div 
      className="bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-slate-800 rounded-3xl h-[650px] flex overflow-hidden text-slate-800 dark:text-slate-200 shadow-xl relative" 
      dir={isRtl ? 'rtl' : 'ltr'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Drag upload highlight overlay */}
      {isDragging && (
        <div className={`absolute inset-0 bg-blue-500/10 backdrop-blur-xs border-4 border-dashed border-blue-500 z-50 flex items-center justify-center pointer-events-none animate-in fade-in duration-200 ${ANIMATION_TRANSITIONS}`}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-center space-y-2.5 shadow-2xl">
            <Paperclip className="w-10 h-10 text-blue-500 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isRtl ? 'أفلت الملف لإرفاقه' : 'Drop File here to Upload'}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium block">
              {isRtl ? 'سيتم تحميل الملف كسياق ذكي في المحادثة' : 'File will be uploaded as custom RAG context'}
            </span>
          </div>
        </div>
      )}

      {/* 1. LEFT PANEL: Conversations Sidebar */}
      <SidebarPanel
        isRtl={isRtl}
        conversations={conversations}
        activeConvId={activeConvId}
        setActiveConvId={setActiveConvId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        editingConvId={editingConvId}
        setEditingConvId={setEditingConvId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        handleNewConversation={handleNewConversation}
        handleDeleteConversation={handleDeleteConversation}
        handleTogglePin={handleTogglePin}
        saveRename={saveRename}
        startRename={startRename}
        setShowShareModal={setShowShareModal}
        setShowPrivacyModal={setShowPrivacyModal}
      />

      {/* 2. MAIN CONVERSATION WORKSPACE */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/50 dark:bg-[#030712] min-w-0">
        
        {/* Workspace Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title={isSidebarCollapsed ? (isRtl ? 'إظهار القائمة' : 'Show Sidebar') : (isRtl ? 'إخفاء القائمة' : 'Hide Sidebar')}
            >
              {isSidebarCollapsed ? (
                isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />
              ) : (
                isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />
              )}
            </button>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs truncate max-w-[200px]" title={activeConv?.title}>{activeConv?.title}</h4>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 font-mono">Date: {activeConv?.date}</span>
            </div>
          </div>

          <div className="flex gap-1.5 items-center">
            {/* AI Trace Panel Toggle */}
            <button
              onClick={() => {
                setShowTracePanel(!showTracePanel);
                setSelectedCitation(null);
              }}
              className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                showTracePanel 
                  ? 'bg-blue-500/5 border-blue-500 text-blue-600 dark:bg-blue-950/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تتبع RAG / الذكاء' : 'AI Trace Logs'}</span>
            </button>

            {/* Share link and Export thread */}
            <button
              onClick={() => setShowShareModal(activeConvId)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title={isRtl ? 'توليد رابط مشاركة' : 'Share Conversation'}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => setShowExportModal(activeConvId)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title={isRtl ? 'تصدير المحادثة' : 'Export thread'}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Disclaimer Banner */}
        {!disclaimerDismissed && (
          <div className="bg-blue-500/5 border-b border-blue-500/10 px-5 py-2.5 flex justify-between items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="leading-relaxed rtl:leading-loose">{isRtl ? 'تنبيه الأمان: الردود يتم إنشاؤها تلقائياً. يرجى التحقق من التعليمات البرمجية قبل تطبيقها.' : 'Disclaimer: AI outputs are generated programmatically. Verify code block parameters before production.'}</span>
            </div>
            <button onClick={() => setDisclaimerDismissed(true)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer text-xs font-bold transition-colors">×</button>
          </div>
        )}

        {/* Conversation Thread messages list */}
        <ChatThread
          isRtl={isRtl}
          activeConv={activeConv}
          isStreaming={isStreaming}
          streamingText={streamingText}
          speakingMessageId={speakingMessageId}
          setSpeakingMessageId={setSpeakingMessageId}
          isTtsEnabled={isTtsEnabled}
          handleCopyText={handleCopyText}
          handleRateResponse={handleRateResponse}
          simulateAiResponse={simulateAiResponse}
          setSelectedCitation={setSelectedCitation}
          setShowTracePanel={setShowTracePanel}
          chatBottomRef={chatBottomRef}
          setChatInput={setChatInput}
          textareaRef={textareaRef}
        />

        {/* Composer Input Bar */}
        <ChatComposer
          isRtl={isRtl}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isStreaming={isStreaming}
          isTtsEnabled={isTtsEnabled}
          setIsTtsEnabled={setIsTtsEnabled}
          handleSendMessage={handleSendMessage}
          handleComposerKeyDown={handleComposerKeyDown}
          fileInputRef={fileInputRef}
          textareaRef={textareaRef}
          handleFileAttach={handleFileAttach}
          showUrlInput={showUrlInput}
          setShowUrlInput={setShowUrlInput}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          handleUrlAttach={handleUrlAttach}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          attachedUrls={attachedUrls}
          setAttachedUrls={setAttachedUrls}
          showSlashMenu={showSlashMenu}
          filteredCommands={filteredCommands}
          slashMenuIndex={slashMenuIndex}
          handleSlashSelect={handleSlashSelect}
          setIsVoiceActive={setIsVoiceActive}
          isVoiceActive={isVoiceActive}
        />

      </div>

      {/* 3. RIGHT PANEL: Collapsible Citation Drawer */}
      {selectedCitation && (
        <CitationsDrawer
          isRtl={isRtl}
          selectedCitation={selectedCitation}
          setSelectedCitation={setSelectedCitation}
        />
      )}

      {/* 4. RIGHT PANEL: Collapsible AI Tool Trace Panel */}
      {showTracePanel && (
        <TraceLogsDrawer
          isRtl={isRtl}
          setShowTracePanel={setShowTracePanel}
        />
      )}

      {/* 5. Voice Recording Waveform Overlay */}
      <VoiceListeningModal
        isRtl={isRtl}
        isVoiceActive={isVoiceActive}
        setIsVoiceActive={setIsVoiceActive}
        voiceWaveform={voiceWaveform}
        setVoiceWaveform={setVoiceWaveform}
        setChatInput={setChatInput}
        triggerToast={triggerToast}
      />

      {/* 6. Privacy compliance consent modal */}
      <GDPRPrivacyModal
        isRtl={isRtl}
        showPrivacyModal={showPrivacyModal}
        setShowPrivacyModal={setShowPrivacyModal}
        addAuditLog={addAuditLog}
      />

      {/* 7. Export Thread Settings Modal */}
      <ExportModal
        isRtl={isRtl}
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        isExporting={isExporting}
        handleExportSubmit={handleExportSubmit}
        exportProgress={exportProgress}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
      />

      {/* 8. Share link generation Modal */}
      <ShareModal
        isRtl={isRtl}
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        shareExpiration={shareExpiration}
        setShareExpiration={setShareExpiration}
        handleShareSubmit={handleShareSubmit}
      />

      {/* Local Toast message */}
      {toastMessage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
export default AIWorkspace;
