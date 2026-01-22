import { Server, WebSocket } from 'mock-socket';
import { v4 as uuid } from 'uuid';

import { type Message } from '@/types';

const WS_URL = 'ws://localhost:8080/chat';
const IDLE_TIMEOUT = 30000;

type MessageHandler = (message: Message) => void;
type StatusHandler = (messageId: string, status: Message['status']) => void;

let mockServer: Server | null = null;

export function startMockServer(): Server {
  if (mockServer) {
    mockServer.close();
  }

  mockServer = new Server(WS_URL);

  mockServer.on('connection', () => {
    console.log('[MockServer] Client connected');
  });

  return mockServer;
}

class MockWebSocketClient {
  private socket: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private activeChatId: string | null = null;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoMessageInterval: ReturnType<typeof setInterval> | null = null;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    startMockServer();
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('[WebSocket] Connected');
    };

    this.socket.onclose = () => {
      console.log('[WebSocket] Disconnected');
    };
  }

  disconnect() {
    this.stopIdleTimeout();
    this.stopAutoMessages();
    this.socket?.close();
    this.socket = null;
    mockServer?.close();
    mockServer = null;
  }

  setActiveChat(chatId: string | null) {
    this.activeChatId = chatId;
    this.stopIdleTimeout();
    this.stopAutoMessages();
  }

  sendMessage(message: Message) {
    if (!this.activeChatId) return;

    this.stopIdleTimeout();
    this.stopAutoMessages();

    setTimeout(() => {
      this.statusHandlers.forEach((handler) => handler(message.id, 'delivered'));
    }, 500);

    setTimeout(() => {
      this.statusHandlers.forEach((handler) => handler(message.id, 'read'));
    }, 1500);

    setTimeout(() => {
      if (!this.activeChatId) return;

      const reply: Message = {
        id: uuid(),
        chatId: this.activeChatId,
        senderId: 'user-reply',
        text: 'Спасибо за информацию!',
        timestamp: Date.now(),
        status: 'delivered',
      };

      this.messageHandlers.forEach((handler) => handler(reply));
    }, 2000);

    this.startIdleTimeout();
  }

  private startIdleTimeout() {
    this.stopIdleTimeout();

    this.idleTimeout = setTimeout(() => {
      this.startAutoMessages();
    }, IDLE_TIMEOUT);
  }

  private stopIdleTimeout() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }

  private startAutoMessages() {
    if (!this.activeChatId) return;

    this.stopAutoMessages();

    const texts = [
      'Привет! Как дела?',
      'Интересно, расскажи подробнее',
      'Согласен с тобой',
      'Хорошая идея!',
      'Давай обсудим это позже',
      'Отлично, договорились',
      'Окей, сделаю',
    ];

    this.sendAutoMessage(texts);

    this.autoMessageInterval = setInterval(() => {
      this.sendAutoMessage(texts);
    }, 5000 + Math.random() * 5000);
  }

  private sendAutoMessage(texts: string[]) {
    if (!this.activeChatId) return;

    const message: Message = {
      id: uuid(),
      chatId: this.activeChatId,
      senderId: 'user-auto',
      text: texts[Math.floor(Math.random() * texts.length)],
      timestamp: Date.now(),
      status: 'delivered',
    };

    this.messageHandlers.forEach((handler) => handler(message));
  }

  private stopAutoMessages() {
    if (this.autoMessageInterval) {
      clearInterval(this.autoMessageInterval);
      this.autoMessageInterval = null;
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }
}

export const mockWebSocket = new MockWebSocketClient();
