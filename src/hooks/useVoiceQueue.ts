import { useState, useEffect, useCallback } from 'react';
import { QueuedCall, voiceQueueSeed } from '@/data/seed/voiceQueueSeed';

export function useVoiceQueue() {
  const [queue, setQueue] = useState<QueuedCall[]>(voiceQueueSeed);

  // Tick waiting times of queued items
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue((prev) =>
        prev.map((c) => ({
          ...c,
          waitTime: c.waitTime + 1
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dequeue first or by ID
  const dequeueCall = useCallback((id: string) => {
    let call: QueuedCall | null = null;
    setQueue((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target) call = target;
      return prev.filter((c) => c.id !== id);
    });
    return call;
  }, []);

  // Add random incoming caller simulator trigger
  const simulateInboundQueuedCall = useCallback(() => {
    const names = [
      'Zainab Al-Fahad',
      'Robert Miller',
      'Youssef Khalil',
      'Alice Watson',
      'Omar Al-Harbi'
    ];
    const phonePrefixes = ['+966 (50) 443-', '+1 (555) 702-', '+44 (20) 7946-'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)] + 
      Math.floor(1000 + Math.random() * 9000);
    
    const priorities: QueuedCall['priority'][] = ['VIP', 'High', 'Normal'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

    const queues = ['Enterprise VIP Queue', 'Billing & Invoices', 'General Support'];
    const randomQueue = queues[Math.floor(Math.random() * queues.length)];

    const newCall: QueuedCall = {
      id: `q-call-${Date.now()}`,
      phoneNumber: randomPhone,
      customerName: randomName,
      waitTime: 0,
      priority: randomPriority,
      queueName: randomQueue
    };

    setQueue((prev) => [...prev, newCall]);
    return newCall;
  }, []);

  // Auto trigger incoming simulation every 25 seconds if queue is low
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue((prev) => {
        if (prev.length < 5 && Math.random() > 0.4) {
          // Trigger queue addition
          const names = ['Khalid Al-Qarni', 'Emma Stone', 'Saleh Al-Otaibi'];
          const newCall: QueuedCall = {
            id: `q-call-${Date.now()}`,
            phoneNumber: '+966 (54) 887-' + Math.floor(1000 + Math.random() * 9000),
            customerName: names[Math.floor(Math.random() * names.length)],
            waitTime: 0,
            priority: Math.random() > 0.6 ? 'High' : 'Normal',
            queueName: 'General Support'
          };
          return [...prev, newCall];
        }
        return prev;
      });
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  return {
    queue,
    setQueue,
    dequeueCall,
    simulateInboundQueuedCall
  };
}
