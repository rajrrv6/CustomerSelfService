import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, act } from '@/test-utils';
import { FeedbackToastProvider } from '@/components/customer-portal/feedback/PostChatToasts';
import { useUIStore } from '@/stores/uiStore';

let SuperAdminLayout: any;


// Mock useTabQueryState to use a standard useState hook to bypass Next.js router mocking limitations in tests
vi.mock('@/hooks/useTabQueryState', () => {
  return {
    useTabQueryState: (defaultTab: string, validTabs: string[], propActiveTab?: string) => {
      const [state, setState] = useState(propActiveTab && validTabs.includes(propActiveTab) ? propActiveTab : defaultTab);
      return [state, setState] as const;
    }
  };
});

import { BillingOverviewTab } from '@/components/super-admin/billing/BillingOverviewTab';
import { AuditOverviewTab } from '@/components/super-admin/audit/AuditOverviewTab';
import { NotificationsOverviewTab } from '@/components/super-admin/notifications/NotificationsOverviewTab';
import { SettingsOverviewTab } from '@/components/super-admin/settings/SettingsOverviewTab';
import { HelpCenterTab } from '@/components/super-admin/help/HelpCenterTab';
import { TenantManagementContainer } from '@/components/super-admin/tenant-management/TenantManagementContainer';
import { SystemOperationsContainer } from '@/components/super-admin/system-operations/SystemOperationsContainer';
import { VectorDbStatusTab } from '@/components/super-admin/vector-db/VectorDbStatusTab';
import { KnowledgeConnectorRegistry } from '@/components/super-admin/infrastructure/KnowledgeConnectorRegistry';

const lazyComponentsMap: Record<string, any> = {
  BillingOverviewTab,
  AuditOverviewTab,
  NotificationsOverviewTab,
  SettingsOverviewTab,
  HelpCenterTab,
  TenantManagementContainer,
  SystemOperationsContainer,
  VectorDbStatusTab,
  KnowledgeConnectorRegistry,
};

// Spy on React.lazy to return modules synchronously in tests
vi.spyOn(React, 'lazy').mockImplementation((importFn: any): any => {
  const fnStr = importFn.toString();
  const name = Object.keys(lazyComponentsMap).find(key => fnStr.includes(key));
  
  if (name) {
    const Component = lazyComponentsMap[name];
    return function SyncLazy(props: any) {
      return <Component {...props} />;
    };
  }
  
  return function FallbackLazy() {
    return <div>Module not found in map</div>;
  };
});

describe('Super Admin Subsystem QA Tests', () => {
  beforeAll(async () => {
    const mod = await import('@/components/super-admin/shared/SuperAdminLayout');
    SuperAdminLayout = mod.SuperAdminLayout;
  }, 60000);

  const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
  const revokeObjectURLMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    useUIStore.getState().setLang('en');
    vi.useFakeTimers();
    
    // Stub global URL methods for download tests
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();
  });

  // 1. Render layout selection
  it('renders SuperAdminLayout with dashboard overview stats', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_dashboard" />
        </FeedbackToastProvider>
      );
    });

    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('LLM Models')).toBeInTheDocument();
    expect(screen.getByText('Speech Engines')).toBeInTheDocument();
    expect(screen.getByText('SIP Trunks')).toBeInTheDocument();
    expect(screen.getByText('Vector DB Clusters')).toBeInTheDocument();
  });

  // 2. SIP Dialer Diagnostics Test Dialing Simulator
  it('runs SIP dialing test diagnostics logging step-by-step', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_dashboard" />
        </FeedbackToastProvider>
      );
    });

    // Open diagnostics modal
    const testDialBtn = screen.getByText('SIP Dial Test');
    await act(async () => {
      fireEvent.click(testDialBtn);
    });

    expect(screen.getByText('SIP Telephony Path Diagnostics')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('e.g. +966500000000');
    await act(async () => {
      fireEvent.change(input, { target: { value: '+966512345678' } });
    });

    const runBtn = screen.getByRole('button', { name: /Run Test/i });
    await act(async () => {
      fireEvent.click(runBtn);
    });

    // Advance timer slightly past 600ms (650ms) to ensure interval fires and logs first event
    act(() => {
      vi.advanceTimersByTime(650);
    });

    // Initial log text
    expect(screen.getByText('SIP INVITE sent to telephony gateway address...')).toBeInTheDocument();

    // Advance timer step-by-step for the remaining 5 logs
    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(650);
      });
    }

    // Verify all diagnostic steps logged successfully
    expect(screen.getByText('Call terminated. Verified Voice quality MOS: 4.4 (Excellent).')).toBeInTheDocument();
  });

  // 3. RAG Knowledge Connectors Sync transitions
  it('runs RAG connector synchronization transitions and shows toasts', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_infra" />
        </FeedbackToastProvider>
      );
    });

    // Click the Knowledge Connectors tab button to toggle the sub-tab
    const tabButton = screen.getByRole('button', { name: /Knowledge Connectors/i });
    await act(async () => {
      fireEvent.click(tabButton);
    });

    // Verify the KnowledgeConnectorRegistry content is rendered
    const connectorsHeader = screen.getByText(/Active Connection Registry/i);
    expect(connectorsHeader).toBeInTheDocument();

    // Click Sync button on first connector (Confluence Product Manuals)
    const syncButtons = screen.getAllByTitle(/Sync Now/i);
    await act(async () => {
      fireEvent.click(syncButtons[0]);
    });

    // Advance timer slightly to flush the 0ms timeout for Handshaking...
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Check handshaking state
    expect(screen.getByText('Handshaking...')).toBeInTheDocument();

    // Ingesting page step (at 1600ms)
    act(() => {
      vi.advanceTimersByTime(1650);
    });
    expect(screen.getByText('Ingesting page 15 of 60...')).toBeInTheDocument();

    // Advance past completion (3200ms)
    act(() => {
      vi.advanceTimersByTime(1650);
    });

    // Connector synchronizing state disappears
    expect(screen.queryByText('Handshaking...')).not.toBeInTheDocument();
  });

  // 4. Vector Search Simulator & Caching Behavior
  it('bypasses loading states entirely on Vector Search Simulator cache hits', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_infra" />
        </FeedbackToastProvider>
      );
    });

    // Search simulator inputs
    const queryInput = screen.getByPlaceholderText(/Enter query phrase.../i);
    const namespaceSelect = screen.getByRole('combobox');
    const searchBtn = screen.getByRole('button', { name: /Query Index/i });

    // 1st search - Cache Miss
    fireEvent.change(queryInput, { target: { value: 'refund guidelines' } });
    fireEvent.change(namespaceSelect, { target: { value: 'kb-billing-docs' } });
    fireEvent.click(searchBtn);

    // Expect loading spinner/searching status to be active on the button
    expect(searchBtn).toBeDisabled();

    // Advance timer past delay of 600ms to resolve search
    act(() => {
      vi.advanceTimersByTime(650);
    });

    // Render results
    expect(screen.getByText(/Refund operations policy dictates that payments for/i)).toBeInTheDocument();

    // 2nd search - Cache Hit
    // Change query and change it back to trigger hit
    fireEvent.change(queryInput, { target: { value: 'something else' } });
    fireEvent.click(searchBtn);

    // Miss loading state active
    expect(searchBtn).toBeDisabled();
    
    // Resolve second search
    act(() => {
      vi.advanceTimersByTime(650);
    });

    // Clear queries
    fireEvent.change(queryInput, { target: { value: 'refund guidelines' } });
    // Click query index again (Cache hit)
    fireEvent.click(searchBtn);

    // With a cache hit, it should render immediately. No loading state should be triggered!
    expect(screen.getByRole('button', { name: /Query Index/i })).not.toBeDisabled();
    expect(screen.getByText('CACHED HIT')).toBeInTheDocument();
    expect(screen.getByText(/Refund operations policy dictates that payments for/i)).toBeInTheDocument();
  });

  // 5. Multi-Tenant Billing Analytics MRR Cards and Suspend/Resume
  it('displays MRR statistics and handles suspend/resume billing workflows', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_billing" />
        </FeedbackToastProvider>
      );
    });

    // MRR KPI card checks
    expect(screen.getByText('Monthly Revenue (MRR)')).toBeInTheDocument();
    expect(screen.getByText('$2297')).toBeInTheDocument(); // MRR value from mock billing data (999 STC + 299 Al-Rajhi + 999 Emirates = 2297)

    // Tab switcher to tenants accounts
    const tenantsTab = screen.getByText('Tenant Billing Accounts');
    fireEvent.click(tenantsTab);

    // Verify tenant billing listing
    expect(screen.getByText(/Al-Rajhi Retail/i)).toBeInTheDocument();

    // Suspend Billing trigger
    const suspendButtons = screen.getAllByTitle('Suspend Billing');
    fireEvent.click(suspendButtons[0]);

    // Status shifts to suspended
    expect(screen.getAllByText('Suspended').length).toBeGreaterThan(0);

    // Resume billing trigger
    const resumeButtons = screen.getAllByTitle('Resume Billing');
    fireEvent.click(resumeButtons[0]);

    // Status shifts back to active
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
  });

  // 6. Analytics Export & Immediate Blob URL Revocation
  it('downloads CSV/JSON reports and immediately revokes Blob URLs', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_analytics" />
        </FeedbackToastProvider>
      );
    });

    const exportBtn = screen.getByRole('button', { name: /Export Reports/i });
    fireEvent.click(exportBtn);

    expect(screen.getByText('Export System Analytics Reports')).toBeInTheDocument();

    // Select format and download
    const csvFormat = screen.getByText('CSV Form');
    fireEvent.click(csvFormat);

    const downloadBtn = screen.getByRole('button', { name: /Export & Download/i });
    fireEvent.click(downloadBtn);

    // Advance compilation timer (requires 6 ticks of 200ms to evaluate p >= 100)
    act(() => {
      vi.advanceTimersByTime(200 * 6);
    });

    // Download triggered
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });

  // 7. SIEM push audit logs telemetry synchronization
  it('performs SIEM telemetry sync simulation', async () => {
    await act(async () => {
      render(
        <FeedbackToastProvider>
          <SuperAdminLayout activeSubScreen="sa_audit" />
        </FeedbackToastProvider>
      );
    });

    const siemBtn = screen.getByText('SIEM Ingestion HUD');
    fireEvent.click(siemBtn);

    expect(screen.getByText('SIEM Ingestion Sync Console')).toBeInTheDocument();

    const startPushBtn = screen.getByRole('button', { name: /Start SIEM Push/i });
    fireEvent.click(startPushBtn);

    // Verify loading state
    expect(screen.getByText('Forwarding Telemetry Logs to SIEM...')).toBeInTheDocument();

    // Progress increments (requires 6 ticks of 250ms to evaluate p >= 100)
    act(() => {
      vi.advanceTimersByTime(250 * 6);
    });

    // Ingestion succeeds
    expect(screen.getByText('SIEM Ingestion Success')).toBeInTheDocument();
    expect(screen.getByText('[SUCCESS] Ingestion completed. 200 OK response from SIEM gateway.')).toBeInTheDocument();
  });
});
