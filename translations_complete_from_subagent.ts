export interface TranslationKeys {
  appName: string;
  roleSwitcher: string;
  theme: string;
  language: string;
  logout: string;
  search: string;
  filters: string;
  actions: string;
  status: string;
  priority: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  create: string;
  export: string;
  active: string;
  unassigned: string;
  resolved: string;
  escalated: string;
  urgent: string;
  high: string;
  medium: string;
  low: string;
  submit: string;
  dashboard: string;
  unifiedInbox: string;
  conversations: string;
  tickets: string;
  botManagement: string;
  personaEditor: string;
  intentManagement: string;
  dialogBuilder: string;
  knowledgeBase: string;
  safetyGuardrails: string;
  omnichannel: string;
  analytics: string;
  qaCoaching: string;
  workforceMgmt: string;
  integrations: string;
  customerPortal: string;
  publicBotWidget: string;
  systemSettings: string;
  llmRegistry: string;
  asrTtsRegistry: string;
  costBenchmarks: string;
  crossTenantAnalytics: string;
  vectorDbStatus: string;
  sipTrunkConfig: string;
  dialogFlow: {
    layout: {
      mobileInspectorTitle: string;
      mobileInspectorClose: string;
      simulatorSheetTitle: string;
      simulatorSheetDesc: string;
      footerVersion: string;
      footerLoadDraft: string;
      footerSaveDraft: string;
    };
    toolbar: {
      panels: string;
      variables: string;
      simulator: string;
      addNode: string;
      validateFlow: string;
      startSim: string;
      resetSim: string;
      validationOk: string;
    };
    inspector: {
      variablesContext: string;
      regressionSuite: string;
      memoryRegister: string;
      liveTraceMap: string;
      assertions: string;
      runAssertionSuite: string;
    };
    simulator: {
      title: string;
      chatTab: string;
      traceLogs: string;
      idleMessage: string;
      startSim: string;
      stepDebugger: string;
      nextStep: string;
      noTraceLogs: string;
      executionInProgress: string;
      simulatorWaiting: string;
    };
  };
  analyticsCenter: {
    layout: {
      title: string;
      subtitle: string;
      liveStream: string;
      tabExecutive: string;
      tabSla: string;
      tabWorkforce: string;
      tabAi: string;
      tabIntegrations: string;
      subWallboard: string;
      subPerformance: string;
      subGuardrails: string;
      subCosts: string;
    };
    execDashboard: {
      alertsTitle: string;
      kpiPortalTraffic: string;
      kpiPortalTrafficSub: string;
      kpiPortalTrafficTrend: string;
      kpiDeflection: string;
      kpiDeflectionSub: string;
      kpiDeflectionTarget: string;
      kpiSla: string;
      kpiSlaSub: string;
      kpiSlaGoal: string;
      kpiCsat: string;
      kpiCsatSub: string;
      kpiCsatPositive: string;
      funnelTitle: string;
      funnelSubtitle: string;
      funnelSessions: string;
      feedTitle: string;
      feedSubtitle: string;
    };
    wallboard: {
      consoleTitle: string;
      consoleSubtitle: string;
      simulateCall: string;
      systemIdle: string;
      kpiCallsInQueue: string;
      kpiCallsInQueueSub: string;
      kpiMaxWait: string;
      kpiMaxWaitSub: string;
      kpiVoiceQuality: string;
      kpiVoiceQualitySub: string;
      kpiActiveStaff: string;
      kpiActiveStaffSub: string;
      queueTitle: string;
      queueSubtitle: string;
      queueEmpty: string;
      queueColCustomer: string;
      queueColPhone: string;
      queueColQueue: string;
      queueColPriority: string;
      queueColWait: string;
      queueColAction: string;
      routeAction: string;
      sipTitle: string;
      sipSubtitle: string;
      jitter: string;
      packetLoss: string;
      supervisorTitle: string;
      supervisorSubtitle: string;
      supColSupervisor: string;
      supColAgent: string;
      supColMode: string;
      supColDuration: string;
      supColTimestamp: string;
      minsUnit: string;
      actionWhisper: string;
      actionBarge: string;
      actionSilent: string;
    };
    containment: {
      chartTitle: string;
      guardrailTitle: string;
      guardrailSubtitle: string;
      confidenceScore: string;
      critical: string;
      escalatedTo: string;
      promptMatrixTitle: string;
      promptMatrixSubtitle: string;
      colPromptName: string;
      colCategory: string;
      colSuccessRate: string;
      colAvgTokens: string;
      colLatency: string;
      tokensUnit: string;
    };
    costAnalytics: {
      kpiTotalCost: string;
      kpiTotalCostSub: string;
      kpiInputTokens: string;
      kpiInputTokensSub: string;
      kpiOutputTokens: string;
      kpiOutputTokensSub: string;
      chartTitle: string;
      logsTitle: string;
      inputLabel: string;
      outputLabel: string;
      ragTitle: string;
      ragSubtitle: string;
      colQuery: string;
      colCategory: string;
      colFrequency: string;
      colClosestMatch: string;
      hitsUnit: string;
      closestTarget: string;
    };
    slaAnalytics: {
      kpiFirstResponse: string;
      kpiFirstResponseGoal: string;
      kpiResolution: string;
      kpiResolutionGoal: string;
      kpiAvgLatency: string;
      kpiAvgLatencySub: string;
      csatTitle: string;
      npsTitle: string;
      escalationTitle: string;
      escalationSubtitle: string;
      colTicketId: string;
      colCustomer: string;
      colPriority: string;
      colReason: string;
      colTime: string;
      minsAgo: string;
    };
  };
}

export const translations: Record<'en' | 'ar', TranslationKeys> = {
  en: {
    appName: 'AI-Native mPaaS CX',
    roleSwitcher: 'Select Role',
    theme: 'Theme',
    language: 'Language',
    logout: 'Sign Out',
    search: 'Search...',
    filters: 'Filters',
    actions: 'Actions',
    status: 'Status',
    priority: 'Priority',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create New',
    export: 'Export Data',
    active: 'Active',
    unassigned: 'Unassigned',
    resolved: 'Resolved',
    escalated: 'Escalated',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    submit: 'Submit',
    dashboard: 'Dashboard',
    unifiedInbox: 'Unified Inbox',
    conversations: 'Conversations',
    tickets: 'Ticketing System',
    botManagement: 'Bot Management',
    personaEditor: 'Persona Editor',
    intentManagement: 'Intent & Slots',
    dialogBuilder: 'Dialog Flow Builder',
    knowledgeBase: 'RAG & Knowledge Base',
    safetyGuardrails: 'Safety & Guardrails',
    omnichannel: 'Omnichannel Channels',
    analytics: 'Analytics & CSAT',
    qaCoaching: 'QA & Coaching',
    workforceMgmt: 'Workforce Planning',
    integrations: 'ERP & CRM Integrations',
    customerPortal: 'Customer Portal',
    publicBotWidget: 'Public Bot Widget',
    systemSettings: 'Global System Settings',
    llmRegistry: 'LLM Model Registry',
    asrTtsRegistry: 'ASR/TTS Provider Registry',
    costBenchmarks: 'Model Cost Benchmarks',
    crossTenantAnalytics: 'Cross-Tenant Analytics',
    vectorDbStatus: 'Vector DB Clusters',
    sipTrunkConfig: 'SIP Trunk Voice Config',
    dialogFlow: {
      layout: {
        mobileInspectorTitle: 'Workflow Inspector',
        mobileInspectorClose: 'Close',
        simulatorSheetTitle: 'Farah NLU Simulator',
        simulatorSheetDesc: 'Run chat simulation and inspect trace logs.',
        footerVersion: 'mPaaS AI Workflow Engine: v1.8.0-stable',
        footerLoadDraft: 'Load Cache Draft',
        footerSaveDraft: 'Save Cache Draft',
      },
      toolbar: {
        panels: 'Panels',
        variables: 'Variables',
        simulator: 'Simulator',
        addNode: 'Add Node:',
        validateFlow: 'Validate Flow',
        startSim: 'Start Sim',
        resetSim: 'Reset Sim',
        validationOk: 'Workflow structural integrity looks correct. Ready for production ingestion deployment pipeline.',
      },
      inspector: {
        variablesContext: 'Variables Context',
        regressionSuite: 'Regression Suite',
        memoryRegister: 'Memory Register',
        liveTraceMap: 'Live Trace Map',
        assertions: 'Assertions',
        runAssertionSuite: 'Run Assertion Suite',
      },
      simulator: {
        title: 'Farah NLU Sim',
        chatTab: 'Chat',
        traceLogs: 'Trace logs',
        idleMessage: 'Simulator is idle. Setup target parameters in the canvas and click "Start Simulation" to test variables.',
        startSim: 'Start Sim',
        stepDebugger: 'Step debugger active:',
        nextStep: 'Next Step',
        noTraceLogs: 'No execution traces.',
        executionInProgress: 'Execution in progress. Click Next Step.',
        simulatorWaiting: 'Simulator is waiting to be initialized.',
      },
    },
    analyticsCenter: {
      layout: {
        title: 'Analytics & Observability Center',
        subtitle: 'Real-time telemetry, agent queues capacity, generative guardrail logs, and API connector performance metrics.',
        liveStream: 'LIVE TELEMETRY STREAM ACTIVE',
        tabExecutive: 'Executive Overview',
        tabSla: 'SLA & CSAT/NPS',
        tabWorkforce: 'Workforce & Queues',
        tabAi: 'AI Observability',
        tabIntegrations: 'Integrations Observability',
        subWallboard: 'Live Call Wallboard',
        subPerformance: 'Workforce Performance & Heatmap',
        subGuardrails: 'Generative Guardrails & Prompts',
        subCosts: 'Token Costs & RAG Failures',
      },
      execDashboard: {
        alertsTitle: 'Live Operations Warnings & SLA Indicators',
        kpiPortalTraffic: 'Portal Traffic',
        kpiPortalTrafficSub: 'Realtime sessions tracked',
        kpiPortalTrafficTrend: '+18.2% vs prev week',
        kpiDeflection: 'Self-Service Deflection',
        kpiDeflectionSub: 'Resolved without Agent',
        kpiDeflectionTarget: 'Target: 60.0%',
        kpiSla: 'SLA Compliance',
        kpiSlaSub: 'Response & Resolution',
        kpiSlaGoal: 'Goal: 98.0%',
        kpiCsat: 'Satisfaction Score',
        kpiCsatSub: 'Average CSAT index',
        kpiCsatPositive: 'Positive ratio: 84%',
        funnelTitle: 'Customer Journey Conversion Funnel',
        funnelSubtitle: 'Deflection conversion vs ticket creation drop-off.',
        funnelSessions: 'sessions',
        feedTitle: 'Real-Time Operational Feed',
        feedSubtitle: 'Live streaming logs from RAG searches, webhooks, and telephony gateways.',
      },
      wallboard: {
        consoleTitle: 'Live Telephony Wallboard Console',
        consoleSubtitle: 'Trigger real-time incoming voice calls and manage queue handoffs instantly to test operations.',
        simulateCall: 'Simulate Inbound Call',
        systemIdle: 'System Idle. Waiting for trigger activity...',
        kpiCallsInQueue: 'Calls In Queue',
        kpiCallsInQueueSub: 'Active waiting callers',
        kpiMaxWait: 'Max Queue Wait',
        kpiMaxWaitSub: 'Longest active wait duration',
        kpiVoiceQuality: 'Voice Quality (MOS)',
        kpiVoiceQualitySub: 'Mean Opinion Score (PCMU/Opus)',
        kpiActiveStaff: 'Active Staffing',
        kpiActiveStaffSub: 'Total active agent roster',
        queueTitle: 'Live Telephony Waiting Queue',
        queueSubtitle: 'Real-time incoming callers waiting for agent allocation.',
        queueEmpty: 'No callers currently waiting in queue.',
        queueColCustomer: 'Customer Name',
        queueColPhone: 'Contact Number',
        queueColQueue: 'Target Queue',
        queueColPriority: 'Priority',
        queueColWait: 'Wait Time',
        queueColAction: 'Action',
        routeAction: 'Route',
        sipTitle: 'Twilio Voice quality & SIP Trunks',
        sipSubtitle: 'Real-time signal diagnostics, packet loss, and codec degradation parameters.',
        jitter: 'Jitter',
        packetLoss: 'Packet Loss',
        supervisorTitle: 'Supervisor Monitoring & Whisper Log',
        supervisorSubtitle: 'Audit of real-time supervisor whisper, barge-in, and silent monitoring interactions on active voice channels.',
        supColSupervisor: 'Supervisor Name',
        supColAgent: 'Target Agent',
        supColMode: 'Monitoring Mode',
        supColDuration: 'Duration Active',
        supColTimestamp: 'Trigger Timestamp',
        minsUnit: 'mins',
        actionWhisper: 'Whispering',
        actionBarge: 'Barging In',
        actionSilent: 'Silent Monitoring',
      },
      containment: {
        chartTitle: 'Farah AI Support Containment Rate (%)',
        guardrailTitle: 'Generative Guardrails & Hallucination Logs',
        guardrailSubtitle: 'Real-time alerts triggered by semantic validation failures or low confidence scores.',
        confidenceScore: 'Confidence Score',
        critical: 'CRITICAL',
        escalatedTo: 'TO AGENT',
        promptMatrixTitle: 'LLM Prompt Performance Matrix',
        promptMatrixSubtitle: 'Telemetry parameters for prompt iterations deployed across Farah AI classification and SAP reasoning layers.',
        colPromptName: 'Prompt Configuration Name',
        colCategory: 'Category Layer',
        colSuccessRate: 'Prompt Success Rate',
        colAvgTokens: 'Avg Tokens',
        colLatency: 'Latency (ms)',
        tokensUnit: 'tokens',
      },
      costAnalytics: {
        kpiTotalCost: 'Total LLM API Cost',
        kpiTotalCostSub: 'Aggregated across active LLM endpoints',
        kpiInputTokens: 'Input Tokens Consumed',
        kpiInputTokensSub: 'Cached context optimization active',
        kpiOutputTokens: 'Output Tokens Generated',
        kpiOutputTokensSub: 'Completion token ratio: 28.5%',
        chartTitle: 'AI Model Cost Breakdown (USD)',
        logsTitle: 'Token Observability Logs',
        inputLabel: 'Input',
        outputLabel: 'Output',
        ragTitle: 'Pinecone RAG Search Failure Analytics',
        ragSubtitle: 'Queries executed by portal users that failed similarity scores or matching thresholds, highlighting knowledge base documentation gaps.',
        colQuery: 'Unresolved Customer Query',
        colCategory: 'Article Category',
        colFrequency: 'Frequency Alert',
        colClosestMatch: 'Closest Matched Index',
        hitsUnit: 'hits',
        closestTarget: 'Closest target',
      },
      slaAnalytics: {
        kpiFirstResponse: 'First Response SLA',
        kpiFirstResponseGoal: 'Goal: 98.5% (Adhered)',
        kpiResolution: 'Resolution SLA',
        kpiResolutionGoal: 'Goal: 98.0% (Warning)',
        kpiAvgLatency: 'Average Response Latency',
        kpiAvgLatencySub: 'Under first-reply target (5 mins)',
        csatTitle: 'Customer Satisfaction (CSAT) Breakdown',
        npsTitle: 'Net Promoter Score (NPS) Trend',
        escalationTitle: 'Telephony & Ticket Escalations Audit',
        escalationSubtitle: 'Real-time log of cases escalated due to customer sentiment drop, API sync faults, or co-browse timeouts.',
        colTicketId: 'Ticket ID',
        colCustomer: 'Customer',
        colPriority: 'Priority',
        colReason: 'Trigger Reason',
        colTime: 'Escalation Time',
        minsAgo: 'mins ago',
      },
    },
  },
  ar: {
    appName: 'منصة mPaaS لخدمة العملاء الذكية',
    roleSwitcher: 'اختر الدور',
    theme: 'المظهر',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    search: 'بحث...',
    filters: 'تصفية',
    actions: 'إجراءات',
    status: 'الحالة',
    priority: 'الأولوية',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    create: 'إنشاء جديد',
    export: 'تصدير البيانات',
    active: 'نشط',
    unassigned: 'غير معين',
    resolved: 'تم حلها',
    escalated: 'تم تصعيدها',
    urgent: 'عاجل جداً',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    submit: 'إرسال',
    dashboard: 'لوحة القيادة',
    unifiedInbox: 'البريد الوارد الموحد',
    conversations: 'المحادثات المباشرة',
    tickets: 'نظام التذاكر الدعم',
    botManagement: 'إدارة البوتات والذكاء الاصطناعي',
    personaEditor: 'محرر شخصية البوت',
    intentManagement: 'إدارة النوايا والفتحات',
    dialogBuilder: 'مخطط تدفق الحوار',
    knowledgeBase: 'قاعدة المعرفة والـ RAG',
    safetyGuardrails: 'حواجز الأمان والسلامة',
    omnichannel: 'القنوات والاتصالات',
    analytics: 'التحليلات ومؤشر رضا العملاء',
    qaCoaching: 'الجودة والتدريب التوجيهي',
    workforceMgmt: 'تخطيط القوى العاملة',
    integrations: 'تكاملات الأنظمة والـ CRM',
    customerPortal: 'بوابة العميل المفتوحة',
    publicBotWidget: 'ويدجت البوت العام',
    systemSettings: 'إعدادات النظام العامة',
    llmRegistry: 'سجل نماذج الذكاء الاصطناعي LLM',
    asrTtsRegistry: 'سجل موفري التعرف وتحويل الكلام (ASR/TTS)',
    costBenchmarks: 'مقارنات تكاليف النماذج',
    crossTenantAnalytics: 'تحليلات المشتركين المتعددة',
    vectorDbStatus: 'حالة مجموعات قواعد بيانات المتجهات',
    sipTrunkConfig: 'إعدادات خطوط الاتصال SIP Trunk',
    dialogFlow: {
      layout: {
        mobileInspectorTitle: 'مفتش سير العمل',
        mobileInspectorClose: 'إغلاق',
        simulatorSheetTitle: 'محاكي Farah للتعرف على اللغة الطبيعية',
        simulatorSheetDesc: 'تشغيل محاكاة المحادثة وفحص سجلات التتبع.',
        footerVersion: 'محرك سير عمل mPaaS الذكي: الإصدار 1.8.0-مستقر',
        footerLoadDraft: 'تحميل المسودة المؤقتة',
        footerSaveDraft: 'حفظ المسودة المؤقتة',
      },
      toolbar: {
        panels: 'اللوحات',
        variables: 'المتغيرات',
        simulator: 'المحاكي',
        addNode: 'إضافة عقدة:',
        validateFlow: 'التحقق من التدفق',
        startSim: 'بدء المحاكاة',
        resetSim: 'إعادة تعيين المحاكاة',
        validationOk: 'سلامة البنية الهيكلية لسير العمل صحيحة. جاهز للنشر في خط أنابيب الإنتاج.',
      },
      inspector: {
        variablesContext: 'سياق المتغيرات',
        regressionSuite: 'مجموعة الاختبارات الانحدارية',
        memoryRegister: 'سجل الذاكرة',
        liveTraceMap: 'خريطة التتبع المباشر',
        assertions: 'التأكيدات',
        runAssertionSuite: 'تشغيل مجموعة التأكيدات',
      },
      simulator: {
        title: 'محاكي Farah NLU',
        chatTab: 'المحادثة',
        traceLogs: 'سجلات التتبع',
        idleMessage: 'المحاكي في وضع الخمول. حدد المعاملات المستهدفة في اللوحة واضغط "بدء المحاكاة" لاختبار المتغيرات.',
        startSim: 'بدء المحاكاة',
        stepDebugger: 'مصحح الأخطاء خطوة بخطوة نشط:',
        nextStep: 'الخطوة التالية',
        noTraceLogs: 'لا توجد آثار تنفيذ.',
        executionInProgress: 'التنفيذ جارٍ. انقر على "الخطوة التالية".',
        simulatorWaiting: 'المحاكي ينتظر التهيئة.',
      },
    },
    analyticsCenter: {
      layout: {
        title: 'مركز التحليلات والمراقبة الشاملة',
        subtitle: 'مراقبة أداء محادثات الذكاء الاصطناعي، المكالمات الهاتفية المباشرة، تكامل الأنظمة الخارجية، ومستوى الخدمة.',
        liveStream: 'تدفق القياس المباشر نشط',
        tabExecutive: 'لوحة التحكم التنفيذية',
        tabSla: 'اتفاقيات مستوى الخدمة (SLA)',
        tabWorkforce: 'الموظفين وقنوات الانتظار',
        tabAi: 'مراقبة الذكاء الاصطناعي',
        tabIntegrations: 'ربط الأنظمة والتكامل',
        subWallboard: 'شاشة الاتصالات المباشرة',
        subPerformance: 'أداء الموظفين والخريطة الحرارية',
        subGuardrails: 'حواجز الحماية التوليدية والموجهات',
        subCosts: 'تكاليف الرموز وإخفاقات البحث',
      },
      execDashboard: {
        alertsTitle: 'تحذيرات العمليات المباشرة ومؤشرات مستوى الخدمة',
        kpiPortalTraffic: 'حركة البوابة',
        kpiPortalTrafficSub: 'الجلسات المتتبعة في الوقت الفعلي',
        kpiPortalTrafficTrend: '+18.2% مقارنة بالأسبوع الماضي',
        kpiDeflection: 'انحراف الخدمة الذاتية',
        kpiDeflectionSub: 'تم الحل دون تدخل وكيل',
        kpiDeflectionTarget: 'الهدف: 60.0%',
        kpiSla: 'الالتزام باتفاقية مستوى الخدمة',
        kpiSlaSub: 'الاستجابة والحل',
        kpiSlaGoal: 'الهدف: 98.0%',
        kpiCsat: 'مؤشر الرضا',
        kpiCsatSub: 'متوسط مؤشر رضا العملاء',
        kpiCsatPositive: 'نسبة الإيجابية: 84%',
        funnelTitle: 'قمع تحويل رحلة العميل',
        funnelSubtitle: 'تحويل الانحراف مقابل تراجع إنشاء التذاكر.',
        funnelSessions: 'جلسات',
        feedTitle: 'تغذية العمليات في الوقت الفعلي',
        feedSubtitle: 'سجلات مباشرة من عمليات بحث RAG والـ webhooks وبوابات الاتصال الهاتفي.',
      },
      wallboard: {
        consoleTitle: 'لوحة تحكم الاتصالات الهاتفية المباشرة',
        consoleSubtitle: 'تشغيل مكالمات صوتية واردة في الوقت الفعلي وإدارة تحويلات قائمة الانتظار لاختبار العمليات.',
        simulateCall: 'محاكاة مكالمة واردة',
        systemIdle: 'النظام في وضع الخمول. بانتظار النشاط...',
        kpiCallsInQueue: 'المكالمات في قائمة الانتظار',
        kpiCallsInQueueSub: 'المتصلون المنتظرون النشطون',
        kpiMaxWait: 'أقصى وقت انتظار',
        kpiMaxWaitSub: 'أطول مدة انتظار نشطة',
        kpiVoiceQuality: 'جودة الصوت (MOS)',
        kpiVoiceQualitySub: 'متوسط مؤشر الجودة (PCMU/Opus)',
        kpiActiveStaff: 'التوظيف النشط',
        kpiActiveStaffSub: 'إجمالي قائمة الوكلاء النشطين',
        queueTitle: 'قائمة انتظار الاتصالات الهاتفية المباشرة',
        queueSubtitle: 'المتصلون الواردون في الوقت الفعلي بانتظار تخصيص وكيل.',
        queueEmpty: 'لا يوجد متصلون في قائمة الانتظار حالياً.',
        queueColCustomer: 'اسم العميل',
        queueColPhone: 'رقم التواصل',
        queueColQueue: 'قائمة الانتظار المستهدفة',
        queueColPriority: 'الأولوية',
        queueColWait: 'وقت الانتظار',
        queueColAction: 'إجراء',
        routeAction: 'تحويل',
        sipTitle: 'جودة صوت Twilio وخطوط SIP',
        sipSubtitle: 'تشخيصات الإشارة في الوقت الفعلي، فقدان الحزم، وتدهور الترميز.',
        jitter: 'الاهتزاز',
        packetLoss: 'فقدان الحزم',
        supervisorTitle: 'مراقبة المشرف وسجل الهمس',
        supervisorSubtitle: 'تدقيق تفاعلات المشرف في الوقت الفعلي من الهمس والاقتحام والمراقبة الصامتة على قنوات الصوت النشطة.',
        supColSupervisor: 'اسم المشرف',
        supColAgent: 'الوكيل المستهدف',
        supColMode: 'وضع المراقبة',
        supColDuration: 'مدة النشاط',
        supColTimestamp: 'طابع وقت التشغيل',
        minsUnit: 'دقائق',
        actionWhisper: 'همس',
        actionBarge: 'اقتحام',
        actionSilent: 'مراقبة صامتة',
      },
      containment: {
        chartTitle: 'معدل احتواء دعم Farah AI (%)',
        guardrailTitle: 'حواجز الحماية التوليدية وسجلات الهلوسة',
        guardrailSubtitle: 'تنبيهات في الوقت الفعلي تتشغل بسبب إخفاقات التحقق الدلالي أو درجات الثقة المنخفضة.',
        confidenceScore: 'درجة الثقة',
        critical: 'حرج',
        escalatedTo: 'إلى الوكيل',
        promptMatrixTitle: 'مصفوفة أداء موجهات LLM',
        promptMatrixSubtitle: 'معاملات القياس لتكرارات الموجهات المنشورة عبر طبقات تصنيف Farah AI والاستدلال في SAP.',
        colPromptName: 'اسم تكوين الموجه',
        colCategory: 'طبقة الفئة',
        colSuccessRate: 'معدل نجاح الموجه',
        colAvgTokens: 'متوسط الرموز',
        colLatency: 'زمن الاستجابة (مللي ثانية)',
        tokensUnit: 'رموز',
      },
      costAnalytics: {
        kpiTotalCost: 'إجمالي تكلفة واجهة برمجة LLM',
        kpiTotalCostSub: 'مجمّع عبر نقاط نهاية LLM النشطة',
        kpiInputTokens: 'رموز الإدخال المستهلكة',
        kpiInputTokensSub: 'تحسين السياق المؤقت نشط',
        kpiOutputTokens: 'رموز الإخراج المولّدة',
        kpiOutputTokensSub: 'نسبة رموز الإكمال: 28.5%',
        chartTitle: 'تفصيل تكاليف نماذج الذكاء الاصطناعي (دولار)',
        logsTitle: 'سجلات مراقبة الرموز',
        inputLabel: 'إدخال',
        outputLabel: 'إخراج',
        ragTitle: 'تحليلات إخفاقات بحث Pinecone RAG',
        ragSubtitle: 'الاستعلامات التي نفّذها مستخدمو البوابة والتي فشلت في درجات التشابه أو عتبات المطابقة، مما يكشف ثغرات في توثيق قاعدة المعرفة.',
        colQuery: 'استعلام العميل غير المحلول',
        colCategory: 'فئة المقال',
        colFrequency: 'تنبيه التكرار',
        colClosestMatch: 'أقرب فهرس مطابق',
        hitsUnit: 'مرة',
        closestTarget: 'الأقرب:',
      },
      slaAnalytics: {
        kpiFirstResponse: 'SLA الاستجابة الأولى',
        kpiFirstResponseGoal: 'الهدف: 98.5% (ملتزم)',
        kpiResolution: 'SLA الحل',
        kpiResolutionGoal: 'الهدف: 98.0% (تحذير)',
        kpiAvgLatency: 'متوسط زمن الاستجابة',
        kpiAvgLatencySub: 'دون الهدف الأول للرد (5 دقائق)',
        csatTitle: 'تفصيل رضا العملاء (CSAT)',
        npsTitle: 'اتجاه مؤشر صافي الترويج (NPS)',
        escalationTitle: 'تدقيق تصعيدات الاتصالات والتذاكر',
        escalationSubtitle: 'سجل في الوقت الفعلي للحالات المُصعَّدة بسبب تراجع مشاعر العملاء أو أخطاء مزامنة API أو انتهاء وقت الجلسة المشتركة.',
        colTicketId: 'رقم التذكرة',
        colCustomer: 'العميل',
        colPriority: 'الأولوية',
        colReason: 'سبب التصعيد',
        colTime: 'وقت التصعيد',
        minsAgo: 'دقائق مضت',
      },
    },
  },
};
