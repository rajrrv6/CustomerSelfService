import { KnowledgeConnector } from '@/types/knowledgeConnector';

export const mockKnowledgeConnectors: KnowledgeConnector[] = [
  {
    id: 'conn-1',
    name: 'Company Wiki & Policies',
    type: 'confluence',
    status: 'active',
    lastSync: '2026-06-03 14:30',
    owner: 'admin@mpaas.com',
    endpointUrl: 'https://confluence.mpaas.com/wiki',
    description: 'Internal employee handbook, onboarding manuals, and remote work guidelines.',
    syncFrequency: 'daily'
  },
  {
    id: 'conn-2',
    name: 'Marketing Notion Space',
    type: 'notion',
    status: 'active',
    lastSync: '2026-06-03 16:15',
    owner: 'marketing-lead@mpaas.com',
    endpointUrl: 'https://notion.so/mpaas-marketing',
    description: 'Product brochures, marketing copy assets, and public launch documentation.',
    syncFrequency: 'hourly'
  },
  {
    id: 'conn-3',
    name: 'Public Website Documentation',
    type: 'website_crawl',
    status: 'pending',
    lastSync: 'Pending Initial Sync',
    owner: 'admin@mpaas.com',
    endpointUrl: 'https://docs.mpaas.com',
    description: 'Crawler targeting public product docs and API references.',
    syncFrequency: 'weekly'
  },
  {
    id: 'conn-4',
    name: 'HR Google Drive Shared Folder',
    type: 'google_drive',
    status: 'error',
    lastSync: '2026-06-02 09:00',
    owner: 'hr-manager@mpaas.com',
    endpointUrl: 'gdrive://shared-folders/hr-recruitment-2026',
    description: 'Candidate applications, CV documents, and compensation benefit charts.',
    syncFrequency: 'daily'
  },
  {
    id: 'conn-5',
    name: 'Legacy Product Manuals (PDF)',
    type: 'file_upload',
    status: 'disabled',
    lastSync: '2026-05-20 11:45',
    owner: 'support-ops@mpaas.com',
    endpointUrl: 'file://uploads/support-manual-v1.pdf',
    description: 'Uploaded offline user manuals for discontinued product lines.',
    syncFrequency: 'manual'
  },
  {
    id: 'conn-6',
    name: 'Enterprise IT SharePoint Portals',
    type: 'sharepoint',
    status: 'active',
    lastSync: '2026-06-03 12:00',
    owner: 'it-security@mpaas.com',
    endpointUrl: 'https://sharepoint.mpaas.com/sites/it-sec',
    description: 'Shared IT infrastructure blueprints, support guidelines, and security policies.',
    syncFrequency: 'daily'
  }
];
