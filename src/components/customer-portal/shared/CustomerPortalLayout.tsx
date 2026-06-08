'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import {
  Sparkles, Search, BookOpen, ShieldCheck, Plus, PhoneCall, Volume2,
  CheckCircle, ArrowLeft, ChevronDown, Shield, MessageSquare, ClipboardList, Bot, Activity, Bell
} from 'lucide-react';
import { AccessibilityWidget } from '../accessibility/AccessibilityWidget';
import { VoiceCallModal } from '../callbacks/VoiceCallModal';
import { CobrowseModal } from '../callbacks/CobrowseModal';
import { CallbackRequestModal } from '../callbacks/CallbackRequestModal';
import { SubmitTicketModal } from '../tickets/SubmitTicketModal';
import { SubmitTicketPage } from '../tickets/SubmitTicketPage';
import { TicketList } from '../tickets/TicketList';
import { TicketDetail } from '../tickets/TicketDetail';
import { KbSearch } from '../knowledge-base/KbSearch';
import { KbArticleView } from '../knowledge-base/KbArticleView';
import { RefundWizard } from '../refunds/RefundWizard';
import { LiveChatOverlay } from '../live-chat/LiveChatOverlay';
import { CustomerChatHistory } from './CustomerChatHistory';
import { FeedbackHubPage } from '../feedback/FeedbackHubPage';
import { useFeedbackToasts } from '../feedback/PostChatToasts';
import { CustomerNotifications } from '../notifications/CustomerNotifications';
import { CustomerSettings } from '../settings/CustomerSettings';
import { FavoritesPage, RecentActivityPage, PersonalizedRecommendations } from './PersonalizationHub';
import { HttpStatusPage, MaintenanceModeScreen } from './EnterpriseStates';
import { SystemStatusPage } from '../status/SystemStatusPage';
import { LiveSupportWorkspace } from '../support/LiveSupportWorkspace';
import { GlobalSearch } from '../navigation/GlobalSearch';
import { AIWorkspace } from '../ai-copilot/AIWorkspace';

// Dashboard widgets
import { QuickActions } from '../navigation/QuickActions';
import { FavoritesManager } from '../personalization/FavoritesManager';
import { RecentActivityFeed } from '../personalization/RecentActivityFeed';
import { SavedSearches } from '../personalization/SavedSearches';
import { TicketSLAWidget } from '../tickets/TicketSLAWidget';
import { ChangelogFeed } from '../system/ChangelogFeed';
import { CsatSurveyWidget } from '../feedback/CsatSurveyWidget';
import { NpsSurveyWidget } from '../feedback/NpsSurveyWidget';
import { CallbackQueueCard } from '../feedback/CallbackQueueCard';
import { AccentColorPicker } from './EnterpriseFrameworks';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { INTERACTIVE_CARD, SURFACE_PANEL, FOCUS_RING, SUPPORT_MICRO_TRANSITION } from '@/design-system/tokens';

// Enterprise System Imports
import { OrgSwitcher } from '../enterprise/OrgSwitcher';
import { AuditLogViewer } from '../enterprise/AuditLogViewer';
import { ActiveSessionsPanel } from '../enterprise/ActiveSessionsPanel';
import { SessionTimeoutModal } from '../enterprise/SessionTimeoutModal';
import { ExportCenter } from '../enterprise/ExportCenter';
import { SsoStatusPanel } from '../enterprise/SsoStatusPanel';
import { QuotaDashboard } from '../enterprise/QuotaDashboard';
import { kbArticles, historicalChats } from './constants';

interface CustomerPortalLayoutProps {
  activeSubScreen: string;
  setActiveSubScreen: (sub: string) => void;
}

export function CustomerPortalLayout({
  activeSubScreen,
  setActiveSubScreen
}: CustomerPortalLayoutProps) {
  const {
    tickets,
    createTicket,
    addAuditLog,
    lang,
    role,
  } = useApp();

  const t = translations[lang];
  const { pushToast } = useFeedbackToasts();
  const { alerts } = useNotificationStore();

  // RBAC: Governance features visible to admin roles only
  // (super_admin and client_admin per the UserRole type definition)
  const canAccessGovernance =
    role === 'super_admin' ||
    role === 'client_admin';

  // ----------------------------------------------------
  // Session Inactivity Timer (Phase 5)
  // ----------------------------------------------------
  const [sessionTimeLeft, setSessionTimeLeft] = useState(900);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowTimeoutModal(false);
          addAuditLog('User security session expired automatically due to inactivity.', 'failed');
          setActiveSubScreen('customer_system_403');
          return 0;
        }
        if (prev === 121) {
          setShowTimeoutModal(true);
        }
        return prev - 1;
      });
    }, 1000);

    const resetTimer = () => {
      setSessionTimeLeft((prev) => {
        if (prev <= 120) return prev;
        return 900;
      });
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    return () => {
      clearInterval(interval);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [setActiveSubScreen, addAuditLog]);

  // ----------------------------------------------------
  // Governance Dropdown State (Phase 5)
  // ----------------------------------------------------
  const [isGovernanceMenuOpen, setIsGovernanceMenuOpen] = useState(false);
  const governanceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (governanceMenuRef.current && !governanceMenuRef.current.contains(e.target as Node)) {
        setIsGovernanceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global Search State
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('blue');
  const [callbackQueued, setCallbackQueued] = useState(false);
  const [showCsatModal, setShowCsatModal] = useState(false);
  const [showNpsModal, setShowNpsModal] = useState(false);

  // ----------------------------------------------------
  // State Hooks
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [kbCategoryFilter, setKbCategoryFilter] = useState('All');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [articleFeedbackGiven, setArticleFeedbackGiven] = useState<Record<string, 'up' | 'down' | null>>({});

  // Search suggestion dropdown states (AI Search UX Improvements)
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchFocusIndex, setSearchFocusIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSearchFocusIndex(-1); // Reset highlight when query changes
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aiPrompts = [
    { text: lang === 'ar' ? 'كيف يمكنني استرداد قيمة اشتراك SaaS؟' : 'How to request a SaaS subscription refund', query: 'refund' },
    { text: lang === 'ar' ? 'إعداد OAuth لموصلات API' : 'Setting up OAuth client API connectors', query: 'oauth' },
    { text: lang === 'ar' ? 'إعادة تعيين تفاصيل تسجيل الدخول المغلقة' : 'Resetting locked registry login', query: 'registry login' },
  ];

  const savedSearches = [
    { query: 'refund ORD-99881' },
    { query: 'Stripe 403 Forbidden scopes' },
    { query: 'SLA priority matrix' }
  ];

  const filteredKbArticles = debouncedSearchQuery.trim() === ''
    ? []
    : kbArticles.filter(art => 
        art.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      ).slice(0, 5);

  const dropdownItems: Array<{
    type: 'kb' | 'prompt' | 'action';
    id: string;
    label: string;
    onClick: () => void;
  }> = [];

  filteredKbArticles.forEach(art => {
    dropdownItems.push({
      type: 'kb',
      id: art.id,
      label: art.title,
      onClick: () => {
        setSelectedArticleId(art.id);
        setActiveSubScreen('customer_kb_article');
        setSearchFocused(false);
      }
    });
  });

  aiPrompts.forEach((prompt, idx) => {
    dropdownItems.push({
      type: 'prompt',
      id: `prompt-${idx}`,
      label: prompt.text,
      onClick: () => {
        setSearchQuery(prompt.query);
        setDebouncedSearchQuery(prompt.query);
      }
    });
  });

  if (searchQuery.trim() !== '') {
    dropdownItems.push({
      type: 'action',
      id: 'ask-farah',
      label: lang === 'ar' ? `اسأل فرح AI عن "${searchQuery}"` : `Ask Farah AI about "${searchQuery}"`,
      onClick: () => {
        handleSendChatMessage(searchQuery);
        setChatOpen(true);
        setSearchFocused(false);
      }
    });
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchFocused) {
      if (e.key === 'ArrowDown') {
        setSearchFocused(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchFocusIndex(prev => (prev + 1) % dropdownItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchFocusIndex(prev => (prev - 1 + dropdownItems.length) % dropdownItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchFocusIndex >= 0 && searchFocusIndex < dropdownItems.length) {
        dropdownItems[searchFocusIndex].onClick();
      } else {
        setActiveSubScreen('customer_kb_article');
        setSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchFocused(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <mark key={i} className="bg-amber-100 dark:bg-amber-950/85 text-amber-900 dark:text-amber-250 font-bold px-0.5 rounded">{part}</mark>
            : part
        )}
      </span>
    );
  };

  // Ticket Form States
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketCategory, setTicketCategory] = useState('Billing & Payments');
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Modals & Panels Toggles
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCobrowseModal, setShowCobrowseModal] = useState(false);
  const [showAccessibilityWidget, setShowAccessibilityWidget] = useState(false);

  // Accessibility States (Scoped to Customer portal)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highContrast, setHighContrast] = useState(false);

  // Callback states
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTime, setCallbackTime] = useState('As soon as possible');

  // Co-Browse states
  const [cobrowsePin, setCobrowsePin] = useState('');
  const [cobrowseConnected, setCobrowseConnected] = useState(false);

  // Order Lookup & Refund Flow States
  const [otpStep, setOtpStep] = useState<'none' | 'email' | 'code' | 'verified'>('none');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupOtp, setLookupOtp] = useState('');
  const [lookupOrderNum] = useState('ORD-99881');
  const [refundStep, setRefundStep] = useState<'none' | 'select' | 'confirm' | 'submitting' | 'done'>('none');
  const [refundReason, setRefundReason] = useState('Damaged on Arrival');
  const [refundAttachment, setRefundAttachment] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  // Floating Live Chat Overlay States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLanguage, setChatLanguage] = useState<'en' | 'ar'>('en');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user' | 'agent' | 'system'; text: string; time: string }>>([
    { sender: 'bot', text: 'Hi! I am Farah. How can I help you today?\n\nأهلاً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟', time: '15:00' }
  ]);
  const [chatStatus, setChatStatus] = useState<'idle' | 'typing' | 'queue' | 'human_chat' | 'survey' | 'email_transcript'>('idle');
  const [queuePos, setQueuePos] = useState(3);
  const [surveyCsat, setSurveyCsat] = useState(0);
  const [surveyNps, setSurveyNps] = useState(0);
  const [transcriptEmail, setTranscriptEmail] = useState('');

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) return;

    createTicket({
      title: ticketTitle,
      description: ticketDesc,
      customerName: 'David Miller',
      customerEmail: 'david.miller@yahoo.com',
      priority: ticketPriority,
      status: 'open',
      category: ticketCategory
    });

    setTicketTitle('');
    setTicketDesc('');
    setShowSubmitModal(false);
    addAuditLog(`David Miller submitted support ticket: ${ticketTitle}`, 'success');
    setSubmitSuccessMessage(`Support Case "${ticketTitle}" submitted successfully!`);
    setTimeout(() => {
      setSubmitSuccessMessage(null);
    }, 4000);
    setActiveSubScreen('customer_my_tickets');
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText || !selectedTicketId) return;

    addAuditLog(`Posted reply to ticket ${selectedTicketId}: "${ticketReplyText}"`, 'success');
    setTicketReplyText('');
  };

  const handleScheduleCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;

    addAuditLog(`Voice callback scheduled to line ${callbackPhone}`, 'success');
    setCallbackQueued(true);
    setShowCallbackModal(false);
    pushToast(
      'success',
      lang === 'ar' ? 'تم جدولة الاتصال' : 'Callback Scheduled',
      lang === 'ar'
        ? `سيتصل بك الوكيل على الرقم ${callbackPhone} في أقرب وقت ممكن.`
        : `An agent will call you at ${callbackPhone} soon.`
    );
  };

  const handleJoinCobrowse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cobrowsePin) return;

    setCobrowseConnected(true);
    addAuditLog(`Co-Browse session joined. Pin: ${cobrowsePin}`, 'success');
    setTimeout(() => {
      setCobrowseConnected(false);
      setShowCobrowseModal(false);
      setCobrowsePin('');
      setSubmitSuccessMessage('Co-Browse session finished successfully.');
      setTimeout(() => {
        setSubmitSuccessMessage(null);
      }, 4000);
    }, 4000);
  };

  const handleArticleHelpful = (id: string, type: 'up' | 'down') => {
    setArticleFeedbackGiven((prev) => ({ ...prev, [id]: type }));
    addAuditLog(`Helpfulness feedback logged for KB article: ${id} (${type})`, 'success');
  };

  const handleOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail) return;
    setOtpError(null);
    setChatStatus('typing');
    setTimeout(() => {
      setOtpStep('code');
      setChatStatus('idle');
      addAuditLog(`OTP verification code generated and sent to: ${lookupEmail}`, 'success');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupOtp !== '1234') {
      setOtpError('Incorrect code. Use 1234 for testing.');
      return;
    }
    setOtpError(null);
    setChatStatus('typing');
    setTimeout(() => {
      setOtpStep('verified');
      setChatStatus('idle');
      addAuditLog(`OTP authorized successfully for order: ${lookupOrderNum}`, 'success');
    }, 1000);
  };

  const handleSendChatMessage = (text: string) => {
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text, time: timeStr }]);
    setChatInput('');
    setChatStatus('typing');

    setTimeout(() => {
      let response = 'I could not find exact parameters in our RAG indexes. Would you like to consult a live support agent?';
      const lower = text.toLowerCase();

      if (lower.includes('refund') || lower.includes('return') || lower.includes('ارجاع')) {
        response = 'Refund Policy ks-1 allows return actions within 30 days of renewal. Type "order status" or check the refund options in the home screen.';
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('سعر')) {
        response = 'SaaS Standard accounts run at $49/month and Premium channels at $99/month. Direct invoicing can be set up via CRM Connectors.';
      } else if (lower.includes('delay') || lower.includes('تأخير')) {
        response = 'Fiber Gateway ORD-77612 shows a pending carrier milestone. Try scheduling a voice callback or checking order timeline logs.';
      } else if (lower.includes('agent') || lower.includes('human') || lower.includes('انسان')) {
        setChatStatus('queue');
        setQueuePos(3);
        return;
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: response, time: timeStr }]);
      setChatStatus('idle');
    }, 1200);
  };

  useEffect(() => {
    if (chatStatus !== 'queue') return;
    const interval = setInterval(() => {
      setQueuePos((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setChatStatus('human_chat');
          setChatMessages((m) => [
            ...m,
            { sender: 'system', text: 'Queue connected. Agent Nadia Vance joined the conversation.', time: '' },
            { sender: 'agent', text: 'Hi David! I am Nadia Vance. I see you requested human support. Let me look at your account logs.', time: '15:04' }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [chatStatus]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast-mode', 'accessibility-high-contrast');
    } else {
      document.body.classList.remove('high-contrast-mode', 'accessibility-high-contrast');
    }
    return () => {
      document.body.classList.remove('high-contrast-mode', 'accessibility-high-contrast');
    };
  }, [highContrast]);

  useEffect(() => {
    document.body.classList.remove('portal-scale-sm', 'portal-scale-lg', 'accessibility-font-sm', 'accessibility-font-lg');
    if (fontSize === 'sm') {
      document.body.classList.add('portal-scale-sm', 'accessibility-font-sm');
    } else if (fontSize === 'lg') {
      document.body.classList.add('portal-scale-lg', 'accessibility-font-lg');
    }
    return () => {
      document.body.classList.remove('portal-scale-sm', 'portal-scale-lg', 'accessibility-font-sm', 'accessibility-font-lg');
    };
  }, [fontSize]);

  const fontClass = fontSize === 'sm' ? 'text-[11px]' : fontSize === 'lg' ? 'text-[14px]' : 'text-[12px]';

  // Governance routes list
  const governanceRoutes = [
    { id: 'customer_org_switcher', labelEN: 'Workspace Settings', labelAR: 'إعدادات بيئة العمل' },
    { id: 'customer_audit_logs', labelEN: 'Compliance Audit Logs', labelAR: 'سجلات تدقيق الامتثال' },
    { id: 'customer_exports', labelEN: 'Compliance Exports', labelAR: 'تصدير بيانات الامتثال' },
    { id: 'customer_sso_status', labelEN: 'SSO & Federation Status', labelAR: 'حالة الربط والـ SSO' },
    { id: 'customer_quotas', labelEN: 'Rate Limits & Quotas', labelAR: 'حدود الاستخدام والحصص' }
  ];

  return (
    <div
      className={`max-w-6xl mx-auto space-y-6 ${highContrast ? 'high-contrast-mode p-4 border-4 rounded-3xl' : 'text-slate-800 dark:text-slate-200'} ${fontSize === 'sm' ? 'portal-scale-sm' : fontSize === 'lg' ? 'portal-scale-lg' : 'portal-scale-base'} transition-all`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header Tools */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{t.portal.homeHero.welcomeBack}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block font-mono">{t.portal.homeHero.profileBadge}</span>
          </div>
        </div>

        {/* Header right-side control strip */}
        <div className="flex items-center gap-3">
          {/* OrgSwitcher in header (admin-only visible component) */}
          {canAccessGovernance && (
            <>
              <div className="border-l border-slate-200 dark:border-slate-800 h-6 mx-2" />
              <OrgSwitcher />
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono flex items-center gap-1.5"
              aria-label="Open global search"
            >
              <Search className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'البحث' : 'Search'}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubScreen('customer_chat_history')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono"
            >
              {t.portal.homeHero.pastChats}
            </button>

            <button
              onClick={() => setShowCobrowseModal(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono"
            >
              {t.portal.homeHero.coBrowse}
            </button>

            <button
              onClick={() => setActiveSubScreen('customer_feedback_hub')}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-bold rounded-xl transition-all font-mono"
            >
              {lang === 'ar' ? 'مركز التقييمات' : 'Feedback Hub'}
            </button>

            <button
              onClick={() => setShowAccessibilityWidget(true)}
              data-testid="accessibility-options-btn"
              className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold rounded-xl hover:bg-blue-100 font-mono"
            >
              {t.portal.homeHero.accessibilityOptions}
            </button>

            {/* Governance Dropdown — admin roles only */}
            {canAccessGovernance && (
              <div className="relative" ref={governanceMenuRef}>
                <button
                  onClick={() => setIsGovernanceMenuOpen((v) => !v)}
                  className={`px-3.5 py-1.5 text-[10px] font-bold rounded-xl transition-all font-mono flex items-center gap-1.5 ${
                    isGovernanceMenuOpen
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                  aria-haspopup="true"
                  aria-expanded={isGovernanceMenuOpen}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'الحوكمة' : 'Governance'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-100 ${isGovernanceMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isGovernanceMenuOpen && (
                  <div
                    className={`absolute top-10 ${lang === 'ar' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-2xl z-50 w-56 text-xs font-semibold animate-in zoom-in-95 duration-100 origin-top`}
                    role="menu"
                  >
                    <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono mb-2 px-2">
                      {lang === 'ar' ? 'إدارة المؤسسة والامتثال' : 'Enterprise & Compliance'}
                    </span>
                    <div className="space-y-1">
                      {governanceRoutes.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSubScreen(item.id);
                            setIsGovernanceMenuOpen(false);
                          }}
                          className="w-full flex items-center text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-350"
                          style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                          role="menuitem"
                        >
                          <span className="text-[10.5px] font-bold">{lang === 'ar' ? item.labelAR : item.labelEN}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Routing */}
      <div className={fontClass}>
        {activeSubScreen === 'customer_home' && (
          <div className="space-y-2.5 animate-in fade-in duration-250">
            {/* Maintenance alert banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-2 rounded-xl flex items-center gap-3 text-[10.5px] font-semibold">
              <span className="flex-1">
                {lang === 'ar'
                  ? 'تنبيه الصيانة: ستخضع أنظمة التخزين السحابي لصيانة مجدولة في 12 يونيو بين الساعة 02:00 و 04:00 بتوقيت مكة.'
                  : 'Maintenance Alert: Cloud storage systems scheduled for routine optimization on June 12, 02:00 - 04:00 UTC.'}
              </span>
            </div>

            {/* SECTION 1 — HERO AI SEARCH (PRIMARY FOCUS) */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-750 text-white rounded-3xl py-3.5 px-5 text-center space-y-1.5 shadow-md shadow-blue-500/5 relative overflow-visible">
              <span className="inline-block px-2 py-0.5 bg-white/15 rounded-full text-[8.5px] font-bold backdrop-blur-md font-mono">
                {t.portal.homeHero.badge}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight leading-none">{t.portal.homeHero.heroTitle}</h2>
              <p className="text-[10.5px] text-blue-100 max-w-md mx-auto leading-normal">
                {t.portal.homeHero.heroDesc}
              </p>

              <div className="max-w-[340px] mx-auto relative pt-0.5" ref={searchContainerRef}>
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  data-testid="portal-search-input"
                  placeholder={t.portal.homeHero.searchPlaceholder}
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-8.5 pr-4 py-1.5 rounded-xl bg-white text-slate-850 text-[11px] focus:outline-none shadow-sm hover:shadow-md focus:shadow-lg border border-slate-200 dark:border-slate-800/40 focus:ring-2 focus:ring-blue-400/80 font-semibold transition-all"
                />

                {/* Search suggestion dropdown */}
                {searchFocused && (dropdownItems.length > 0 || savedSearches.length > 0) && (
                  <div className="absolute left-0 right-0 mt-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-2 animate-in fade-in slide-in-from-top-1.5 duration-100">
                    
                    {/* Saved Searches */}
                    {savedSearches.length > 0 && (
                      <div className="space-y-0.5">
                        <span className="block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1">
                          {lang === 'ar' ? 'عمليات البحث المحفوظة' : 'Saved Searches'}
                        </span>
                        <div className="flex flex-wrap gap-1 px-1">
                          {savedSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchQuery(search.query);
                                setDebouncedSearchQuery(search.query);
                              }}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-semibold text-slate-700 dark:text-slate-300 rounded-md cursor-pointer transition-colors"
                            >
                              {search.query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KB Matches */}
                    {filteredKbArticles.length > 0 && (
                      <div className="space-y-0.5">
                        <span className="block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1 mb-0.5">
                          {lang === 'ar' ? 'مقالات المعرفة المطابقة' : 'Instant Knowledge Matches'}
                        </span>
                        <div className="space-y-0.5">
                          {filteredKbArticles.map((art) => {
                            const itemIndex = dropdownItems.findIndex(item => item.type === 'kb' && item.id === art.id);
                            const isHighlighted = itemIndex === searchFocusIndex;
                            return (
                              <button
                                key={art.id}
                                onClick={() => {
                                  setSelectedArticleId(art.id);
                                  setActiveSubScreen('customer_kb_article');
                                  setSearchFocused(false);
                                }}
                                className={`w-full flex items-center gap-2 px-1.5 py-0.5 rounded-lg text-left cursor-pointer transition-colors ${
                                  isHighlighted 
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                    : 'hover:bg-blue-500/5 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-[10px] font-semibold truncate">
                                  {highlightMatch(art.title, searchQuery)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* AI Prompts */}
                    <div className="space-y-0.5">
                      <span className="block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1 mb-0.5">
                        {lang === 'ar' ? 'اقتراحات فرح الذكية' : 'AI Assistant Suggestions'}
                      </span>
                      <div className="space-y-0.5">
                        {aiPrompts.map((prompt, idx) => {
                          const itemIndex = dropdownItems.findIndex(item => item.type === 'prompt' && item.id === `prompt-${idx}`);
                          const isHighlighted = itemIndex === searchFocusIndex;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchQuery(prompt.query);
                                setDebouncedSearchQuery(prompt.query);
                              }}
                              className={`w-full flex items-center gap-2 px-1.5 py-0.75 rounded-lg text-left cursor-pointer transition-colors ${
                                isHighlighted 
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                  : 'hover:bg-blue-500/5 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="text-[10px] font-medium truncate">{prompt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ask Farah Action */}
                    {searchQuery.trim() !== '' && (
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        {(() => {
                          const itemIndex = dropdownItems.findIndex(item => item.type === 'action' && item.id === 'ask-farah');
                          const isHighlighted = itemIndex === searchFocusIndex;
                          return (
                            <button
                              onClick={() => {
                                handleSendChatMessage(searchQuery);
                                setChatOpen(true);
                                setSearchFocused(false);
                              }}
                              className={`w-full flex items-center justify-between px-1.5 py-0.75 rounded-lg text-left cursor-pointer transition-colors ${
                                isHighlighted 
                                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' 
                                  : 'bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Bot className="w-3 h-3 shrink-0 text-blue-500" />
                                <span className="text-[10px] font-bold truncate">
                                  {lang === 'ar' ? `اسأل فرح الذكية عن "${searchQuery}"` : `Ask Farah AI about "${searchQuery}"`}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded shrink-0">
                                {lang === 'ar' ? 'تشغيل' : 'Ask'}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    {/* Footer instructions hint */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[8px] text-slate-400 dark:text-slate-500 font-mono font-bold text-center">
                      ↑↓ {lang === 'ar' ? 'للتنقل' : 'navigate'}  •  Enter {lang === 'ar' ? 'للاختيار' : 'select'}  •  Esc {lang === 'ar' ? 'للإغلاق' : 'close'}
                    </div>

                  </div>
                )}
              </div>

              {/* Instant Search Recommendation Chips */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-1.5 text-[9px]">
                <span className="text-blue-200 font-semibold mt-0.5">
                  {lang === 'ar' ? 'اقتراحات سريعة:' : 'Quick Prompts:'}
                </span>
                {[
                  { label: lang === 'ar' ? 'استرجاع اشتراك' : 'Refund subscription', query: 'refund' },
                  { label: lang === 'ar' ? 'إعداد OAuth' : 'Setup OAuth client', query: 'oauth' },
                  { label: lang === 'ar' ? 'حساب مغلق' : 'Locked account login', query: 'login' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(chip.query);
                      setDebouncedSearchQuery(chip.query);
                      setActiveSubScreen('customer_kb_article');
                    }}
                    className="px-2 py-0.5 bg-white/15 hover:bg-white/25 rounded-full text-white font-medium cursor-pointer transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2 — QUICK SELF-SERVICE UTILITIES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {[
                {
                  id: 'ticket',
                  title: lang === 'ar' ? 'تقديم تذكرة دعم' : 'Submit Ticket',
                  desc: lang === 'ar' ? 'إنشاء بلاغ دعم فني' : 'File a support case',
                  icon: <Plus className="w-4 h-4 text-purple-500" />,
                  onClick: () => setShowSubmitModal(true)
                },
                {
                  id: 'chat',
                  title: lang === 'ar' ? 'المحادثة الفورية' : 'Live Chat',
                  desc: lang === 'ar' ? 'تواصل مع الدعم الذكي' : 'Consult Farah AI',
                  icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
                  onClick: () => setChatOpen(true)
                },
                {
                  id: 'callback',
                  title: lang === 'ar' ? 'طلب مكالمة هاتفية' : 'Voice Callback',
                  desc: lang === 'ar' ? 'جدولة اتصال الدعم الفني' : 'Schedule callback',
                  icon: <PhoneCall className="w-4 h-4 text-indigo-500" />,
                  onClick: () => setShowCallbackModal(true)
                },
                {
                  id: 'cobrowse',
                  title: lang === 'ar' ? 'تصفح مشترك' : 'Co-Browse',
                  desc: lang === 'ar' ? 'مشاركة شاشة آمنة' : 'Secure screen share',
                  icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
                  onClick: () => setShowCobrowseModal(true)
                },
                {
                  id: 'kb_hub',
                  title: lang === 'ar' ? 'مركز المعرفة' : 'Knowledge Hub',
                  desc: lang === 'ar' ? 'تصفح مقالات الدعم والمساعدة' : 'Browse setup guides',
                  icon: <BookOpen className="w-4 h-4 text-amber-500" />,
                  onClick: () => {
                    setKbCategoryFilter('All');
                    setSelectedArticleId('');
                    setActiveSubScreen('customer_kb_article');
                  }
                },
                {
                  id: 'track',
                  title: lang === 'ar' ? 'متابعة التذاكر' : 'Track Tickets',
                  desc: lang === 'ar' ? 'حالة البلاغات النشطة' : 'View active cases',
                  icon: <ClipboardList className="w-4 h-4 text-pink-500" />,
                  onClick: () => setActiveSubScreen('customer_my_tickets')
                },
                {
                  id: 'copilot',
                  title: lang === 'ar' ? 'مساعد فرح الذكي' : 'AI Copilot',
                  desc: lang === 'ar' ? 'مساحة العمل الذكية' : 'AI workspace engine',
                  icon: <Bot className="w-4 h-4 text-teal-500" />,
                  onClick: () => setActiveSubScreen('customer_kb')
                },
                {
                  id: 'status',
                  title: lang === 'ar' ? 'حالة النظام' : 'System Status',
                  desc: lang === 'ar' ? 'استقرار وجودة الخدمات' : 'Monitor platform systems',
                  icon: <Activity className="w-4 h-4 text-rose-500" />,
                  onClick: () => setActiveSubScreen('customer_system_status')
                }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`group flex items-center gap-2 p-1.5 rounded-xl text-left transition-all active:scale-[0.98] min-h-[50px] ${SURFACE_PANEL} ${INTERACTIVE_CARD} ${SUPPORT_MICRO_TRANSITION}`}
                  style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                >
                  <div className="p-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className="font-extrabold text-[10.5px] text-slate-805 dark:text-white leading-tight truncate">
                      {item.title}
                    </h5>
                    <p className="text-[8.5px] text-slate-400 dark:text-slate-455 leading-none truncate">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* SECTION 3 — AI RECOMMENDATIONS */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                  {lang === 'ar' ? 'توصيات فرح المخصصة لك' : 'AI Recommended Support Intel'}
                </span>
              </div>
              <div className="flex sm:grid sm:grid-cols-2 overflow-x-auto sm:overflow-x-visible gap-1.5 pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory">
                {[
                  {
                    id: 'art-2',
                    title: lang === 'ar' ? 'إعداد OAuth لموصلات بوابة العميل' : 'Setting Up OAuth for Client-Gate API Connectors',
                    reason: lang === 'ar' ? 'بناءً على نشاط "Stripe 403"' : 'Based on "Stripe 403" activity',
                    category: 'Developer APIs'
                  },
                  {
                    id: 'art-4',
                    title: lang === 'ar' ? 'التعامل مع تأخيرات تسليم بوابة الألياف البصرية' : 'Handling Fiber Gateway Delivery Delays',
                    reason: lang === 'ar' ? 'بناءً على تذكرة الشحن الأخيرة' : 'Based on recent shipment ticket',
                    category: 'Returns & Refunds'
                  }
                ].map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedArticleId(rec.id);
                      setActiveSubScreen('customer_kb_article');
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-xl text-left group shrink-0 w-[85%] sm:w-auto snap-start ${SURFACE_PANEL} ${INTERACTIVE_CARD} ${SUPPORT_MICRO_TRANSITION}`}
                    style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 mr-1.5">
                      <div className="p-1 bg-blue-500/10 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="truncate space-y-0.5">
                        <span className="block truncate text-[10px] font-extrabold text-slate-850 dark:text-white leading-tight">
                          {rec.title}
                        </span>
                        <span className="px-1 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[6.5px] font-extrabold font-mono uppercase inline-block leading-none">
                          {rec.reason}
                        </span>
                      </div>
                    </div>
                    <ArrowLeft className="w-3 h-3 text-blue-500 shrink-0 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 4 — SUPPORT STATUS */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                  {lang === 'ar' ? 'مؤشرات الدعم النشطة' : 'Active Support Telemetry'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                
                {/* Active Alerts */}
                <div className={`flex items-center justify-between p-1.5 rounded-xl ${SURFACE_PANEL} text-[10.5px] font-semibold min-h-[46px]`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Bell className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div className="truncate">
                      <span className="block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5">
                        {lang === 'ar' ? 'التنبيهات' : 'Alerts'}
                      </span>
                      <span className="font-extrabold text-[9.5px] text-slate-850 dark:text-white leading-tight">
                        {alerts.filter(a => !a.dismissed && a.lifecycleState === 'active').length} {lang === 'ar' ? 'نشط' : 'Active'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubScreen('customer_notifications')}
                    className="text-[8px] text-blue-500 hover:underline font-bold cursor-pointer shrink-0 ml-1"
                  >
                    {lang === 'ar' ? 'عرض' : 'View'}
                  </button>
                </div>

                {/* Live Support */}
                <div className={`flex items-center gap-1.5 p-1.5 rounded-xl ${SURFACE_PANEL} text-[10.5px] font-semibold truncate min-h-[46px]`}>
                  <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
                  <div className="truncate">
                    <span className="block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5">
                      {lang === 'ar' ? 'الدعم المباشر' : 'Live Help'}
                    </span>
                    <span className="font-extrabold text-[9.5px] text-slate-850 dark:text-white leading-tight">
                      {lang === 'ar' ? 'متصل (<2د)' : 'ONLINE (<2m Wait)'}
                    </span>
                  </div>
                </div>

                {/* SLA Target */}
                <div className={`flex items-center justify-between p-1.5 rounded-xl ${SURFACE_PANEL} text-[10.5px] font-semibold min-h-[46px]`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <div className="truncate">
                      <span className="block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5">
                        {lang === 'ar' ? 'الالتزام بـ SLA' : 'SLA Target'}
                      </span>
                      <span className="font-mono font-extrabold text-[9.5px] text-emerald-600 dark:text-emerald-400 leading-tight">
                        99.98% OK
                      </span>
                    </div>
                  </div>
                  <span className="px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[6.5px] font-bold shrink-0">
                    {lang === 'ar' ? 'مستقر' : 'OK'}
                  </span>
                </div>

                {/* Last Case */}
                <div className={`flex items-center justify-between p-1.5 rounded-xl ${SURFACE_PANEL} text-[10.5px] font-semibold min-h-[46px]`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <ClipboardList className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <div className="truncate">
                      <span className="block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5">
                        {lang === 'ar' ? 'آخر تذكرة' : 'Last Case'}
                      </span>
                      <span className="font-extrabold text-[9.5px] text-slate-850 dark:text-white leading-tight truncate block max-w-[90px]">
                        {tickets.filter(t => t.customerEmail === 'david.miller@yahoo.com')[0]?.title || (lang === 'ar' ? 'لا يوجد' : 'None')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubScreen('customer_my_tickets')}
                    className="text-[8px] text-blue-500 hover:underline font-bold shrink-0 cursor-pointer ml-1"
                  >
                    {lang === 'ar' ? 'الكل' : 'All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Render Callback queue card in absolute overlay or custom spot if active */}
            {callbackQueued && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                <CallbackQueueCard
                  lang={lang}
                  phoneNumber={callbackPhone}
                  onToastTrigger={pushToast}
                />
              </div>
            )}
          </div>
        )}

        {activeSubScreen === 'customer_kb' && (
          <AIWorkspace />
        )}

        {activeSubScreen === 'customer_kb_article' && (
          selectedArticleId ? (
            <KbArticleView
              kbArticles={kbArticles}
              selectedArticleId={selectedArticleId}
              setSelectedArticleId={setSelectedArticleId}
              setActiveSubScreen={setActiveSubScreen}
              articleFeedbackGiven={articleFeedbackGiven}
              handleArticleHelpful={handleArticleHelpful}
            />
          ) : (
            <KbSearch
              kbArticles={kbArticles}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              kbCategoryFilter={kbCategoryFilter}
              setKbCategoryFilter={setKbCategoryFilter}
              setSelectedArticleId={setSelectedArticleId}
              setActiveSubScreen={setActiveSubScreen}
            />
          )
        )}

        {activeSubScreen === 'customer_ticket_detail' && (
          <TicketDetail
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            setActiveSubScreen={setActiveSubScreen}
            ticketReplyText={ticketReplyText}
            setTicketReplyText={setTicketReplyText}
            handlePostReply={handlePostReply}
          />
        )}

        {activeSubScreen === 'customer_ticket_submit' && (
          <SubmitTicketPage
            ticketTitle={ticketTitle}
            setTicketTitle={setTicketTitle}
            ticketCategory={ticketCategory}
            setTicketCategory={setTicketCategory}
            ticketPriority={ticketPriority}
            setTicketPriority={setTicketPriority}
            ticketDesc={ticketDesc}
            setTicketDesc={setTicketDesc}
            handleTicketSubmit={handleTicketSubmit}
            onBack={() => setActiveSubScreen('customer_home')}
          />
        )}

        {activeSubScreen === 'customer_order_refund' && (
          <RefundWizard
            setActiveSubScreen={setActiveSubScreen}
            otpStep={otpStep}
            setOtpStep={setOtpStep}
            lookupEmail={lookupEmail}
            setLookupEmail={setLookupEmail}
            lookupOtp={lookupOtp}
            setLookupOtp={setLookupOtp}
            lookupOrderNum={lookupOrderNum}
            refundStep={refundStep}
            setRefundStep={setRefundStep}
            refundReason={refundReason}
            setRefundReason={setRefundReason}
            refundAttachment={refundAttachment}
            setRefundAttachment={setRefundAttachment}
            handleOtpRequest={handleOtpRequest}
            handleVerifyOtp={handleVerifyOtp}
            otpError={otpError}
            setOtpError={setOtpError}
          />
        )}

        {activeSubScreen === 'customer_my_tickets' && (
          <TicketList
            tickets={tickets}
            setSelectedTicketId={setSelectedTicketId}
            setActiveSubScreen={setActiveSubScreen}
          />
        )}

        {activeSubScreen === 'customer_chat_history' && (
          <CustomerChatHistory
            historicalChats={historicalChats}
            setActiveSubScreen={setActiveSubScreen}
          />
        )}

        {activeSubScreen === 'customer_feedback_hub' && (
          <FeedbackHubPage
            lang={lang}
            onBack={() => setActiveSubScreen('customer_home')}
            pushToast={pushToast}
          />
        )}

        {activeSubScreen === 'customer_notifications' && (
          <CustomerNotifications />
        )}

        {activeSubScreen === 'customer_live_support' && (
          <LiveSupportWorkspace />
        )}

        {activeSubScreen === 'customer_recent_activity' && (
          <RecentActivityPage />
        )}

        {activeSubScreen === 'customer_favorites' && (
          <FavoritesPage
            onSelectArticle={(id) => {
              setSelectedArticleId(id);
              setActiveSubScreen('customer_kb_article');
            }}
          />
        )}

        {activeSubScreen === 'customer_system_status' && (
          <SystemStatusPage setActiveSubScreen={setActiveSubScreen} />
        )}

        {activeSubScreen === 'customer_settings' && (
          <CustomerSettings />
        )}

        {activeSubScreen === 'customer_system_403' && (
          <HttpStatusPage status="403" onBack={() => setActiveSubScreen('customer_home')} />
        )}

        {activeSubScreen === 'customer_system_404' && (
          <HttpStatusPage status="404" onBack={() => setActiveSubScreen('customer_home')} />
        )}

        {activeSubScreen === 'customer_system_500' && (
          <HttpStatusPage status="500" onBack={() => setActiveSubScreen('customer_home')} />
        )}

        {activeSubScreen === 'customer_system_maintenance' && (
          <MaintenanceModeScreen />
        )}

        {/* ============================================================
            Enterprise Governance Routes — RBAC Guarded
            Only admin roles (super_admin, client_admin, operations_admin,
            compliance_admin) may access these screens.
            Customer role receives 403 Forbidden.
        ============================================================ */}

        {activeSubScreen === 'customer_org_switcher' && (
          canAccessGovernance ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubScreen('customer_home')}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'ar' ? 'إعدادات المؤسسة وبيئة العمل' : 'Workspace & Tenant Settings'}
                  </h2>
                  <span className="text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5">
                    {lang === 'ar'
                      ? 'تبديل بين بيئات المؤسسة وإدارة الجلسات النشطة.'
                      : 'Switch between organizational environments and manage active device sessions.'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 space-y-4">
                  <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    {lang === 'ar' ? 'مبدل بيئة العمل' : 'Active Tenant Select'}
                  </span>
                  <OrgSwitcher />
                </div>
                <div className="md:col-span-2">
                  <ActiveSessionsPanel />
                </div>
              </div>
            </div>
          ) : (
            <HttpStatusPage status="403" onBack={() => setActiveSubScreen('customer_home')} />
          )
        )}

        {activeSubScreen === 'customer_audit_logs' && (
          canAccessGovernance ? (
            <AuditLogViewer onBack={() => setActiveSubScreen('customer_home')} />
          ) : (
            <HttpStatusPage status="403" onBack={() => setActiveSubScreen('customer_home')} />
          )
        )}

        {activeSubScreen === 'customer_exports' && (
          canAccessGovernance ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubScreen('customer_home')}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'ar' ? 'مركز الامتثال وتصدير البيانات' : 'Compliance Snapshots & Export'}
                  </h2>
                  <span className="text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5">
                    {lang === 'ar'
                      ? 'قم بتوليد وتحميل نسخ مشفرة من سجلات التدقيق والدلائل للجهات الخارجية.'
                      : 'Request signed audit log datasets or user seat metadata collections for external audits.'}
                  </span>
                </div>
              </div>
              <ExportCenter />
            </div>
          ) : (
            <HttpStatusPage status="403" onBack={() => setActiveSubScreen('customer_home')} />
          )
        )}

        {activeSubScreen === 'customer_sso_status' && (
          canAccessGovernance ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubScreen('customer_home')}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'ar' ? 'مراقبة الربط الموحد (SSO)' : 'SSO Connection & Federation'}
                  </h2>
                  <span className="text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5">
                    {lang === 'ar'
                      ? 'مراقبة زمن استجابة الـ IdP، والتحقق من صلاحية شهادات SAML/OIDC النشطة.'
                      : 'Monitor federation latency, success rates, and active identity provider configurations.'}
                  </span>
                </div>
              </div>
              <SsoStatusPanel />
            </div>
          ) : (
            <HttpStatusPage status="403" onBack={() => setActiveSubScreen('customer_home')} />
          )
        )}

        {activeSubScreen === 'customer_quotas' && (
          canAccessGovernance ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubScreen('customer_home')}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'ar' ? 'قياسات الحصة والترخيص' : 'Telemetry & Limit Quotas'}
                  </h2>
                  <span className="text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5">
                    {lang === 'ar'
                      ? 'استعراض معدلات الاستخدام للـ API، والرسائل، والجلسات المصرح بها.'
                      : 'Review API call rates, message throughput, and licensed session consumption metrics.'}
                  </span>
                </div>
              </div>
              <QuotaDashboard />
            </div>
          ) : (
            <HttpStatusPage status="403" onBack={() => setActiveSubScreen('customer_home')} />
          )
        )}
      </div>

      {/* Accessibilities & Modals */}
      <AccessibilityWidget
        isOpen={showAccessibilityWidget}
        onClose={() => setShowAccessibilityWidget(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />

      <VoiceCallModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

      <CobrowseModal
        isOpen={showCobrowseModal}
        onClose={() => setShowCobrowseModal(false)}
        cobrowsePin={cobrowsePin}
        setCobrowsePin={setCobrowsePin}
        cobrowseConnected={cobrowseConnected}
        handleJoinCobrowse={handleJoinCobrowse}
      />

      <CallbackRequestModal
        isOpen={showCallbackModal}
        onClose={() => {
          setShowCallbackModal(false);
          if (!callbackQueued) setCallbackPhone('');
        }}
        callbackPhone={callbackPhone}
        setCallbackPhone={setCallbackPhone}
        callbackTime={callbackTime}
        setCallbackTime={setCallbackTime}
        handleScheduleCallback={handleScheduleCallback}
      />

      <SubmitTicketModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        ticketTitle={ticketTitle}
        setTicketTitle={setTicketTitle}
        ticketCategory={ticketCategory}
        setTicketCategory={setTicketCategory}
        ticketPriority={ticketPriority}
        setTicketPriority={setTicketPriority}
        ticketDesc={ticketDesc}
        setTicketDesc={setTicketDesc}
        handleTicketSubmit={handleTicketSubmit}
      />

      <LiveChatOverlay
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatLanguage={chatLanguage}
        setChatLanguage={setChatLanguage}
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        chatStatus={chatStatus}
        setChatStatus={setChatStatus}
        queuePos={queuePos}
        setQueuePos={setQueuePos}
        surveyCsat={surveyCsat}
        setSurveyCsat={setSurveyCsat}
        surveyNps={surveyNps}
        setSurveyNps={setSurveyNps}
        transcriptEmail={transcriptEmail}
        setTranscriptEmail={setTranscriptEmail}
        handleSendChatMessage={handleSendChatMessage}
      />

      {/* Global Search Overlay (Phase 5) */}
      <GlobalSearch
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        setActiveSubScreen={setActiveSubScreen}
        setSelectedArticleId={(id) => setSelectedArticleId(id)}
        setSelectedTicketId={(id) => setSelectedTicketId(id)}
        onTriggerAction={(action) => {
          if (action === 'open_ticket_modal') setShowSubmitModal(true);
          else if (action === 'open_callback_modal') setShowCallbackModal(true);
          else if (action === 'open_voice_modal') setShowVoiceModal(true);
          else if (action === 'open_cobrowse_modal') setShowCobrowseModal(true);
          else if (action === 'toggle_accessibility') setShowAccessibilityWidget(true);
          else if (action === 'change_accent_blue') setAccentColor('blue');
          else if (action === 'change_accent_indigo') setAccentColor('indigo');
          else if (action === 'change_accent_emerald') setAccentColor('emerald');
          setGlobalSearchOpen(false);
        }}
      />

      {/* Session Timeout Modal (Phase 5) */}
      <SessionTimeoutModal
        isOpen={showTimeoutModal}
        timeLeftSeconds={sessionTimeLeft}
        onExtend={() => {
          setSessionTimeLeft(900);
          setShowTimeoutModal(false);
          addAuditLog('Customer extended active security session manually', 'success');
          pushToast(
            'success',
            lang === 'ar' ? 'تم تمديد الجلسة' : 'Session Extended',
            lang === 'ar' ? 'تم تجديد وقت جلسة العمل بنجاح.' : 'Your active security token was successfully refreshed.'
          );
        }}
        onLogout={() => {
          setSessionTimeLeft(900);
          setShowTimeoutModal(false);
          addAuditLog('Customer terminated active security session manually', 'failed');
          setActiveSubScreen('customer_system_403');
        }}
        lang={lang}
      />

      {submitSuccessMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-650 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-bounce text-xs font-mono">
          <CheckCircle className="w-4 h-4" />
          <span>{submitSuccessMessage}</span>
        </div>
      )}

      {/* Bottom Voice Call Widget Link */}
      <div className="fixed bottom-6 left-6 z-30">
        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white font-bold rounded-full shadow-lg text-[10px] hover:bg-emerald-700 font-mono transition-all hover:scale-105 active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.portal.homeHero.hotline}</span>
        </button>
      </div>
    </div>
  );
}
