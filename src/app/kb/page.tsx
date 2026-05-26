'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KbSearch } from '@/components/customer-portal/knowledge-base/KbSearch';
import { KbArticleView } from '@/components/customer-portal/knowledge-base/KbArticleView';
import { ArrowLeft, Sparkles, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

export default function PublicKbPage() {
  const router = useRouter();
  const { lang, theme, setLang, setTheme, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [kbCategoryFilter, setKbCategoryFilter] = useState('All');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art-1');
  const [articleFeedbackGiven, setArticleFeedbackGiven] = useState<Record<string, 'up' | 'down' | null>>({});
  const [activeSubScreen, setActiveSubScreen] = useState('customer_kb');

  useEffect(() => {
    if (activeSubScreen === 'customer_home') {
      router.push('/portal/public');
    }
  }, [activeSubScreen, router]);

  const handleArticleHelpful = (id: string, type: 'up' | 'down') => {
    setArticleFeedbackGiven((prev) => ({ ...prev, [id]: type }));
    addAuditLog(`Helpfulness feedback logged for KB article: ${id} (${type})`, 'success');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Guest KB Navbar">
          <div className="flex items-center gap-3">
            <Link href="/portal/public" className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-xs sm:text-sm">Public Knowledge Base</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <button type="button" onClick={() => setLang('en')} className={lang === 'en' ? 'text-blue-600' : 'hover:text-slate-800 dark:hover:text-white'}>
                EN
              </button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={() => setLang('ar')} className={lang === 'ar' ? 'text-blue-600' : 'hover:text-slate-800 dark:hover:text-white'}>
                ع
              </button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={isRtl ? 'تبديل المظهر' : 'Toggle theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
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
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-[10px] text-slate-500">
        © 2026 AI-Native mPaaS · Guest Self-Service Center
      </footer>
    </div>
  );
}
