'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
import { CustomerDashboardHome } from '../home/CustomerDashboardHome';

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

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const action = searchParams.get('action');
      if (action === 'submit_ticket' && activeSubScreen !== 'customer_ticket_submit') {
        setActiveSubScreen('customer_ticket_submit');
      }
    }
  }, [searchParams, activeSubScreen, setActiveSubScreen]);

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
  const [queueStatus, setQueueStatus] = useState<'idle' | 'queued' | 'connecting' | 'active' | 'completed'>('idle');
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

  // Load active callback queue state from localStorage on mount (Sprint 10A Task 3)
  useEffect(() => {
    if (role !== 'customer') return;

    try {
      const stored = localStorage.getItem('mPaaS_active_callback');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.phoneNumber && parsed.createdTimestamp) {
          const isExpired = Date.now() - parsed.createdTimestamp > 2 * 60 * 60 * 1000;
          if (isExpired) {
            localStorage.removeItem('mPaaS_active_callback');
          } else {
            setCallbackPhone(parsed.phoneNumber);
            setCallbackQueued(true);
            setQueueStatus(parsed.callbackStatus || 'queued');
          }
        }
      }
    } catch (err) {
      console.error('Failed to restore active callback session on mount:', err);
    }
  }, [role]);

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
    setQueueStatus('queued');
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
          <div className="space-y-2.5">
            <CustomerDashboardHome
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchFocused={searchFocused}
              setSearchFocused={setSearchFocused}
              kbArticles={kbArticles}
              savedSearches={savedSearches}
              onOpenKbArticle={(id) => {
                setSelectedArticleId(id);
                setActiveSubScreen(id ? 'customer_kb_article' : 'customer_kb');
                setSearchFocused(false);
              }}
              onOpenAiChat={(query) => {
                handleSendChatMessage(query);
                setChatOpen(true);
                setSearchFocused(false);
              }}
              onOpenTickets={() => setShowSubmitModal(true)}
              onOpenChat={() => setChatOpen(true)}
              onOpenCallback={() => setShowCallbackModal(true)}
              onOpenCobrowse={() => setShowCobrowseModal(true)}
              onOpenKnowledgeHub={() => {
                setKbCategoryFilter('All');
                setSelectedArticleId('');
                setActiveSubScreen('customer_kb_article');
              }}
              onOpenMyTickets={() => setActiveSubScreen('customer_my_tickets')}
              onOpenCopilot={() => setActiveSubScreen('customer_kb')}
              onOpenSystemStatus={() => setActiveSubScreen('customer_system_status')}
              onOpenNotifications={() => setActiveSubScreen('customer_notifications')}
              recentTicket={tickets.filter(t => t.customerEmail === 'david.miller@yahoo.com')[0]}
              alertCount={alerts.filter(a => !a.dismissed && a.lifecycleState === 'active').length}
            />

            {/* Render Callback queue card in absolute overlay or custom spot if active */}
            {(callbackQueued || queueStatus !== 'idle') && (
              <div className="max-w-5xl mx-auto pt-2 pb-4 px-4 md:px-0">
                <CallbackQueueCard
                  lang={lang}
                  phoneNumber={callbackPhone}
                  onToastTrigger={pushToast}
                  onDismiss={() => {
                    setCallbackQueued(false);
                    setQueueStatus('idle');
                    localStorage.removeItem('mPaaS_active_callback');
                  }}
                  onClose={() => {
                    setCallbackQueued(false);
                    setQueueStatus('idle');
                    localStorage.removeItem('mPaaS_active_callback');
                  }}
                  onStatusChange={(status) => setQueueStatus(status)}
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
