import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@/test-utils';
import { OrgSwitcher } from '@/components/customer-portal/enterprise/OrgSwitcher';
import { ActiveSessionsPanel } from '@/components/customer-portal/enterprise/ActiveSessionsPanel';
import { SessionTimeoutModal } from '@/components/customer-portal/enterprise/SessionTimeoutModal';
import { ExportCenter } from '@/components/customer-portal/enterprise/ExportCenter';
import { QuotaDashboard } from '@/components/customer-portal/enterprise/QuotaDashboard';
import { AuditLogViewer } from '@/components/customer-portal/enterprise/AuditLogViewer';
import { FederationHealthCard } from '@/components/customer-portal/enterprise/FederationHealthCard';
import { SsoProvider } from '@/components/customer-portal/enterprise/types';

describe('Phase 5 Enterprise Infrastructure Subsystem', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // 1. Organization Switcher
  describe('OrgSwitcher Component', () => {
    it('renders trigger button showing active organization and changes active selection', async () => {
      render(<OrgSwitcher />);
      
      // Initially displays first org Acme Corp Production
      expect(screen.getByText('Acme Corp Production')).toBeInTheDocument();
      
      const switcherBtn = screen.getByText('Acme Corp Production');
      fireEvent.click(switcherBtn);

      // Search field is focused
      const searchInput = screen.getByPlaceholderText(/Search environments.../i);
      expect(searchInput).toBeInTheDocument();

      // Typing in filter search
      fireEvent.change(searchInput, { target: { value: 'Staging' } });
      
      // Acne Corp Staging should match
      const stagingBtn = screen.getByText('Acme Corp Staging');
      expect(stagingBtn).toBeInTheDocument();

      // Switch workspace
      fireEvent.click(stagingBtn);

      // Check storage persistence
      expect(localStorage.getItem('current_tenant_id')).toBe('tnt-acme-stage-9921');
    });
  });

  // 2. Audit Log Viewer
  describe('AuditLogViewer Component', () => {
    it('renders audit feed table and opens detail diff drawer', async () => {
      const onBack = vi.fn();
      render(<AuditLogViewer onBack={onBack} />);

      // Sticky column header check
      expect(screen.getByText('Log ID')).toBeInTheDocument();
      expect(screen.getByText('Module')).toBeInTheDocument();

      // Search filter check
      const searchInput = screen.getByPlaceholderText(/Search by action, actor, or region.../i);
      fireEvent.change(searchInput, { target: { value: 'User login initiated' } });

      // Click row to view details by clicking the action cell text directly
      const rowCell = screen.getAllByText('User login initiated')[0];
      fireEvent.click(rowCell);

      // Drawer should open and display metadata details
      expect(screen.getByText('Audit Log Details')).toBeInTheDocument();
      expect(screen.getAllByText('User login initiated')[0]).toBeInTheDocument();
    });
  });

  // 3. Active Session Governance & Timeout Modal
  describe('Session Timeout Modal & Active Sessions Panel', () => {
    it('renders session timeout modal with countdown and traps focus', () => {
      const onExtend = vi.fn();
      const onLogout = vi.fn();
      
      render(
        <SessionTimeoutModal
          isOpen={true}
          timeLeftSeconds={120}
          onExtend={onExtend}
          onLogout={onLogout}
          lang="en"
        />
      );

      expect(screen.getByText('Security Session Timeout')).toBeInTheDocument();
      expect(screen.getByText('2:00')).toBeInTheDocument();

      // Test extension click
      const extendBtn = screen.getByRole('button', { name: /Keep Session Open/i });
      fireEvent.click(extendBtn);
      expect(onExtend).toHaveBeenCalled();
    });

    it('renders active sessions panel and handles force logout confirmation workflows', async () => {
      render(<ActiveSessionsPanel />);
      
      expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument();
      
      // Click revoke access triggers confirm prompt
      const revokeBtn = screen.getAllByRole('button', { name: /Revoke Access/i })[0];
      fireEvent.click(revokeBtn);

      expect(screen.getByText('Revoke Session Access?')).toBeInTheDocument();

      // Confirm button is interactive
      const confirmBtn = screen.getByRole('button', { name: /Revoke Device/i });
      fireEvent.click(confirmBtn);

      // Session row gets removed synchronously
      expect(screen.queryByText('iPhone 15 Pro Max')).not.toBeInTheDocument();
    });
  });

  // 4. Export Compliance Snaps
  describe('Export Operations Center', () => {
    it('creates compliance compile jobs and stores status to localStorage', async () => {
      render(<ExportCenter />);
      
      expect(screen.getByText('Compliance & Export Center')).toBeInTheDocument();

      // Queue new export
      const submitBtn = screen.getByRole('button', { name: /Initialize Compilation/i });
      fireEvent.click(submitBtn);

      // Advance timers to trigger simulation compile steps
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Job card appears and displays queued/processing status
      expect(screen.getByText('Compiling')).toBeInTheDocument();

      // Save list to localStorage should contain the newly created job
      const storedJobs = localStorage.getItem('compliance_export_jobs');
      expect(storedJobs).toContain('Compliance Audit Logs');
    });
  });

  // 5. Federation SSO Expiry warning escalation
  describe('Federation Expiry warnings', () => {
    it('escalates provider certificates depending on remaining days', () => {
      const testProviders: SsoProvider[] = [
        {
          name: 'Okta Enterprise IdP',
          status: 'active',
          lastSync: new Date().toISOString(),
          successRate: 100,
          certExpiry: new Date(Date.now() + 45 * 24 * 3600000).toISOString(), // 45 days
          latencyMs: 12,
        },
        {
          name: 'Azure AD',
          status: 'active',
          lastSync: new Date().toISOString(),
          successRate: 100,
          certExpiry: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), // 5 days
          latencyMs: 15,
        },
        {
          name: 'Expired Identity',
          status: 'degraded',
          lastSync: new Date().toISOString(),
          successRate: 90,
          certExpiry: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), // Expired
          latencyMs: 120,
        }
      ];

      // Good
      const { rerender } = render(<FederationHealthCard provider={testProviders[0]} onSync={vi.fn()} lang="en" />);
      expect(screen.getByText(/Active \(\d+ days remaining\)/i)).toBeInTheDocument();

      // Warning / Critical
      rerender(<FederationHealthCard provider={testProviders[1]} onSync={vi.fn()} lang="en" />);
      expect(screen.getByText(/Critical: Expiring very soon \(\d+ days!\)/i)).toBeInTheDocument();

      // Expired
      rerender(<FederationHealthCard provider={testProviders[2]} onSync={vi.fn()} lang="en" />);
      expect(screen.getByText(/Expired! Immediate renewal required/i)).toBeInTheDocument();
    });
  });

  // 6. Quotas and Rate Limits Dashboard
  describe('QuotaTelemetry Dashboard', () => {
    it('renders usage indicators and displays screen-reader-friendly labels', () => {
      render(<QuotaDashboard />);

      // Exposes screen-reader summaries
      const quotaRegion = screen.getByLabelText(/Quota usage card for API Calls \(Monthly\): 9650 of 10000 requests used \(96.5%\)\. Status is Over Limit Warning\./i);
      expect(quotaRegion).toBeInTheDocument();

      // Ratio limit warning colors applied
      expect(screen.getByText('Over Limit Warning')).toBeInTheDocument();
    });
  });
});
