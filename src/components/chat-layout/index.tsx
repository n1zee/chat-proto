import { useEffect } from 'react';

import { useChatLayoutData } from '@/store/chat-store';

import { mockWebSocket } from '@/services/mock-websocket';

import { ChatList } from '@/components/chat-list';
import { MessagesListWrapper } from "@/components/messages-list-wrapper";

import styles from './styles.module.css';

export const ChatLayout = () => {
  const { activeChat, chats, isLoadingMessages, addIncomingMessage, updateMessageStatus } =
    useChatLayoutData();

  const activeChatData = chats.find((chat) => chat.id === activeChat);

  useEffect(() => {
    mockWebSocket.connect();

    const unsubscribeMessage = mockWebSocket.onMessage((message) => {
      addIncomingMessage(message);
    });

    const unsubscribeStatus = mockWebSocket.onStatusChange((messageId, status) => {
      updateMessageStatus(messageId, status);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      mockWebSocket.disconnect();
    };
  }, [addIncomingMessage, updateMessageStatus]);

  useEffect(() => {
    mockWebSocket.setActiveChat(activeChat);
  }, [activeChat]);

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <header className={styles.header}>
          <span className={styles.title}>Чаты</span>
        </header>
        <div className={styles.chatListWrapper}>
          <ChatList />
        </div>
      </aside>

      <main className={styles.main}>
        <MessagesListWrapper activeChat={activeChat} isLoadingMessages={isLoadingMessages} activeChatData={activeChatData} />
      </main>
    </div>
  );
};
