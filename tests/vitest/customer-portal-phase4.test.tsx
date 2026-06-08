import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { NotificationCard } from '@/components/customer-portal/notifications/NotificationCard';
import { NotificationPreferences } from '@/components/customer-portal/notifications/NotificationPreferences';
import { ProfileEditor } from '@/components/customer-portal/settings/ProfileEditor';
import { AppearanceSettings } from '@/components/customer-portal/settings/AppearanceSettings';
import { AccessibilitySettings } from '@/components/customer-portal/settings/AccessibilitySettings';
import { FavoritesManager } from '@/components/customer-portal/personalization/FavoritesManager';
import { RecentActivityFeed } from '@/components/customer-portal/personalization/RecentActivityFeed';
import { SavedSearches } from '@/components/customer-portal/personalization/SavedSearches';
import { SystemAlert } from '@/stores/notifications/notificationTypes';

// ----------------------------------------------------------------------
// Mock setup
// ----------------------------------------------------------------------
const MOCK_ALERT: SystemAlert = {
  id: 'alert-1',
  timestamp: '2026-06-08 10:00:00',
  lastOccurred: '2026-06-08 10:00:00',
  category: 'sla',
  source: 'SLA',
  severity: 'critical',
  alertCode: 'SLA_BREACH',
  sourceEntity: 'Billing Queue',
  title: 'Billing SLA Warning',
  message: 'Billing queue response exceeded threshold limit.',
  read: false,
  pinned: false,
  lifecycleState: 'active',
  dismissed: false,
  count: 1,
  metadata: {
    queueName: 'Billing Queue',
    waitTime: '18m 42s'
  }
};

describe('NotificationCard Component', () => {
  it('renders alert details and metadata properly', () => {
    const onAck = vi.fn();
    const onPin = vi.fn();
    const onSnooze = vi.fn();
    const onDel = vi.fn();

    render(
      <NotificationCard
        alert={MOCK_ALERT}
        onAcknowledge={onAck}
        onTogglePin={onPin}
        onSnooze={onSnooze}
        onDelete={onDel}
      />
    );

    expect(screen.getByText('Billing SLA Warning')).toBeInTheDocument();
    expect(screen.getByText('Billing queue response exceeded threshold limit.')).toBeInTheDocument();
    
    // Toggle details button should exist
    const expandBtn = screen.getByLabelText(/Toggle details/i);
    expect(expandBtn).toBeInTheDocument();
  });

  it('triggers callback when acknowledge action is clicked', () => {
    const onAck = vi.fn();
    render(
      <NotificationCard
        alert={MOCK_ALERT}
        onAcknowledge={onAck}
        onTogglePin={vi.fn()}
        onSnooze={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const ackBtn = screen.getByLabelText(/Mark as read/i);
    fireEvent.click(ackBtn);
    expect(onAck).toHaveBeenCalledWith('alert-1');
  });

  it('expands metadata parameters when Chevron is clicked', () => {
    render(
      <NotificationCard
        alert={MOCK_ALERT}
        onAcknowledge={vi.fn()}
        onTogglePin={vi.fn()}
        onSnooze={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const expandBtn = screen.getByLabelText(/Toggle details/i);
    fireEvent.click(expandBtn);
    expect(screen.getByText('Billing Queue')).toBeInTheDocument();
    expect(screen.getByText('18m 42s')).toBeInTheDocument();
  });
});

describe('NotificationPreferences Component', () => {
  it('renders all notification channel switch options', () => {
    render(<NotificationPreferences />);
    expect(screen.getByText('Email Alerts')).toBeInTheDocument();
    expect(screen.getByText('SMS Broadcasts')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('In-App Overlays')).toBeInTheDocument();
  });

  it('renders Quiet Hours / DND configuration panel', () => {
    render(<NotificationPreferences />);
    expect(screen.getByText('Scheduled Quiet Hours (DND)')).toBeInTheDocument();
  });
});

describe('ProfileEditor Component', () => {
  it('renders input fields for user profile details', () => {
    render(<ProfileEditor />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Corporate Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });
});

describe('AppearanceSettings Component', () => {
  it('renders theme selections and accent options', () => {
    render(<AppearanceSettings />);
    expect(screen.getByText('Interface Theme Mode')).toBeInTheDocument();
    expect(screen.getByText('Display Density')).toBeInTheDocument();
    expect(screen.getByText('Typography Scale')).toBeInTheDocument();
  });
});

describe('AccessibilitySettings Component', () => {
  it('renders accessible switches and guide controls', () => {
    render(<AccessibilitySettings />);
    expect(screen.getByText('High Contrast Borders & Text')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcut Hints')).toBeInTheDocument();
    expect(screen.getByText('Screen Reader Optimizations')).toBeInTheDocument();
  });
});

describe('FavoritesManager Component', () => {
  it('renders favorite item list from storage', () => {
    render(<FavoritesManager onSelectArticle={vi.fn()} />);
    // Check seed items show up
    expect(screen.getByText('How to Request a SaaS Subscription Refund')).toBeInTheDocument();
    expect(screen.getByText('Resetting Locked Civil Registry Logins')).toBeInTheDocument();
  });
});

describe('RecentActivityFeed Component', () => {
  it('renders timeline grouping items', () => {
    render(<RecentActivityFeed />);
    expect(screen.getByText('Recent Activity Feed')).toBeInTheDocument();
  });
});

describe('SavedSearches Component', () => {
  it('renders saved search parameter chips', () => {
    const onSearch = vi.fn();
    render(<SavedSearches onRunSearch={onSearch} />);
    expect(screen.getByText('refund ORD-99881')).toBeInTheDocument();
    expect(screen.getByText('Stripe 403 Forbidden scopes')).toBeInTheDocument();
  });
});
