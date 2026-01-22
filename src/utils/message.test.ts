import { describe, it, expect } from 'vitest';

import { type Message } from '@/types';

import { isOwnMessage } from './message';

describe('message utils', () => {
  describe('isOwnMessage', () => {
    const createMessage = (senderId: string): Message => ({
      id: 'msg-1',
      chatId: 'chat-1',
      senderId,
      text: 'Test message',
      timestamp: Date.now(),
      status: 'sent',
    });

    it('returns true when senderId matches currentUserId', () => {
      const message = createMessage('user-123');
      expect(isOwnMessage(message, 'user-123')).toBe(true);
    });

    it('returns false when senderId does not match currentUserId', () => {
      const message = createMessage('user-123');
      expect(isOwnMessage(message, 'user-456')).toBe(false);
    });
  });
});
