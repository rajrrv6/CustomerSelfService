'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { Shield, Sparkles, User, Database, Settings, ShieldAlert, Cpu, HeartHandshake } from 'lucide-react';

interface Persona {
  role: UserRole;
  name: string;
  desc: string;
  icon: React.ReactNode;
  bgClass: string;
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { setRole, setLang, lang, theme, setTheme } = useApp();

  const personas: Persona[] = [
    {
      role: 'super_admin',
      name: 'Richard (Super Admin)',
      desc: 'Registers LLM models, ASR/TTS engines, configures SIP VoIP trunks, and views cross-tenant infrastructure.',
      icon: <ShieldAlert className="w-5 h-5" />,
      bgClass: 'from-red-500/10 to-orange-500/10 hover:border-red-500/50 text-red-500'
    },
    {
      role: 'client_admin',
      name: 'Saud (Client Admin)',
      desc: 'Full control of tenant configuration: Bot Personas, Dialog Flow Builders, RAG Embeddings, and Guardrails.',
      icon: <Settings className="w-5 h-5" />,
      bgClass: 'from-blue-500/10 to-indigo-500/10 hover:border-blue-500/50 text-blue-500'
    },
    {
      role: 'operations_manager',
      name: 'Amira (Operations Mgr)',
      desc: 'Controls routing queues, CRM connectors, agent rosters, audit logs, and monitors SLAs.',
      icon: <Database className="w-5 h-5" />,
      bgClass: 'from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/50 text-emerald-500'
    },
    {
      role: 'qa_manager',
      name: 'Marc (QA Manager)',
      desc: 'Audits conversation transcripts, reviews agent quality scores, and drafts training plans.',
      icon: <Cpu className="w-5 h-5" />,
      bgClass: 'from-purple-500/10 to-pink-500/10 hover:border-purple-500/50 text-purple-500'
    },
    {
      role: 'supervisor',
      name: 'Sarah (Supervisor)',
      desc: 'Real-time monitoring, live call whispering / coaching overlay, and workforce traffic forecasting.',
      icon: <Shield className="w-5 h-5" />,
      bgClass: 'from-amber-500/10 to-yellow-500/10 hover:border-amber-500/50 text-amber-500'
    },
    {
      role: 'support_agent',
      name: 'Liam (Support Agent)',
      desc: 'Accesses unified inbox workspace with AI Smart Reply, customer 360, macros, and ticket queues.',
      icon: <User className="w-5 h-5" />,
      bgClass: 'from-sky-500/10 to-cyan-500/10 hover:border-sky-500/50 text-sky-500'
    },
    {
      role: 'customer',
      name: 'David (Customer Portal)',
      desc: 'Launches self-service helpdesk: KB search, ticket submission, active live chat, and voice callbacks.',
      icon: <HeartHandshake className="w-5 h-5" />,
      bgClass: 'from-violet-500/10 to-fuchsia-500/10 hover:border-violet-500/50 text-violet-500'
    },
    {
      role: 'viewer',
      name: 'Audit Viewer (Read-only)',
      desc: 'Read-only access to CSAT graphs, cost reduction calculations, and SLA dashboards.',
      icon: <User className="w-5 h-5" />,
      bgClass: 'from-slate-500/10 to-zinc-500/10 hover:border-slate-500/50 text-slate-400'
    }
  ];

  const handlePersonaClick = (role: UserRole) => {
    setRole(role);
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#030712] transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">AI-Native mPaaS</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Omnichannel CX Module</p>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* Lang Selector */}
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                lang === 'en' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                lang === 'ar' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t as any)}
                className={`px-2.5 py-1.5 rounded-md transition-all capitalize ${
                  theme === t ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex items-center justify-center my-8">
        <div className="max-w-4xl w-full bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Demo Environment (CEO-Ready)
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-3 text-slate-800 dark:text-white">
              {lang === 'ar' ? 'بوابة تسجيل الدخول الموحدة' : 'Unified Workspace Gateway'}
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-lg mx-auto">
              {lang === 'ar' 
                ? 'اختر دوراً أدناه لمحاكاة تجربة مستخدم كاملة الصلاحيات مع حماية الوصول وحواجز الأمان وقنوات الاتصال الموحدة.' 
                : 'Select an identity below to simulate a full workspace dashboard populated with live mock components, safety guardrails, and role-based permissions.'}
            </p>
          </div>

          {/* Persona Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map((persona) => (
              <button
                key={persona.role}
                onClick={() => handlePersonaClick(persona.role)}
                className={`group flex flex-col justify-between text-left p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-gradient-to-br ${persona.bgClass} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-900">
                    {persona.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    {persona.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {persona.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed font-normal">
                    {persona.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Account Inputs */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider">
                Custom SSO Credentials
              </h4>
              <p className="text-xs text-slate-400">Mock Auth integrated. Any email and password will succeed.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="email@mpaas.com"
                defaultValue="admin.saud@mpaas.com"
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs w-full sm:w-48 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                onClick={() => handlePersonaClick('client_admin')}
                className="px-5 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all rounded-xl shadow-lg shadow-blue-500/25 shrink-0"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-600 max-w-lg mx-auto font-medium">
        <p>© 2026 AI-Native mPaaS Platform. Omnichannel Customer Self-Service Module. Fully responsive. Built for demonstration.</p>
      </div>
    </div>
  );
}
