'use client';

import React from 'react';
import { Ticket } from '@/types';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface TicketListProps {
  tickets: Ticket[];
  setSelectedTicketId: (id: string | null) => void;
  setActiveSubScreen: (sub: string) => void;
}

export function TicketList({
  tickets,
  setSelectedTicketId,
  setActiveSubScreen
}: TicketListProps) {
  const { lang } = useApp();
  const t = translations[lang];

  const customerTickets = tickets.filter((t) => t.customerEmail === 'david.miller@yahoo.com');

  const getPriorityLabel = (priority: string) => {
    if (priority === 'low') return t.portal.tickets.priorityLow;
    if (priority === 'medium') return t.portal.tickets.priorityMedium;
    if (priority === 'high') return t.portal.tickets.priorityHigh;
    if (priority === 'urgent') return t.portal.tickets.priorityUrgent;
    return priority;
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'Billing & Payments') return t.portal.tickets.categoryBilling;
    if (category === 'User Authentication') return t.portal.tickets.categoryAuth;
    if (category === 'API Integrations') return t.portal.tickets.categoryApi;
    if (category === 'Shipments & Delivery') return t.portal.tickets.categoryShipment;
    return category;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'open') return lang === 'ar' ? 'مفتوح' : 'OPEN';
    if (status === 'solved') return t.portal.tickets.solved;
    return status.toUpperCase();
  };

  const headers = [
    { key: 'id', label: t.portal.tickets.tableTicketId },
    { key: 'title', label: t.portal.tickets.tableSubject },
    { key: 'category', label: t.portal.tickets.tableCategory },
    { key: 'priority', label: t.portal.tickets.tablePriority },
    { key: 'status', label: t.portal.tickets.tableStatus },
    { key: 'action', label: t.portal.tickets.tableAction }
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div>
        <h2 className="text-xl font-bold">{t.portal.tickets.listTitle}</h2>
        <p className="text-xs text-slate-400">{t.portal.tickets.listSubtitle}</p>
      </div>

      <EnterpriseTable
        headers={headers}
        empty={customerTickets.length === 0}
        emptyTitle={t.portal.tickets.noTickets}
        emptyDesc={t.portal.tickets.noTicketsDesc}
      >
        {customerTickets.map((tkt) => (
          <tr key={tkt.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40 text-slate-700 dark:text-slate-350">
            <td className="px-6 py-4 font-bold font-mono text-slate-900 dark:text-white">{tkt.id}</td>
            <td className="px-6 py-4 font-medium max-w-[200px] truncate">{tkt.title}</td>
            <td className="px-6 py-4 font-semibold text-slate-450">{getCategoryLabel(tkt.category)}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                tkt.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {getPriorityLabel(tkt.priority).toUpperCase()}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                tkt.status === 'open'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {getStatusLabel(tkt.status)}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setSelectedTicketId(tkt.id);
                  setActiveSubScreen('customer_ticket_detail');
                }}
                className="text-blue-500 font-bold hover:underline"
              >
                {t.portal.tickets.openThread}
              </button>
            </td>
          </tr>
        ))}
      </EnterpriseTable>
    </div>
  );
}
