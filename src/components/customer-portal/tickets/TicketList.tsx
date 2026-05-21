'use client';

import React from 'react';
import { Ticket } from '@/types';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';

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
  const customerTickets = tickets.filter((t) => t.customerEmail === 'david.miller@yahoo.com');

  const headers = [
    { key: 'id', label: 'Ticket ID' },
    { key: 'title', label: 'Subject' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div>
        <h2 className="text-xl font-bold">My Support Tickets</h2>
        <p className="text-xs text-slate-400">Track pending resolutions, assigned agents, and SLA deadlines.</p>
      </div>

      <EnterpriseTable
        headers={headers}
        empty={customerTickets.length === 0}
        emptyTitle="No Support Tickets"
        emptyDesc="You have not submitted any support tickets yet."
      >
        {customerTickets.map((tkt) => (
          <tr key={tkt.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40 text-slate-700 dark:text-slate-350">
            <td className="px-6 py-4 font-bold font-mono text-slate-900 dark:text-white">{tkt.id}</td>
            <td className="px-6 py-4 font-medium max-w-[200px] truncate">{tkt.title}</td>
            <td className="px-6 py-4 font-semibold text-slate-450">{tkt.category}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                tkt.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {tkt.priority.toUpperCase()}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                tkt.status === 'open'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {tkt.status.toUpperCase()}
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
                Open Thread
              </button>
            </td>
          </tr>
        ))}
      </EnterpriseTable>
    </div>
  );
}
