import { type Message, type Chat, type User } from '@/types';

export const MOCK_CURRENT_USER_ID = 'current-user';

let messageCounter = 0;
let chatCounter = 0;
let userCounter = 0;

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: `user-${++userCounter}`,
  name: `User ${userCounter}`,
  avatar: `https://example.com/avatar${userCounter}.png`,
  ...overrides,
});

export const createMockMessage = (overrides?: Partial<Message>): Message => ({
  id: `msg-${++messageCounter}`,
  chatId: 'chat-1',
  senderId: 'user-1',
  text: 'Test message',
  timestamp: Date.now(),
  status: 'sent',
  ...overrides,
});

export const createMockChat = (overrides?: Partial<Chat>): Chat => ({
  id: `chat-${++chatCounter}`,
  name: `Test Chat ${chatCounter}`,
  avatar: `https://example.com/chat${chatCounter}.png`,
  lastMessage: null,
  participants: [createMockUser()],
  ...overrides,
});

export const resetFactoryCounters = () => {
  messageCounter = 0;
  chatCounter = 0;
  userCounter = 0;
};
