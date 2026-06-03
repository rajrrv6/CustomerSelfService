'use client';

import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Sparkles, 
  User, 
  Database, 
  Lock, 
  Eye, 
  AlertCircle, 
  Save, 
  X, 
  Check, 
  Users, 
  ShieldAlert, 
  Award, 
  Calendar, 
  Activity, 
  Cpu, 
  Layers, 
  HelpCircle, 
  Download, 
  FileText, 
  Search, 
  RefreshCw, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  UserMinus,
  Filter,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { usePermissionStore, usePermission, type PermissionLevel, type RolePermissions } from '@/stores/permissionStore';

// Local i18n translation dictionary
interface LocalDict {
  title: string;
  subtitle: string;
  btnSave: string;
  btnSaving: string;
  tabPolicy: string;
  tabDirectory: string;
  tabAudit: string;
  cardUsers: string;
  cardRoles: string;
  cardMfa: string;
  cardPending: string;
  cardRisk: string;
  cardLocked: string;
  matrixTitle: string;
  matrixDesc: string;
  matrixSearchPlaceholder: string;
  userTableTitle: string;
  userTableDesc: string;
  userColName: string;
  userColRole: string;
  userColLogin: string;
  userColMfa: string;
  userColRisk: string;
  userColState: string;
  userColActions: string;
  btnRevoke: string;
  btnRevoked: string;
  btnLock: string;
  btnUnlock: string;
  requestTitle: string;
  requestDesc: string;
  requestColUser: string;
  requestColType: string;
  requestColJust: string;
  requestColAction: string;
  btnApprove: string;
  btnReject: string;
  insightTitle: string;
  insightDesc: string;
  btnResolve: string;
  btnResolved: string;
  logTitle: string;
  logDesc: string;
  btnExport: string;
  aiTitle: string;
  aiDesc: string;
  btnApply: string;
  btnApplied: string;
  advisoryText: string;
}

const enLocal: LocalDict = {
  title: 'RBAC Access Governance Control Panel',
  subtitle: 'Tenant authorization administration, credential profiles audits, and security compliance matrix.',
  btnSave: 'Apply Access Policies',
  btnSaving: 'Compiling & Syncing...',
  tabPolicy: 'Governance Dashboard & IAM Matrix',
  tabDirectory: 'Directory Control & Approvals',
  tabAudit: 'Compliance Timeline & Log Trails',
  cardUsers: 'Active Directory Users',
  cardRoles: 'Configured Tenant Roles',
  cardMfa: 'MFA Protection Enforced',
  cardPending: 'Pending Access Reviews',
  cardRisk: 'High-Risk Privilege Tiers',
  cardLocked: 'Temporarily Locked Accounts',
  matrixTitle: 'Granular Role Permissions Grid',
  matrixDesc: 'Tenant-wide API endpoint access mapping. Changes compile directly to the core authorization gateway.',
  matrixSearchPlaceholder: 'Search modules or permission categories...',
  userTableTitle: 'Workspace Access & Directory Control',
  userTableDesc: 'Roster registry for current authenticated workspace users. Control status parameters and session credentials.',
  userColName: 'Personnel Profile',
  userColRole: 'Assigned Role Scope',
  userColLogin: 'Last Activity Log',
  userColMfa: 'MFA Protection',
  userColRisk: 'Risk Tier',
  userColState: 'Session Status',
  userColActions: 'Operational Actions',
  btnRevoke: 'Revoke Session',
  btnRevoked: 'Session Terminated',
  btnLock: 'Suspend Account',
  btnUnlock: 'Restore Access',
  requestTitle: 'Privilege Escalation Review Pipeline',
  requestDesc: 'Temporary administrative credential grants and contractor policy reviews awaiting clearance.',
  requestColUser: 'Requesting User',
  requestColType: 'Escalation Objective',
  requestColJust: 'Business Justification',
  requestColAction: 'Governance Decision',
  btnApprove: 'Grant Access',
  btnReject: 'Deny Request',
  insightTitle: 'Compliance Scanning & Security Insights',
  insightDesc: 'Proactive scanner reporting stale accounts and dangerous permission combinations.',
  btnResolve: 'Mitigate Risk',
  btnResolved: 'Mitigated',
  logTitle: 'IAM Governance Ledger & SIEM timeline',
  logDesc: 'Chronological timeline of credential updates, login audits, and override grants.',
  btnExport: 'Export Logs (CSV)',
  aiTitle: 'Farah AI Security Recommendations',
  aiDesc: 'Automated governance compliance guidelines based on behavioral anomalies.',
  btnApply: 'Enforce recommendation',
  btnApplied: 'Rule Enforced',
  advisoryText: 'Notice: Modifications to role capabilities or credential status sync instantly to the core auth pipeline. Revoking sessions will trigger immediate client redirection to the login portal.'
};

const arLocal: LocalDict = {
  title: 'لوحة حوكمة الصلاحيات وإدارة الوصول (RBAC)',
  subtitle: 'إدارة صلاحيات المستأجر، وتدقيق حسابات المستخدمين، ومراقبة الالتزام الأمني للمنصة.',
  btnSave: 'تطبيق سياسات الوصول',
  btnSaving: 'جاري البناء والمزامنة...',
  tabPolicy: 'لوحة التحكم وجدول الصلاحيات',
  tabDirectory: 'سجل المستخدمين والموافقات',
  tabAudit: 'خط الالتزام الزمني وسجلات النظام',
  cardUsers: 'المستخدمين النشطين بالسجل',
  cardRoles: 'الأدوار الوظيفية المهيأة',
  cardMfa: 'حسابات محمية بالتحقق الثنائي',
  cardPending: 'مراجعات الصلاحية المعلقة',
  cardRisk: 'مستويات صلاحيات عالية المخاطر',
  cardLocked: 'الحسابات المقفلة مؤقتاً',
  matrixTitle: 'جدول تفويض الصلاحيات التفصيلي',
  matrixDesc: 'خريطة صلاحيات واجهة برمجة التطبيقات للمستأجر. تطبق التحديثات مباشرة على بوابة المصادقة الأساسية.',
  matrixSearchPlaceholder: 'ابحث عن موديول أو فئة صلاحيات...',
  userTableTitle: 'سجل المستخدمين والتحكم بالوصول لمساحة العمل',
  userTableDesc: 'قائمة حسابات مساحة العمل الحالية المصرح لها. تحكم بحالة الحساب وصلاحية جلسات العمل المفتوحة.',
  userColName: 'الملف التعريفي للموظف',
  userColRole: 'نطاق الدور المعين',
  userColLogin: 'آخر نشاط مسجل',
  userColMfa: 'التحقق الثنائي MFA',
  userColRisk: 'مستوى الخطر',
  userColState: 'حالة جلسة العمل',
  userColActions: 'الإجراءات التشغيلية',
  btnRevoke: 'إنهاء الجلسة فوراً',
  btnRevoked: 'تم إنهاء الجلسة',
  btnLock: 'تعليق الحساب',
  btnUnlock: 'استعادة الوصول',
  requestTitle: 'مراجعة طلبات تصعيد الصلاحيات',
  requestDesc: 'طلبات تصعيد الصلاحيات المؤقتة للموظفين ومراجعة حسابات المقاولين قيد الانتظار والمراجعة.',
  requestColUser: 'المستخدم طالب التصعيد',
  requestColType: 'هدف التصعيد المطلوب',
  requestColJust: 'المبرر التشغيلي',
  requestColAction: 'القرار الأمني والرقابي',
  btnApprove: 'منح الصلاحية',
  btnReject: 'رفض الطلب',
  insightTitle: 'فحص الامتثال والرؤى الأمنية لـ IAM',
  insightDesc: 'تقرير الفحص التلقائي للحسابات الخاملة والتركيبات الخطرة لتفويض الصلاحيات.',
  btnResolve: 'تخفيف المخاطر',
  btnResolved: 'تم التخفيف',
  logTitle: 'سجل حوكمة الوصول وخط الأحداث الزمني (SIEM)',
  logDesc: 'تتبع زمني تفصيلي لتعديل الصلاحيات، عمليات الدخول، والاستثناءات التشغيلية الممنوحة.',
  btnExport: 'تصدير سجل التدقيق (CSV)',
  aiTitle: 'رؤى وتوصيات فرح لحوكمة الوصول أمنياً',
  aiDesc: 'توجيهات الحوكمة الآلية المستندة إلى السلوكيات والأنشطة الشاذة المسجلة بالنظام.',
  btnApply: 'تطبيق التوصية الأمنية',
  btnApplied: 'تم تطبيق القاعدة',
  advisoryText: 'تنبيه: التعديلات في صلاحيات الأدوار أو تعطيل الحسابات تسري لحظياً في محرك المصادقة. يؤدي إنهاء جلسة أي مستخدم إلى إعادة توجيهه فوراً لصفحة تسجيل الدخول.'
};

export function RbacTab() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';
  const loc = isRtl ? arLocal : enLocal;

  // Active Tab State
  const [activeSubTab, setActiveSubTab] = useState<'policy' | 'directory' | 'audit'>('policy');

  // Matrix Search Query
  const [matrixSearch, setMatrixSearch] = useState('');

  // Save Policy State
  const [isCompiling, setIsCompiling] = useState(false);

  // 1. Permissions Matrix State (Bound to centralized permission store)
  const permissions = usePermissionStore((s) => s.permissions);
  const updatePermission = usePermissionStore((s) => s.updatePermission);
  const { canEdit, canManage, canExport } = usePermission('rbac');

  // 2. User Directory Roster States
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Tariq Mansoor', email: 'tariq.mansoor@mpaas.com', role: 'supervisor', lastActive: '12 mins ago', mfa: true, risk: 'low', session: 'active', locked: false, reviewed: true },
    { id: 'usr-2', name: 'Nadia Vance', email: 'nadia.vance@mpaas.com', role: 'supervisor', lastActive: '2 mins ago', mfa: false, risk: 'medium', session: 'active', locked: false, reviewed: true },
    { id: 'usr-3', name: 'Sarah Connor', email: 'sarah.connor@mpaas.com', role: 'qa', lastActive: '2 hours ago', mfa: true, risk: 'low', session: 'active', locked: false, reviewed: true },
    { id: 'usr-4', name: 'Guest Contractor', email: 'external.temp@mpaas.com', role: 'viewer', lastActive: '1 day ago', mfa: false, risk: 'high', session: 'active', locked: false, reviewed: false },
    { id: 'usr-5', name: 'Idle Administrator', email: 'admin-backup@mpaas.com', role: 'admin', lastActive: '94 days ago', mfa: true, risk: 'medium', session: 'inactive', locked: false, reviewed: true },
    { id: 'usr-6', name: 'Amara Vance', email: 'amara.vance@mpaas.com', role: 'operations', lastActive: 'Just now', mfa: true, risk: 'medium', session: 'active', locked: false, reviewed: true }
  ]);

  // 3. Temporary Access Request pipeline
  const [requests, setRequests] = useState([
    { id: 'req-1', name: 'Nadia Vance', email: 'nadia.vance@mpaas.com', type: 'Temporary Billing Access', justification: 'Requires read-only audit capability on subscription overage statements for Plivo gateway logs.', expires: '4 hours', status: 'pending' },
    { id: 'req-2', name: 'Guest Contractor', email: 'external.temp@mpaas.com', type: 'RAG Knowledge Import Rights', justification: 'Requires database credential indexing capability to link new company manuals.', expires: '1 day', status: 'pending' },
    { id: 'req-3', name: 'Amara Vance', email: 'amara.vance@mpaas.com', type: 'Temporary Admin RBAC Access', justification: 'Requires temporary capability to check compliance logs for security certification.', expires: '2 hours', status: 'pending' }
  ]);

  // 4. Compliance Insights panel
  const [insights, setInsights] = useState([
    { id: 'ins-1', titleEn: 'Idle Administrator account has logged no recent sessions', titleAr: 'حساب مسؤول خامل لم يسجل أي جلسات دخول مؤخراً', risk: 'high', type: 'dormant', targetUsr: 'Idle Administrator', status: 'active' },
    { id: 'ins-2', titleEn: 'MFA protection disabled for high-risk viewer role', titleAr: 'التحقق الثنائي معطل لدور مراقب عام مرتفع المخاطر', risk: 'medium', type: 'mfa', targetUsr: 'Guest Contractor', status: 'active' },
    { id: 'ins-3', titleEn: 'Excessive Billing Export privileges allocated to QA Manager', titleAr: 'صلاحيات تصدير فواتير زائدة ممنوحة لمدير الجودة', risk: 'low', type: 'scope', targetUsr: 'Sarah Connor', status: 'active' },
    { id: 'ins-4', titleEn: 'Operations Manager possesses unmitigated analytics write scope', titleAr: 'يمتلك مدير العمليات نطاق كتابة غير مخفف في التحليلات', risk: 'low', type: 'scope_ops', targetUsr: 'Amara Vance', status: 'active' }
  ]);

  // 5. Audit Log list states
  const [logs, setLogs] = useState([
    { id: 'gov-1', timestamp: '2026-06-03 10:14:22', operator: 'active.user@mpaas.com', action: 'Modified SLA matrix credentials for Support Supervisor', severity: 'success' },
    { id: 'gov-2', timestamp: '2026-06-03 09:40:11', operator: 'System Daemon', action: 'Failed MFA authentication block for guest.contractor@mpaas.com', severity: 'warning' },
    { id: 'gov-3', timestamp: '2026-06-03 08:15:00', operator: 'active.user@mpaas.com', action: 'Revoked active workspace login token for Guest Contractor', severity: 'info' },
    { id: 'gov-4', timestamp: '2026-06-02 23:12:40', operator: 'Security Broker', action: 'Emergency administrative grant compiled via SAML callback', severity: 'critical' },
    { id: 'gov-5', timestamp: '2026-06-02 18:30:20', operator: 'active.user@mpaas.com', action: 'MFA verification reset requested for Tariq Mansoor', severity: 'success' },
    { id: 'gov-6', timestamp: '2026-06-03 11:20:00', operator: 'amara.vance@mpaas.com', action: 'Requested temporary privilege escalation clearance for SIEM audit trails', severity: 'info' }
  ]);

  const [logFilter, setLogFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // 6. AI Recommendations list
  const [recommendations, setRecommendations] = useState([
    { id: 'rec-1', textEn: 'Suspend Idle Administrator backup profile to mitigate stale credential risk.', textAr: 'تعليق حساب المسؤول الاحتياطي الخامل لتقليل مخاطر الحسابات القديمة.', applied: false, savings: 'Reduces Admin footprint' },
    { id: 'rec-2', textEn: 'Enforce mandatory MFA redirection for Guest Contractor to secure vector databases.', textAr: 'فرض تفعيل التحقق الثنائي للمقاول الخارجي لتأمين قواعد البيانات المتجهة.', applied: false, savings: 'Compliance: ISO 27001' },
    { id: 'rec-3', textEn: 'Revoke secondary billing scopes for QA Manager to enforce separation of duties.', textAr: 'إلغاء الصلاحيات الجانبية للفوترة لمدير الجودة لضمان فصل المهام والمسؤوليات.', applied: false, savings: 'Reduces over-permissioning' },
    { id: 'rec-4', textEn: 'Review analytics write privileges for Amara Vance to enforce least-privilege access.', textAr: 'مراجعة صلاحيات كتابة التحليلات للمستخدم Amara Vance لفرض مبدأ الحد الأدنى من الصلاحيات.', applied: false, savings: 'Operational Audit Cleared' }
  ]);

  // Roles list mapping
  const roleMetadata = [
    { id: 'admin', name: isRtl ? 'مسؤول النظام' : 'Administrator', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200' },
    { id: 'supervisor', name: isRtl ? 'المشرف' : 'Supervisor', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200' },
    { id: 'qa', name: isRtl ? 'مدير الجودة' : 'QA Manager', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200' },
    { id: 'operations', name: isRtl ? 'مدير العمليات' : 'Operations Manager', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200' },
    { id: 'viewer', name: isRtl ? 'مراقب عام' : 'Viewer', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200' }
  ];

  // Modules metadata
  const modulesList = [
    { id: 'inbox', label: isRtl ? 'صندوق الوارد الموحد' : 'Inbox' },
    { id: 'sla', label: isRtl ? 'لوحة اتفاقية الخدمة' : 'SLA Dashboard' },
    { id: 'billing', label: isRtl ? 'الفوترة والاشتراك' : 'Billing' },
    { id: 'analytics', label: isRtl ? 'مركز التحليلات' : 'Analytics' },
    { id: 'workforce', label: isRtl ? 'تخطيط القوى العاملة' : 'Workforce' },
    { id: 'qa', label: isRtl ? 'مراجعة الجودة' : 'QA Workspace' },
    { id: 'rag', label: isRtl ? 'بيانات المعرفة RAG' : 'RAG Ingestion' },
    { id: 'copilot', label: isRtl ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot' },
    { id: 'bot', label: isRtl ? 'إدارة البوتات' : 'Bot Studio' },
    { id: 'surveys', label: isRtl ? 'التقارير والاستبيانات' : 'Surveys' },
    { id: 'audit', label: isRtl ? 'سجل التدقيق الأمني' : 'Audit Logs' }
  ];

  // Permission Option Levels
  const permissionOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manage', label: 'Manage' },
    { value: 'edit', label: 'Edit' },
    { value: 'view', label: 'View' },
    { value: 'none', label: 'None' }
  ];

  // Filter permission matrix by search
  const filteredModules = useMemo(() => {
    return modulesList.filter(mod => {
      const label = mod.label.toLowerCase();
      const id = mod.id.toLowerCase();
      const query = matrixSearch.toLowerCase();
      return label.includes(query) || id.includes(query);
    });
  }, [matrixSearch, isRtl]);

  // Actions handlers
  const handleMatrixChange = (roleId: string, moduleId: string, value: string) => {
    if (!canEdit) return;
    if (roleId === 'admin') return;

    updatePermission(roleId, moduleId, value as PermissionLevel);

    const roleName = roleMetadata.find(r => r.id === roleId)?.name || roleId;
    const moduleName = modulesList.find(m => m.id === moduleId)?.label || moduleId;

    // Toast and Audit Log
    useNotificationStore.getState().addAlert({
      category: 'compliance',
      source: 'guardrails',
      severity: 'info',
      alertCode: 'RBAC_PERMISSION_TOGGLED',
      sourceEntity: `Scope: ${roleName}`,
      title: isRtl ? 'تعديل صلاحية الوصول' : 'Permission Changed',
      message: isRtl 
        ? `تم تحديث صلاحية دور ${roleName} على موديول ${moduleName} إلى ${value.toUpperCase()}.`
        : `Role ${roleName} access to ${moduleName} successfully set to ${value.toUpperCase()}.`,
      metadata: {
        roleId,
        moduleId,
        newScope: value
      }
    });

    addAuditLog(`Modified permission scope: ${roleName} - ${moduleName} updated to ${value.toUpperCase()}`, 'success');
  };

  const handleGlobalCompile = () => {
    if (!canManage) return;
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      useNotificationStore.getState().addAlert({
        category: 'compliance',
        source: 'guardrails',
        severity: 'success',
        alertCode: 'RBAC_POLICIES_COMPILED',
        sourceEntity: 'Access Policy Engine',
        title: isRtl ? 'تم تطبيق السياسات بنجاح' : 'Access Policies Compiled',
        message: isRtl 
          ? 'تم دمج ورفع سياسات الـ RBAC بنجاح على بوابة التحقق والمصادقة للعملاء.'
          : 'All role policy scopes successfully compiled and synced to the authorization gateway.',
        metadata: {
          operator: 'Tenant Owner'
        }
      });
      addAuditLog('Globally compiled and deployed RBAC policy definitions to API gateway', 'success');
    }, 1500);
  };

  // Directory actions
  const handleToggleLock = (userId: string, currentLock: boolean, userName: string) => {
    if (!canManage) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, locked: !currentLock } : u));
    
    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'guardrails',
      severity: 'warning',
      alertCode: currentLock ? 'USER_ACCESS_RESTORED' : 'USER_ACCOUNT_SUSPENDED',
      sourceEntity: userName,
      title: currentLock ? (isRtl ? 'تم رفع تعليق الحساب' : 'User Suspended Lifted') : (isRtl ? 'تم تعليق حساب مستخدم' : 'User Account Suspended'),
      message: currentLock
        ? (isRtl ? `تم استعادة صلاحيات الدخول للمستخدم ${userName} بنجاح.` : `Account access successfully restored for user ${userName}.`)
        : (isRtl ? `تم تعليق حساب الدخول للمستخدم ${userName} بسبب مقتضيات الأمان.` : `Access credentials temporarily suspended for ${userName} (Dormancy policy).`),
      metadata: { userId }
    });

    addAuditLog(`${currentLock ? 'Restored' : 'Suspended'} access profile for directory user: ${userName}`, 'success');
  };

  const handleRevokeSession = (userId: string, userName: string) => {
    if (!canManage) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, session: 'inactive' } : u));

    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'voice',
      severity: 'info',
      alertCode: 'USER_SESSION_REVOKED',
      sourceEntity: userName,
      title: isRtl ? 'تم إنهاء الجلسة فوراً' : 'Session Revoked Forcefully',
      message: isRtl 
        ? `تم طرد وجلسة عمل المستخدم ${userName} بنجاح. سيتم طلب إعادة تسجيل الدخول.`
        : `Active token revoked for ${userName}. Forced redirection executed.`,
      metadata: { userId }
    });

    addAuditLog(`Revoked active token sessions and executed forced sign-out for: ${userName}`, 'success');
  };

  const handleRoleChange = (userId: string, nextRole: string, userName: string) => {
    if (!canManage) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));

    useNotificationStore.getState().addAlert({
      category: 'compliance',
      source: 'guardrails',
      severity: 'warning',
      alertCode: 'USER_ROLE_REASSIGNED',
      sourceEntity: userName,
      title: isRtl ? 'تم تغيير الدور الوظيفي' : 'Directory Role Reassigned',
      message: isRtl
        ? `تم تحديث الدور المخصص لـ ${userName} إلى ${nextRole.toUpperCase()}.`
        : `Assigned role for ${userName} modified to ${nextRole.toUpperCase()} scope.`,
      metadata: { userId, targetRole: nextRole }
    });

    addAuditLog(`Reassigned directory profile role for ${userName} to: ${nextRole.toUpperCase()}`, 'success');
  };

  const handleApproveAccessReview = (userId: string, userName: string) => {
    if (!canManage) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, reviewed: true, risk: 'low' } : u));

    useNotificationStore.getState().addAlert({
      category: 'compliance',
      source: 'guardrails',
      severity: 'success',
      alertCode: 'USER_ACCESS_APPROVED',
      sourceEntity: userName,
      title: isRtl ? 'تم إقرار مراجعة الوصول' : 'User Access Approved',
      message: isRtl
        ? `تم إقرار حالة الأمان والمصادقة للمستخدم ${userName} وخفض تقييم الخطر.`
        : `Access authorization cleared for user ${userName}. Security risk reduced.`,
      metadata: { userId }
    });

    addAuditLog(`Completed access review clearance and certified directory credentials for: ${userName}`, 'success');
  };

  // Approvals actions
  const handleResolveRequest = (reqId: string, action: 'approved' | 'rejected', userName: string, type: string) => {
    if (!canManage) return;
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: action } : r));

    // Append to timeline logs
    const nowTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      {
        id: `gov-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        operator: 'active.user@mpaas.com',
        action: `Temporary request for ${type} by ${userName} was ${action.toUpperCase()}`,
        severity: action === 'approved' ? 'success' : 'info'
      },
      ...prev
    ]);

    useNotificationStore.getState().addAlert({
      category: 'escalation',
      source: 'guardrails',
      severity: action === 'approved' ? 'success' : 'info',
      alertCode: action === 'approved' ? 'PRIVILEGE_GRANT_APPROVED' : 'PRIVILEGE_GRANT_DENIED',
      sourceEntity: userName,
      title: action === 'approved' ? (isRtl ? 'تم قبول طلب الصلاحية' : 'Access Request Approved') : (isRtl ? 'تم رفض طلب الصلاحية' : 'Access Request Rejected'),
      message: action === 'approved'
        ? (isRtl ? `تم منح صلاحية "${type}" للمستخدم ${userName}.` : `Granted temporary privileges for ${type} to ${userName}.`)
        : (isRtl ? `تم رفض منح صلاحية "${type}" للمستخدم ${userName}.` : `Denial response compiled for ${userName} request.`),
      metadata: { reqId, statusDecision: action }
    });

    addAuditLog(`${action === 'approved' ? 'Approved' : 'Rejected'} privilege escalation request for ${userName} (${type})`, 'success');
  };

  // Security Insights actions
  const handleResolveInsight = (id: string, type: string, targetUsr: string) => {
    if (!canManage) return;
    setInsights(prev => prev.map(ins => ins.id === id ? { ...ins, status: 'resolved' } : ins));

    // Execute state changes depending on resolution type
    if (type === 'dormant') {
      // Suspend idle admin
      setUsers(prev => prev.map(u => u.name === targetUsr ? { ...u, locked: true } : u));
      addAuditLog(`Mitigated risk: Suspended dormant administrator profile: ${targetUsr}`, 'success');
    } else if (type === 'mfa') {
      // Force enable MFA
      setUsers(prev => prev.map(u => u.name === targetUsr ? { ...u, mfa: true } : u));
      addAuditLog(`Mitigated risk: Remotely activated MFA protection configuration for: ${targetUsr}`, 'success');
    } else if (type === 'scope') {
      // Reduce billing scopes
      updatePermission('qa', 'billing', 'none');
      addAuditLog(`Mitigated risk: Stripped billing scopes for QA Manager role`, 'success');
    } else if (type === 'scope_ops') {
      // Reduce analytics scope of operations manager
      updatePermission('operations', 'analytics', 'view');
      addAuditLog(`Mitigated risk: Reduced analytics write scopes for Operations Manager`, 'success');
    }

    useNotificationStore.getState().addAlert({
      category: 'compliance',
      source: 'guardrails',
      severity: 'success',
      alertCode: 'RISK_MITIGATION_RESOLVED',
      sourceEntity: targetUsr,
      title: isRtl ? 'تم معالجة الخطر بنجاح' : 'Security Risk Mitigated',
      message: isRtl
        ? `تم تطبيق الإجراءات التصحيحية بنجاح على الملف الشخصي: ${targetUsr}.`
        : `Access correction protocols applied successfully on user: ${targetUsr}.`,
      metadata: { targetUsr, insightType: type }
    });
  };

  // Apply AI Recommendation
  const handleApplyRec = (id: string, text: string) => {
    if (!canManage) return;
    setRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, applied: true } : rec));

    if (id === 'rec-1') {
      setUsers(prev => prev.map(u => u.name === 'Idle Administrator' ? { ...u, locked: true } : u));
    } else if (id === 'rec-2') {
      setUsers(prev => prev.map(u => u.name === 'Guest Contractor' ? { ...u, mfa: true } : u));
    } else if (id === 'rec-3') {
      updatePermission('qa', 'billing', 'none');
    } else if (id === 'rec-4') {
      updatePermission('operations', 'analytics', 'view');
    }

    useNotificationStore.getState().addAlert({
      category: 'ai',
      source: 'guardrails',
      severity: 'success',
      alertCode: 'AI_GOVERNANCE_RULE_APPLIED',
      sourceEntity: 'Farah AI Access Auditor',
      title: isRtl ? 'تم تطبيق قاعدة الحوكمة الذكية' : 'AI Recommendation Enforced',
      message: isRtl
        ? `تم بنجاح تفعيل التوجيه: ${text}`
        : `Successfully enforced AI recommendation: ${text}`,
      metadata: { recommendationId: id }
    });

    addAuditLog(`Enforced AI Governance recommendation: ${text}`, 'success');
  };

  // Export CSV simulated
  const handleExportLogs = () => {
    if (!canExport) return;
    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'analytics',
      severity: 'info',
      alertCode: 'GOVERNANCE_LOGS_EXPORTED',
      sourceEntity: 'Audit Exporter',
      title: isRtl ? 'تصدير سجل الحوكمة' : 'Exporting Governance Logs',
      message: isRtl 
        ? 'تم تجميع سجل أحداث الوصول وبدء تحميل ملف CSV...' 
        : 'Compiling security timeline ledger. CSV download initialized.',
      metadata: { logCount: logs.length }
    });

    addAuditLog('Triggered SIEM governance timeline CSV raw data export', 'success');
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (logFilter === 'critical') return log.severity === 'critical';
      if (logFilter === 'warning') return log.severity === 'warning';
      if (logFilter === 'info') return log.severity === 'info';
      return true;
    });
  }, [logs, logFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">
            {isRtl ? 'إدارة حوكمة الصلاحيات (RBAC)' : 'IAM & Access Governance Console'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loc.subtitle}
          </p>
        </div>
        <button
          onClick={handleGlobalCompile}
          disabled={isCompiling || !canManage}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-750 text-white rounded-2xl shadow-md active:scale-95 transition-all uppercase tracking-wider font-mono ${
            (isCompiling || !canManage) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title={!canManage ? "Requires Manage Permission" : undefined}
        >
          <RefreshCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? loc.btnSaving : loc.btnSave}</span>
        </button>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveSubTab('policy')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11.5px] outline-none whitespace-nowrap cursor-pointer ${
            activeSubTab === 'policy'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{loc.tabPolicy}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11.5px] outline-none whitespace-nowrap cursor-pointer ${
            activeSubTab === 'directory'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{loc.tabDirectory}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11.5px] outline-none whitespace-nowrap cursor-pointer ${
            activeSubTab === 'audit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{loc.tabAudit}</span>
        </button>
      </div>

      {/* ─── TAB 1: GOVERNANCE DASHBOARD & PERMISSIONS MATRIX ─── */}
      {activeSubTab === 'policy' && (
        <div className="space-y-6">
          {/* Overview Cards (Section 1) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">{loc.cardUsers}</span>
              <h3 className="text-xl font-black text-slate-800 dark:text-white font-mono">{users.length}</h3>
              <span className="text-[9.5px] text-slate-450 block font-semibold">Active workspace roster</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">{loc.cardRoles}</span>
              <h3 className="text-xl font-black text-slate-800 dark:text-white font-mono">{roleMetadata.length}</h3>
              <span className="text-[9.5px] text-slate-455 block font-semibold">Configured permissions tiers</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">{loc.cardMfa}</span>
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-450 font-mono">
                {users.filter(u => u.mfa).length} / {users.length}
              </h3>
              <span className="text-[9.5px] text-emerald-500/80 block font-semibold">MFA protection compliance</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">{loc.cardPending}</span>
              <h3 className="text-xl font-black text-amber-600 dark:text-amber-450 font-mono">
                {users.filter(u => !u.reviewed).length + requests.filter(r => r.status === 'pending').length}
              </h3>
              <span className="text-[9.5px] text-amber-500/80 block font-semibold">Requires immediate review</span>
            </div>
          </div>

          {/* Granular Permission Matrix (Section 2) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-850">
              <div className="space-y-0.5">
                <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  {loc.matrixTitle}
                </h3>
                <p className="text-[11px] text-slate-500">{loc.matrixDesc}</p>
              </div>

              {/* Lightweight Filter Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={loc.matrixSearchPlaceholder}
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Matrix Table with sticky headers and scroll container */}
            <div className="max-h-96 overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl min-w-0 w-full relative">
              <table className="w-full text-left text-xs border-collapse relative">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{isRtl ? 'الدور الوظيفي' : 'Role'}</th>
                    {filteredModules.map((mod) => (
                      <th key={mod.id} className="py-3 px-3 text-center min-w-28 bg-slate-50 dark:bg-slate-950">
                        {mod.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-655 dark:text-slate-350 font-semibold">
                  {roleMetadata.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 group">
                      {/* Role Header */}
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-950 z-5 shadow-sm">
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 min-h-[22px] rounded-lg border text-[9.5px] font-bold font-mono tracking-wide whitespace-nowrap ${role.color}`}>
                          {role.name}
                        </span>
                      </td>

                      {/* Modules Cells (Dropdown instead of grid checkboxes for lightweight rendering) */}
                      {filteredModules.map((mod) => {
                        const activeLevel = permissions[role.id]?.[mod.id as keyof RolePermissions] || 'none';
                        return (
                          <td key={mod.id} className="py-3 px-2 text-center">
                            <select
                              value={activeLevel}
                              disabled={role.id === 'admin' || !canEdit}
                              onChange={(e) => handleMatrixChange(role.id, mod.id, e.target.value)}
                              className={`px-2 py-1.5 rounded-xl border bg-transparent font-mono text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                role.id === 'admin' || !canEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                              } ${
                                activeLevel === 'admin' ? 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5' :
                                activeLevel === 'manage' ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5' :
                                activeLevel === 'edit' ? 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5' :
                                activeLevel === 'view' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' :
                                'border-slate-200 dark:border-slate-800 text-slate-400'
                              }`}
                              title={!canEdit && role.id !== 'admin' ? "Requires Edit Permission" : undefined}
                            >
                              {permissionOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="dark:bg-slate-950 dark:text-slate-200">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Governance recommendations (Section 7) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-500" />
                {loc.aiTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                {loc.aiDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className={`p-4 border rounded-2xl flex flex-col justify-between gap-4 transition-all ${
                    rec.applied 
                      ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 opacity-60' 
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-wide text-indigo-600 dark:text-indigo-400">
                      <span>RECOMMENDED RULE</span>
                      <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 rounded">
                        {rec.savings}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-350 leading-relaxed font-semibold">
                      {isRtl ? rec.textAr : rec.textEn}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApplyRec(rec.id, isRtl ? rec.textAr : rec.textEn)}
                    disabled={rec.applied || !canManage}
                    className={`w-full py-2 rounded-xl text-[10.5px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                      (rec.applied || !canManage)
                        ? 'bg-slate-200 dark:bg-slate-850 text-slate-400 dark:text-slate-650 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-750 text-white active:scale-95 cursor-pointer'
                    }`}
                    title={!canManage && !rec.applied ? "Requires Manage Permission" : undefined}
                  >
                    {rec.applied && <Check className="w-3.5 h-3.5" />}
                    <span>{rec.applied ? loc.btnApplied : loc.btnApply}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: IAM USER DIRECTORY & ACCESS APPROVALS ─── */}
      {activeSubTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main user table and reviews (Left 2-thirds) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Access Table (Section 3) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="space-y-0.5 border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  {loc.userTableTitle}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {loc.userTableDesc}
                </p>
              </div>

              {/* Scroll Container for Directory table */}
              <div className="max-h-96 overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl relative w-full min-w-0">
                <table className="w-full text-left text-xs border-collapse relative">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{loc.userColName}</th>
                      <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{loc.userColRole}</th>
                      <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{loc.userColLogin}</th>
                      <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{loc.userColMfa}</th>
                      <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{loc.userColRisk}</th>
                      <th className="py-3 px-4 bg-slate-50 dark:bg-slate-950">{loc.userColState}</th>
                      <th className="py-3 px-4 text-right bg-slate-50 dark:bg-slate-950">{loc.userColActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-655 dark:text-slate-350 font-semibold">
                    {users.map((usr) => (
                      <tr key={usr.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors ${usr.locked ? 'opacity-50 bg-slate-50 dark:bg-slate-950' : ''}`}>
                        {/* Avatar / Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black uppercase text-[10px] text-slate-655 tracking-wider shrink-0 border border-slate-200 dark:border-slate-700">
                              {usr.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="space-y-0.5">
                              <span className="block font-bold">{usr.name}</span>
                              <span className="block font-mono text-[9.5px] text-slate-450 truncate" style={{ maxWidth: '140px' }} title={usr.email}>{usr.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role selector dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={usr.role}
                            onChange={(e) => handleRoleChange(usr.id, e.target.value, usr.name)}
                            disabled={(usr.name === 'Idle Administrator' && usr.locked) || !canManage}
                            className={`px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono text-[10.5px] font-bold outline-none ${
                              ((usr.name === 'Idle Administrator' && usr.locked) || !canManage) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title={!canManage ? "Requires Manage Permission" : undefined}
                          >
                            {roleMetadata.map((r) => (
                              <option key={r.id} value={r.id} className="dark:bg-slate-950 dark:text-slate-200">
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Last activity */}
                        <td className="py-3.5 px-4 font-mono text-[10px]">{usr.lastActive}</td>

                        {/* MFA Status */}
                        <td className="py-3.5 px-4">
                          {usr.mfa ? (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase font-mono text-[8px]">Enforced</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold uppercase font-mono text-[8px] animate-pulse">Disabled</span>
                          )}
                        </td>

                        {/* Risk Tier */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            usr.risk === 'high' ? 'bg-red-100 text-red-800' :
                            usr.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {usr.risk}
                          </span>
                        </td>

                        {/* Session status */}
                        <td className="py-3.5 px-4">
                          {usr.session === 'active' ? (
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-active shrink-0" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span>Offline</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {/* Session Revoke */}
                            {usr.session === 'active' ? (
                              <button
                                disabled={!canManage}
                                onClick={() => handleRevokeSession(usr.id, usr.name)}
                                className={`px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-xl font-bold text-[10px] transition-all whitespace-nowrap ${
                                  !canManage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title={!canManage ? "Requires Manage Permission" : "Terminate active credential token session"}
                              >
                                {loc.btnRevoke}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 px-2 py-1 font-mono italic">Revoked</span>
                            )}

                            {/* Lock/Unlock account */}
                            <button
                              disabled={!canManage}
                              onClick={() => handleToggleLock(usr.id, usr.locked, usr.name)}
                              className={`px-2.5 py-1 border rounded-xl font-bold text-[10px] transition-all whitespace-nowrap ${
                                usr.locked 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white' 
                                  : 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20 text-red-600'
                              } ${!canManage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                              title={!canManage ? "Requires Manage Permission" : undefined}
                            >
                              {usr.locked ? loc.btnUnlock : loc.btnLock}
                            </button>

                            {/* Certify directory/Access review badge */}
                            {!usr.reviewed && (
                              <button
                                disabled={!canManage}
                                onClick={() => handleApproveAccessReview(usr.id, usr.name)}
                                className={`px-2 py-1 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold text-[10px] ${
                                  !canManage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title={!canManage ? "Requires Manage Permission" : "Approve access review audit"}
                              >
                                Certify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Privilege Escalation reviews (Section 4) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="space-y-0.5 border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  {loc.requestTitle}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {loc.requestDesc}
                </p>
              </div>

              <div className="space-y-4">
                {requests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      req.status !== 'pending' 
                        ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 opacity-60' 
                        : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-850'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">
                          {req.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({req.email})</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[9px] font-bold font-mono">
                          Expires: {req.expires}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-350">
                        <strong className="text-slate-900 dark:text-white">{loc.requestColType}:</strong> {req.type}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                        <strong className="text-slate-750 dark:text-slate-400">{loc.requestColJust}:</strong> {req.justification}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0 self-start md:self-center">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            disabled={!canManage}
                            onClick={() => handleResolveRequest(req.id, 'approved', req.name, req.type)}
                            className={`px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl text-[10.5px] uppercase tracking-wider transition-all whitespace-nowrap ${
                              !canManage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title={!canManage ? "Requires Manage Permission" : undefined}
                          >
                            {loc.btnApprove}
                          </button>
                          <button
                            disabled={!canManage}
                            onClick={() => handleResolveRequest(req.id, 'rejected', req.name, req.type)}
                            className={`px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-2xl text-[10.5px] uppercase tracking-wider transition-all whitespace-nowrap ${
                              !canManage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title={!canManage ? "Requires Manage Permission" : undefined}
                          >
                            {loc.btnReject}
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-xl font-bold font-mono uppercase text-[10px] border ${
                          req.status === 'approved' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/20 border-emerald-350 text-emerald-800' 
                            : 'bg-rose-100 dark:bg-rose-950/20 border-rose-350 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Security & Compliance insights (Right third) */}
          <div className="space-y-6">
            
            {/* Insights panel (Section 5) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-500" />
                  {loc.insightTitle}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {loc.insightDesc}
                </p>
              </div>

              <div className="space-y-3">
                {insights.map((ins) => {
                  const isResolved = ins.status === 'resolved';
                  return (
                    <div 
                      key={ins.id} 
                      className={`p-3.5 border rounded-2xl space-y-3 transition-all ${
                        isResolved 
                          ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 opacity-60 font-semibold' 
                          : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-850 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[11.5px] leading-tight text-slate-800 dark:text-white">
                          {isRtl ? ins.titleAr : ins.titleEn}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase shrink-0 ${
                          ins.risk === 'high' ? 'bg-red-100 text-red-800' :
                          ins.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {ins.risk}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850 text-[10.5px]">
                        <span className="text-slate-450 truncate block max-w-32" title={ins.targetUsr}>User: {ins.targetUsr}</span>
                        <button
                          type="button"
                          onClick={() => handleResolveInsight(ins.id, ins.type, ins.targetUsr)}
                          disabled={isResolved || !canManage}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all ${
                            (isResolved || !canManage)
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-750 text-white active:scale-95 cursor-pointer'
                          }`}
                          title={!canManage && !isResolved ? "Requires Manage Permission" : undefined}
                        >
                          {isResolved ? loc.btnResolved : loc.btnResolve}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 3: IAM AUDIT LEDGER TIMELINE ─── */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div className="space-y-0.5">
                <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase font-mono">
                  {loc.logTitle}
                </h3>
                <p className="text-[11px] text-slate-500">{loc.logDesc}</p>
              </div>
            </div>

            {/* Severity Filter and Export actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Severity filter tabs */}
              <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl w-fit">
                {(['all', 'critical', 'warning', 'info'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      logFilter === filter
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                        : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-300'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Export Trigger */}
              <button 
                disabled={!canExport}
                onClick={handleExportLogs}
                className={`px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 dark:hover:bg-slate-900 text-slate-655 dark:text-slate-300 rounded-xl transition-all font-bold text-[10px] flex items-center gap-1.5 ${
                  !canExport ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title={!canExport ? "Requires Export Permission" : undefined}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{loc.btnExport}</span>
              </button>
            </div>
          </div>

          {/* Timeline scrollable viewport with sticky headers container */}
          <div className="max-h-96 overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl relative w-full min-w-0 p-4 space-y-4">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl"
              >
                {/* Event Marker */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  log.severity === 'critical' ? 'bg-red-500/10 border-red-200 text-red-600' :
                  log.severity === 'warning' ? 'bg-amber-500/10 border-amber-200 text-amber-600' :
                  log.severity === 'success' ? 'bg-emerald-500/10 border-emerald-200 text-emerald-600' :
                  'bg-blue-500/10 border-blue-200 text-blue-600'
                }`}>
                  {log.severity === 'critical' ? <ShieldAlert className="w-4 h-4" /> :
                   log.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                   log.severity === 'success' ? <UserCheck className="w-4 h-4" /> :
                   <FileText className="w-4 h-4" />}
                </div>

                {/* Log Info */}
                <div className="space-y-1 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-mono text-[10.5px] font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span className="font-mono text-slate-400 text-[9.5px] shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold font-mono">
                    <span>Operator: {log.operator}</span>
                    <span>•</span>
                    <span className={`uppercase font-bold ${
                      log.severity === 'critical' ? 'text-red-500' :
                      log.severity === 'warning' ? 'text-amber-500' :
                      log.severity === 'success' ? 'text-emerald-500' :
                      'text-blue-500'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium">
                No governance logs found matching filter constraints.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Bottom Advisory warning banner ─── */}
      <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-450 p-4 rounded-3xl text-xs leading-relaxed font-semibold">
        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
        <p>{loc.advisoryText}</p>
      </div>
    </div>
  );
}

export default RbacTab;
