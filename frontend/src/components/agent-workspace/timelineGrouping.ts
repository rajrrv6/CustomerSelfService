import { Message } from '@/types';

export type TimelineItem =
  | {
      type: 'group';
      id: string;
      sender: 'customer' | 'agent' | 'bot' | 'system';
      senderName: string;
      messages: Message[];
    }
  | {
      type: 'special';
      id: string;
      message: Message;
    };

function parseTimeStringToMinutes(timeStr: string): number {
  // Matches HH:MM:SS or HH:MM or HH:MM AM/PM
  const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[4];
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
}

function getMinutesDifference(timeStr1: string, timeStr2: string): number {
  const d1 = Date.parse(timeStr1) || Date.parse(`2026-06-09T${timeStr1}`);
  const d2 = Date.parse(timeStr2) || Date.parse(`2026-06-09T${timeStr2}`);
  if (!isNaN(d1) && !isNaN(d2)) {
    return Math.abs(d1 - d2) / 60000;
  }
  const minutes1 = parseTimeStringToMinutes(timeStr1);
  const minutes2 = parseTimeStringToMinutes(timeStr2);
  return Math.abs(minutes1 - minutes2);
}

export function groupMessages(messages: Message[], channel: string): TimelineItem[] {
  const items: TimelineItem[] = [];
  let currentGroup: {
    type: 'group';
    id: string;
    sender: 'customer' | 'agent' | 'bot' | 'system';
    senderName: string;
    messages: Message[];
  } | null = null;

  for (const msg of messages) {
    const isSystem = msg.sender === 'system';
    const isEmail = channel === 'email';
    const isInternalNote =
      msg.messageType === 'internal_note' ||
      msg.text.startsWith('[Internal Note]:') ||
      msg.senderName.includes('Notes');
    const isEscalation = msg.messageType === 'escalation' || msg.text.includes('Escalated');
    const isSpecial = isSystem || isEmail || isInternalNote || isEscalation;

    if (isSpecial) {
      // If there's an active group, push it first
      if (currentGroup) {
        items.push(currentGroup);
        currentGroup = null;
      }
      // Push the special message as a standalone item
      items.push({
        type: 'special',
        id: msg.id,
        message: msg,
      });
    } else {
      // Standard chat message
      if (currentGroup) {
        // Check if we can append: same sender and within 2 minutes
        const senderMatch = currentGroup.sender === msg.sender;
        const lastMsg = currentGroup.messages[currentGroup.messages.length - 1];
        const timeDiff = getMinutesDifference(lastMsg.timestamp, msg.timestamp);
        const withinTwoMinutes = timeDiff <= 2;

        if (senderMatch && withinTwoMinutes) {
          currentGroup.messages.push(msg);
        } else {
          // Push old group and start new one
          items.push(currentGroup);
          currentGroup = {
            type: 'group',
            id: `group-${msg.id}`,
            sender: msg.sender,
            senderName: msg.senderName,
            messages: [msg],
          };
        }
      } else {
        // Start a new group
        currentGroup = {
          type: 'group',
          id: `group-${msg.id}`,
          sender: msg.sender,
          senderName: msg.senderName,
          messages: [msg],
        };
      }
    }
  }

  if (currentGroup) {
    items.push(currentGroup);
  }

  return items;
}
