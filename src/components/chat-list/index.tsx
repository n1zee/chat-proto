import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useChatListData } from '@/store/chat-store';

import { ChatListItem } from "@/components/chat-list-item";

import styles from './styles.module.css';

export const ChatList = () => {
  const { chats, activeChat, isLoadingChats, fetchChats, selectChat } = useChatListData();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  if (isLoadingChats) {
    return (
      <div className="loading">
        <Loader2 className="spinner" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChat}
          onClick={() => selectChat(chat.id)}
        />
      ))}
    </div>
  );
};
