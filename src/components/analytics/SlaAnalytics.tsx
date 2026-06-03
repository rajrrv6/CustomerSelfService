'use client';

import React, { useState } from 'react';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Users, 
  Shield, 
  Sparkles, 
  Check, 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { usePermission } from '@/stores/permissionStore';

// Local dictionary for UI extension
interface LocalDict {
  kpiBreachRisk: string;
  kpiBreachRiskGoal: string;
  kpiEscalatedTickets: string;
  kpiEscalatedTicketsGoal: string;
  kpiAvgResTime: string;
  kpiAvgResTimeGoal: string;
  kpiQueueBacklog: string;
  kpiQueueBacklogGoal: string;
  kpiActiveWarnings: string;
  kpiActiveWarningsGoal: string;
  
  // Real-Time SLA Breach Monitor
  breachMonitorTitle: string;
  breachMonitorSubtitle: string;
  filterAll: string;
  filterCritical: string;
  filterWarnings: string;
  colRemaining: string;
  colChannel: string;
  colAgent: string;
  colActions: string;
  actionCoach: string;
  actionReassign: string;
  actionEscalate: string;
  
  // Queue Health
  queueHealthTitle: string;
  queueHealthSubtitle: string;
  colVolume: string;
  colWaitTime: string;
  colCongestion: string;
  colAdherence: string;
  colRisk: string;
  congestionLow: string;
  congestionMod: string;
  congestionHigh: string;
  riskLow: string;
  riskMed: string;
  riskHigh: string;
  
  // SLA Trend Analytics
  trendTitle: string;
  trendSubtitle: string;
  tabResponseTimes: string;
  tabDailyBreaches: string;
  tabHourlyPressure: string;
  tabDailyAdherence: string;
  tabEscalations: string;
  
  // Incident Timeline
  incidentTitle: string;
  incidentSubtitle: string;
  filterInfo: string;
  sourceLabel: string;
  
  // Leaderboard
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  topPerformers: string;
  coachingRequired: string;
  initiateCoaching: string;
  coachingScheduled: string;
  rebalanceTeam: string;
  rebalancedLabel: string;
  complianceRate: string;
  latencyVal: string;
  
  // AI Operations Insights
  aiInsightsTitle: string;
  aiInsightsSubtitle: string;
  balancingRecom: string;
  shiftRecom: string;
  btnApplyBalancing: string;
  btnApproveExtension: string;
  appliedStatus: string;
  approvedStatus: string;
}

const enLocal: LocalDict = {
  kpiBreachRisk: 'Breach Risk %',
  kpiBreachRiskGoal: 'Goal: < 2.0% (Healthy)',
  kpiEscalatedTickets: 'Escalated Tickets',
  kpiEscalatedTicketsGoal: 'Goal: < 10 (High)',
  kpiAvgResTime: 'Avg Resolution Time',
  kpiAvgResTimeGoal: 'Goal: < 20 mins',
  kpiQueueBacklog: 'Queue Backlog',
  kpiQueueBacklogGoal: 'Goal: < 30 cases',
  kpiActiveWarnings: 'Active Warnings',
  kpiActiveWarningsGoal: 'Goal: 0 (Critical)',
  
  breachMonitorTitle: 'Real-Time SLA Breach Monitor',
  breachMonitorSubtitle: 'Live tracking of cases near or exceeding SLA thresholds. Avoids heavy ticking countdowns to preserve CPU.',
  filterAll: 'All Alerts',
  filterCritical: 'Critical Breaches',
  filterWarnings: 'Warnings Only',
  colRemaining: 'SLA Status',
  colChannel: 'Channel',
  colAgent: 'Agent',
  colActions: 'Actions',
  actionCoach: 'Co-coach Agent',
  actionReassign: 'Reassign Case',
  actionEscalate: 'Escalate Priority',
  
  queueHealthTitle: 'Queue Health & Workload',
  queueHealthSubtitle: 'Omnichannel routing queue latency and active agent concurrency.',
  colVolume: 'Active Volume',
  colWaitTime: 'Avg Wait Time',
  colCongestion: 'Congestion',
  colAdherence: 'SLA Adherence',
  colRisk: 'Risk Level',
  congestionLow: 'Low',
  congestionMod: 'Moderate',
  congestionHigh: 'Congested',
  riskLow: 'Low Risk',
  riskMed: 'Medium Risk',
  riskHigh: 'High Risk',
  
  trendTitle: 'SLA Trend Analytics Reports',
  trendSubtitle: 'Operations telemetry selector for key SLA compliance and latency metrics.',
  tabResponseTimes: 'Response Times',
  tabDailyBreaches: 'Daily Breaches',
  tabHourlyPressure: 'Hourly Pressure',
  tabDailyAdherence: 'Daily Adherence',
  tabEscalations: 'Escalations Trajectory',
  
  incidentTitle: 'Escalation Timeline & Incident Feed',
  incidentSubtitle: 'Real-time operational alerts for SLA breaches, system events, and manual rebalancing.',
  filterInfo: 'Info Only',
  sourceLabel: 'Source',
  
  leaderboardTitle: 'Agent & Team SLA Leaderboard',
  leaderboardSubtitle: 'Compliance and latency metrics for support queues and active agents.',
  topPerformers: 'Top Performers',
  coachingRequired: 'Coaching & Balance Needed',
  initiateCoaching: 'Initiate Coaching',
  coachingScheduled: 'Coaching Scheduled',
  rebalanceTeam: 'Rebalance Team',
  rebalancedLabel: 'Rebalanced',
  complianceRate: 'Compliance',
  latencyVal: 'Avg Resp',
  
  aiInsightsTitle: 'AI Operations & Workforce Insights',
  aiInsightsSubtitle: 'Proactive recommendations generated by Farah AI operational engine.',
  balancingRecom: 'Billing WhatsApp queue is congested due to template verification delay. Rebalance traffic to Email agents.',
  shiftRecom: 'Staffing predictive model projects 25% traffic volume surge in Technical Support queue next hour.',
  btnApplyBalancing: 'Apply Smart Rebalancing',
  btnApproveExtension: 'Approve Shift Extension',
  appliedStatus: 'Applied',
  approvedStatus: 'Approved'
};

const arLocal: LocalDict = {
  kpiBreachRisk: 'معدل خطر خرق الخدمة %',
  kpiBreachRiskGoal: 'الهدف: < 2.0% (سليم)',
  kpiEscalatedTickets: 'التذاكر المصعدة',
  kpiEscalatedTicketsGoal: 'الهدف: < 10 (مرتفع)',
  kpiAvgResTime: 'متوسط وقت الحل',
  kpiAvgResTimeGoal: 'الهدف: < 20 دقيقة',
  kpiQueueBacklog: 'متراكم الطلبات',
  kpiQueueBacklogGoal: 'الهدف: < 30 حالة',
  kpiActiveWarnings: 'التحذيرات النشطة',
  kpiActiveWarningsGoal: 'الهدف: 0 (حرجة)',
  
  breachMonitorTitle: 'مراقب خرق اتفاقية مستوى الخدمة بالوقت الفعلي',
  breachMonitorSubtitle: 'متابعة مباشرة للحالات القريبة من خرق اتفاقية مستوى الخدمة أو التي تجاوزتها. تتجنب العدادات الثقيلة لتوفير وحدة المعالجة المركزية.',
  filterAll: 'جميع التنببهات',
  filterCritical: 'الخروقات الحرجة',
  filterWarnings: 'التحذيرات فقط',
  colRemaining: 'حالة مستوى الخدمة',
  colChannel: 'القناة',
  colAgent: 'الوكيل',
  colActions: 'الإجراءات',
  actionCoach: 'توجيه مشترك للوكيل',
  actionReassign: 'إعادة تعيين الحالة',
  actionEscalate: 'تصعيد الأولوية',
  
  queueHealthTitle: 'صحة قوائم الانتظار وضغط العمل',
  queueHealthSubtitle: 'زمن انتقال قوائم توجيه القنوات المتعددة وإنتاجية الوكلاء النشطين.',
  colVolume: 'الحجم النشط',
  colWaitTime: 'متوسط وقت الانتظار',
  colCongestion: 'مستوى الازدحام',
  colAdherence: 'الالتزام بمستوى الخدمة',
  colRisk: 'مستوى الخطر',
  congestionLow: 'منخفض',
  congestionMod: 'متوسط',
  congestionHigh: 'مزدحم',
  riskLow: 'خطر منخفض',
  riskMed: 'خطر متوسط',
  riskHigh: 'خطر مرتفع',
  
  trendTitle: 'تقارير تحليلات اتجاهات مستوى الخدمة',
  trendSubtitle: 'محدد قياس العمليات التشغيلية لمؤشرات الالتزام بالخدمة وزمن الانتقال.',
  tabResponseTimes: 'أوقات الاستجابة',
  tabDailyBreaches: 'الخروقات اليومية',
  tabHourlyPressure: 'ضغط الساعات',
  tabDailyAdherence: 'الالتزام اليومي',
  tabEscalations: 'مسار التصعيد',
  
  incidentTitle: 'مخطط التصعيد الزمني وسجل الأحداث',
  incidentSubtitle: 'تنبيهات تشغيلية بالوقت الفعلي لخروقات الخدمة، الأحداث النظامية، وإعادة التوازن اليدوي.',
  filterInfo: 'معلومات فقط',
  sourceLabel: 'المصدر',
  
  leaderboardTitle: 'لوحة متصدري مستوى الخدمة للوكلاء والفرق',
  leaderboardSubtitle: 'مؤشرات الالتزام وزمن الاستجابة لقوائم الدعم والوكلاء النشطين.',
  topPerformers: 'الأفضل أداءً',
  coachingRequired: 'مطلوب توجيه وتوازن العمل',
  initiateCoaching: 'بدء التوجيه',
  coachingScheduled: 'تمت جدولة التوجيه',
  rebalanceTeam: 'إعادة التوازن',
  rebalancedLabel: 'تم التوازن',
  complianceRate: 'نسبة الالتزام',
  latencyVal: 'متوسط الرد',
  
  aiInsightsTitle: 'رؤى الذكاء الاصطناعي للعمليات والقوى العاملة',
  aiInsightsSubtitle: 'توصيات استباقية تم إنشاؤها بواسطة محرك العمليات فرح AI.',
  balancingRecom: 'قائمة انتظار فوترة WhatsApp مزدحمة بسبب تأخر التحقق من القالب. أعد توجيه حركة المرور إلى وكلاء البريد الإلكتروني.',
  shiftRecom: 'نموذج التنبؤ بالموظفين يتوقع زيادة بنسبة 25٪ في حجم الزيارات في قائمة انتظار الدعم الفني خلال الساعة القادمة.',
  btnApplyBalancing: 'تطبيق إعادة التوازن الذكي',
  btnApproveExtension: 'الموافقة على تمديد الوردية',
  appliedStatus: 'تم التطبيق',
  approvedStatus: 'تمت الموافقة'
};

interface BreachCase {
  id: string;
  ticketId: string;
  customerName: string;
  priority: 'critical' | 'high' | 'medium';
  remainingText: string;
  remainingTextAr: string;
  statusType: 'critical' | 'warning' | 'healthy';
  channel: string;
  channelAr: string;
  agent: string;
  agentAr: string;
}

interface Incident {
  id: string;
  timestamp: string;
  category: 'critical' | 'warning' | 'info';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  source: string;
}

interface LeaderboardAgent {
  name: string;
  nameAr: string;
  channel: string;
  channelAr: string;
  metricValue: string;
  compliance: string;
  status: 'pending' | 'scheduled' | 'done';
}

export function SlaAnalytics() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const t = translations[lang];
  const loc = isRtl ? arLocal : enLocal;
  const { canManage } = usePermission('sla');

  // Real-Time SLA Cases State
  const [cases, setCases] = useState<BreachCase[]>([
    {
      id: '1',
      ticketId: 'TCK-892',
      customerName: 'Ahmed Al-Shehri',
      priority: 'critical',
      remainingText: 'Breached -18m',
      remainingTextAr: 'تم الخرق -18 د',
      statusType: 'critical',
      channel: 'Billing',
      channelAr: 'الفواتير',
      agent: 'Tariq Mansoor',
      agentAr: 'طارق منصور'
    },
    {
      id: '2',
      ticketId: 'TCK-765',
      customerName: 'John Doe',
      priority: 'high',
      remainingText: 'Due in 4m',
      remainingTextAr: 'مستحق خلال 4 د',
      statusType: 'warning',
      channel: 'Technical Support',
      channelAr: 'الدعم الفني',
      agent: 'Sarah Jenkins',
      agentAr: 'سارة جنكينز'
    },
    {
      id: '3',
      ticketId: 'TCK-491',
      customerName: 'Yasmine Smith',
      priority: 'medium',
      remainingText: 'Due in 18m',
      remainingTextAr: 'مستحق خلال 18 د',
      statusType: 'warning',
      channel: 'VIP Support',
      channelAr: 'دعم VIP',
      agent: 'Liam Bennett',
      agentAr: 'ليام بينيت'
    },
    {
      id: '4',
      ticketId: 'TCK-322',
      customerName: 'Michael Chen',
      priority: 'critical',
      remainingText: 'Breached -5m',
      remainingTextAr: 'تم الخرق -5 د',
      statusType: 'critical',
      channel: 'WhatsApp Support',
      channelAr: 'دعم واتساب',
      agent: 'Nadia Vance',
      agentAr: 'ناديا فانس'
    },
    {
      id: '5',
      ticketId: 'TCK-115',
      customerName: 'Sarah Connor',
      priority: 'high',
      remainingText: 'Due in 28m',
      remainingTextAr: 'مستحق خلال 28 د',
      statusType: 'healthy',
      channel: 'Email Support',
      channelAr: 'الدعم البريدي',
      agent: 'Unassigned',
      agentAr: 'غير معين'
    }
  ]);

  // Real-Time Incident timeline State
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      timestamp: '22:15:22',
      category: 'critical',
      title: 'WhatsApp Queue SLA Breach',
      titleAr: 'خرق اتفاقية خدمة WhatsApp',
      description: 'WhatsApp Support queue response latency exceeded 5m threshold (currently 6.5m).',
      descriptionAr: 'تجاوزت فترة استجابة خدمة دعم واتساب حد الـ 5 دقائق (حالياً 6.5 د).',
      source: 'Farah AI Monitor'
    },
    {
      id: '2',
      timestamp: '22:04:10',
      category: 'warning',
      title: 'High Roster Shrinkage Warning',
      titleAr: 'تحذير انكماش مناوبات العمل',
      description: 'Agent Tariq Mansoor logged off early. Billing Queue has elevated backlog risk.',
      descriptionAr: 'الوكيل طارق منصور سجل خروج مبكر. قائمة الفواتير تواجه خطراً مرتفعاً للتراكم.',
      source: 'Workforce Scheduler'
    },
    {
      id: '3',
      timestamp: '21:40:15',
      category: 'critical',
      title: 'SAP Integration Sync Locked',
      titleAr: 'قفل مزامنة تكامل SAP',
      description: 'Invoice validation locked for Case TCK-892 after consecutive backend sync attempts timed out.',
      descriptionAr: 'تم قفل التحقق من الفاتورة للحالة TCK-892 بعد انتهاء مهلة محاولات المزامنة الخلفية المتتالية.',
      source: 'SAP Connector'
    },
    {
      id: '4',
      timestamp: '21:10:00',
      category: 'info',
      title: 'Farah NLU Engine Hot-Swapped',
      titleAr: 'تبديل محرك Farah NLU مباشرة',
      description: 'Farah NLU translation and intent classification engine hot-swapped to model v2.4.1.',
      descriptionAr: 'تم تبديل محرك تصنيف النوايا والترجمة Farah NLU مباشرة للنسخة v2.4.1.',
      source: 'AI Orchestrator'
    },
    {
      id: '5',
      timestamp: '20:30:12',
      category: 'warning',
      title: 'Plivo Voice Gateway High Latency',
      titleAr: 'زمن انتقال مرتفع لبوابة Plivo',
      description: 'Voice SIP gateway latency spiked to 1.8s, causing voice packet delays.',
      descriptionAr: 'ارتفع زمن انتقال بوابة الصوت SIP إلى 1.8 ث، مما يسبب تأخير حزم الصوت.',
      source: 'Twilio & Plivo Router'
    },
    {
      id: '6',
      timestamp: '19:45:00',
      category: 'info',
      title: 'Night Shift Roster Rebalanced',
      titleAr: 'إعادة توازن نوبة العمل الليلية',
      description: 'Workforce schedule automatically reallocated 2 backup agents to the technical queue.',
      descriptionAr: 'قام جدول القوى العاملة تلقائياً بإعادة توجيه وكيلين احتياطيين إلى القائمة الفنية.',
      source: 'WFM Engine'
    }
  ]);

  // Leaderboards States
  const [coachingAgents, setCoachingAgents] = useState<LeaderboardAgent[]>([
    {
      name: 'Tariq Mansoor',
      nameAr: 'طارق منصور',
      channel: 'Billing',
      channelAr: 'الفواتير',
      metricValue: '6.8m',
      compliance: '92.4%',
      status: 'pending'
    },
    {
      name: 'Nadia Vance',
      nameAr: 'ناديا فانس',
      channel: 'WhatsApp Support',
      channelAr: 'دعم واتساب',
      metricValue: '5.4m',
      compliance: '93.1%',
      status: 'pending'
    },
    {
      name: 'Billing Support Team',
      nameAr: 'فريق دعم الفواتير',
      channel: 'Queue Congestion',
      channelAr: 'ازدحام قائمة الانتظار',
      metricValue: '7.2m latency',
      compliance: '28 backlog',
      status: 'pending'
    }
  ]);

  // State Filters
  const [monitorFilter, setMonitorFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'response' | 'breaches' | 'pressure' | 'adherence' | 'escalations'>('response');

  // AI Insights Applied States
  const [balancingApplied, setBalancingApplied] = useState(false);
  const [shiftApproved, setShiftApproved] = useState(false);

  // Sparkline Helper
  const Sparkline = ({ points, color }: { points: number[]; color: string }) => {
    const width = 60;
    const height = 24;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const pathD = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <svg className="w-12 h-6 overflow-visible shrink-0" viewBox={`0 0 ${width} ${height}`}>
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Delta color formatter helper
  const renderDeltaIndicator = (val: string, isPositiveGood: boolean) => {
    const isNegative = val.startsWith('-');
    const isNeutral = val === '0' || val === '0.0%' || val === '0m' || val === '0';
    if (isNeutral) {
      return <span className="text-[10px] text-slate-400 font-mono">0</span>;
    }
    const isGood = isPositiveGood ? !isNegative : isNegative;
    return (
      <span className={`text-[10px] font-bold font-mono ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
        {val}
      </span>
    );
  };

  // Handlers for interactive actions
  const handleCoach = (caseId: string) => {
    if (!canManage) return;
    const c = cases.find(item => item.id === caseId);
    if (!c) return;

    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'SLA',
      severity: 'info',
      alertCode: 'AGENT_COACHING_INITIATED',
      sourceEntity: c.agent === 'Unassigned' ? 'Unassigned' : c.agent,
      title: isRtl ? `بدء التوجيه المشترك: ${c.ticketId}` : `Co-Coaching Initiated: ${c.ticketId}`,
      message: isRtl 
        ? `تم بدء جلسة توجيه مشترك للوكيل ${c.agentAr === 'غير معين' ? 'المناوب' : c.agentAr} في التذكرة ${c.ticketId}.` 
        : `Co-coaching session initiated for agent ${c.agent === 'Unassigned' ? 'on duty' : c.agent} on Case ${c.ticketId}.`,
      metadata: {
        agentName: c.agent,
        ticketId: c.ticketId,
        sourceSystem: 'SLA Operations Center'
      }
    });

    useNotificationStore.getState().addAuditLog(
      `Co-coach initiated for ${c.ticketId} with agent ${c.agent}`,
      'success'
    );
  };

  const handleReassign = (caseId: string) => {
    if (!canManage) return;
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const nextAgent = c.agent === 'Sarah Jenkins' ? 'Liam Bennett' : 'Sarah Jenkins';
        const nextAgentAr = nextAgent === 'Sarah Jenkins' ? 'سارة جنكينز' : 'ليام بينيت';

        useNotificationStore.getState().addAlert({
          category: 'operations',
          source: 'SLA',
          severity: 'success',
          alertCode: 'CASE_REASSIGNED',
          sourceEntity: nextAgent,
          title: isRtl ? `إعادة تعيين الحالة: ${c.ticketId}` : `Case Reassigned: ${c.ticketId}`,
          message: isRtl
            ? `تم إعادة تعيين التذكرة ${c.ticketId} بنجاح إلى الوكيل ${nextAgentAr}.`
            : `Case ${c.ticketId} successfully reassigned to agent ${nextAgent}.`,
          metadata: {
            agentName: nextAgent,
            ticketId: c.ticketId,
            sourceSystem: 'SLA Operations Center'
          }
        });

        useNotificationStore.getState().addAuditLog(
          `Case ${c.ticketId} reassigned to agent ${nextAgent}`,
          'success'
        );

        return {
          ...c,
          agent: nextAgent,
          agentAr: nextAgentAr
        };
      }
      return c;
    }));
  };

  const handleEscalate = (caseId: string) => {
    if (!canManage) return;
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        if (c.priority === 'critical') return c;

        useNotificationStore.getState().addAlert({
          category: 'escalation',
          source: 'SLA',
          severity: 'critical',
          alertCode: 'PRIORITY_ESCALATED',
          sourceEntity: c.ticketId,
          title: isRtl ? `تصعيد الأولوية: ${c.ticketId}` : `Priority Escalated: ${c.ticketId}`,
          message: isRtl
            ? `تم تصعيد أولوية الحالة ${c.ticketId} إلى حرجة.`
            : `Priority for Case ${c.ticketId} escalated to Critical.`,
          metadata: {
            ticketId: c.ticketId,
            sourceSystem: 'SLA Operations Center'
          }
        });

        useNotificationStore.getState().addAuditLog(
          `Priority for Case ${c.ticketId} escalated to Critical`,
          'success'
        );

        return {
          ...c,
          priority: 'critical',
          statusType: 'critical',
          remainingText: 'Breached -1m',
          remainingTextAr: 'تم الخرق -1 د'
        };
      }
      return c;
    }));
  };

  const handleLeaderboardAction = (index: number) => {
    if (!canManage) return;
    setCoachingAgents(prev => prev.map((agent, idx) => {
      if (idx === index) {
        const isTeam = agent.name.includes('Team') || agent.nameAr.includes('فريق');
        const alertCode = isTeam ? 'TEAM_REBALANCED' : 'COACHING_SCHEDULED';
        const title = isRtl
          ? (isTeam ? `إعادة توازن الفريق: ${agent.nameAr}` : `جدولة جلسة توجيه: ${agent.nameAr}`)
          : (isTeam ? `Team Rebalanced: ${agent.name}` : `Coaching Scheduled: ${agent.name}`);
        const msg = isRtl
          ? (isTeam ? `تم إعادة توازن ضغط عمل فريق ${agent.nameAr} بنجاح.` : `تم جدولة جلسة التوجيه التشغيلية للوكيل ${agent.nameAr}.`)
          : (isTeam ? `Workload for ${agent.name} has been successfully rebalanced.` : `Operational coaching session scheduled for agent ${agent.name}.`);

        useNotificationStore.getState().addAlert({
          category: 'operations',
          source: 'SLA',
          severity: 'success',
          alertCode,
          sourceEntity: agent.name,
          title,
          message: msg,
          metadata: {
            entityName: agent.name,
            sourceSystem: 'SLA Performance Dashboard'
          }
        });

        useNotificationStore.getState().addAuditLog(
          `${isTeam ? 'Rebalance' : 'Coaching'} action triggered for ${agent.name}`,
          'success'
        );

        // Add incident to timeline
        const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newIncident: Incident = {
          id: String(incidents.length + 1),
          timestamp: timeStr,
          category: 'info',
          title: isTeam ? 'Team Workload Rebalanced' : 'Agent Coaching Scheduled',
          titleAr: isTeam ? 'تم إعادة توازن العمل للفريق' : 'تم جدولة توجيه للوكيل',
          description: isTeam 
            ? `Workload for ${agent.name} reallocated manually from dashboard control.`
            : `Coaching session initiated for ${agent.name} due to latency threshold breaches.`,
          descriptionAr: isTeam
            ? `تم إعادة توزيع عبء العمل لـ ${agent.nameAr} يدوياً من لوحة التحكم.`
            : `تم بدء جلسة توجيه للوكيل ${agent.nameAr} بسبب خرق عتبة زمن الاستجابة.`,
          source: 'SLA Control Board'
        };
        setIncidents(prev => [newIncident, ...prev]);

        return {
          ...agent,
          status: 'scheduled' as const
        };
      }
      return agent;
    }));
  };

  const handleApplyBalancing = () => {
    if (!canManage) return;
    if (balancingApplied) return;
    setBalancingApplied(true);

    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'SLA',
      severity: 'success',
      alertCode: 'SMART_REBALANCING_APPLIED',
      sourceEntity: 'Farah AI Controller',
      title: isRtl ? 'تم تطبيق إعادة التوازن الذكي' : 'Smart Rebalancing Applied',
      message: isRtl 
        ? 'تم تفعيل إعادة التوازن بنجاح. تم تحويل حركة مرور واتساب الفائضة إلى قناة الدعم البريدي للفواتير.' 
        : 'Smart rebalancing applied successfully. Redirected WhatsApp overflow to billing email queue.',
      metadata: {
        sourceSystem: 'Farah AI Engine',
        actionType: 'Smart Routing'
      }
    });

    useNotificationStore.getState().addAuditLog(
      'AI Smart Rebalancing applied for Billing WhatsApp queue',
      'success'
    );

    // Append to incident feed
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setIncidents(prev => [
      {
        id: String(prev.length + 1),
        timestamp: timeStr,
        category: 'info',
        title: 'Smart Rebalancing Applied',
        titleAr: 'تطبيق إعادة التوازن الذكي',
        description: 'WhatsApp overflow redirected to billing email queue via automated AI routing policy.',
        descriptionAr: 'تم تحويل فائض WhatsApp تلقائياً إلى قائمة البريد الإلكتروني للفواتير بناءً على سياسة التوجيه الذكي.',
        source: 'Farah AI Engine'
      },
      ...prev
    ]);
  };

  const handleApproveExtension = () => {
    if (!canManage) return;
    if (shiftApproved) return;
    setShiftApproved(true);

    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'SLA',
      severity: 'success',
      alertCode: 'SHIFT_EXTENSION_APPROVED',
      sourceEntity: 'Workforce Scheduler',
      title: isRtl ? 'تمت الموافقة على تمديد النوبات' : 'Shift Extension Approved',
      message: isRtl 
        ? 'تمت الموافقة على التمديد المؤقت. تم جدولة 3 وكلاء دعم فني احتياطيين للساعة القادمة.' 
        : 'Temporary shift extension approved. 3 technical support agents scheduled for the next hour.',
      metadata: {
        sourceSystem: 'Workforce Scheduler',
        actionType: 'Staffing Escalation'
      }
    });

    useNotificationStore.getState().addAuditLog(
      'AI Shift Extension approved for Technical Support queue volume surge',
      'success'
    );

    // Append to incident feed
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setIncidents(prev => [
      {
        id: String(prev.length + 1),
        timestamp: timeStr,
        category: 'info',
        title: 'Staff Shift Extension Approved',
        titleAr: 'الموافقة على تمديد ورديات الموظفين',
        description: '3 backup agents activated on temporary shift extensions to offset projected volume spike.',
        descriptionAr: 'تم تفعيل 3 وكلاء احتياطيين في ورديات ممددة مؤقتاً لتغطية الارتفاع المتوقع في حجم الطلبات.',
        source: 'Workforce Scheduler'
      },
      ...prev
    ]);
  };

  // Filtered lists
  const filteredCases = cases.filter(c => {
    if (monitorFilter === 'critical') return c.statusType === 'critical';
    if (monitorFilter === 'warning') return c.statusType === 'warning';
    return true;
  });

  const filteredIncidents = incidents.filter(inc => {
    if (timelineFilter === 'critical') return inc.category === 'critical';
    if (timelineFilter === 'warning') return inc.category === 'warning';
    if (timelineFilter === 'info') return inc.category === 'info';
    return true;
  });

  // Table Headers
  const tableHeaders = [
    t.analyticsCenter.slaAnalytics.colTicketId,
    t.analyticsCenter.slaAnalytics.colCustomer,
    t.analyticsCenter.slaAnalytics.colPriority,
    loc.colRemaining,
    loc.colChannel,
    loc.colAgent,
    loc.colActions
  ];

  // Helper for priorities translation and color matching
  const getPriorityBadgeType = (p: BreachCase['priority']) => {
    if (p === 'critical') return 'error';
    if (p === 'high') return 'warning';
    return 'neutral';
  };

  const getPriorityLabel = (p: BreachCase['priority']) => {
    if (isRtl) {
      if (p === 'critical') return 'حرجة';
      if (p === 'high') return 'عالية';
      return 'متوسطة';
    }
    return p.toUpperCase();
  };

  // Sparkline data sets
  const firstResponseSparkData = [98.5, 98.7, 98.6, 98.9, 99.0, 99.1];
  const resolutionSparkData = [98.2, 98.0, 98.1, 97.9, 97.8];
  const breachRiskSparkData = [2.1, 1.8, 1.6, 1.4, 1.2];
  const escalatedSparkData = [10, 11, 12, 14];
  const responseTimeSparkData = [3.1, 2.9, 2.7, 2.5, 2.4];
  const resolutionTimeSparkData = [16.2, 15.5, 14.8, 14.2];
  const backlogSparkData = [35, 38, 40, 42];
  const warningsSparkData = [4, 4, 3, 3];

  // Weekday translation helper for SVG charts
  const weekdayLabels = isRtl
    ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const hourlyLabels = isRtl
    ? ['9 ص', '11 ص', '1 م', '3 م', '5 م', '7 م', '9 م', '11 م']
    : ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM', '11 PM'];

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. Executive SLA KPI Header (8 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: First Response SLA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.slaAnalytics.kpiFirstResponse}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">99.1%</span>
            </div>
            <Clock className="w-7 h-7 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('+0.4%', true)}
              <span className="text-[9px] text-slate-400 font-medium">{t.analyticsCenter.slaAnalytics.kpiFirstResponseGoal}</span>
            </div>
            <Sparkline points={firstResponseSparkData} color="#10b981" />
          </div>
        </div>

        {/* Card 2: Resolution SLA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.slaAnalytics.kpiResolution}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">97.8%</span>
            </div>
            <AlertTriangle className="w-7 h-7 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('-0.2%', true)}
              <span className="text-[9px] text-slate-400 font-medium">{t.analyticsCenter.slaAnalytics.kpiResolutionGoal}</span>
            </div>
            <Sparkline points={resolutionSparkData} color="#f59e0b" />
          </div>
        </div>

        {/* Card 3: Breach Risk % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{loc.kpiBreachRisk}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">1.2%</span>
            </div>
            <ShieldAlert className="w-7 h-7 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('-0.5%', false)}
              <span className="text-[9px] text-slate-400 font-medium">{loc.kpiBreachRiskGoal}</span>
            </div>
            <Sparkline points={breachRiskSparkData} color="#10b981" />
          </div>
        </div>

        {/* Card 4: Escalated Tickets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{loc.kpiEscalatedTickets}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">14</span>
            </div>
            <TrendingUp className="w-7 h-7 text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('+2', false)}
              <span className="text-[9px] text-slate-400 font-medium">{loc.kpiEscalatedTicketsGoal}</span>
            </div>
            <Sparkline points={escalatedSparkData} color="#ef4444" />
          </div>
        </div>

        {/* Card 5: Avg Response Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.slaAnalytics.kpiAvgLatency}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">2.4 {t.analyticsCenter.wallboard.minsUnit}</span>
            </div>
            <Activity className="w-7 h-7 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('-0.3m', false)}
              <span className="text-[9px] text-slate-400 font-medium">{t.analyticsCenter.slaAnalytics.kpiAvgLatencySub}</span>
            </div>
            <Sparkline points={responseTimeSparkData} color="#10b981" />
          </div>
        </div>

        {/* Card 6: Avg Resolution Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{loc.kpiAvgResTime}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">14.2 {t.analyticsCenter.wallboard.minsUnit}</span>
            </div>
            <Clock className="w-7 h-7 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('-1.1m', false)}
              <span className="text-[9px] text-slate-400 font-medium">{loc.kpiAvgResTimeGoal}</span>
            </div>
            <Sparkline points={resolutionTimeSparkData} color="#10b981" />
          </div>
        </div>

        {/* Card 7: Queue Backlog */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{loc.kpiQueueBacklog}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">42</span>
            </div>
            <Users className="w-7 h-7 text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('+5', false)}
              <span className="text-[9px] text-slate-400 font-medium">{loc.kpiQueueBacklogGoal}</span>
            </div>
            <Sparkline points={backlogSparkData} color="#ef4444" />
          </div>
        </div>

        {/* Card 8: Active Warnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{loc.kpiActiveWarnings}</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">3</span>
            </div>
            <Shield className="w-7 h-7 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              {renderDeltaIndicator('-1', false)}
              <span className="text-[9px] text-slate-400 font-medium">{loc.kpiActiveWarningsGoal}</span>
            </div>
            <Sparkline points={warningsSparkData} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Grid of Monitor and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Real-Time SLA Breach Monitor (Left 2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{loc.breachMonitorTitle}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{loc.breachMonitorSubtitle}</p>
            </div>
            
            {/* Table Filters */}
            <div className="flex border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden self-start sm:self-center shrink-0">
              <button
                onClick={() => setMonitorFilter('all')}
                className={`px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${monitorFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
              >
                {loc.filterAll}
              </button>
              <button
                onClick={() => setMonitorFilter('critical')}
                className={`px-2.5 py-1 text-[10px] font-bold border-x border-slate-100 dark:border-slate-800 transition-all cursor-pointer ${monitorFilter === 'critical' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
              >
                {loc.filterCritical}
              </button>
              <button
                onClick={() => setMonitorFilter('warning')}
                className={`px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${monitorFilter === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
              >
                {loc.filterWarnings}
              </button>
            </div>
          </div>

          <EnterpriseTable headers={tableHeaders} empty={filteredCases.length === 0} emptyTitle="No matching cases" emptyDesc="There are no tickets matching this SLA filter currently.">
            {filteredCases.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                <td className="px-6 py-3.5 font-bold text-blue-600 dark:text-blue-400 font-mono">{c.ticketId}</td>
                <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{c.customerName}</td>
                <td className="px-6 py-3.5">
                  <Badge type={getPriorityBadgeType(c.priority)}>
                    {getPriorityLabel(c.priority)}
                  </Badge>
                </td>
                <td className="px-6 py-3.5">
                  <Badge type={c.statusType === 'critical' ? 'error' : c.statusType === 'warning' ? 'warning' : 'success'}>
                    {isRtl ? c.remainingTextAr : c.remainingText}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{isRtl ? c.channelAr : c.channel}</td>
                <td className="px-6 py-3.5 font-mono font-medium text-slate-900 dark:text-white">
                  {c.agent === 'Unassigned' ? (
                    <span className="text-slate-400 italic">{isRtl ? c.agentAr : c.agent}</span>
                  ) : (
                    isRtl ? c.agentAr : c.agent
                  )}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCoach(c.id)}
                      disabled={!canManage}
                      className={`px-2 py-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-bold cursor-pointer transition-colors ${!canManage ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={!canManage ? "Requires Manage Permission" : loc.actionCoach}
                    >
                      {isRtl ? 'توجيه' : 'Coach'}
                    </button>
                    <button
                      onClick={() => handleReassign(c.id)}
                      disabled={!canManage}
                      className={`px-2 py-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-bold cursor-pointer transition-colors ${!canManage ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={!canManage ? "Requires Manage Permission" : loc.actionReassign}
                    >
                      {isRtl ? 'تعيين' : 'Reassign'}
                    </button>
                    {c.priority !== 'critical' && (
                      <button
                        onClick={() => handleEscalate(c.id)}
                        disabled={!canManage}
                        className={`px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-[9px] font-bold cursor-pointer transition-colors ${!canManage ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={!canManage ? "Requires Manage Permission" : loc.actionEscalate}
                      >
                        {isRtl ? 'تصعيد' : 'Escalate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </EnterpriseTable>
        </div>

        {/* 7. AI Operations Insights Panel (Right Column) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{loc.aiInsightsTitle}</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{loc.aiInsightsSubtitle}</p>
          </div>

          <div className="flex-1 flex flex-col gap-4 py-1">
            {/* Insight 1 */}
            <div className="p-4 border border-violet-100 dark:border-violet-950/40 bg-violet-50/10 dark:bg-violet-950/10 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  {isRtl ? 'تخفيف الحمل' : 'Queue Balancing'}
                </span>
                <p className="text-[10px] leading-normal font-semibold text-slate-800 dark:text-slate-200">
                  {loc.balancingRecom}
                </p>
              </div>
              <button
                onClick={handleApplyBalancing}
                disabled={balancingApplied || !canManage}
                className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  balancingApplied 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default' 
                    : !canManage
                    ? 'bg-violet-600/60 opacity-60 cursor-not-allowed text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
                title={!canManage ? "Requires Manage Permission" : undefined}
              >
                {balancingApplied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{balancingApplied ? loc.appliedStatus : loc.btnApplyBalancing}</span>
              </button>
            </div>

            {/* Insight 2 */}
            <div className="p-4 border border-blue-100 dark:border-blue-955/40 bg-blue-50/10 dark:bg-blue-950/10 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {isRtl ? 'جدولة الموارد' : 'Predictive Staffing'}
                </span>
                <p className="text-[10px] leading-normal font-semibold text-slate-800 dark:text-slate-200">
                  {loc.shiftRecom}
                </p>
              </div>
              <button
                onClick={handleApproveExtension}
                disabled={shiftApproved || !canManage}
                className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  shiftApproved 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default' 
                    : !canManage
                    ? 'bg-blue-600/60 opacity-60 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title={!canManage ? "Requires Manage Permission" : undefined}
              >
                {shiftApproved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{shiftApproved ? loc.approvedStatus : loc.btnApproveExtension}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Queue Health & Workload Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{loc.queueHealthTitle}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{loc.queueHealthSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Queue 1: Billing */}
          <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'طابور الفواتير' : 'Billing Queue'}</h5>
                  <span className="text-[9px] text-slate-400 font-mono">15 active / 8.4m wait</span>
                </div>
              </div>
              <Badge type="warning">{loc.congestionHigh}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{loc.colAdherence}</span>
                <span className="font-bold text-amber-500">94.5%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '94.5%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">{loc.colRisk}</span>
              <Badge type="warning">{loc.riskHigh}</Badge>
            </div>
          </div>

          {/* Queue 2: Tech Support */}
          <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'الدعم الفني' : 'Technical Support'}</h5>
                  <span className="text-[9px] text-slate-400 font-mono">24 active / 4.2m wait</span>
                </div>
              </div>
              <Badge type="info">{loc.congestionMod}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{loc.colAdherence}</span>
                <span className="font-bold text-amber-500">97.8%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '97.8%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">{loc.colRisk}</span>
              <Badge type="warning">{loc.riskMed}</Badge>
            </div>
          </div>

          {/* Queue 3: VIP */}
          <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'دعم كبار الشخصيات VIP' : 'VIP Executive Line'}</h5>
                  <span className="text-[9px] text-slate-400 font-mono">2 active / 1.1m wait</span>
                </div>
              </div>
              <Badge type="success">{loc.congestionLow}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{loc.colAdherence}</span>
                <span className="font-bold text-emerald-500">100%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">{loc.colRisk}</span>
              <Badge type="success">{loc.riskLow}</Badge>
            </div>
          </div>

          {/* Queue 4: WhatsApp */}
          <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'دعم واتساب' : 'WhatsApp Support'}</h5>
                  <span className="text-[9px] text-slate-400 font-mono">18 active / 6.5m wait</span>
                </div>
              </div>
              <Badge type="warning">{loc.congestionHigh}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{loc.colAdherence}</span>
                <span className="font-bold text-rose-500">92.1%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '92.1%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">{loc.colRisk}</span>
              <Badge type="warning">{loc.riskHigh}</Badge>
            </div>
          </div>

          {/* Queue 5: Email */}
          <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'الدعم البريدي الإلكتروني' : 'Email Support'}</h5>
                  <span className="text-[9px] text-slate-400 font-mono">35 active / 28.5m wait</span>
                </div>
              </div>
              <Badge type="info">{loc.congestionMod}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{loc.colAdherence}</span>
                <span className="font-bold text-emerald-500">98.6%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.6%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">{loc.colRisk}</span>
              <Badge type="success">{loc.riskLow}</Badge>
            </div>
          </div>

          {/* Queue 6: Voice */}
          <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'الدعم الصوتي (الهاتف)' : 'Voice Call Center'}</h5>
                  <span className="text-[9px] text-slate-400 font-mono">8 active / 2.4m wait</span>
                </div>
              </div>
              <Badge type="success">{loc.congestionLow}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{loc.colAdherence}</span>
                <span className="font-bold text-emerald-500">99.2%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99.2%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">{loc.colRisk}</span>
              <Badge type="success">{loc.riskLow}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Row: SLA Switcher Reports (Line & Bar charts) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{loc.trendTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{loc.trendSubtitle}</p>
          </div>

          {/* Interactive Chart Tabs Selector */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <button
              onClick={() => setActiveChartTab('response')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${activeChartTab === 'response' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {loc.tabResponseTimes}
            </button>
            <button
              onClick={() => setActiveChartTab('breaches')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${activeChartTab === 'breaches' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {loc.tabDailyBreaches}
            </button>
            <button
              onClick={() => setActiveChartTab('pressure')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${activeChartTab === 'pressure' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {loc.tabHourlyPressure}
            </button>
            <button
              onClick={() => setActiveChartTab('adherence')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${activeChartTab === 'adherence' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {loc.tabDailyAdherence}
            </button>
            <button
              onClick={() => setActiveChartTab('escalations')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${activeChartTab === 'escalations' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {loc.tabEscalations}
            </button>
          </div>
        </div>

        {/* SVG Container: Zero overflow protection with viewBox */}
        <div className="w-full overflow-hidden">
          <div className="relative w-full h-[220px]">
            <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="crimsonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 30 + ratio * 130;
                return (
                  <line
                    key={idx}
                    x1="50"
                    y1={y}
                    x2="470"
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-slate-150 dark:text-slate-800/80"
                  />
                );
              })}

              {/* Render dynamic charts */}
              {activeChartTab === 'response' && (
                <>
                  {/* Y Axis labels: Response time 0m to 5m */}
                  {[5, 3.75, 2.5, 1.25, 0].map((val, idx) => {
                    const y = 30 + idx * 32.5;
                    return (
                      <text key={idx} x="42" y={y + 3} textAnchor="end" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                        {val.toFixed(2)}m
                      </text>
                    );
                  })}
                  {/* Area path for 2.8, 2.5, 2.7, 2.4, 2.2, 2.6, 2.4 */}
                  <path
                    d="M 50 100.4 L 120 110 L 190 103.6 L 260 113.2 L 330 119.6 L 400 106.8 L 470 113.2 L 470 160 L 50 160 Z"
                    fill="url(#purpleGrad)"
                  />
                  {/* Line path */}
                  <path
                    d="M 50 100.4 L 120 110 L 190 103.6 L 260 113.2 L 330 119.6 L 400 106.8 L 470 113.2"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* X Axis labels */}
                  {weekdayLabels.map((lbl, idx) => (
                    <text key={idx} x={50 + idx * 70} y="180" textAnchor="middle" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                      {lbl}
                    </text>
                  ))}
                  {/* Points */}
                  {[100.4, 110, 103.6, 113.2, 119.6, 106.8, 113.2].map((y, idx) => (
                    <circle key={idx} cx={50 + idx * 70} cy={y} r="3" className="fill-white stroke-[#6366f1] stroke-2" />
                  ))}
                </>
              )}

              {activeChartTab === 'breaches' && (
                <>
                  {/* Y Axis labels: 0 to 6 breaches */}
                  {[6, 4.5, 3, 1.5, 0].map((val, idx) => {
                    const y = 30 + idx * 32.5;
                    return (
                      <text key={idx} x="42" y={y + 3} textAnchor="end" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                        {Math.round(val)}
                      </text>
                    );
                  })}
                  {/* Bars for 4, 2, 5, 1, 0, 3, 2 */}
                  {[
                    { val: 4, h: 4 * 21.6 },
                    { val: 2, h: 2 * 21.6 },
                    { val: 5, h: 5 * 21.6 },
                    { val: 1, h: 1 * 21.6 },
                    { val: 0, h: 0 },
                    { val: 3, h: 3 * 21.6 },
                    { val: 2, h: 2 * 21.6 }
                  ].map((bar, idx) => (
                    <rect
                      key={idx}
                      x={50 + idx * 70 - 10}
                      y={160 - bar.h}
                      width="20"
                      height={bar.h}
                      rx="4"
                      fill="url(#crimsonGrad)"
                      stroke="#f43f5e"
                      strokeWidth="1"
                    />
                  ))}
                  {/* X Axis labels */}
                  {weekdayLabels.map((lbl, idx) => (
                    <text key={idx} x={50 + idx * 70} y="180" textAnchor="middle" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                      {lbl}
                    </text>
                  ))}
                </>
              )}

              {activeChartTab === 'pressure' && (
                <>
                  {/* Y Axis labels: active cases 0 to 35 */}
                  {[35, 26, 17, 8, 0].map((val, idx) => {
                    const y = 30 + idx * 32.5;
                    return (
                      <text key={idx} x="42" y={y + 3} textAnchor="end" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                        {val}
                      </text>
                    );
                  })}
                  {/* Bars for 12, 18, 25, 30, 22, 15, 10, 5 */}
                  {[12, 18, 25, 30, 22, 15, 10, 5].map((val, idx) => {
                    const h = (val / 35) * 130;
                    return (
                      <rect
                        key={idx}
                        x={50 + idx * 60 - 8}
                        y={160 - h}
                        width="16"
                        height={h}
                        rx="4"
                        fill="url(#amberGrad)"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* X Axis labels */}
                  {hourlyLabels.map((lbl, idx) => (
                    <text key={idx} x={50 + idx * 60} y="180" textAnchor="middle" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                      {lbl}
                    </text>
                  ))}
                </>
              )}

              {activeChartTab === 'adherence' && (
                <>
                  {/* Y Axis labels: 90% to 100% */}
                  {['100%', '97.5%', '95.0%', '92.5%', '90.0%'].map((val, idx) => {
                    const y = 30 + idx * 32.5;
                    return (
                      <text key={idx} x="42" y={y + 3} textAnchor="end" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                        {val}
                      </text>
                    );
                  })}
                  {/* Area path for 97.5%, 98.1%, 97.8%, 98.5%, 99.1%, 98.8%, 99.3% */}
                  <path
                    d="M 50 70 L 120 60.4 L 190 65.2 L 260 54 L 330 44.4 L 400 49.2 L 470 41.2 L 470 160 L 50 160 Z"
                    fill="url(#greenGrad)"
                  />
                  {/* Line path */}
                  <path
                    d="M 50 70 L 120 60.4 L 190 65.2 L 260 54 L 330 44.4 L 400 49.2 L 470 41.2"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* X Axis labels */}
                  {weekdayLabels.map((lbl, idx) => (
                    <text key={idx} x={50 + idx * 70} y="180" textAnchor="middle" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                      {lbl}
                    </text>
                  ))}
                  {/* Points */}
                  {[70, 60.4, 65.2, 54, 44.4, 49.2, 41.2].map((y, idx) => (
                    <circle key={idx} cx={50 + idx * 70} cy={y} r="3" className="fill-white stroke-[#10b981] stroke-2" />
                  ))}
                </>
              )}

              {activeChartTab === 'escalations' && (
                <>
                  {/* Y Axis labels: 0 to 20 */}
                  {[20, 15, 10, 5, 0].map((val, idx) => {
                    const y = 30 + idx * 32.5;
                    return (
                      <text key={idx} x="42" y={y + 3} textAnchor="end" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                        {val}
                      </text>
                    );
                  })}
                  {/* Line path for 8, 12, 15, 11, 14, 18, 14 */}
                  <path
                    d="M 50 126 L 120 94 L 190 70 L 260 102 L 330 78 L 400 46 L 470 78"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* X Axis labels */}
                  {weekdayLabels.map((lbl, idx) => (
                    <text key={idx} x={50 + idx * 70} y="180" textAnchor="middle" fontSize="9" className="fill-slate-400 dark:fill-slate-500 font-mono font-bold">
                      {lbl}
                    </text>
                  ))}
                  {/* Points */}
                  {[126, 94, 70, 102, 78, 46, 78].map((y, idx) => (
                    <circle key={idx} cx={50 + idx * 70} cy={y} r="3" className="fill-white stroke-[#3b82f6] stroke-2" />
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Grid: Leaderboard and Timeline Incident Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 5. Escalation Timeline & Incident Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{loc.incidentTitle}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{loc.incidentSubtitle}</p>
            </div>

            {/* Filter controls */}
            <div className="flex border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={() => setTimelineFilter('all')}
                className={`px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${timelineFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-550 dark:bg-slate-950 text-slate-500'}`}
              >
                {loc.filterAll}
              </button>
              <button
                onClick={() => setTimelineFilter('critical')}
                className={`px-2 py-0.5 text-[9px] font-bold border-x border-slate-100 dark:border-slate-800 cursor-pointer transition-all ${timelineFilter === 'critical' ? 'bg-rose-600 text-white' : 'bg-slate-550 dark:bg-slate-950 text-slate-500'}`}
              >
                {t.analyticsCenter.slaAnalytics.colPriority === 'الأولوية' ? 'حرجة' : 'Critical'}
              </button>
              <button
                onClick={() => setTimelineFilter('warning')}
                className={`px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${timelineFilter === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-550 dark:bg-slate-950 text-slate-500'}`}
              >
                {t.analyticsCenter.slaAnalytics.colPriority === 'الأولوية' ? 'تحذير' : 'Warning'}
              </button>
              <button
                onClick={() => setTimelineFilter('info')}
                className={`px-2 py-0.5 text-[9px] font-bold border-l border-slate-100 dark:border-slate-800 cursor-pointer transition-all ${timelineFilter === 'info' ? 'bg-blue-500 text-white' : 'bg-slate-550 dark:bg-slate-950 text-slate-500'}`}
              >
                {loc.filterInfo}
              </button>
            </div>
          </div>

          <div className="max-h-[290px] overflow-y-auto pr-1 space-y-4">
            {filteredIncidents.map((inc) => (
              <div key={inc.id} className="flex gap-4 relative group">
                {/* Visual Line connector */}
                <div className="w-1.5 flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full shrink-0 border-2 border-white dark:border-slate-900 ${
                    inc.category === 'critical' ? 'bg-rose-500' : inc.category === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="w-[1px] flex-1 bg-slate-100 dark:bg-slate-800 group-last:hidden" />
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-4 border-b border-slate-50 dark:border-slate-850/50 group-last:border-none">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white font-sans">
                      {isRtl ? inc.titleAr : inc.title}
                    </span>
                    <Badge type={inc.category === 'critical' ? 'error' : inc.category === 'warning' ? 'warning' : 'info'}>
                      {inc.category.toUpperCase()}
                    </Badge>
                    <span className="text-[9px] text-slate-400 font-mono font-bold ml-auto">{inc.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {isRtl ? inc.descriptionAr : inc.description}
                  </p>
                  <span className="text-[8px] text-slate-400 font-mono mt-1 block">
                    {loc.sourceLabel}: {inc.source}
                  </span>
                </div>
              </div>
            ))}
            {filteredIncidents.length === 0 && (
              <p className="text-center text-slate-400 py-8 italic font-sans">No incidents recorded in this filter category.</p>
            )}
          </div>
        </div>

        {/* 6. Agent & Team SLA Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{loc.leaderboardTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{loc.leaderboardSubtitle}</p>
          </div>

          <div className="space-y-4">
            {/* Top Performers section */}
            <div>
              <h5 className="text-[10px] font-black uppercase font-mono tracking-widest text-slate-400 mb-2">{loc.topPerformers}</h5>
              <div className="space-y-2">
                {/* Performer 1 */}
                <div className="flex items-center justify-between p-2.5 border border-slate-50 dark:border-slate-850 bg-slate-50/10 dark:bg-slate-950/5 rounded-xl">
                  <div>
                    <h6 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'سارة كونور' : 'Sarah Connor'}</h6>
                    <span className="text-[8px] text-slate-400 font-mono">{isRtl ? 'الدعم الصوتي (الهاتف)' : 'Voice Call Center'}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-right">
                    <div>
                      <span className="text-[8px] text-slate-400 block">{loc.complianceRate}</span>
                      <span className="text-[10px] font-black text-emerald-500">99.8%</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block">{loc.latencyVal}</span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">1.2m</span>
                    </div>
                  </div>
                </div>

                {/* Performer 2 */}
                <div className="flex items-center justify-between p-2.5 border border-slate-50 dark:border-slate-850 bg-slate-50/10 dark:bg-slate-950/5 rounded-xl">
                  <div>
                    <h6 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'جون دو' : 'John Doe'}</h6>
                    <span className="text-[8px] text-slate-400 font-mono">{isRtl ? 'دعم كبار الشخصيات VIP' : 'VIP Executive Line'}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-right">
                    <div>
                      <span className="text-[8px] text-slate-400 block">{loc.complianceRate}</span>
                      <span className="text-[10px] font-black text-emerald-500">99.5%</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block">{loc.latencyVal}</span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">1.0m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coaching Required section */}
            <div>
              <h5 className="text-[10px] font-black uppercase font-mono tracking-widest text-slate-400 mb-2">{loc.coachingRequired}</h5>
              <div className="space-y-2">
                {coachingAgents.map((agent, idx) => {
                  const { canManage } = usePermission('sla');
                  const isTeam = agent.name.includes('Team') || agent.nameAr.includes('فريق');
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 border border-rose-100/10 dark:border-rose-950/20 bg-rose-50/5 dark:bg-rose-950/5 rounded-xl">
                      <div>
                        <h6 className="font-bold text-slate-900 dark:text-white">{isRtl ? agent.nameAr : agent.name}</h6>
                        <span className="text-[8px] text-slate-400 font-mono">{isRtl ? agent.channelAr : agent.channel}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 font-mono text-right">
                          <div>
                            <span className="text-[8px] text-slate-400 block">{isTeam ? (isRtl ? 'الحجم' : 'Backlog') : loc.complianceRate}</span>
                            <span className="text-[10px] font-black text-rose-500">{agent.compliance}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block">{isTeam ? (isRtl ? 'التاخير' : 'Wait Time') : loc.latencyVal}</span>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white">{agent.metricValue}</span>
                          </div>
                        </div>

                        {/* Interactive Coaching trigger button */}
                        <button
                          onClick={() => handleLeaderboardAction(idx)}
                          disabled={agent.status === 'scheduled' || !canManage}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                            agent.status === 'scheduled'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default font-sans'
                              : !canManage
                              ? 'bg-white opacity-60 cursor-not-allowed border border-slate-200 text-slate-400 font-sans'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-sans'
                          }`}
                          title={!canManage ? "Requires Manage Permission" : undefined}
                        >
                          {agent.status === 'scheduled' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>{isTeam ? loc.rebalancedLabel : loc.coachingScheduled}</span>
                            </>
                          ) : (
                            <span>{isTeam ? loc.rebalanceTeam : loc.initiateCoaching}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
