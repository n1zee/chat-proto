import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useChatStore } from './chat-store';

import { type Message, type Chat } from '@/types';

const { mockSendMessage } = vi.hoisted(() => ({
  mockSendMessage: vi.fn(),
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: () => ({ currentUserId: 'current-user' }),
  },
}));

vi.mock('@/services/mock-api', () => ({
  getChats: vi.fn(),
  getMessages: vi.fn(),
}));

vi.mock('@/services/mock-websocket', () => ({
  mockWebSocket: {
    sendMessage: mockSendMessage,
  },
}));

import { getChats, getMessages } from '@/services/mock-api';

const mockChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'Test Chat',
    avatar: 'https://example.com/avatar.png',
    lastMessage: null,
    participants: [{ id: 'user-1', name: 'User 1', avatar: 'https://example.com/u1.png' }],
  },
  {
    id: 'chat-2',
    name: 'Test Chat 2',
    avatar: 'https://example.com/avatar2.png',
    lastMessage: null,
    participants: [{ id: 'user-2', name: 'User 2', avatar: 'https://example.com/u2.png' }],
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    senderId: 'user-1',
    text: 'Hello',
    timestamp: Date.now(),
    status: 'delivered',
  },
];

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      chats: [],
      activeChat: null,
      messages: {},
      isLoadingChats: false,
      isLoadingMessages: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchChats', () => {
    it('loads chats successfully', async () => {
      vi.mocked(getChats).mockResolvedValue(mockChats);

      await act(async () => {
        await useChatStore.getState().fetchChats();
      });

      expect(useChatStore.getState().chats).toEqual(mockChats);
      expect(useChatStore.getState().isLoadingChats).toBe(false);
      expect(useChatStore.getState().error).toBeNull();
    });

    it('sets loading state while fetching', async () => {
      vi.mocked(getChats).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockChats), 100))
      );

      const promise = useChatStore.getState().fetchChats();
      expect(useChatStore.getState().isLoadingChats).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(useChatStore.getState().isLoadingChats).toBe(false);
    });

    it('handles Error instance', async () => {
      vi.mocked(getChats).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await useChatStore.getState().fetchChats();
      });

      expect(useChatStore.getState().error).toBe('Network error');
      expect(useChatStore.getState().isLoadingChats).toBe(false);
    });

    it('handles non-Error rejection', async () => {
      vi.mocked(getChats).mockRejectedValue('Unknown error');

      await act(async () => {
        await useChatStore.getState().fetchChats();
      });

      expect(useChatStore.getState().error).toBe('Ошибка загрузки чатов');
    });

    it('clears previous error on new fetch', async () => {
      useChatStore.setState({ error: 'Previous error' });
      vi.mocked(getChats).mockResolvedValue(mockChats);

      await act(async () => {
        await useChatStore.getState().fetchChats();
      });

      expect(useChatStore.getState().error).toBeNull();
    });
  });

  describe('fetchMessages', () => {
    it('loads messages successfully', async () => {
      vi.mocked(getMessages).mockResolvedValue(mockMessages);

      await act(async () => {
        await useChatStore.getState().fetchMessages('chat-1');
      });

      expect(useChatStore.getState().messages['chat-1']).toEqual(mockMessages);
      expect(useChatStore.getState().isLoadingMessages).toBe(false);
    });

    it('sets loading state while fetching', async () => {
      vi.mocked(getMessages).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockMessages), 100))
      );

      const promise = useChatStore.getState().fetchMessages('chat-1');
      expect(useChatStore.getState().isLoadingMessages).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(useChatStore.getState().isLoadingMessages).toBe(false);
    });

    it('handles Error instance', async () => {
      vi.mocked(getMessages).mockRejectedValue(new Error('Failed to load'));

      await act(async () => {
        await useChatStore.getState().fetchMessages('chat-1');
      });

      expect(useChatStore.getState().error).toBe('Failed to load');
      expect(useChatStore.getState().isLoadingMessages).toBe(false);
    });

    it('handles non-Error rejection', async () => {
      vi.mocked(getMessages).mockRejectedValue('Unknown');

      await act(async () => {
        await useChatStore.getState().fetchMessages('chat-1');
      });

      expect(useChatStore.getState().error).toBe('Ошибка загрузки сообщений');
    });

    it('preserves existing messages from other chats', async () => {
      useChatStore.setState({
        messages: { 'chat-2': [{ ...mockMessages[0], chatId: 'chat-2' }] },
      });
      vi.mocked(getMessages).mockResolvedValue(mockMessages);

      await act(async () => {
        await useChatStore.getState().fetchMessages('chat-1');
      });

      expect(useChatStore.getState().messages['chat-1']).toEqual(mockMessages);
      expect(useChatStore.getState().messages['chat-2']).toHaveLength(1);
    });
  });

  describe('selectChat', () => {
    it('sets active chat', () => {
      act(() => {
        useChatStore.getState().selectChat('chat-1');
      });

      expect(useChatStore.getState().activeChat).toBe('chat-1');
    });

    it('fetches messages if not cached', async () => {
      vi.mocked(getMessages).mockResolvedValue(mockMessages);

      await act(async () => {
        useChatStore.getState().selectChat('chat-1');
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(getMessages).toHaveBeenCalledWith('chat-1');
    });

    it('does not fetch messages if already cached', () => {
      useChatStore.setState({
        messages: { 'chat-1': mockMessages },
      });

      act(() => {
        useChatStore.getState().selectChat('chat-1');
      });

      expect(getMessages).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      useChatStore.setState({
        activeChat: 'chat-1',
        chats: mockChats,
        messages: { 'chat-1': [] },
      });
    });

    it('adds message optimistically with correct fields', () => {
      act(() => {
        useChatStore.getState().sendMessage('chat-1', 'Hello world');
      });

      const messages = useChatStore.getState().messages['chat-1'];
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        chatId: 'chat-1',
        senderId: 'current-user',
        text: 'Hello world',
        status: 'sent',
      });
      expect(messages[0].id).toMatch(/^msg-/);
      expect(messages[0].timestamp).toBeGreaterThan(0);
    });

    it('updates lastMessage in chat', () => {
      act(() => {
        useChatStore.getState().sendMessage('chat-1', 'Hello world');
      });

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.lastMessage?.text).toBe('Hello world');
    });

    it('does not update other chats lastMessage', () => {
      act(() => {
        useChatStore.getState().sendMessage('chat-1', 'Hello world');
      });

      const chat2 = useChatStore.getState().chats.find((c) => c.id === 'chat-2');
      expect(chat2?.lastMessage).toBeNull();
    });

    it('calls mockWebSocket.sendMessage', () => {
      act(() => {
        useChatStore.getState().sendMessage('chat-1', 'Hello');
      });

      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          chatId: 'chat-1',
          text: 'Hello',
        })
      );
    });

    it('creates messages array if not exists', () => {
      useChatStore.setState({
        chats: mockChats,
        messages: {},
      });

      act(() => {
        useChatStore.getState().sendMessage('chat-1', 'First message');
      });

      expect(useChatStore.getState().messages['chat-1']).toHaveLength(1);
    });
  });

  describe('addIncomingMessage', () => {
    beforeEach(() => {
      useChatStore.setState({
        chats: mockChats,
        messages: { 'chat-1': [] },
      });
    });

    it('adds incoming message to chat', () => {
      const newMessage: Message = {
        id: 'msg-new',
        chatId: 'chat-1',
        senderId: 'user-1',
        text: 'New message',
        timestamp: Date.now(),
        status: 'delivered',
      };

      act(() => {
        useChatStore.getState().addIncomingMessage(newMessage);
      });

      const messages = useChatStore.getState().messages['chat-1'];
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg-new');
    });

    it('updates lastMessage in corresponding chat', () => {
      const newMessage: Message = {
        id: 'msg-new',
        chatId: 'chat-1',
        senderId: 'user-1',
        text: 'Incoming text',
        timestamp: Date.now(),
        status: 'delivered',
      };

      act(() => {
        useChatStore.getState().addIncomingMessage(newMessage);
      });

      const chat = useChatStore.getState().chats.find((c) => c.id === 'chat-1');
      expect(chat?.lastMessage?.text).toBe('Incoming text');
    });

    it('creates messages array if chat not initialized', () => {
      useChatStore.setState({
        chats: mockChats,
        messages: {},
      });

      const newMessage: Message = {
        id: 'msg-new',
        chatId: 'chat-1',
        senderId: 'user-1',
        text: 'First incoming',
        timestamp: Date.now(),
        status: 'delivered',
      };

      act(() => {
        useChatStore.getState().addIncomingMessage(newMessage);
      });

      expect(useChatStore.getState().messages['chat-1']).toHaveLength(1);
    });
  });

  describe('updateMessageStatus', () => {
    it('updates message status in active chat', () => {
      useChatStore.setState({
        activeChat: 'chat-1',
        messages: {
          'chat-1': [{ ...mockMessages[0], id: 'msg-to-update', status: 'sent' }],
        },
      });

      act(() => {
        useChatStore.getState().updateMessageStatus('msg-to-update', 'delivered');
      });

      const message = useChatStore.getState().messages['chat-1'][0];
      expect(message.status).toBe('delivered');
    });

    it('falls back to searching all chats when not in active chat', () => {
      useChatStore.setState({
        activeChat: 'chat-2',
        messages: {
          'chat-1': [{ ...mockMessages[0], id: 'msg-in-chat-1', status: 'sent' }],
          'chat-2': [],
        },
      });

      act(() => {
        useChatStore.getState().updateMessageStatus('msg-in-chat-1', 'read');
      });

      const message = useChatStore.getState().messages['chat-1'][0];
      expect(message.status).toBe('read');
    });

    it('does nothing when message not found', () => {
      const initialMessages = {
        'chat-1': [{ ...mockMessages[0], id: 'existing-msg', status: 'sent' }],
      };
      useChatStore.setState({
        activeChat: 'chat-1',
        messages: initialMessages as Record<string, Message[]>,
      });

      act(() => {
        useChatStore.getState().updateMessageStatus('non-existent-msg', 'delivered');
      });

      const message = useChatStore.getState().messages['chat-1'][0];
      expect(message.status).toBe('sent');
    });

    it('handles no active chat', () => {
      useChatStore.setState({
        activeChat: null,
        messages: {
          'chat-1': [{ ...mockMessages[0], id: 'msg-1', status: 'sent' }],
        },
      });

      act(() => {
        useChatStore.getState().updateMessageStatus('msg-1', 'delivered');
      });

      const message = useChatStore.getState().messages['chat-1'][0];
      expect(message.status).toBe('delivered');
    });

    it('updates to read status', () => {
      useChatStore.setState({
        activeChat: 'chat-1',
        messages: {
          'chat-1': [{ ...mockMessages[0], id: 'msg-1', status: 'delivered' }],
        },
      });

      act(() => {
        useChatStore.getState().updateMessageStatus('msg-1', 'read');
      });

      expect(useChatStore.getState().messages['chat-1'][0].status).toBe('read');
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      useChatStore.setState({ error: 'Some error' });

      act(() => {
        useChatStore.getState().clearError();
      });

      expect(useChatStore.getState().error).toBeNull();
    });

    it('does nothing when no error', () => {
      useChatStore.setState({ error: null });

      act(() => {
        useChatStore.getState().clearError();
      });

      expect(useChatStore.getState().error).toBeNull();
    });
  });
});
