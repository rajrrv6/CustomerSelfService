'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { KnowledgeConnector, ConnectorType, SyncFrequency } from '@/types/knowledgeConnector';
import { Globe, Link as LinkIcon, User, FileText, Settings } from 'lucide-react';

interface KnowledgeConnectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  connector: KnowledgeConnector | null;
  onSave: (connectorData: Omit<KnowledgeConnector, 'id' | 'lastSync'> & { id?: string }) => void;
  lang: 'en' | 'ar';
}

export function KnowledgeConnectorFormModal({
  isOpen,
  onClose,
  connector,
  onSave,
  lang
}: KnowledgeConnectorFormModalProps) {
  const isRtl = lang === 'ar';

  const [name, setName] = useState('');
  const [type, setType] = useState<ConnectorType>('website_crawl');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('daily');

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (connector) {
        setName(connector.name);
        setType(connector.type);
        setEndpointUrl(connector.endpointUrl || '');
        setDescription(connector.description || '');
        setOwner(connector.owner);
        setSyncFrequency(connector.syncFrequency);
      } else {
        setName('');
        setType('website_crawl');
        setEndpointUrl('');
        setDescription('');
        setOwner('admin@mpaas.com');
        setSyncFrequency('daily');
      }
      setErrors({});
    }
  }, [isOpen, connector]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = isRtl ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!owner.trim()) {
      newErrors.owner = isRtl ? 'المالك مطلوب' : 'Owner is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner)) {
      newErrors.owner = isRtl ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
    }

    if (type !== 'file_upload') {
      if (!endpointUrl.trim()) {
        newErrors.endpointUrl = isRtl ? 'العنوان أو الرابط مطلوب' : 'Endpoint URL is required';
      } else {
        // Basic URL pattern check
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
        if (!urlPattern.test(endpointUrl)) {
          newErrors.endpointUrl = isRtl ? 'الرابط غير صالح' : 'Invalid URL format';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: connector?.id,
      name,
      type,
      endpointUrl: type === 'file_upload' ? undefined : endpointUrl,
      description,
      owner,
      syncFrequency,
      status: connector?.status || 'pending'
    });

    onClose();
  };

  const getTitle = () => {
    if (connector) {
      return isRtl ? 'تعديل موصل المعرفة' : 'Edit Knowledge Connector';
    }
    return isRtl ? 'إضافة موصل معرفة جديد' : 'Add New Knowledge Connector';
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={getTitle()} maxWidthClass="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label htmlFor="connector-name" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
            {isRtl ? 'اسم الموصل' : 'Connector Name'} *
          </label>
          <div className="relative">
            <input
              id="connector-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
              placeholder={isRtl ? 'مثال: ملفات الدعم الفني للمؤسسة' : 'e.g. Enterprise Support Wiki'}
            />
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
          {errors.name && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.name}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="connector-type" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'نوع الموصل' : 'Connector Type'} *
            </label>
            <select
              id="connector-type"
              value={type}
              onChange={(e) => {
                const val = e.target.value as ConnectorType;
                setType(val);
                if (val === 'file_upload') setEndpointUrl('');
              }}
              className="w-full px-3 py-2.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
            >
              <option value="confluence">Confluence</option>
              <option value="notion">Notion</option>
              <option value="website_crawl">Website Crawl</option>
              <option value="google_drive">Google Drive</option>
              <option value="sharepoint">SharePoint</option>
              <option value="file_upload">{isRtl ? 'تحميل ملف' : 'File Upload'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="connector-frequency" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'تكرار المزامنة' : 'Sync Frequency'} *
            </label>
            <select
              id="connector-frequency"
              value={syncFrequency}
              onChange={(e) => setSyncFrequency(e.target.value as SyncFrequency)}
              className="w-full px-3 py-2.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
            >
              <option value="hourly">{isRtl ? 'ساعي' : 'Hourly'}</option>
              <option value="daily">{isRtl ? 'يومي' : 'Daily'}</option>
              <option value="weekly">{isRtl ? 'أسبوعي' : 'Weekly'}</option>
              <option value="manual">{isRtl ? 'يدوي' : 'Manual'}</option>
            </select>
          </div>
        </div>

        {type !== 'file_upload' && (
          <div>
            <label htmlFor="connector-url" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
              {isRtl ? 'رابط الوصول / النقطة النهائية' : 'Endpoint Connection URL'} *
            </label>
            <div className="relative">
              <input
                id="connector-url"
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                placeholder="https://mywiki.domain.com"
              />
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>
            {errors.endpointUrl && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.endpointUrl}</span>}
          </div>
        )}

        <div>
          <label htmlFor="connector-owner" className="block text-[10px] font-bold text-slate-455 uppercase font-mono mb-1.5">
            {isRtl ? 'المالك المسؤول' : 'Responsible Owner'} *
          </label>
          <div className="relative">
            <input
              id="connector-owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
              placeholder="operator@mpaas.com"
            />
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
          {errors.owner && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.owner}</span>}
        </div>

        <div>
          <label htmlFor="connector-desc" className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
            {isRtl ? 'الوصف' : 'Description'}
          </label>
          <textarea
            id="connector-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white resize-none"
            placeholder={isRtl ? 'أدخل تفاصيل ووصف هذا الموصل ومحتواه...' : 'Describe the contents of this repository connector...'}
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isRtl ? 'حفظ الموصل' : 'Save Connector'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
