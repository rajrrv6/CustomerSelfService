'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { KnowledgeConnector, ConnectorType } from '@/types/knowledgeConnector';
import { KnowledgeConnectorStatusBadge } from './KnowledgeConnectorStatusBadge';
import { Edit2, Trash2, RefreshCw, FileText, Globe, Key, Cloud } from 'lucide-react';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';

interface KnowledgeConnectorTableProps {
  data: KnowledgeConnector[];
  lang: 'en' | 'ar';
  onEdit: (connector: KnowledgeConnector) => void;
  onDelete: (id: string) => void;
  onSync: (connector: KnowledgeConnector) => void;
}

export function KnowledgeConnectorTable({
  data,
  lang,
  onEdit,
  onDelete,
  onSync
}: KnowledgeConnectorTableProps) {
  const isRtl = lang === 'ar';

  const typeLabels: Record<ConnectorType, { en: string; ar: string; icon: React.ReactNode }> = {
    notion: { en: 'Notion Workspace', ar: 'مساحة عمل Notion', icon: <FileText className="w-3.5 h-3.5 text-yellow-600" /> },
    confluence: { en: 'Confluence Wiki', ar: 'ويكي Confluence', icon: <FileText className="w-3.5 h-3.5 text-blue-600" /> },
    google_drive: { en: 'Google Drive', ar: 'جوجل درايف', icon: <Cloud className="w-3.5 h-3.5 text-emerald-600" /> },
    sharepoint: { en: 'SharePoint Portal', ar: 'مدخل SharePoint', icon: <Cloud className="w-3.5 h-3.5 text-sky-600" /> },
    website_crawl: { en: 'Website Crawl', ar: 'زحف وفهرسة الويب', icon: <Globe className="w-3.5 h-3.5 text-indigo-650" /> },
    file_upload: { en: 'File Upload (Offline)', ar: 'تحميل ملف يدوي', icon: <FileText className="w-3.5 h-3.5 text-slate-500" /> }
  };

  const columns = useMemo<ColumnDef<KnowledgeConnector>[]>(() => [
    {
      accessorKey: 'name',
      header: isRtl ? 'اسم الموصل' : 'Connector Name',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</div>
            {item.description && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-xs mt-0.5">
                {item.description}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'type',
      header: isRtl ? 'نوع الموصل' : 'Connector Type',
      cell: ({ row }) => {
        const t = row.original.type;
        const config = typeLabels[t] || { en: t, ar: t, icon: <FileText className="w-3.5 h-3.5 text-slate-400" /> };
        return (
          <div className="flex items-center gap-1.5 font-bold">
            {config.icon}
            <span>{isRtl ? config.ar : config.en}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: isRtl ? 'الحالة' : 'Status',
      cell: ({ row }) => <KnowledgeConnectorStatusBadge status={row.original.status} />
    },
    {
      accessorKey: 'lastSync',
      header: isRtl ? 'آخر مزامنة' : 'Last Sync',
      cell: ({ row }) => (
        <span className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400">
          {row.original.lastSync}
        </span>
      )
    },
    {
      accessorKey: 'owner',
      header: isRtl ? 'المالك المسؤول' : 'Owner',
      cell: ({ row }) => (
        <span className="text-[10.5px] text-slate-550 dark:text-slate-400">
          {row.original.owner}
        </span>
      )
    },
    {
      id: 'actions',
      header: isRtl ? 'إجراءات' : 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isRtl ? 'تعديل' : 'Edit'}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSync(item)}
              className="p-1 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
              title={isRtl ? 'مزامنة الآن' : 'Sync Now'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
              title={isRtl ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    }
  ], [isRtl]);

  const filterOptions = [
    {
      columnId: 'type',
      label: isRtl ? 'نوع الموصل' : 'Type',
      options: [
        { label: 'Confluence', value: 'confluence' },
        { label: 'Notion', value: 'notion' },
        { label: 'Website Crawl', value: 'website_crawl' },
        { label: 'Google Drive', value: 'google_drive' },
        { label: 'SharePoint', value: 'sharepoint' },
        { label: 'File Upload', value: 'file_upload' }
      ]
    },
    {
      columnId: 'status',
      label: isRtl ? 'الحالة' : 'Status',
      options: [
        { label: isRtl ? 'نشط' : 'Active', value: 'active' },
        { label: isRtl ? 'قيد الانتظار' : 'Pending', value: 'pending' },
        { label: isRtl ? 'خطأ' : 'Error', value: 'error' },
        { label: isRtl ? 'معطل' : 'Disabled', value: 'disabled' }
      ]
    }
  ];

  return (
    <EnterpriseTable
      data={data}
      columns={columns}
      lang={lang}
      emptyMessage={isRtl ? 'لا توجد موصلات معرفة مضافة' : 'No knowledge connectors found'}
      emptySubMessage={isRtl ? 'أضف موصلات لربط بيانات RAG بالمستندات الخاصة بك.' : 'Add connectors to import documents for your RAG engine.'}
      enableSearch={true}
      searchPlaceholder={isRtl ? 'البحث عن موصلات...' : 'Search connectors...'}
      filterOptions={filterOptions}
    />
  );
}
