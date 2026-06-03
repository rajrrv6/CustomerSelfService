export type ConnectorType = 'notion' | 'confluence' | 'google_drive' | 'sharepoint' | 'website_crawl' | 'file_upload';
export type ConnectorStatus = 'active' | 'pending' | 'error' | 'disabled';
export type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';

export interface KnowledgeConnector {
  id: string;
  name: string;
  type: ConnectorType;
  status: ConnectorStatus;
  lastSync: string;
  owner: string;
  endpointUrl?: string;
  description?: string;
  syncFrequency: SyncFrequency;
}
