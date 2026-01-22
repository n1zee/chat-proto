import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

import { type Chat, type Message } from '@/types';

import { useAuthStore } from '@/store/auth-store';

import { getChats, getMessages } from '@/services/mock-api';

import { mockWebSocket } from '@/services/mock-websocket';

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  fetchChats: () => Promise<void>;
  selectChat: (chatId: string) => void;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  addIncomingMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  clearError: () => void;
}

const useChatStoreBase = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  isLoadingChats: false,
  isLoadingMessages: false,
  error: null,

  fetchChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const chats = await getChats();
      set({ chats, isLoadingChats: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка загрузки чатов';
      set({ isLoadingChats: false, error: message });
    }
  },

  selectChat: (chatId: string) => {
    set({ activeChat: chatId });
    const { messages, fetchMessages } = get();
    if (!messages[chatId]) {
      fetchMessages(chatId);
    }
  },

  fetchMessages: async (chatId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const fetchedMessages = await getMessages(chatId);
      set((state) => ({
        messages: { ...state.messages, [chatId]: fetchedMessages },
        isLoadingMessages: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка загрузки сообщений';
      set({ isLoadingMessages: false, error: message });
    }
  },

  sendMessage: (chatId: string, text: string) => {
    const messageId = `msg-${Date.now()}`;
    const { currentUserId } = useAuthStore.getState();

    const message: Message = {
      id: messageId,
      chatId,
      senderId: currentUserId,
      text,
      timestamp: Date.now(),
      status: 'sent',
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] ?? []), message],
      },
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, lastMessage: message } : chat,
      ),
    }));

    mockWebSocket.sendMessage(message);
  },

  addIncomingMessage: (message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.chatId]: [...(state.messages[message.chatId] ?? []), message],
      },
      chats: state.chats.map((chat) =>
        chat.id === message.chatId ? { ...chat, lastMessage: message } : chat,
      ),
    }));
  },

  updateMessageStatus: (messageId: string, status: Message['status']) => {
    const { activeChat, messages } = get();

    if (activeChat && messages[activeChat]) {
      const chatMessages = messages[activeChat];
      const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);

      if (messageIndex !== -1) {
        set((state) => ({
          messages: {
            ...state.messages,
            [activeChat]: state.messages[activeChat].map((msg) =>
              msg.id === messageId ? { ...msg, status } : msg,
            ),
          },
        }));
        return;
      }
    }

    set((state) => {
      for (const chatId in state.messages) {
        const idx = state.messages[chatId].findIndex((msg) => msg.id === messageId);
        if (idx !== -1) {
          return {
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId].map((msg) =>
                msg.id === messageId ? { ...msg, status } : msg,
              ),
            },
          };
        }
      }
      return state;
    });
  },

  clearError: () => set({ error: null }),
}));

export const useChatStore = useChatStoreBase;

export const useChatListData = () =>
  useChatStoreBase(
    useShallow((state) => ({
      chats: state.chats,
      activeChat: state.activeChat,
      isLoadingChats: state.isLoadingChats,
      fetchChats: state.fetchChats,
      selectChat: state.selectChat,
    })),
  );

export const useMessageListData = () =>
  useChatStoreBase(
    useShallow((state) => ({
      activeChat: state.activeChat,
      messages: state.messages,
    })),
  );

export const useChatLayoutData = () =>
  useChatStoreBase(
    useShallow((state) => ({
      activeChat: state.activeChat,
      chats: state.chats,
      isLoadingMessages: state.isLoadingMessages,
      addIncomingMessage: state.addIncomingMessage,
      updateMessageStatus: state.updateMessageStatus,
    })),
  );

export const useSendMessage = () => useChatStoreBase((state) => state.sendMessage);

export const useError = () =>
  useChatStoreBase(
    useShallow((state) => ({
      error: state.error,
      clearError: state.clearError,
    })),
  );
