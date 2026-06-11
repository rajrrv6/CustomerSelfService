'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { DialogNodeType } from '../types';
import {
  Play, MessageSquare, GitBranch, BrainCircuit, Globe, ShieldAlert,
  Sliders, Clock, UserCheck, Search, Power
} from 'lucide-react';

interface GraphSidebarProps {
  className?: string;
}

interface DraggableItem {
  type: DialogNodeType;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const draggableNodes: DraggableItem[] = [
  {
    type: 'start',
    labelEn: 'Start Gateway',
    labelAr: 'بوابة البداية',
    descEn: 'The entry point of the dialogue flow.',
    descAr: 'نقطة الدخول الرئيسية لمسار الحوار.',
    icon: Play,
    colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
  },
  {
    type: 'intent',
    labelEn: 'Intent Matcher',
    labelAr: 'مطابق النية',
    descEn: 'Triggers when a specific customer intent is identified.',
    descAr: 'يتفعل عند تحديد نية معينة للعميل.',
    icon: BrainCircuit,
    colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
  },
  {
    type: 'message',
    labelEn: 'Send Message',
    labelAr: 'إرسال رسالة',
    descEn: 'Outputs a multilingual text response with typing delay.',
    descAr: 'يرسل استجابة نصية متعددة اللغات مع تأخير الكتابة.',
    icon: MessageSquare,
    colorClass: 'text-slate-600 bg-slate-50 dark:bg-slate-900/30'
  },
  {
    type: 'condition',
    labelEn: 'Condition Router',
    labelAr: 'موجّه الشرط',
    descEn: 'Branches the flow dynamically using variable conditions.',
    descAr: 'يفرّع المسار ديناميكياً باستخدام شروط المتغيرات.',
    icon: GitBranch,
    colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
  },
  {
    type: 'api_action',
    labelEn: 'API Action',
    labelAr: 'طلب واجهة API',
    descEn: 'Executes a secure REST API call with retry policy.',
    descAr: 'ينفذ اتصالاً آمناً بواجهة برمجة التطبيقات REST.',
    icon: Globe,
    colorClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
  },
  {
    type: 'variable_set',
    labelEn: 'Set Variable',
    labelAr: 'تعيين متغير',
    descEn: 'Sets a local session or context variable.',
    descAr: 'يعيّن قيمة لمتغير محلي أو متغير جلسة.',
    icon: Sliders,
    colorClass: 'text-slate-500 bg-slate-50 dark:bg-slate-900/30'
  },
  {
    type: 'delay',
    labelEn: 'Time Delay',
    labelAr: 'تأخير زمني',
    descEn: 'Pauses the flow execution for a set duration.',
    descAr: 'يوقف تشغيل المسار مؤقتاً لفترة زمنية محددة.',
    icon: Clock,
    colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
  },
  {
    type: 'knowledge_search',
    labelEn: 'KB Search',
    labelAr: 'بحث المعرفة RAG',
    descEn: 'Searches RAG-indexed database for context resolutions.',
    descAr: 'يبحث في قاعدة المعرفة المرجعية عن حلول السياق.',
    icon: Search,
    colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
  },
  {
    type: 'human_handoff',
    labelEn: 'Agent Handoff',
    labelAr: 'تحويل لوكيل بشري',
    descEn: 'Transfers active session immediately to standard inbox.',
    descAr: 'يحول الجلسة النشطة فوراً لصندوق وارد الممثل البشري.',
    icon: UserCheck,
    colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
  },
  {
    type: 'escalation',
    labelEn: 'SLA Escalation',
    labelAr: 'تصعيد SLA',
    descEn: 'Triggers priority queue routing with severity tags.',
    descAr: 'يفعّل توجيه طابور الأولوية مع علامات الخطورة.',
    icon: ShieldAlert,
    colorClass: 'text-red-500 bg-red-50 dark:bg-red-950/20'
  },
  {
    type: 'end',
    labelEn: 'End Session',
    labelAr: 'إنهاء الجلسة',
    descEn: 'Completes execution and triggers CSAT surveys.',
    descAr: 'ينهي الجلسة ويفعّل تقييم رضا العملاء.',
    icon: Power,
    colorClass: 'text-red-655 bg-red-50 dark:bg-red-950/20'
  }
];

export function GraphSidebar({ className = '' }: GraphSidebarProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const onDragStart = (event: React.DragEvent, nodeType: DialogNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`w-64 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shrink-0 ${
        isAr ? 'border-l' : 'border-r'
      } ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-wider font-sans text-slate-800 dark:text-slate-200">
          {isAr ? 'لوحة عناصر المحادثة' : 'Dialogue Nodes Toolbox'}
        </h3>
        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
          {isAr
            ? 'اسحب وأسقط العناصر في مساحة العمل لتصميم مسار الحوار.'
            : 'Drag and drop nodes onto the canvas to map out your self-service workflow.'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {draggableNodes.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className="flex items-center gap-3 p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm rounded-xl cursor-grab transition-all select-none active:cursor-grabbing shrink-0"
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 ${item.colorClass} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                  {isAr ? item.labelAr : item.labelEn}
                </h4>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 leading-snug mt-0.5 truncate max-w-44" title={isAr ? item.descAr : item.descEn}>
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
