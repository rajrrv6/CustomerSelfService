'use client';

import React, { useState } from 'react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { Plus, Search, Edit, Trash2, Hash, CheckSquare, ShieldCheck, UserPlus, UserMinus, Bookmark, BookmarkX, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { DidNumber, DidStatus, DidAssignmentState } from '@/types/telephony';
import { TelephonyStatusBadge } from './TelephonyStatusBadge';

const initialNumbers: DidNumber[] = [
  {
    id: 'did-1',
    phoneNumber: '+966 92000 8821',
    countryRegion: 'Saudi Arabia',
    provider: 'STC Voice Gateway',
    assignedTenant: 'Saudi Telecom Corp (HQ)',
    activationDate: '2026-01-15',
    status: 'active',
    assignmentState: 'assigned'
  },
  {
    id: 'did-2',
    phoneNumber: '+966 800 124 9982',
    countryRegion: 'Saudi Arabia',
    provider: 'Mobily Business Line',
    assignedTenant: 'Al-Rajhi Retail',
    activationDate: '2026-02-10',
    status: 'active',
    assignmentState: 'assigned'
  },
  {
    id: 'did-3',
    phoneNumber: '+971 4 480 2210',
    countryRegion: 'United Arab Emirates',
    provider: 'Du Enterprise Route',
    assignedTenant: 'Emirates Airlines',
    activationDate: '2026-03-01',
    status: 'active',
    assignmentState: 'assigned'
  },
  {
    id: 'did-4',
    phoneNumber: '+966 92000 7711',
    countryRegion: 'Saudi Arabia',
    provider: 'STC Voice Gateway',
    assignedTenant: 'Unassigned',
    activationDate: '2026-04-05',
    status: 'active',
    assignmentState: 'available'
  },
  {
    id: 'did-5',
    phoneNumber: '+971 800 9981',
    countryRegion: 'United Arab Emirates',
    provider: 'Du Enterprise Route',
    assignedTenant: 'Unassigned',
    activationDate: '2026-04-10',
    status: 'active',
    assignmentState: 'available'
  },
  {
    id: 'did-6',
    phoneNumber: '+966 11 480 3341',
    countryRegion: 'Saudi Arabia',
    provider: 'STC Voice Gateway',
    assignedTenant: 'Gulf Fintech Hub (Reserved)',
    activationDate: '2026-05-01',
    status: 'active',
    assignmentState: 'reserved'
  },
  {
    id: 'did-7',
    phoneNumber: '+966 12 555 4321',
    countryRegion: 'Saudi Arabia',
    provider: 'STC Voice Gateway',
    assignedTenant: 'Unassigned',
    activationDate: '2026-05-15',
    status: 'inactive',
    assignmentState: 'available'
  }
];

export function NumberPoolTab() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [numbers, setNumbers] = useState<DidNumber[]>(initialNumbers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');

  // Modals & form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNumber, setEditingNumber] = useState<DidNumber | null>(null);

  // DID Add/Edit form state
  const [newDid, setNewDid] = useState<Omit<DidNumber, 'id' | 'activationDate'>>({
    phoneNumber: '',
    countryRegion: 'Saudi Arabia',
    provider: 'STC Voice Gateway',
    assignedTenant: 'Unassigned',
    status: 'active',
    assignmentState: 'available'
  });

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningDid, setAssigningDid] = useState<DidNumber | null>(null);
  const [assignTenantName, setAssignTenantName] = useState('');

  // Reserve modal state
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reservingDid, setReservingDid] = useState<DidNumber | null>(null);
  const [reserveTenantName, setReserveTenantName] = useState('');

  const handleCreateClick = () => {
    setEditingNumber(null);
    setNewDid({
      phoneNumber: '',
      countryRegion: 'Saudi Arabia',
      provider: 'STC Voice Gateway',
      assignedTenant: 'Unassigned',
      status: 'active',
      assignmentState: 'available'
    });
    setShowFormModal(true);
  };

  const handleEditClick = (did: DidNumber) => {
    setEditingNumber(did);
    setNewDid({
      phoneNumber: did.phoneNumber,
      countryRegion: did.countryRegion,
      provider: did.provider,
      assignedTenant: did.assignedTenant,
      status: did.status,
      assignmentState: did.assignmentState
    });
    setShowFormModal(true);
  };

  const handleDeleteClick = (id: string) => {
    const did = numbers.find((n) => n.id === id);
    if (!did) return;
    setNumbers((prev) => prev.filter((n) => n.id !== id));
    pushToast(
      'success',
      isRtl ? 'تم حذف رقم DID' : 'DID Number Deleted',
      isRtl ? `تم إزالة الرقم "${did.phoneNumber}" من السجل.` : `Successfully removed phone number "${did.phoneNumber}" from pool.`
    );
    addAuditLog(`Removed DID phone number from pool: ${did.phoneNumber}`, 'success');
  };

  const handleToggleActive = (did: DidNumber) => {
    const nextStatus: DidStatus = did.status === 'inactive' ? 'active' : 'inactive';
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === did.id
          ? {
              ...n,
              status: nextStatus
            }
          : n
      )
    );
    pushToast(
      'success',
      nextStatus === 'active'
        ? (isRtl ? 'تم تفعيل رقم الهاتف' : 'DID Number Activated')
        : (isRtl ? 'تم إلغاء تفعيل رقم الهاتف' : 'DID Number Deactivated'),
      isRtl
        ? `رقم الهاتف "${did.phoneNumber}" أصبح ${nextStatus === 'active' ? 'نشطاً' : 'غير نشط'}.`
        : `Successfully changed status of "${did.phoneNumber}" to ${nextStatus}.`
    );
    addAuditLog(`Toggled DID status: ${did.phoneNumber} (${nextStatus})`, 'success');
  };

  const handleAssignClick = (did: DidNumber) => {
    setAssigningDid(did);
    setAssignTenantName(did.assignedTenant !== 'Unassigned' ? did.assignedTenant : '');
    setShowAssignModal(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDid || !assignTenantName.trim()) return;

    setNumbers((prev) =>
      prev.map((n) =>
        n.id === assigningDid.id
          ? {
              ...n,
              assignedTenant: assignTenantName,
              assignmentState: 'assigned',
              status: 'active'
            }
          : n
      )
    );

    pushToast(
      'success',
      isRtl ? 'تم تعيين رقم الهاتف' : 'DID Assigned',
      isRtl
        ? `تم بنجاح تعيين رقم "${assigningDid.phoneNumber}" للمستأجر "${assignTenantName}".`
        : `Successfully assigned "${assigningDid.phoneNumber}" to tenant "${assignTenantName}".`
    );
    addAuditLog(`Assigned DID ${assigningDid.phoneNumber} to tenant: ${assignTenantName}`, 'success');
    setShowAssignModal(false);
    setAssigningDid(null);
  };

  const handleUnassignClick = (did: DidNumber) => {
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === did.id
          ? {
              ...n,
              assignedTenant: 'Unassigned',
              assignmentState: 'available'
            }
          : n
      )
    );

    pushToast(
      'success',
      isRtl ? 'تم إلغاء تعيين رقم الهاتف' : 'DID Unassigned',
      isRtl
        ? `تم إزالة التعيين عن الرقم "${did.phoneNumber}".`
        : `Successfully removed assignment for "${did.phoneNumber}".`
    );
    addAuditLog(`Unassigned DID number: ${did.phoneNumber}`, 'success');
  };

  const handleReserveClick = (did: DidNumber) => {
    setReservingDid(did);
    setReserveTenantName('');
    setShowReserveModal(true);
  };

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservingDid || !reserveTenantName.trim()) return;

    setNumbers((prev) =>
      prev.map((n) =>
        n.id === reservingDid.id
          ? {
              ...n,
              assignedTenant: `${reserveTenantName} (Reserved)`,
              assignmentState: 'reserved'
            }
          : n
      )
    );

    pushToast(
      'success',
      isRtl ? 'تم حجز رقم الهاتف' : 'DID Reserved',
      isRtl
        ? `تم حجز رقم "${reservingDid.phoneNumber}" للعميل "${reserveTenantName}".`
        : `Successfully reserved "${reservingDid.phoneNumber}" for "${reserveTenantName}".`
    );
    addAuditLog(`Reserved DID ${reservingDid.phoneNumber} for: ${reserveTenantName}`, 'success');
    setShowReserveModal(false);
    setReservingDid(null);
  };

  const handleReleaseReservation = (did: DidNumber) => {
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === did.id
          ? {
              ...n,
              assignedTenant: 'Unassigned',
              assignmentState: 'available'
            }
          : n
      )
    );

    pushToast(
      'success',
      isRtl ? 'تم إلغاء حجز الرقم' : 'Reservation Released',
      isRtl
        ? `تم إلغاء حجز الرقم "${did.phoneNumber}" وأصبح متوفراً.`
        : `Successfully released reservation for "${did.phoneNumber}".`
    );
    addAuditLog(`Released DID reservation: ${did.phoneNumber}`, 'success');
  };

  const handleSaveDid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDid.phoneNumber) return;

    // Derived assignment state logic
    let derivedState = newDid.assignmentState;
    let tenant = newDid.assignedTenant;
    if (tenant !== 'Unassigned') {
      derivedState = 'assigned';
    } else if (derivedState === 'assigned') {
      derivedState = 'available';
    }

    if (editingNumber) {
      setNumbers((prev) =>
        prev.map((n) =>
          n.id === editingNumber.id
            ? {
                ...n,
                phoneNumber: newDid.phoneNumber,
                countryRegion: newDid.countryRegion,
                provider: newDid.provider,
                assignedTenant: tenant,
                status: newDid.status,
                assignmentState: derivedState
              }
            : n
        )
      );
      pushToast(
        'success',
        isRtl ? 'تم تحديث رقم DID' : 'DID Number Updated',
        isRtl ? `تم تعديل بيانات الرقم "${newDid.phoneNumber}".` : `Successfully updated DID number "${newDid.phoneNumber}".`
      );
      addAuditLog(`Updated DID number settings: ${newDid.phoneNumber}`, 'success');
    } else {
      const did: DidNumber = {
        id: `did-${Date.now()}`,
        phoneNumber: newDid.phoneNumber,
        countryRegion: newDid.countryRegion,
        provider: newDid.provider,
        assignedTenant: tenant,
        activationDate: new Date().toISOString().split('T')[0],
        status: newDid.status,
        assignmentState: derivedState
      };
      setNumbers((prev) => [...prev, did]);
      pushToast(
        'success',
        isRtl ? 'تم إضافة رقم DID جديد' : 'DID Number Added',
        isRtl ? `تم تسجيل الرقم "${did.phoneNumber}" بنجاح.` : `Successfully added DID number "${did.phoneNumber}" to pool.`
      );
      addAuditLog(`Added new DID phone number to pool: ${did.phoneNumber}`, 'success');
    }

    setShowFormModal(false);
    setEditingNumber(null);
  };

  // KPIs
  const totalCount = numbers.length;
  const assignedCount = numbers.filter(n => n.assignmentState === 'assigned').length;
  const availableCount = numbers.filter(n => n.assignmentState === 'available').length;

  // Dynamic filter dropdown parameters
  const uniqueProviders = Array.from(new Set(numbers.map(n => n.provider)));

  // Filter & Search logic
  const filteredNumbers = numbers.filter((n) => {
    const matchesSearch =
      n.phoneNumber.includes(searchQuery) ||
      n.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.assignedTenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.countryRegion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || n.provider === providerFilter;
    const matchesAssignment = assignmentFilter === 'all' || n.assignmentState === assignmentFilter;

    return matchesSearch && matchesStatus && matchesProvider && matchesAssignment;
  });

  const tableHeaders = [
    isRtl ? 'رقم الهاتف DID' : 'DID Phone Number',
    isRtl ? 'البلد / المنطقة' : 'Country/Region',
    isRtl ? 'موفر شبكة الاتصال' : 'Carrier Provider',
    isRtl ? 'المستأجر المعين' : 'Assigned Enterprise Tenant',
    isRtl ? 'تاريخ التفعيل' : 'Activation Date',
    isRtl ? 'الحالة' : 'Status',
    isRtl ? 'حالة التعيين' : 'Assignment State',
    isRtl ? 'الإجراءات' : 'Actions'
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={isRtl ? 'حزمة الأرقام الواردة DID' : 'DID Number Pool'}
        description={isRtl ? 'إدارة وتخصيص وتتبع أرقام الاتصال الواردة المباشرة لمستأجري المنصة.' : 'Manage, assign, and track incoming Direct Inward Dialing numbers for platform clients.'}
        action={
          numbers.length > 0 ? (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة رقم DID' : 'Add DID Number'}</span>
            </button>
          ) : undefined
        }
      />

      {numbers.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-650 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 mb-4 shadow-sm">
            <Hash className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
            {isRtl ? 'سجل أرقام DID فارغ' : 'DID Number Pool Empty'}
          </h3>
          <p className="text-[10px] text-slate-400 max-w-sm mt-2 mb-6 font-semibold">
            {isRtl
              ? 'يرجى تسجيل وإضافة أرقام هواتف جديدة في السجل لتتمكن من تعيينها للمستأجرين.'
              : 'Please register new incoming phone numbers in the pool to delegate voice routing access to client organizations.'}
          </p>
          <button
            onClick={handleCreateClick}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة رقم DID جديد' : 'Add First DID Number'}</span>
          </button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <OperationalCard hoverEffect={false} className="border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/30">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isRtl ? 'إجمالي الأرقام المخصصة' : 'Total DID Numbers'}
                  </p>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{totalCount}</h3>
                </div>
              </div>
            </OperationalCard>

            <OperationalCard hoverEffect={false} className="border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-purple-900/30">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isRtl ? 'الأرقام المعينة حالياً' : 'Assigned Numbers'}
                  </p>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {assignedCount} <span className="text-xs text-slate-455 font-normal">/ {totalCount}</span>
                  </h3>
                </div>
              </div>
            </OperationalCard>

            <OperationalCard hoverEffect={false} className="border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-emerald-900/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isRtl ? 'الأرقام الشاغرة المتوفرة' : 'Available Numbers'}
                  </p>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {availableCount} <span className="text-xs text-slate-455 font-normal">/ {totalCount}</span>
                  </h3>
                </div>
              </div>
            </OperationalCard>
          </div>

          {/* Filter and Search HUD */}
          <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
            {/* Assignment filters */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit overflow-x-auto scrollbar-none shrink-0 border border-slate-200 dark:border-slate-800">
              {(['all', 'available', 'assigned', 'reserved'] as const).map((filter) => {
                const isActive = assignmentFilter === filter;
                const labels = {
                  all: isRtl ? 'كل التعيينات' : 'All Assignments',
                  available: isRtl ? 'متوفر' : 'Available',
                  assigned: isRtl ? 'معين' : 'Assigned',
                  reserved: isRtl ? 'محجوز' : 'Reserved'
                };
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setAssignmentFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0 ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-2xl items-stretch sm:items-center min-w-0">
              {/* Status Select Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-205 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold shrink-0"
              >
                <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
                <option value="inactive">{isRtl ? 'غير نشط' : 'Inactive'}</option>
              </select>

              {/* Provider Select Filter */}
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-205 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold shrink-0"
              >
                <option value="all">{isRtl ? 'جميع الشركات' : 'All Carriers'}</option>
                {uniqueProviders.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isRtl ? 'البحث عن أرقام DID المحددة...' : 'Search pool by number, carrier, tenant...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* DID Table */}
          <EnterpriseTable
            headers={tableHeaders}
            empty={filteredNumbers.length === 0}
            emptyTitle={isRtl ? 'حزمة الأرقام فارغة' : 'DID Pool Empty'}
            emptyDesc={isRtl ? 'لا توجد أرقام هواتف مسجلة تطابق محددات البحث.' : 'No telephone records match your active category filter.'}
          >
            {filteredNumbers.map((did) => (
              <tr key={did.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{did.phoneNumber}</td>
                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-350">{did.countryRegion}</td>
                <td className="px-6 py-4 font-semibold text-slate-655 dark:text-slate-350">{did.provider}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${did.assignedTenant === 'Unassigned' ? 'text-slate-400 font-medium italic' : 'text-slate-850 dark:text-slate-105 font-bold'}`}>
                    {did.assignedTenant}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{did.activationDate}</td>
                <td className="px-6 py-4">
                  <TelephonyStatusBadge status={did.status} />
                </td>
                <td className="px-6 py-4">
                  <TelephonyStatusBadge status={did.assignmentState === 'available' ? 'available' : did.assignmentState === 'reserved' ? 'reserved' : 'assigned'} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(did)}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        did.status === 'inactive'
                          ? 'text-slate-455 hover:text-emerald-650 hover:bg-emerald-50 dark:hover:bg-emerald-955/20'
                          : 'text-emerald-500 hover:text-slate-455 hover:bg-slate-105 dark:hover:bg-slate-800'
                      }`}
                      title={did.status === 'inactive' ? (isRtl ? 'تفعيل الرقم' : 'Activate DID') : (isRtl ? 'تعطيل الرقم' : 'Deactivate DID')}
                    >
                      {did.status === 'inactive' ? (
                        <ToggleLeft className="w-4 h-4" />
                      ) : (
                        <ToggleRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Assign / Unassign */}
                    {did.assignmentState === 'assigned' ? (
                      <button
                        onClick={() => handleUnassignClick(did)}
                        className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 text-rose-500 rounded cursor-pointer transition-colors"
                        title={isRtl ? 'إلغاء التعيين' : 'Unassign Tenant'}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignClick(did)}
                        disabled={did.status === 'inactive'}
                        className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 text-blue-500 disabled:text-slate-300 disabled:hover:bg-transparent rounded cursor-pointer transition-colors"
                        title={isRtl ? 'تعيين لمستأجر' : 'Assign Tenant'}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Reserve / Release Reservation */}
                    {did.assignmentState === 'reserved' ? (
                      <button
                        onClick={() => handleReleaseReservation(did)}
                        className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 text-amber-605 rounded cursor-pointer transition-colors"
                        title={isRtl ? 'فك الحجز' : 'Release Reservation'}
                      >
                        <BookmarkX className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      did.assignmentState === 'available' && (
                        <button
                          onClick={() => handleReserveClick(did)}
                          disabled={did.status === 'inactive'}
                          className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 text-amber-500 disabled:text-slate-300 disabled:hover:bg-transparent rounded cursor-pointer transition-colors"
                          title={isRtl ? 'حجز الرقم' : 'Reserve DID'}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handleEditClick(did)}
                      className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 text-blue-650 rounded cursor-pointer transition-colors"
                      title={isRtl ? 'تعديل البيانات' : 'Edit Metadata'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(did.id)}
                      className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 text-rose-600 rounded cursor-pointer transition-colors"
                      title={isRtl ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </EnterpriseTable>
        </>
      )}

      {/* Register / Edit Modal */}
      <ModalWrapper
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingNumber ? (isRtl ? 'تعديل بيانات رقم DID' : 'Edit DID Metadata') : (isRtl ? 'إضافة رقم DID جديد' : 'Register DID Number')}
      >
        <form onSubmit={handleSaveDid} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
              {isRtl ? 'رقم الهاتف (بتنسيق دولي)' : 'DID Phone Number (International Format)'}
            </label>
            <input
              type="text"
              required
              value={newDid.phoneNumber}
              onChange={(e) => setNewDid({ ...newDid, phoneNumber: e.target.value })}
              placeholder="+966 92000 0000"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'البلد / المنطقة' : 'Country/Region'}
              </label>
              <input
                type="text"
                required
                value={newDid.countryRegion}
                onChange={(e) => setNewDid({ ...newDid, countryRegion: e.target.value })}
                placeholder="e.g. Saudi Arabia"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-855 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'موفر شبكة الاتصال' : 'Carrier Network Provider'}
              </label>
              <select
                value={newDid.provider}
                onChange={(e) => setNewDid({ ...newDid, provider: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
              >
                <option value="STC Voice Gateway">STC Voice Gateway</option>
                <option value="Mobily Business Line">Mobily Business Line</option>
                <option value="Du Enterprise Route">Du Enterprise Route</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
              {isRtl ? 'المستأجر المعين' : 'Assign to Client Tenant'}
            </label>
            <input
              type="text"
              required
              value={newDid.assignedTenant}
              onChange={(e) => setNewDid({ ...newDid, assignedTenant: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'الحالة' : 'Status'}
              </label>
              <select
                value={newDid.status}
                onChange={(e) => setNewDid({ ...newDid, status: e.target.value as DidStatus })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'حالة التعيين' : 'Assignment State'}
              </label>
              <select
                value={newDid.assignmentState}
                onChange={(e) => setNewDid({ ...newDid, assignmentState: e.target.value as DidAssignmentState })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
              >
                <option value="available">Available (Unassigned)</option>
                <option value="assigned">Assigned</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer font-semibold"
            >
              {editingNumber ? (isRtl ? 'حفظ التغييرات' : 'Save Changes') : (isRtl ? 'إضافة الرقم' : 'Register DID')}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* Tenant Assignment Modal */}
      <ModalWrapper
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={isRtl ? 'تعيين رقم DID لمستأجر' : 'Assign DID Number to Tenant'}
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold mb-2">
              {isRtl ? `تعيين رقم الهاتف: ${assigningDid?.phoneNumber}` : `Assigning phone number: ${assigningDid?.phoneNumber}`}
            </p>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
              {isRtl ? 'اسم المستأجر' : 'Tenant Name'}
            </label>
            <input
              type="text"
              required
              value={assignTenantName}
              onChange={(e) => setAssignTenantName(e.target.value)}
              placeholder={isRtl ? 'مثال: شركة الراجحي للتجزئة' : 'e.g. Al-Rajhi Retail'}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer font-semibold"
            >
              {isRtl ? 'تأكيد التعيين' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* Tenant Reservation Modal */}
      <ModalWrapper
        isOpen={showReserveModal}
        onClose={() => setShowReserveModal(false)}
        title={isRtl ? 'حجز رقم DID لعميل' : 'Reserve DID Number for Customer'}
      >
        <form onSubmit={handleSaveReservation} className="space-y-4">
          <div>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold mb-2">
              {isRtl ? `حجز رقم الهاتف: ${reservingDid?.phoneNumber}` : `Reserving phone number: ${reservingDid?.phoneNumber}`}
            </p>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
              {isRtl ? 'اسم الجهة الحاجزة' : 'Customer Name for Reservation'}
            </label>
            <input
              type="text"
              required
              value={reserveTenantName}
              onChange={(e) => setReserveTenantName(e.target.value)}
              placeholder={isRtl ? 'مثال: بنك الخليج الرقمي' : 'e.g. Gulf Digital Bank'}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReserveModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer font-semibold"
            >
              {isRtl ? 'حجز الرقم' : 'Reserve DID'}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
