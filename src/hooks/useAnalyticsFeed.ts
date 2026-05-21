import { useState, useEffect } from 'react';

export interface FeedEvent {
  id: string;
  timestamp: string;
  category: 'bot' | 'voice' | 'ticket' | 'integration' | 'system';
  message: string;
  details?: string;
}

const initialEvents: FeedEvent[] = [
  {
    id: 'f-1',
    timestamp: '1 min ago',
    category: 'bot',
    message: 'Farah AI deflected refund request.',
    details: 'Ticket matched Pinecone article ID 42a-RAG.'
  },
  {
    id: 'f-2',
    timestamp: '2 mins ago',
    category: 'integration',
    message: 'SAP Invoice sync complete for customer.',
    details: 'Synced invoice #89280 via API Credential Vault.'
  },
  {
    id: 'f-3',
    timestamp: '4 mins ago',
    category: 'voice',
    message: 'Outbound hotline voice call connected.',
    details: 'Agent Amina Mansoor answering destination +966-50...'
  },
  {
    id: 'f-4',
    timestamp: '8 mins ago',
    category: 'ticket',
    message: 'New support ticket escalated to Tier-2.',
    details: 'Priority SLA rule HIGH triggered. Assigned to Sanjay Kumar.'
  }
];

const mockEventPool: Omit<FeedEvent, 'id' | 'timestamp'>[] = [
  {
    category: 'bot',
    message: 'Farah AI resolved shipping address mismatch.',
    details: 'NLU Intent "modify_shipping" matched confidence 0.98.'
  },
  {
    category: 'integration',
    message: 'Salesforce Lead Sync successfully executed.',
    details: 'Batched 12 customer records from unified inbox.'
  },
  {
    category: 'system',
    message: 'Co-Browse session token created.',
    details: 'PIN generated for Portal Session auth.'
  },
  {
    category: 'voice',
    message: 'Call placed on hold by Agent Sanjay Kumar.',
    details: 'Hold timer started. Streaming corporate hold music.'
  },
  {
    category: 'bot',
    message: 'Farah AI triggered human handoff.',
    details: 'CSAT sentiment dropped below threshold (Confidence 0.42).'
  },
  {
    category: 'ticket',
    message: 'Ticket #4920 resolved by Agent Amina Mansoor.',
    details: 'Resolution Code: REFUND_PROCESSED. SLA met.'
  },
  {
    category: 'system',
    message: 'Guardrails safety moderation review flag.',
    details: 'Customer query triggered standard moderation check: PASSED.'
  }
];

export function useAnalyticsFeed() {
  const [feed, setFeed] = useState<FeedEvent[]>(initialEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomPoolIndex = Math.floor(Math.random() * mockEventPool.length);
      const chosenTemplate = mockEventPool[randomPoolIndex];
      
      const newEvent: FeedEvent = {
        ...chosenTemplate,
        id: `feed-ev-${Date.now()}`,
        timestamp: 'Just now'
      };

      setFeed((prevFeed) => {
        // Adjust the timestamp strings of previous events
        const updatedFeed = prevFeed.map((ev, index) => {
          if (ev.timestamp === 'Just now') {
            return { ...ev, timestamp: '1 min ago' };
          }
          if (ev.timestamp.includes('min ago')) {
            const mins = parseInt(ev.timestamp) + 1;
            return { ...ev, timestamp: `${mins} mins ago` };
          }
          return ev;
        });

        // Insert new event at index 0 and slice to keep top 10 events
        return [newEvent, ...updatedFeed.slice(0, 8)];
      });

    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return { feed };
}
