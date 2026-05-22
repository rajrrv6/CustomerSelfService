'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Sparkles, Search, BookOpen, ShieldCheck, Plus, PhoneCall, Volume2, CheckCircle } from 'lucide-react';
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

interface CustomerPortalLayoutProps {
  activeSubScreen: string;
  setActiveSubScreen: (sub: string) => void;
}

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
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
    conversations,
    setConversations
  } = useApp();

  const t = translations[lang];

  // ----------------------------------------------------
  // Mock Data definitions
  // ----------------------------------------------------
  const kbArticles: Article[] = [
    {
      id: 'art-1',
      title: 'How to Request a SaaS Subscription Refund',
      category: 'Returns & Refunds',
      tags: ['refund', 'billing', 'subscription'],
      helpfulCount: 154,
      content: `Under the standard AI-Native mPaaS subscription guidelines, corporate customers are eligible for a full refund within 30 days of shipment/renewal if the service tier parameters fall below the stated SLA metrics.

To initiate a refund request:
1. Locate your Order ID inside the Order Lookup portal (formatted as ORD-XXXXX).
2. If the order date is within the 30-day window, you will see a 'Refund Eligible' indicator.
3. Click 'Initiate Return/Refund' to open the wizard, select your return reason, and submit.
4. Once verified, the credits will reflect in your active account statement within 3 to 5 banking days.

For orders outside the 30-day window, please submit a formal ticket category 'Billing & Payments' with attachments proving system downtime or failure logs.`
    },
    {
      id: 'art-2',
      title: 'Setting Up OAuth for Client-Gate API Connectors',
      category: 'Developer APIs',
      tags: ['oauth', 'api', 'connector', 'integration'],
      helpfulCount: 92,
      content: `Our client-gate connectors support OAuth 2.0 authorization rules. To establish an API link:
- Log in to your Client Admin console, navigate to settings, and locate the 'ERP Connectors' tab.
- Generate a new client credentials pair (Client ID & Client Secret).
- Ensure your security firewalls whitelist our gateway IPs: 147.28.112.5 and 147.28.112.6.
- A HTTP 403 Forbidden indicates invalid permission scopes. Verify your tenant tokens have read:billing scopes enabled.`
    },
    {
      id: 'art-3',
      title: 'Resetting Locked Civil Registry Logins',
      category: 'Account & Access',
      tags: ['login', 'auth', 'password', 'civil-registry'],
      helpfulCount: 210,
      content: `If your civil registry login credentials fail 3 consecutive times, your user ID will be locked for security.

To unlock your access:
1. Trigger the OTP request flow using your registered corporate email.
2. Enter the 4-digit code (sent via email/SMS).
3. Reset your credentials using a password with at least 12 characters, including one symbol, one uppercase letter, and one number.
4. If OTP delivery fails, check that your telecom carrier allows inbound automated SMS broadcasts.`
    },
    {
      id: 'art-4',
      title: 'Handling Fiber Gateway Delivery Delays',
      category: 'Returns & Refunds',
      tags: ['shipping', 'delivery', 'delay', 'fiber'],
      helpfulCount: 45,
      content: `In the event that your Fiber Gateway Pack (ORD-77612) shows delayed logistics indicators on SAP:
- Verify shipping milestone schedules.
- If delivery exceeds the estimated ETA by 48 hours, a delivery agent will automatically prompt a voice callback to confirm coordinate metrics.
- Delivery changes requested within 12 hours of dispatch can be performed directly inside the Order Status Timeline on your Portal.`
    }
  ];

  const historicalChats = [
    { id: 'ch-1', title: 'Help with locked registry credential resets', solvedDate: '2026-05-10', rating: 5, agent: 'Nadia Vance' },
    { id: 'ch-2', title: 'Duplicate invoice transaction inquiry', solvedDate: '2026-05-14', rating: 4, agent: 'Farah Bot' }
  ];

  // ----------------------------------------------------
  // State Hooks
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [kbCategoryFilter, setKbCategoryFilter] = useState('All');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art-1');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [articleFeedbackGiven, setArticleFeedbackGiven] = useState<Record<string, 'up' | 'down' | null>>({});

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
  const [lookupOrderNum, setLookupOrderNum] = useState('ORD-99881');
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

    setShowCallbackModal(false);
    addAuditLog(`Voice callback scheduled to line ${callbackPhone}`, 'success');
    setSubmitSuccessMessage(`Callback successfully requested! An agent will call ${callbackPhone} at ${callbackTime}.`);
    setTimeout(() => {
      setSubmitSuccessMessage(null);
    }, 4000);
    setCallbackPhone('');
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
      } else if (lower.includes('delay') || lower.includes('delay') || lower.includes('تأخير')) {
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

  const fontClass = fontSize === 'sm' ? 'text-[11px]' : fontSize === 'lg' ? 'text-[14px]' : 'text-[12px]';

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

        <div className="flex gap-2">
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
            onClick={() => setShowAccessibilityWidget(true)}
            className="px-3.5 py-1.5 bg-blue-55 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold rounded-xl hover:bg-blue-100 font-mono"
          >
            {t.portal.homeHero.accessibilityOptions}
          </button>
        </div>
      </div>

      {/* Screen Routing */}
      <div className={fontClass}>
        {activeSubScreen === 'customer_home' && (
          <div className="space-y-6">
            <div className="bg-linear-to-r from-blue-600 to-indigo-750 text-white rounded-3xl p-8 text-center space-y-3.5 shadow-lg shadow-blue-500/10 relative overflow-hidden">
              <span className="px-3 py-1 bg-white/15 rounded-full text-[10px] font-bold backdrop-blur-md font-mono">
                {t.portal.homeHero.badge}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">{t.portal.homeHero.heroTitle}</h2>
              <p className="text-xs text-blue-105 max-w-md mx-auto leading-relaxed">
                {t.portal.homeHero.heroDesc}
              </p>

              <div className="max-w-md mx-auto relative pt-2">
                <Search className="absolute left-3.5 top-5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.portal.homeHero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveSubScreen('customer_kb');
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-850 text-xs focus:outline-none shadow-md font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <button
                onClick={() => {
                  setKbCategoryFilter('All');
                  setActiveSubScreen('customer_kb');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <BookOpen className="w-6 h-6 text-blue-500" />
                <h4 className="font-bold text-xs text-slate-850 dark:text-white">{t.portal.homeHero.knowledgeHubTitle}</h4>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">{t.portal.homeHero.knowledgeHubDesc}</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_order_refund')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <h4 className="font-bold text-xs text-slate-850 dark:text-white">{t.portal.homeHero.orderRefundsTitle}</h4>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">{t.portal.homeHero.orderRefundsDesc}</p>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <Plus className="w-6 h-6 text-purple-500" />
                <h4 className="font-bold text-xs text-slate-855 dark:text-white">{t.portal.homeHero.submitTicketTitle}</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-400 font-normal">{t.portal.homeHero.submitTicketDesc}</p>
              </button>

              <button
                onClick={() => setShowCallbackModal(true)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <PhoneCall className="w-6 h-6 text-indigo-500" />
                <h4 className="font-bold text-xs text-slate-855 dark:text-white">{t.portal.homeHero.voiceSchedulingTitle}</h4>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">{t.portal.homeHero.voiceSchedulingDesc}</p>
              </button>
            </div>
          </div>
        )}

        {activeSubScreen === 'customer_kb' && (
          <KbSearch
            kbArticles={kbArticles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            kbCategoryFilter={kbCategoryFilter}
            setKbCategoryFilter={setKbCategoryFilter}
            setSelectedArticleId={setSelectedArticleId}
            setActiveSubScreen={setActiveSubScreen}
          />
        )}

        {activeSubScreen === 'customer_kb_article' && (
          <KbArticleView
            kbArticles={kbArticles}
            selectedArticleId={selectedArticleId}
            setSelectedArticleId={setSelectedArticleId}
            setActiveSubScreen={setActiveSubScreen}
            articleFeedbackGiven={articleFeedbackGiven}
            handleArticleHelpful={handleArticleHelpful}
          />
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
        onClose={() => setShowCallbackModal(false)}
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
