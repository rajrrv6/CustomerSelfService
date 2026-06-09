import { Message } from '@/types';

export interface CopilotSuggestion {
  id: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
  score: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  matchPercent: number;
  preview: string;
}

export interface DetectedIntent {
  name: string;
  confidence: number;
  category: string;
}

export interface WrapupRecommendation {
  code: string;
  category: string;
  summary: string;
  confidence: number;
}

export interface EscalationRecommendation {
  id: string;
  reason: string;
  severity: 'warning' | 'critical';
  confidence: number;
}

export interface CopilotAnalysisResult {
  intent: DetectedIntent;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: CopilotSuggestion[];
  articles: KnowledgeArticle[];
  escalations: EscalationRecommendation[];
  wrapup: WrapupRecommendation[];
}

export function analyzeConversation(messages: Message[], slaStatus?: string): CopilotAnalysisResult {
  const customerMessages = messages.filter(m => m.sender === 'customer');
  const fullText = customerMessages.map(m => m.text).join(' ').toLowerCase();

  const intentSpecs = [
    {
      name: 'refund_request',
      category: 'Billing Operations',
      keywords: ['refund', 'return', 'credit', 'استرجاع', 'ارجاع', 'استرداد'],
      baseConfidence: 90
    },
    {
      name: 'payment_failure',
      category: 'Billing Operations',
      keywords: ['fail', 'decline', 'stripe', 'payment', 'فشل', 'دفع'],
      baseConfidence: 92
    },
    {
      name: 'billing_issue',
      category: 'Billing Operations',
      keywords: ['bill', 'invoice', 'charge', 'vat', 'فاتورة'],
      baseConfidence: 88
    },
    {
      name: 'cancellation_request',
      category: 'Account Services',
      keywords: ['cancel', 'terminate', 'close account', 'إلغاء', 'الغاء'],
      baseConfidence: 91
    },
    {
      name: 'technical_issue',
      category: 'Developer APIs',
      keywords: ['error', 'bug', 'api', '403', '500', 'latency', 'مشكلة', 'عطل'],
      baseConfidence: 93
    },
    {
      name: 'shipping_delay',
      category: 'Logistics & Shipping',
      keywords: ['shipping', 'delay', 'late', 'delivery', 'تأخير', 'شحن'],
      baseConfidence: 89
    },
    {
      name: 'escalation_risk',
      category: 'Customer Care',
      keywords: ['manager', 'supervisor', 'complain', 'terrible', 'worst', 'مدير', 'تصعيد'],
      baseConfidence: 95
    },
    {
      name: 'positive_feedback',
      category: 'Feedback',
      keywords: ['thanks', 'great', 'awesome', 'good', 'شكرا', 'ممتاز'],
      baseConfidence: 87
    }
  ];

  let intentName = 'general_support';
  let category = 'Customer Care';
  let confidence = 85;
  let maxMatches = 0;

  for (const spec of intentSpecs) {
    let matches = 0;
    for (const kw of spec.keywords) {
      if (fullText.includes(kw)) {
        matches += 1;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      intentName = spec.name;
      category = spec.category;
      // Dynamic confidence: base confidence + 3% per extra keyword match, capped at 99%
      confidence = Math.min(99, spec.baseConfidence + (matches - 1) * 3);
    }
  }

  // Sentiment Analysis
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (fullText.includes('thanks') || fullText.includes('great') || fullText.includes('awesome') || fullText.includes('good') || fullText.includes('appreciate') || fullText.includes('شكرا')) {
    sentiment = 'positive';
  } else if (fullText.includes('error') || fullText.includes('fail') || fullText.includes('terrible') || fullText.includes('worst') || fullText.includes('delay') || fullText.includes('slow') || fullText.includes('broken') || fullText.includes('damaged') || fullText.includes('dispute') || fullText.includes('cancel') || fullText.includes('عطل') || fullText.includes('مشكلة')) {
    sentiment = 'negative';
  }

  const suggestions: CopilotSuggestion[] = [];
  const articles: KnowledgeArticle[] = [];
  const escalations: EscalationRecommendation[] = [];
  const wrapup: WrapupRecommendation[] = [];

  // Populate data based on intent
  if (intentName === 'refund_request') {
    suggestions.push(
      { id: 'sug-1', text: 'Under Return Policy (ks-1), refunds are allowed within 30 days. I have logged a damages exception on the invoice and initiated a credit.', confidence: 'high', score: 98 },
      { id: 'sug-2', text: 'بموجب شروط سياسة الإرجاع (ks-1)، يُسمح باسترداد الأموال في غضون 30 يومًا. سأقوم بمعالجة استثناء الإرجاع.', confidence: 'high', score: 95 }
    );
    articles.push(
      { id: 'art-1', title: 'Processing Stripe Subscription Refunds', category: 'Billing Operations', matchPercent: 99, preview: 'Learn how to process partial and full refunds via Stripe API dashboard and log exceptions.' },
      { id: 'art-2', title: 'Overriding Policy Exclusions Manual Guide', category: 'Compliance', matchPercent: 86, preview: 'Steps required to manually override 30-day standard refund constraints for premium enterprise customers.' }
    );
    wrapup.push({
      code: 'SAP-CRM-101',
      category: 'Billing Mismatch',
      summary: 'Processed customer refund request under standard policy exceptions.',
      confidence: 96
    });
  } else if (intentName === 'payment_failure') {
    suggestions.push(
      { id: 'sug-1', text: 'Checking Stripe logs for transaction errors. Let me retry the subscription capture manually.', confidence: 'high', score: 97 },
      { id: 'sug-2', text: 'أقوم بالتحقق من سجلات Stripe للبحث عن أخطاء المعاملة. دعني أعد محاولة تحصيل الاشتراك يدويًا.', confidence: 'medium', score: 88 }
    );
    articles.push(
      { id: 'art-1', title: 'Detecting Double Transaction Failures', category: 'Billing Operations', matchPercent: 97, preview: 'Details on webhook timing delays that can cause multiple credit card authorizations.' }
    );
    wrapup.push({
      code: 'SAP-CRM-401',
      category: 'Authentication Mismatch',
      summary: 'Investigated card payment decline and cleared stuck Stripe auth tokens.',
      confidence: 94
    });
  } else if (intentName === 'billing_issue') {
    suggestions.push(
      { id: 'sug-1', text: 'I can update your billing registration details and VAT registration number for ORD-77612.', confidence: 'high', score: 96 },
      { id: 'sug-2', text: 'أهلاً بك أمينة. قمت بتحديث الهوية الضريبية وعنوان الفاتورة لطلبك رقم ORD-77612 بنجاح.', confidence: 'high', score: 94 }
    );
    articles.push(
      { id: 'art-1', title: 'Managing Corporate Billing Profiles', category: 'Billing Operations', matchPercent: 94, preview: 'How to modify active client metadata including company tax identifiers.' }
    );
    wrapup.push({
      code: 'SAP-CRM-101',
      category: 'Billing Mismatch',
      summary: 'Updated client tax registration and corporate billing address metadata.',
      confidence: 98
    });
  } else if (intentName === 'cancellation_request') {
    suggestions.push(
      { id: 'sug-1', text: 'I understand you wish to terminate the service. I can guide you through the downgrade flow or process cancellation.', confidence: 'high', score: 95 },
      { id: 'sug-2', text: 'أفهم رغبتك في الإلغاء. يمكنني المساعدة في إنهاء الحساب أو خفض خطة الاشتراك.', confidence: 'medium', score: 85 }
    );
    articles.push(
      { id: 'art-1', title: 'Managing Subscription Cancellation Flows', category: 'Account Services', matchPercent: 98, preview: 'Best practices for retention handling and executing subscription cancellation commands.' }
    );
    wrapup.push({
      code: 'SAP-CRM-401',
      category: 'Authentication Mismatch',
      summary: 'Completed customer request to terminate subscription and processed final invoice.',
      confidence: 95
    });
  } else if (intentName === 'technical_issue') {
    suggestions.push(
      { id: 'sug-1', text: 'Checking webhook token expirations in our developer gateway dashboard right now.', confidence: 'high', score: 98 },
      { id: 'sug-2', text: 'أتحقق من انتهاء صلاحية رمز الويب هوك في لوحة تحكم بوابة المطورين الآن.', confidence: 'high', score: 95 }
    );
    articles.push(
      { id: 'art-1', title: 'Troubleshooting 403 Forbidden on Webhooks', category: 'Developer APIs', matchPercent: 98, preview: 'Resolving RAG index lookup authentication errors and token mismatches.' },
      { id: 'art-2', title: 'Regenerating Client Secret Keys', category: 'Developer APIs', matchPercent: 92, preview: 'Security guidelines for regenerating credentials without causing endpoint dropouts.' }
    );
    wrapup.push({
      code: 'SAP-CRM-305',
      category: 'Vector Compaction Lockout',
      summary: 'Resolved webhook 403 authorization error by refreshing ERP registration tokens.',
      confidence: 99
    });
  } else if (intentName === 'shipping_delay') {
    suggestions.push(
      { id: 'sug-1', text: 'Let me dispatch a trace to Vertex Logistics dispatcher to confirm your package delivery timeline.', confidence: 'high', score: 94 },
      { id: 'sug-2', text: 'دعني أرسل طلباً لمرسل Vertex Logistics لتأكيد الجدول الزمني لتوصيل شحنتك.', confidence: 'medium', score: 86 }
    );
    articles.push(
      { id: 'art-1', title: 'Vertex Logistics Tracking Standards', category: 'Logistics & Shipping', matchPercent: 94, preview: 'Understanding tracking scans and transit delay thresholds.' }
    );
    wrapup.push({
      code: 'SAP-CRM-204',
      category: 'SIP Trunk Dropout',
      summary: 'Checked package delivery transit logs and verified shipping delay status.',
      confidence: 92
    });
  } else if (intentName === 'escalation_risk') {
    suggestions.push(
      { id: 'sug-1', text: 'I apologize for the negative experience. I am escalating this ticket immediately to our Tier 2 Engineering Desk.', confidence: 'high', score: 99 },
      { id: 'sug-2', text: 'أعتذر عن هذه التجربة السيئة. سأقوم بتصعيد هذه التذكرة فورًا إلى مكتب هندسة المستوى الثاني.', confidence: 'high', score: 97 }
    );
    articles.push(
      { id: 'art-1', title: 'Standard Incident Resolution Procedures', category: 'Customer Care', matchPercent: 90, preview: 'Escalation paths for resolving severe service interruptions.' }
    );
    wrapup.push({
      code: 'SAP-CRM-204',
      category: 'SIP Trunk Dropout',
      summary: 'Escalated critical client complaint to supervisor desk due to frustration.',
      confidence: 97
    });
  } else {
    suggestions.push(
      { id: 'sug-1', text: 'Thank you for reaching out. Let me check the database system to confirm your active service key.', confidence: 'medium', score: 85 },
      { id: 'sug-2', text: 'شكراً لتواصلك معنا. اسمح لي بالتحقق من قاعدة البيانات لتأكيد مفتاح الخدمة النشط.', confidence: 'medium', score: 80 }
    );
    articles.push(
      { id: 'art-1', title: 'Standard Incident Resolution Procedures', category: 'Customer Care', matchPercent: 85, preview: 'Standard procedures for customer support intake.' }
    );
    wrapup.push({
      code: 'SAP-CRM-101',
      category: 'Billing Mismatch',
      summary: 'Handled standard client support request and answered general queries.',
      confidence: 80
    });
  }

  // Escalation Recommendation detection
  const needsEscalation = 
    intentName === 'escalation_risk' ||
    sentiment === 'negative' ||
    slaStatus === 'breached' ||
    slaStatus === 'warning' ||
    fullText.includes('manager') ||
    fullText.includes('supervisor') ||
    fullText.includes('cancel');

  if (needsEscalation) {
    let reason = 'Negative customer sentiment and frustration keywords detected.';
    let severity: 'warning' | 'critical' = 'warning';

    if (slaStatus === 'breached') {
      reason = 'SLA response target breached. Instant supervisor escalation required.';
      severity = 'critical';
    } else if (slaStatus === 'warning') {
      reason = 'Approaching critical SLA response deadline (under 5 minutes left).';
      severity = 'warning';
    } else if (fullText.includes('cancel')) {
      reason = 'Customer cancellation request detected. Retain logic required.';
      severity = 'critical';
    } else if (fullText.includes('manager') || fullText.includes('supervisor')) {
      reason = 'Customer explicitly requested supervisor/manager escalation.';
      severity = 'critical';
    }

    escalations.push({
      id: 'esc-rec-1',
      reason,
      severity,
      confidence: 98
    });
  }

  return {
    intent: { name: intentName, confidence, category },
    sentiment,
    suggestions,
    articles,
    escalations,
    wrapup
  };
}
