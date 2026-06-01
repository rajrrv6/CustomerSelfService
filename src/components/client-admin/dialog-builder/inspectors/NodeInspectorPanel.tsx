'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDialogStore } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { FormShell } from '@/components/shared/forms/FormShell';
import { TextInputField } from '@/components/shared/forms/TextInputField';
import { SelectField } from '@/components/shared/forms/SelectField';
import { SwitchField } from '@/components/shared/forms/SwitchField';
import { TextAreaField } from '@/components/shared/forms/TextAreaField';
import { FormValidationSummary } from '@/components/shared/forms/FormValidationSummary';
import { FormSubmitBar } from '@/components/shared/forms/FormSubmitBar';
import { Badge } from '@/components/shared/BadgeSystem';
import { X, Sliders, Play, Plus, Trash2 } from 'lucide-react';
import { DialogNodeConfig, DialogNodeType } from '../types';
import { variablesRegistry } from './VariablesSidebar';

// Zod schemas per node type
const baseNodeSchema = z.object({
  labelEn: z.string().min(2, 'English label is required (min 2 chars).'),
  labelAr: z.string().min(2, 'Arabic label is required (min 2 chars).'),
  
  // Start
  startMessageEn: z.string().optional(),
  startMessageAr: z.string().optional(),

  // Message
  messageEn: z.string().optional(),
  messageAr: z.string().optional(),
  typingDelayMs: z.coerce.number().min(0).max(10000).optional(),

  // Condition
  conditions: z.array(z.object({
    id: z.string(),
    variable: z.string().min(1, 'Variable is required'),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains']),
    value: z.string().min(1, 'Value is required'),
    targetHandleId: z.string()
  })).optional(),

  // Intent
  intentName: z.string().optional(),
  utterances: z.array(z.string()).optional(),
  intentOutputTextEn: z.string().optional(),
  intentOutputTextAr: z.string().optional(),

  // API Action
  apiUrl: z.string().url('Must be a valid HTTP/HTTPS URL').optional().or(z.literal('')),
  apiMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  apiHeaders: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).optional(),
  apiPayload: z.string().optional(),
  apiRetryCount: z.coerce.number().min(0).max(5).optional(),
  apiTimeoutSeconds: z.coerce.number().min(1).max(60).optional(),

  // Escalation
  escalationQueue: z.string().optional(),
  escalationPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  escalationSeverity: z.coerce.number().min(1).max(5).optional(),
  escalationReasonEn: z.string().optional(),
  escalationReasonAr: z.string().optional(),

  // Variable Set
  variableKey: z.string().optional(),
  variableValue: z.string().optional(),

  // Delay
  delaySeconds: z.coerce.number().min(0).max(3600).optional(),

  // Human Handoff
  handoffQueue: z.string().optional(),
  handoffReasonEn: z.string().optional(),
  handoffReasonAr: z.string().optional(),

  // Knowledge Search
  kbSource: z.string().optional(),
  kbMinConfidence: z.coerce.number().min(0.1).max(1.0).optional(),

  // End
  endMessageEn: z.string().optional(),
  endMessageAr: z.string().optional(),
  triggerCSAT: z.boolean().optional(),
});

type InspectorFormValues = z.infer<typeof baseNodeSchema>;

export function NodeInspectorPanel() {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';
  const t = translations[lang];

  const selectedNodeId = useDialogStore((s) => s.selectedNodeId);
  const selectNode = useDialogStore((s) => s.selectNode);
  const nodes = useDialogStore((s) => s.nodes);
  const node = nodes.find((n) => n.id === selectedNodeId) || null;

  const updateNodeConfig = useDialogStore((s) => s.updateNodeConfig);
  const updateNodeName = useDialogStore((s) => s.updateNodeName);

  const methods = useForm<InspectorFormValues>({
    resolver: zodResolver(baseNodeSchema) as Resolver<InspectorFormValues>,
    mode: 'onChange',
    defaultValues: {}
  });

  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = methods;

  // Set default values when node selection changes
  useEffect(() => {
    if (node) {
      const config = node.data.config || {};
      reset({
        labelEn: node.data.labelEn,
        labelAr: node.data.labelAr,
        ...config
      });
    }
  }, [node, reset]);

  // Header keys dynamic list array helper for APIs
  const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({
    control,
    name: 'apiHeaders' as any
  });

  // Conditions list array helper for branch routing
  const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({
    control,
    name: 'conditions' as any
  });

  if (!node) {
    return (
      <div className="w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-medium h-full shrink-0">
        <Sliders className="w-8 h-8 opacity-40 mb-3" />
        <p className="text-xs leading-normal">
          {isAr
            ? 'انقر على أي عقدة في ساحة العمل لتعديل خصائصها وتكوينها.'
            : 'Select a node on the canvas to inspect and edit its properties.'}
        </p>
      </div>
    );
  }

  const onSubmit = (values: InspectorFormValues) => {
    // 1. Save label changes
    updateNodeName(node.id, values.labelEn, values.labelAr);

    // 2. Extract node-specific configuration keys to avoid bloating
    const { labelEn, labelAr, ...configKeys } = values;
    updateNodeConfig(node.id, configKeys as Partial<DialogNodeConfig>);

    // Reset dirty state to current saved values
    reset(values);
    alert(isAr ? 'تم حفظ التغييرات بنجاح!' : 'Node configuration saved!');
  };

  // Variable helper injector (appends token to active input target)
  const injectVariable = (fieldName: keyof InspectorFormValues, variableName: string) => {
    const current = watch(fieldName) as string || '';
    setValue(fieldName, `${current}{{${variableName}}}` as any, { shouldDirty: true });
  };

  const nodeType = node.type as DialogNodeType;

  return (
    <div
      className="w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shrink-0 relative"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header banner */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black uppercase font-sans text-slate-800 dark:text-slate-100">
              {isAr ? 'مفتش خصائص العقدة' : 'Node Inspector'}
            </h3>
            {isDirty && (
              <Badge type="warning" className="text-[8px] px-1 py-0 shadow-none">
                {isAr ? 'تغييرات معلقة' : 'Pending'}
              </Badge>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate uppercase">
            ID: {node.id} ({nodeType})
          </span>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <FormShell methods={methods} onSubmit={onSubmit} className="space-y-4">
          <FormValidationSummary errors={errors} lang={lang} />

          {/* Core Labels section */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
              {isAr ? 'أسماء العقدة وتسمياتها' : 'Node Identifiers'}
            </span>
            <TextInputField
              id="labelEn"
              label={isAr ? 'الاسم الإنجليزي:' : 'Node Name (EN):'}
              required
              error={errors.labelEn?.message}
              lang={lang}
              {...register('labelEn')}
            />
            <TextInputField
              id="labelAr"
              label={isAr ? 'الاسم العربي:' : 'Node Name (AR):'}
              required
              error={errors.labelAr?.message}
              lang={lang}
              className="text-end"
              {...register('labelAr')}
            />
          </div>

          {/* ──── START NODE OPTIONS ──── */}
          {nodeType === 'start' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'رسالة الترحيب الأولى' : 'Welcome Message'}
              </span>
              <TextAreaField
                id="startMessageEn"
                label="Greeting Message (EN):"
                rows={2}
                error={errors.startMessageEn?.message}
                lang={lang}
                {...register('startMessageEn')}
              />
              <TextAreaField
                id="startMessageAr"
                label="Greeting Message (AR):"
                rows={2}
                error={errors.startMessageAr?.message}
                lang={lang}
                className="text-end"
                {...register('startMessageAr')}
              />
            </div>
          )}

          {/* ──── MESSAGE NODE OPTIONS ──── */}
          {nodeType === 'message' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'تكوين محتوى الرسالة' : 'Response Prompts'}
              </span>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400">Response Text (EN):</label>
                  <select
                    onChange={(e) => injectVariable('messageEn', e.target.value)}
                    value=""
                    className="text-[9px] font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded px-1.5 focus:outline-none"
                  >
                    <option value="" disabled>{isAr ? '+ إدراج متغير' : '+ Insert Var'}</option>
                    {variablesRegistry.map((v) => (
                      <option key={v.key} value={v.key}>{v.key}</option>
                    ))}
                  </select>
                </div>
                <TextAreaField
                  id="messageEn"
                  rows={3}
                  error={errors.messageEn?.message}
                  lang={lang}
                  {...register('messageEn')}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400">Response Text (AR):</label>
                  <select
                    onChange={(e) => injectVariable('messageAr', e.target.value)}
                    value=""
                    className="text-[9px] font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded px-1.5 focus:outline-none"
                  >
                    <option value="" disabled>{isAr ? '+ إدراج متغير' : '+ Insert Var'}</option>
                    {variablesRegistry.map((v) => (
                      <option key={v.key} value={v.key}>{v.key}</option>
                    ))}
                  </select>
                </div>
                <TextAreaField
                  id="messageAr"
                  rows={3}
                  error={errors.messageAr?.message}
                  lang={lang}
                  className="text-end"
                  {...register('messageAr')}
                />
              </div>

              <TextInputField
                id="typingDelayMs"
                type="number"
                label={isAr ? 'تأخير الكتابة (ميلي ثانية):' : 'Typing Delay (ms):'}
                description="Simulates loading dots before response."
                error={errors.typingDelayMs?.message}
                lang={lang}
                {...register('typingDelayMs')}
              />
            </div>
          )}

          {/* ──── CONDITION NODE OPTIONS ──── */}
          {nodeType === 'condition' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'شروط التفرع والتوجيه' : 'Conditional Branch Routing'}
              </span>

              {conditionFields.map((field, index) => (
                <div key={field.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="absolute top-2 right-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[9px] font-mono font-bold text-slate-400">
                    Rule #{index + 1}
                  </span>

                  <SelectField
                    id={`conditions.${index}.variable`}
                    label="If Variable:"
                    required
                    options={variablesRegistry.map(v => ({ value: v.key, label: v.key }))}
                    lang={lang}
                    {...register(`conditions.${index}.variable` as const)}
                  />

                  <SelectField
                    id={`conditions.${index}.operator`}
                    label="Operator:"
                    required
                    options={[
                      { value: 'equals', label: 'Equals (=)' },
                      { value: 'not_equals', label: 'Not Equals (!=)' },
                      { value: 'greater_than', label: 'Greater Than (>)' },
                      { value: 'less_than', label: 'Less Than (<)' },
                      { value: 'contains', label: 'Contains' },
                      { value: 'not_contains', label: 'Not Contains' }
                    ]}
                    lang={lang}
                    {...register(`conditions.${index}.operator` as const)}
                  />

                  <TextInputField
                    id={`conditions.${index}.value`}
                    label="Value to Compare:"
                    required
                    lang={lang}
                    {...register(`conditions.${index}.value` as const)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendCondition({
                  id: `cond-${Date.now()}-${conditionFields.length}`,
                  variable: 'invoice_amount',
                  operator: 'equals',
                  value: '',
                  targetHandleId: `cond-${conditionFields.length}`
                })}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-xs text-blue-650 hover:bg-blue-50/50 hover:border-blue-500 font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة شرط جديد' : 'Add Conditional Rule'}</span>
              </button>
            </div>
          )}

          {/* ──── INTENT NODE OPTIONS ──── */}
          {nodeType === 'intent' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'نية العميل المستهدفة' : 'Triggering Intent'}
              </span>
              <TextInputField
                id="intentName"
                label="Intent Identifier:"
                required
                placeholder="e.g. request_refund"
                error={errors.intentName?.message}
                lang={lang}
                {...register('intentName')}
              />
              <TextAreaField
                id="intentOutputTextEn"
                label="Acknowledge response (EN):"
                rows={2}
                error={errors.intentOutputTextEn?.message}
                lang={lang}
                {...register('intentOutputTextEn')}
              />
              <TextAreaField
                id="intentOutputTextAr"
                label="Acknowledge response (AR):"
                rows={2}
                error={errors.intentOutputTextAr?.message}
                lang={lang}
                className="text-end"
                {...register('intentOutputTextAr')}
              />
            </div>
          )}

          {/* ──── API ACTION NODE OPTIONS ──── */}
          {nodeType === 'api_action' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'إعدادات واجهة الاتصال API' : 'REST API Configuration'}
              </span>
              
              <SelectField
                id="apiMethod"
                label="HTTP Method:"
                required
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' }
                ]}
                lang={lang}
                {...register('apiMethod')}
              />

              <TextInputField
                id="apiUrl"
                label="Endpoint URL:"
                required
                placeholder="https://api.stripe.com/v1/..."
                error={errors.apiUrl?.message}
                lang={lang}
                {...register('apiUrl')}
              />

              {/* API headers list */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-400">Request Headers</span>
                  <button
                    type="button"
                    onClick={() => appendHeader({ key: '', value: '' })}
                    className="text-[9.5px] text-blue-600 font-bold hover:underline"
                  >
                    + Add Header
                  </button>
                </div>
                {headerFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder="Key"
                      className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-mono"
                      {...register(`apiHeaders.${idx}.key` as const)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-mono"
                      {...register(`apiHeaders.${idx}.value` as const)}
                    />
                    <button
                      type="button"
                      onClick={() => removeHeader(idx)}
                      className="text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Payload with token mapper */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] font-mono font-bold text-slate-400">JSON Payload:</span>
                  <select
                    onChange={(e) => injectVariable('apiPayload', e.target.value)}
                    value=""
                    className="text-[9px] font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded px-1.5 focus:outline-none"
                  >
                    <option value="" disabled>{isAr ? '+ إدراج متغير' : '+ Insert Var'}</option>
                    {variablesRegistry.map((v) => (
                      <option key={v.key} value={v.key}>{v.key}</option>
                    ))}
                  </select>
                </div>
                <TextAreaField
                  id="apiPayload"
                  rows={4}
                  placeholder="&#123;&#10;  &quot;customer&quot;: &quot;&#123;&#123;customer_email&#125;&#125;&quot;&#10;&#125;"
                  error={errors.apiPayload?.message}
                  lang={lang}
                  className="font-mono text-[9px] leading-relaxed"
                  {...register('apiPayload')}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <TextInputField
                  id="apiTimeoutSeconds"
                  type="number"
                  label="Timeout (sec):"
                  error={errors.apiTimeoutSeconds?.message}
                  lang={lang}
                  {...register('apiTimeoutSeconds')}
                />
                <TextInputField
                  id="apiRetryCount"
                  type="number"
                  label="Retry Policy:"
                  error={errors.apiRetryCount?.message}
                  lang={lang}
                  {...register('apiRetryCount')}
                />
              </div>
            </div>
          )}

          {/* ──── ESCALATION NODE OPTIONS ──── */}
          {nodeType === 'escalation' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'معايير تصعيد الدعم' : 'Escalation Parameters'}
              </span>
              
              <SelectField
                id="escalationQueue"
                label="Target Inbox Queue:"
                required
                options={[
                  { value: 'General Support Queue', label: 'General Support Queue' },
                  { value: 'Technical Escalations (Tier 2)', label: 'Technical Escalations (Tier 2)' },
                  { value: 'VIP Executive Line', label: 'VIP Executive Line' },
                  { value: 'Arabic Language Specialists', label: 'Arabic Language Specialists' }
                ]}
                lang={lang}
                {...register('escalationQueue')}
              />

              <SelectField
                id="escalationPriority"
                label="Escalation Priority:"
                required
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' }
                ]}
                lang={lang}
                {...register('escalationPriority')}
              />

              <TextInputField
                id="escalationSeverity"
                type="number"
                label="Severity weight (1-5):"
                error={errors.escalationSeverity?.message}
                lang={lang}
                {...register('escalationSeverity')}
              />

              <TextAreaField
                id="escalationReasonEn"
                label="Escalation Reason (EN):"
                rows={2}
                error={errors.escalationReasonEn?.message}
                lang={lang}
                {...register('escalationReasonEn')}
              />
            </div>
          )}

          {/* ──── VARIABLE SET NODE OPTIONS ──── */}
          {nodeType === 'variable_set' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'تحديث وتعيين متغير' : 'Variable Update'}
              </span>
              
              <SelectField
                id="variableKey"
                label="Target Variable:"
                required
                options={[
                  { value: '', label: '-- Choose --' },
                  ...variablesRegistry.map((v) => ({ value: v.key, label: v.key }))
                ]}
                lang={lang}
                {...register('variableKey')}
              />

              <TextInputField
                id="variableValue"
                label="Value to Assign:"
                required
                placeholder="e.g. true or {{customer_name}}"
                error={errors.variableValue?.message}
                lang={lang}
                {...register('variableValue')}
              />
            </div>
          )}

          {/* ──── DELAY NODE OPTIONS ──── */}
          {nodeType === 'delay' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'إيقاف مؤقت للتدفق' : 'Hold Timing'}
              </span>
              <TextInputField
                id="delaySeconds"
                type="number"
                label="Hold duration (seconds):"
                required
                error={errors.delaySeconds?.message}
                lang={lang}
                {...register('delaySeconds')}
              />
            </div>
          )}

          {/* ──── HUMAN HANDOFF NODE OPTIONS ──── */}
          {nodeType === 'human_handoff' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'توجيه لقسم الوكلاء' : 'Live Agent Transfer'}
              </span>

              <SelectField
                id="handoffQueue"
                label="Support Agent Group:"
                required
                options={[
                  { value: 'General Support Pool', label: 'General Support Pool' },
                  { value: 'Tier-2 Tech Desk', label: 'Tier-2 Tech Desk' },
                  { value: 'VIP Support Queue', label: 'VIP Support Queue' },
                  { value: 'Arabic Specialists Pool', label: 'Arabic Specialists Pool' }
                ]}
                lang={lang}
                {...register('handoffQueue')}
              />

              <TextAreaField
                id="handoffReasonEn"
                label="Transfer Reason (EN):"
                rows={2}
                error={errors.handoffReasonEn?.message}
                lang={lang}
                {...register('handoffReasonEn')}
              />
            </div>
          )}

          {/* ──── KNOWLEDGE SEARCH NODE OPTIONS ──── */}
          {nodeType === 'knowledge_search' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'محرك البحث الذكي RAG' : 'Generative RAG KB Retrieval'}
              </span>
              
              <SelectField
                id="kbSource"
                label="Knowledge Base Source:"
                required
                options={[
                  { value: 'Standard Return & Exchange Policy PDF', label: 'Standard Return Policy PDF' },
                  { value: 'SAP ERP Operational Guide (Database)', label: 'SAP ERP Operational Guide' },
                  { value: 'General Support Helpdesk FAQ (URL)', label: 'General Helpdesk FAQ' }
                ]}
                lang={lang}
                {...register('kbSource')}
              />

              <TextInputField
                id="kbMinConfidence"
                type="number"
                step="0.05"
                label="Min Confidence Score (0.1 - 1.0):"
                required
                error={errors.kbMinConfidence?.message}
                lang={lang}
                {...register('kbMinConfidence')}
              />
            </div>
          )}

          {/* ──── END NODE OPTIONS ──── */}
          {nodeType === 'end' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {isAr ? 'عقدة إنهاء الحوار' : 'Session Completion Parameters'}
              </span>
              <TextAreaField
                id="endMessageEn"
                label="Final Message (EN):"
                rows={2}
                error={errors.endMessageEn?.message}
                lang={lang}
                {...register('endMessageEn')}
              />
              <TextAreaField
                id="endMessageAr"
                label="Final Message (AR):"
                rows={2}
                error={errors.endMessageAr?.message}
                lang={lang}
                className="text-end"
                {...register('endMessageAr')}
              />
              <SwitchField
                id="triggerCSAT"
                label={isAr ? 'تفعيل استبيان الرضا (CSAT):' : 'Trigger CSAT Survey:'}
                description="Prompt client for a 1-5 rating on hangup."
                lang={lang}
                {...register('triggerCSAT')}
              />
            </div>
          )}

          {/* Sticky Form Actions submit bar */}
          <FormSubmitBar
            onCancel={() => selectNode(null)}
            isSubmitting={methods.formState.isSubmitting}
            isDirty={isDirty}
            submitLabel={isAr ? 'حفظ وتعديل العقدة' : 'Save Node Settings'}
            lang={lang}
          />
        </FormShell>
      </div>
    </div>
  );
}
