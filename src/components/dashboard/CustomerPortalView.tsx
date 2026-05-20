'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Ticket } from '@/types';
import {
  HelpCircle,
  Brain,
  BookOpen,
  Clock,
  AlertCircle,
  Plus,
  Send,
  PhoneCall,
  Sparkles,
  Search,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Calendar,
  Lock,
  CheckCircle,
  AlertTriangle,
  Upload,
  User,
  Star,
  Eye,
  Mail,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  Tv
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

export function CustomerPortalView({
  activeSubScreen,
  setActiveSubScreen
}: {
  activeSubScreen: string;
  setActiveSubScreen: (sub: string) => void;
}) {
  const {
    tickets,
    createTicket,
    addAuditLog,
    lang,
    conversations,
    setConversations
  } = useApp();

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
  const [ticketAttachments, setTicketAttachments] = useState<string[]>([]);
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
    setTicketAttachments([]);
    setShowSubmitModal(false);
    addAuditLog(`David Miller submitted support ticket: ${ticketTitle}`, 'success');
    setActiveSubScreen('customer_my_tickets');
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText || !selectedTicketId) return;

    // Simulate posting reply in local tickets context
    addAuditLog(`Posted reply to ticket ${selectedTicketId}: "${ticketReplyText}"`, 'success');
    setTicketReplyText('');
  };

  const handleScheduleCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;

    setShowCallbackModal(false);
    addAuditLog(`Voice callback scheduled to line ${callbackPhone}`, 'success');
    alert(`Callback successfully requested! An agent will call ${callbackPhone} at ${callbackTime}.`);
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
      alert('Co-Browse session finished successfully.');
    }, 4000);
  };

  const handleArticleHelpful = (id: string, type: 'up' | 'down') => {
    setArticleFeedbackGiven((prev) => ({ ...prev, [id]: type }));
    addAuditLog(`Helpfulness feedback logged for KB article: ${id} (${type})`, 'success');
  };

  // OTP Login order verification simulator
  const handleOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail) return;
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
      alert('Incorrect code. Use 1234 for testing.');
      return;
    }
    setChatStatus('typing');
    setTimeout(() => {
      setOtpStep('verified');
      setChatStatus('idle');
      addAuditLog(`OTP authorized successfully for order: ${lookupOrderNum}`, 'success');
    }, 1000);
  };

  // Floating Chat message dispatcher
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
        // Handoff to human queue state
        setChatStatus('queue');
        setQueuePos(3);
        return;
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: response, time: timeStr }]);
      setChatStatus('idle');
    }, 1200);
  };

  // Human queue position loop simulator
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

  // CSS variables for accessibility classes
  const fontClass = fontSize === 'sm' ? 'text-[11px]' : fontSize === 'lg' ? 'text-[14px]' : 'text-[12px]';

  return (
    <div
      className={`max-w-6xl mx-auto space-y-6 ${highContrast ? 'bg-black text-yellow-400 border-4 border-yellow-400 p-4 rounded-3xl' : 'text-slate-800 dark:text-slate-200'} transition-all`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* ----------------------------------------------------
          Header Tools / Accessibility Floating trigger
          ---------------------------------------------------- */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Welcome back, David Miller</h3>
            <span className="text-[10px] text-slate-400 font-semibold block font-mono">Profile: corporate-gold-user</span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Quick Actions Shortcuts */}
          <button
            type="button"
            onClick={() => setActiveSubScreen('customer_chat_history')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono"
          >
            Past Chats
          </button>
          
          <button
            onClick={() => setShowCobrowseModal(true)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono"
          >
            Co-Browse
          </button>

          <button
            onClick={() => setShowAccessibilityWidget(true)}
            className="px-3.5 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold rounded-xl hover:bg-blue-100 font-mono"
          >
            Accessibility Options
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          Subscreen Content Dispatcher
          ---------------------------------------------------- */}
      <div className={fontClass}>
        {activeSubScreen === 'customer_home' && (
          <div className="space-y-6">
            {/* Banner Section */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-750 text-white rounded-3xl p-8 text-center space-y-3.5 shadow-lg shadow-blue-500/10 relative overflow-hidden">
              <span className="px-3 py-1 bg-white/15 rounded-full text-[10px] font-bold backdrop-blur-md">
                FARAH AI SUPPORT DESK
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Self-Service Client Portal</h2>
              <p className="text-xs text-blue-100 max-w-md mx-auto leading-relaxed">
                Unlock instant solutions by looking up order parameters, reading policy handbooks, or initiating automated refunds.
              </p>

              {/* RAG search widget */}
              <div className="max-w-md mx-auto relative pt-2">
                <Search className="absolute left-3.5 top-5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type query to fetch RAG matching segments (e.g. refund)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveSubScreen('customer_kb');
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-850 text-xs focus:outline-none shadow-md font-semibold"
                />
              </div>
            </div>

            {/* Support Core categories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <button
                onClick={() => {
                  setKbCategoryFilter('All');
                  setActiveSubScreen('customer_kb');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <BookOpen className="w-6 h-6 text-blue-500" />
                <h4 className="font-bold text-xs text-slate-850 dark:text-white">Knowledge Hub</h4>
                <p className="text-[10px] text-slate-450 font-normal">Search full-text PDF segments stored in Pinecone.</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_order_refund')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <h4 className="font-bold text-xs text-slate-850 dark:text-white">Order & Refunds</h4>
                <p className="text-[10px] text-slate-450 font-normal">Validate order updates and request product exemptions.</p>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <Plus className="w-6 h-6 text-purple-500" />
                <h4 className="font-bold text-xs text-slate-850 dark:text-white">Submit Ticket</h4>
                <p className="text-[10px] text-slate-450 font-normal">Create and track incident reports in CRM systems.</p>
              </button>

              <button
                onClick={() => setShowCallbackModal(true)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm"
              >
                <PhoneCall className="w-6 h-6 text-indigo-500" />
                <h4 className="font-bold text-xs text-slate-850 dark:text-white">Voice Scheduling</h4>
                <p className="text-[10px] text-slate-450 font-normal">Book an outbound call callback time with support agents.</p>
              </button>
            </div>
          </div>
        )}

        {activeSubScreen === 'customer_kb' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_home')}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold">Knowledge Base Search</h2>
                <p className="text-xs text-slate-400">Search articles synced from our vector storage system.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Category filters */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Categories</span>
                {['All', 'Returns & Refunds', 'Account & Access', 'Developer APIs'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setKbCategoryFilter(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      kbCategoryFilter === cat
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-450'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Results list */}
              <div className="md:col-span-3 space-y-4">
                <input
                  type="text"
                  placeholder="Filter articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                />

                <div className="space-y-3.5">
                  {kbArticles
                    .filter((a) => kbCategoryFilter === 'All' || a.category === kbCategoryFilter)
                    .filter((a) => searchQuery === '' || a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((art) => (
                      <div
                        key={art.id}
                        onClick={() => {
                          setSelectedArticleId(art.id);
                          setActiveSubScreen('customer_kb_article');
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-500 cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase font-mono">
                            {art.category}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono">
                            <ThumbsUp className="w-3 h-3" />
                            {art.helpfulCount} helpful
                          </span>
                        </div>
                        <h4 className="font-bold text-sm hover:underline">{art.title}</h4>
                        <p className="text-[11px] text-slate-450 font-normal line-clamp-2 leading-relaxed">
                          {art.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KB ARTICLE VIEW WITH HELPFULNESS RATING & RELATED TOPICS */}
        {activeSubScreen === 'customer_kb_article' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_kb')}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold">Knowledge Base Article</h2>
                <p className="text-xs text-slate-400">RAG Document segment view</p>
              </div>
            </div>

            {(() => {
              const article = kbArticles.find((a) => a.id === selectedArticleId) || kbArticles[0];
              const feedback = articleFeedbackGiven[article.id];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Article main content body */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase font-mono">
                          {article.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{article.title}</h3>
                      </div>
                    </div>

                    <p className="whitespace-pre-line text-xs leading-relaxed font-normal text-slate-655 dark:text-slate-350">
                      {article.content}
                    </p>

                    {/* Helpfulness check */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-450 font-semibold">Was this article helpful?</span>
                      
                      {feedback ? (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Thank you for your feedback!
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleArticleHelpful(article.id, 'up')}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[10px]"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-slate-450" />
                            <span>Helpful</span>
                          </button>
                          <button
                            onClick={() => handleArticleHelpful(article.id, 'down')}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[10px]"
                          >
                            <ThumbsDown className="w-3.5 h-3.5 text-slate-450" />
                            <span>Not Helpful</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Related articles sidebar */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-850 rounded-3xl p-5 space-y-4 h-fit">
                    <h4 className="font-bold text-xs text-slate-400 uppercase font-mono tracking-wider">Related Articles</h4>
                    <div className="space-y-3.5">
                      {kbArticles
                        .filter((a) => a.id !== article.id)
                        .map((rel) => (
                          <div
                            key={rel.id}
                            onClick={() => setSelectedArticleId(rel.id)}
                            className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl hover:border-blue-500 cursor-pointer transition-all space-y-1.5"
                          >
                            <h5 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1 hover:underline">{rel.title}</h5>
                            <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed font-normal">{rel.content}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TICKET DETAILS WITH THREADED REPLIES & TIMELINE */}
        {activeSubScreen === 'customer_ticket_detail' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_my_tickets')}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold">Ticket Details</h2>
                <p className="text-xs text-slate-400">View resolution thread history</p>
              </div>
            </div>

            {(() => {
              const ticket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left panel: Replies list & Composer */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Main Ticket description bubble */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-mono font-bold">{ticket.id}</span>
                        <span>Opened on: 2026-05-18</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-850 dark:text-white">{ticket.title}</h3>
                      <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-normal bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900/50">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Threaded replies */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Conversation History</span>
                      
                      {/* Thread Item 1: Auto bot triage */}
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm">
                          <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 font-bold mb-1">
                            <span>Farah AI Assistant</span>
                            <span>May 18, 14:15</span>
                          </div>
                          <p className="text-xs font-medium">Hello David. I have logged ticket {ticket.id} and categorized it under {ticket.category}. An agent will verify and reply shortly.</p>
                        </div>
                      </div>

                      {/* Thread Item 2: Agent Response */}
                      {ticket.status !== 'open' && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm">
                            <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 font-bold mb-1">
                              <span>Liam Bennett (Support Desk)</span>
                              <span>May 18, 16:30</span>
                            </div>
                            <p className="text-xs font-medium">I have checked your duplicate transaction error logs inside Stripe. I can confirm the second charge has been exempted and refunded. It will reflect in your statements shortly.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Composer */}
                    <form onSubmit={handlePostReply} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
                      <textarea
                        rows={3}
                        placeholder="Write a message reply back to the support agent..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full bg-transparent text-xs p-2 focus:outline-none"
                      />
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-slate-700"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach File</span>
                        </button>
                        
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right panel: Metadata & SLA Timeline */}
                  <div className="space-y-4">
                    {/* Metadata summary */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                      <h4 className="font-bold text-xs text-slate-450 uppercase font-mono">Case Specifications</h4>
                      <div className="space-y-2 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span className="text-slate-450">Category</span>
                          <span>{ticket.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Priority</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Resolution Status</span>
                          <span className="font-mono text-blue-500 font-bold uppercase">{ticket.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline status milestones */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
                      <h4 className="font-bold text-xs text-slate-450 uppercase font-mono">Status Timeline</h4>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3 border-l border-emerald-500 pb-2 pl-3 relative">
                          <div className="absolute -left-1 w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="text-[11px] font-semibold">
                            <h5 className="font-bold">Ticket Open</h5>
                            <span className="text-[9px] text-slate-450 font-mono">May 18, 14:15</span>
                          </div>
                        </div>

                        <div className={`flex gap-3 pb-2 pl-3 relative ${ticket.status !== 'open' ? 'border-l border-emerald-500' : 'border-l border-slate-205'}`}>
                          <div className={`absolute -left-1 w-2 h-2 rounded-full ${ticket.status !== 'open' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <div className="text-[11px] font-semibold">
                            <h5 className="font-bold">Assigned Agent (Liam)</h5>
                            <span className="text-[9px] text-slate-450 font-mono">{ticket.status !== 'open' ? 'May 18, 14:30' : 'Pending Allocation'}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pl-3 relative">
                          <div className={`absolute -left-1 w-2 h-2 rounded-full ${ticket.status === 'solved' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <div className="text-[11px] font-semibold">
                            <h5 className="font-bold">Resolution Finalized</h5>
                            <span className="text-[9px] text-slate-450 font-mono">{ticket.status === 'solved' ? 'May 18, 16:30' : 'Pending resolution'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ORDER LOOKUP & RETURN/REFUND WIZARD WITH OTP */}
        {activeSubScreen === 'customer_order_refund' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_home')}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold">Order Lookup & Return Portal</h2>
                <p className="text-xs text-slate-400">Validate orders and process refund exceptions.</p>
              </div>
            </div>

            {otpStep !== 'verified' ? (
              /* OTP verification steps */
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase font-mono">
                  <Lock className="w-5 h-5" />
                  <span>Secure Order Verification (OTP)</span>
                </div>

                {otpStep === 'none' || otpStep === 'email' ? (
                  <form onSubmit={handleOtpRequest} className="space-y-4 text-xs font-semibold">
                    <p className="text-[11px] text-slate-450 font-normal">Please input your registered account email to dispatch a 4-digit code.</p>
                    <div>
                      <label className="block text-slate-450 mb-1.5">Corporate Email</label>
                      <input
                        type="email"
                        required
                        placeholder="david.miller@yahoo.com"
                        value={lookupEmail}
                        onChange={(e) => setLookupEmail(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold">
                      Send Verification Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-semibold">
                    <p className="text-[11px] text-slate-450 font-normal">We sent a verification code to {lookupEmail}. Enter the code below (use code 1234).</p>
                    <div>
                      <label className="block text-slate-450 mb-1.5">Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={lookupOtp}
                        onChange={(e) => setLookupOtp(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono text-center text-lg tracking-widest"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold">
                      Verify Code
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Verified Order status timeline & Return selector */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Order Specifications */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Order ID</span>
                        <h4 className="font-bold text-sm text-slate-850 dark:text-white font-mono">{lookupOrderNum}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold">
                        REFUND ELIGIBLE (within 30d)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-450">Item Name</span>
                        <span>SaaS Gold Subscription renewal pack</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">Purchased amount</span>
                        <span className="font-bold font-mono text-blue-600 dark:text-blue-400">$49.99 USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">Date of Shipment</span>
                        <span className="font-mono">2026-05-10</span>
                      </div>
                    </div>
                  </div>

                  {/* Return Wizard step */}
                  {refundStep === 'none' ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-center py-8 space-y-3">
                      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Need to return this item?</h4>
                      <p className="text-[11px] text-slate-450 max-w-sm mx-auto font-normal leading-relaxed">
                        Start the automated return process. Once submitted, your gold account credits will update within 3 business days.
                      </p>
                      <button
                        onClick={() => setRefundStep('select')}
                        className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md"
                      >
                        Initiate Return/Refund
                      </button>
                    </div>
                  ) : refundStep === 'select' ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setRefundStep('confirm');
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold"
                    >
                      <h4 className="font-bold text-xs text-slate-850 dark:text-white uppercase font-mono">Return Details</h4>
                      <div>
                        <label className="block text-slate-450 mb-1.5">Reason for return</label>
                        <select
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                        >
                          <option>Damaged on Arrival</option>
                          <option>SLA Metrics breached</option>
                          <option>Incorrect package size</option>
                          <option>Duplicate billing instance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-450 mb-1.5">Upload Attachment logs</label>
                        <input
                          type="text"
                          placeholder="e.g. log_downtime_error.txt"
                          value={refundAttachment}
                          onChange={(e) => setRefundAttachment(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setRefundStep('none')}
                          className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-655 hover:bg-blue-700 text-white rounded-xl font-bold">
                          Submit Return Details
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center space-y-3.5 py-10">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white">Refund Request Logged</h4>
                      <p className="text-[11px] text-slate-450 max-w-xs mx-auto leading-relaxed">
                        Exemption requested successfully under reason &apos;{refundReason}&apos;. Your account credentials have been logged for processing.
                      </p>
                      <button
                        onClick={() => setRefundStep('none')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                      >
                        Close Wizard
                      </button>
                    </div>
                  )}
                </div>

                {/* Right panel: Order Logistics Milestones timeline */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
                  <h4 className="font-bold text-xs text-slate-450 uppercase font-mono">Logistic Milestones (SAP Sync)</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3 border-l border-emerald-500 pb-2 pl-3 relative">
                      <div className="absolute -left-1 w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="text-[11px] font-semibold">
                        <h5 className="font-bold">Item Dispatched from Dubai-Core Hub</h5>
                        <span className="text-[9px] text-slate-450 font-mono">May 10, 08:30 AST</span>
                      </div>
                    </div>
                    <div className="flex gap-3 pl-3 relative">
                      <div className="absolute -left-1 w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="text-[11px] font-semibold">
                        <h5 className="font-bold">Delivered (Verify signature key)</h5>
                        <span className="text-[9px] text-slate-450 font-mono">May 10, 16:45 AST</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER MY TICKETS LIST */}
        {activeSubScreen === 'customer_my_tickets' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div>
              <h2 className="text-xl font-bold">My Support Tickets</h2>
              <p className="text-xs text-slate-400">Track pending resolutions, assigned agents, and SLA deadlines.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold pb-2">
                      <th className="pb-3">Ticket ID</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Priority</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {tickets
                      .filter((t) => t.customerEmail === 'david.miller@yahoo.com')
                      .map((tkt) => (
                        <tr key={tkt.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                          <td className="py-3.5 font-bold font-mono text-slate-900 dark:text-white">{tkt.id}</td>
                          <td className="py-3.5 font-medium">{tkt.title}</td>
                          <td className="py-3.5 font-semibold text-slate-450">{tkt.category}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                              tkt.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {tkt.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                              tkt.status === 'open'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {tkt.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <button
                              onClick={() => {
                                setSelectedTicketId(tkt.id);
                                setActiveSubScreen('customer_ticket_detail');
                              }}
                              className="text-blue-500 font-bold hover:underline"
                            >
                              Open Thread
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER PAST RESOLVED CHAT HISTORY LIST */}
        {activeSubScreen === 'customer_chat_history' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubScreen('customer_home')}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold">Resolved Chat History</h2>
                <p className="text-xs text-slate-400">View logs of past resolved customer support chats.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {historicalChats.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Chat ID: {chat.id}</span>
                    <span>Solved: {chat.solvedDate}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">{chat.title}</h4>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850 text-xs">
                    <span className="text-slate-450">Agent: <strong>{chat.agent}</strong></span>
                    
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: chat.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          MODALS & OVERLAYS SYSTEM
          ---------------------------------------------------- */}

      {/* Accessibility floating Options Modal */}
      {showAccessibilityWidget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-850 dark:text-white">Accessibility Toolbox</h3>
              <button onClick={() => setShowAccessibilityWidget(false)} className="text-slate-400 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              {/* High Contrast Toggle */}
              <div className="flex justify-between items-center">
                <span>High Contrast Palette</span>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    highContrast ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                  }`}
                >
                  {highContrast ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Font Size Selector */}
              <div>
                <label className="block text-slate-500 mb-1.5">Text Magnification Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'base', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      className={`py-1.5 rounded-xl border font-bold capitalize ${
                        fontSize === sz
                          ? 'border-blue-600 text-blue-600 bg-blue-500/10'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {sz === 'sm' ? 'Small' : sz === 'lg' ? 'Large' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 text-[10px] text-slate-450 font-normal leading-normal">
                Keyboard Shortcuts: Use Tab to cycle between focus targets, and press Enter to select option buttons.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Dialing Info Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xs w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-850 dark:text-white">Call Center Hotlines</h3>
              <button onClick={() => setShowVoiceModal(false)} className="text-slate-400 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4 text-center py-6">
              <PhoneCall className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-[11px] text-slate-450 font-normal leading-relaxed">
                Connect directly via our secure SIP VoIP dial gateway line by dialing the hotline below:
              </p>
              <span className="text-lg font-bold font-mono text-slate-850 dark:text-white block tracking-wider">
                +966 11 412 8891
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-500 font-mono block">
                CARRIER: STC VOIP TRUNK
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Co-Browse Session pin join Modal */}
      {showCobrowseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-850 dark:text-white">Join Co-Browse Session</h3>
              <button onClick={() => setShowCobrowseModal(false)} className="text-slate-400 text-lg">×</button>
            </div>
            <form onSubmit={handleJoinCobrowse} className="p-5 space-y-4">
              <p className="text-[11px] text-slate-450 font-normal leading-relaxed">
                Generate a secure screen sharing session. An agent will ask you for this 6-digit session validation PIN to consult.
              </p>
              
              {cobrowseConnected ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Tv className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-500 font-bold block">Session Active (Screen Shared)</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Enter 6-digit PIN (e.g. 982-114)</label>
                    <input
                      type="text"
                      required
                      placeholder="982-114"
                      value={cobrowsePin}
                      onChange={(e) => setCobrowsePin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-transparent rounded-xl text-center text-lg font-mono tracking-widest focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold">
                    Establish Sharing Connection
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Outbound Callback Schedule Modal */}
      {showCallbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-850 dark:text-white">Schedule Outbound Callback</h3>
              <button onClick={() => setShowCallbackModal(false)} className="text-slate-400 text-lg">×</button>
            </div>
            <form onSubmit={handleScheduleCallback} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1.5">Callback Line Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+966 50 123 4567"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">Preferred Time Window</label>
                <select
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none animate-fade-in"
                >
                  <option>As soon as possible (under 15m)</option>
                  <option>Morning (09:00 - 12:00 AST)</option>
                  <option>Afternoon (12:00 - 15:00 AST)</option>
                  <option>Evening (15:00 - 18:00 AST)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCallbackModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-650 hover:bg-blue-750 text-white rounded-xl font-bold">
                  Book Callback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-850 dark:text-white">Submit Support Incident</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 text-lg">×</button>
            </div>
            <form onSubmit={handleTicketSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1.5">Incident Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Invoicing dispute logs"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                  >
                    <option>Billing & Payments</option>
                    <option>User Authentication</option>
                    <option>API Integrations</option>
                    <option>Shipments & Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">Describe issue details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please outline the full steps of what occurred..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Submit Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Assistant Overlay */}
      <div className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-40`}>
        {chatOpen ? (
          /* Opened chat screen */
          <div className="bg-[#0b0f19] text-white rounded-3xl w-80 shadow-2xl flex flex-col justify-between border border-slate-800 animate-in zoom-in-95 text-xs font-semibold" style={{ height: '450px' }}>
            {/* Chat header */}
            <div className="bg-blue-600 px-4 py-3 text-white flex justify-between items-center rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-200" />
                <div>
                  <h4 className="font-bold text-xs">Farah AI Support</h4>
                  <span className="text-[9px] opacity-75 block font-mono">Omnichannel Bot Portal</span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => setChatLanguage(chatLanguage === 'en' ? 'ar' : 'en')}
                  className="text-[9px] px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold"
                  title="Toggle translation locale"
                >
                  {chatLanguage.toUpperCase()}
                </button>
                <button onClick={() => setChatOpen(false)} className="text-white hover:text-slate-200 text-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/20">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : msg.sender === 'system'
                        ? 'bg-purple-900/40 text-purple-200 font-mono text-[9px] text-center mx-auto rounded-lg'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.time && <span className="text-[8px] opacity-50 block mt-1 text-right">{msg.time}</span>}
                  </div>
                </div>
              ))}

              {/* Bot typing state simulation */}
              {chatStatus === 'typing' && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-3 py-2 flex items-center gap-1.5 text-blue-400 font-mono text-[9px]">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Farah typing...</span>
                  </div>
                </div>
              )}

              {/* Handoff queue intermediate position state */}
              {chatStatus === 'queue' && (
                <div className="text-center py-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-amber-500 font-bold block animate-pulse">Routing to Live Agent...</span>
                  <div className="text-[10px] text-slate-400">
                    <p>Current Queue Position: <strong>{queuePos}</strong></p>
                    <p>Estimated wait: <strong>{queuePos * 1.5} mins</strong></p>
                  </div>
                </div>
              )}

              {/* Survey state */}
              {chatStatus === 'survey' && (
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3.5">
                  <div className="text-center space-y-1">
                    <span className="font-bold text-xs">CSAT Satisfaction Survey</span>
                    <p className="text-[10px] text-slate-450 font-normal">How was your interaction with Agent Nadia Vance?</p>
                  </div>
                  
                  {/* Stars input */}
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSurveyCsat(st)}
                        className={`p-1 ${surveyCsat >= st ? 'text-amber-500' : 'text-slate-600 hover:text-amber-400'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>

                  {/* NPS score selector */}
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 font-bold">Net Promoter Score (NPS)</span>
                    <p className="text-[9px] text-slate-450 font-normal">Scale 1 (Low) to 10 (High)</p>
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSurveyNps(i + 1)}
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[9px] ${
                            surveyNps === i + 1 ? 'bg-purple-650 text-white' : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setChatStatus('email_transcript');
                      addAuditLog(`CSAT logged (${surveyCsat}/5) & NPS logged (${surveyNps}/10)`, 'success');
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] text-center font-bold"
                  >
                    Submit Survey Metrics
                  </button>
                </div>
              )}

              {/* Email Transcript Modal */}
              {chatStatus === 'email_transcript' && (
                <div className="bg-slate-905 border border-slate-800 p-3 rounded-xl space-y-3">
                  <span className="font-bold text-[10px] uppercase font-mono block text-center text-blue-500">Email Chat Transcript</span>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="david.miller@yahoo.com"
                      value={transcriptEmail}
                      onChange={(e) => setTranscriptEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-800 bg-slate-950 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setChatStatus('idle');
                      setChatOpen(false);
                      setChatMessages([{ sender: 'bot', text: 'Hi! I am Farah. How can I help you today?', time: '15:00' }]);
                      setSurveyCsat(0);
                      setSurveyNps(0);
                      addAuditLog(`Dispatched chat transcript to email: ${transcriptEmail}`, 'success');
                      alert(`Transcript sent to ${transcriptEmail}!`);
                    }}
                    className="w-full py-1.5 bg-blue-600 rounded-xl text-[10px] text-center font-bold"
                  >
                    Send Transcript Log
                  </button>
                </div>
              )}
            </div>

            {/* Input Composer */}
            {chatStatus !== 'survey' && chatStatus !== 'email_transcript' && (
              <div className="p-3 border-t border-slate-800 flex gap-2 bg-[#0b0f19] rounded-b-3xl shrink-0">
                <input
                  type="text"
                  placeholder="Type a message or press 'agent'..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-800 bg-transparent rounded-xl focus:outline-none text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChatMessage(chatInput);
                  }}
                />
                
                {chatStatus === 'human_chat' ? (
                  <button
                    type="button"
                    onClick={() => setChatStatus('survey')}
                    className="px-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-[9px] font-bold"
                    title="End Conversation and Survey"
                  >
                    Close
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setChatStatus('queue');
                      setQueuePos(3);
                    }}
                    className="px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-[9px] font-bold"
                    title="Consult Human Desk"
                  >
                    Agent
                  </button>
                )}

                <button
                  onClick={() => handleSendChatMessage(chatInput)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Closed chat bubble icon */
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-650 text-white shadow-xl hover:bg-blue-755 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white dark:border-slate-900"
          >
            <Brain className="w-7 h-7 text-white" />
          </button>
        )}
      </div>

      {/* Scored Call hotline helper widget */}
      <div className="fixed bottom-6 left-6 z-30">
        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white font-bold rounded-full shadow-lg text-[10px] hover:bg-emerald-700 font-mono"
        >
          <Volume2 className="w-4 h-4" />
          <span>Hotline</span>
        </button>
      </div>
    </div>
  );
}
