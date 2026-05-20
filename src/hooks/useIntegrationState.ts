import { useState, useCallback } from 'react';
import { initialConnectors, CRMConnector, ConnectorMapping } from '../data/seed/crmConnectorsSeed';
import { initialConflicts, SyncConflict } from '../data/seed/syncConflictSeed';
import { auditTrailSeed } from '../data/seed/integrationHealthSeed';
import { useApp } from '@/context/AppContext';

export interface ApiCredential {
  id: string;
  name: string;
  keyMasked: string;
  keyFull: string; // for copy mock
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

export interface RetryQueueItem {
  id: string;
  connectorId: string;
  connectorName: string;
  entityType: 'contact' | 'order' | 'billing';
  recordName: string;
  errorMessage: string;
  failedAt: string;
  retryCount: number;
  maxRetries: number;
  status: 'failed' | 'retrying' | 'succeeded';
}

export function useIntegrationState() {
  const { addAuditLog } = useApp();
  
  const [connectors, setConnectors] = useState<CRMConnector[]>(initialConnectors);
  const [conflicts, setConflicts] = useState<SyncConflict[]>(initialConflicts);
  
  const [apiCredentials, setApiCredentials] = useState<ApiCredential[]>([
    {
      id: 'cred-1',
      name: 'Agent Console Production Key',
      keyMasked: 'mp_live_••••••••••••••••W8a9',
      keyFull: 'mp_live_d81hsa8912hjas192831hja19W8a9',
      scopes: ['customer.read', 'tickets.write', 'dialog.read'],
      createdAt: '2026-05-15 08:30:00',
      lastUsed: '2026-05-20 17:40:00',
      status: 'active'
    },
    {
      id: 'cred-2',
      name: 'External ERP Sync Token',
      keyMasked: 'mp_live_••••••••••••••••59Aj',
      keyFull: 'mp_live_ah99120hasf9920199asfh1059Aj',
      scopes: ['customer.read', 'customer.write', 'orders.read'],
      createdAt: '2026-05-10 11:22:15',
      lastUsed: '2026-05-20 17:05:00',
      status: 'active'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState(auditTrailSeed);

  const [retryQueue, setRetryQueue] = useState<RetryQueueItem[]>([
    {
      id: 'ret-1',
      connectorId: 'stripe',
      connectorName: 'Stripe Billing Gate',
      entityType: 'billing',
      recordName: 'Michael Vance (Invoice in_1McaB3299Fhs)',
      errorMessage: 'Stripe API Connection Timeout (450ms limit exceeded)',
      failedAt: '2026-05-20 15:40:00',
      retryCount: 2,
      maxRetries: 5,
      status: 'failed'
    },
    {
      id: 'ret-2',
      connectorId: 'salesforce',
      connectorName: 'Salesforce CRM Cloud',
      entityType: 'contact',
      recordName: 'Sarah Jenkins-Connor',
      errorMessage: 'DUPLICATE_VALUE_FOUND: contact email already exists in target account.',
      failedAt: '2026-05-20 17:10:00',
      retryCount: 0,
      maxRetries: 3,
      status: 'failed'
    }
  ]);

  const pushAudit = useCallback((action: string, status: 'success' | 'failed') => {
    const newAudit = {
      id: `aud-int-${Date.now()}`,
      user: 'active.user@mpaas.com',
      role: 'CLIENT ADMIN',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      ipAddress: '192.168.10.150',
      status
    };
    setAuditLogs(prev => [newAudit, ...prev]);
    // Also push to the global app logs
    addAuditLog(action, status);
  }, [addAuditLog]);

  // Connect connector (OAuth Simulation)
  const connectConnector = useCallback((id: string, clientId: string, clientSecret: string, scopes: string[]) => {
    setConnectors(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'connected',
            clientId,
            clientSecret: '••••••••••••••••',
            scopes,
            connectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return c;
      })
    );
    const connName = connectors.find(c => c.id === id)?.name || id;
    pushAudit(`Connected to integration: ${connName} via simulated OAuth.`, 'success');
  }, [connectors, pushAudit]);

  // Disconnect connector
  const disconnectConnector = useCallback((id: string) => {
    setConnectors(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'disconnected',
            clientId: undefined,
            clientSecret: undefined,
            scopes: [],
            connectedAt: undefined
          };
        }
        return c;
      })
    );
    const connName = connectors.find(c => c.id === id)?.name || id;
    pushAudit(`Revoked connection credentials for integration: ${connName}.`, 'success');
  }, [connectors, pushAudit]);

  // Save new field mappings
  const saveMappings = useCallback((id: string, mappings: ConnectorMapping[]) => {
    setConnectors(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            mappings
          };
        }
        return c;
      })
    );
    const connName = connectors.find(c => c.id === id)?.name || id;
    pushAudit(`Updated field-mappings config for ${connName}. Mapped ${mappings.length} items.`, 'success');
  }, [connectors, pushAudit]);

  // Resolve DB Conflict
  const resolveConflict = useCallback((conflictId: string, resolvedData: { [key: string]: string }, winner: 'local' | 'external' | 'custom') => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    // Simulating writing to target connector retry list or adding success timeline event
    pushAudit(`Resolved database discrepancy for ${conflict.customerName}. Selected ${winner.toUpperCase()} field options.`, 'success');
  }, [conflicts, pushAudit]);

  // Generate client API keys
  const generateApiKey = useCallback((name: string, scopes: string[]) => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey: ApiCredential = {
      id: `cred-${Date.now()}`,
      name,
      keyMasked: `mp_live_••••••••••••••••${randomHex.substring(20)}`,
      keyFull: `mp_live_${randomHex}`,
      scopes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastUsed: 'Never',
      status: 'active'
    };

    setApiCredentials(prev => [newKey, ...prev]);
    pushAudit(`Generated API Credential Vault Key: "${name}" with ${scopes.length} scopes.`, 'success');
    return newKey.keyFull;
  }, [pushAudit]);

  // Revoke credentials
  const revokeApiKey = useCallback((id: string) => {
    setApiCredentials(prev =>
      prev.map(cred => {
        if (cred.id === id) {
          return { ...cred, status: 'revoked' };
        }
        return cred;
      })
    );
    const name = apiCredentials.find(c => c.id === id)?.name || id;
    pushAudit(`Revoked API Token "${name}" from Credential Vault.`, 'success');
  }, [apiCredentials, pushAudit]);

  // Rotate Key
  const rotateApiKey = useCallback((id: string) => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiCredentials(prev =>
      prev.map(cred => {
        if (cred.id === id) {
          return {
            ...cred,
            keyMasked: `mp_live_••••••••••••••••${randomHex.substring(20)}`,
            keyFull: `mp_live_${randomHex}`,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return cred;
      })
    );
    const name = apiCredentials.find(c => c.id === id)?.name || id;
    pushAudit(`Rotated API Token keys for "${name}".`, 'success');
  }, [apiCredentials, pushAudit]);

  // Handle Retrying Queue Sync
  const triggerRetry = useCallback((retryId: string) => {
    setRetryQueue(prev =>
      prev.map(item => {
        if (item.id === retryId) {
          return { ...item, status: 'retrying' };
        }
        return item;
      })
    );

    // Simulate response delay (1.5 seconds)
    setTimeout(() => {
      // 70% chance of success on manual retry trigger
      const succeeded = Math.random() > 0.3;
      
      setRetryQueue(prev =>
        prev.map(item => {
          if (item.id === retryId) {
            if (succeeded) {
              pushAudit(`Manual retry succeeded for ${item.recordName}. Database sync finalized.`, 'success');
              return {
                ...item,
                retryCount: item.retryCount + 1,
                status: 'succeeded'
              };
            } else {
              pushAudit(`Manual retry failed for ${item.recordName} under ${item.connectorName}.`, 'failed');
              return {
                ...item,
                retryCount: item.retryCount + 1,
                status: 'failed',
                errorMessage: 'Rate limits active. Connection pool exhausted, retrying in 300s.'
              };
            }
          }
          return item;
        })
      );
    }, 1500);
  }, [pushAudit]);

  return {
    connectors,
    connectConnector,
    disconnectConnector,
    saveMappings,
    conflicts,
    resolveConflict,
    apiCredentials,
    generateApiKey,
    revokeApiKey,
    rotateApiKey,
    auditLogs,
    retryQueue,
    triggerRetry
  };
}
