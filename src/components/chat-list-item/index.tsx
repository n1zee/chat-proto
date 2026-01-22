import clsx from 'clsx';

import { type Chat } from '@/types';

import { useCurrentUserId } from '@/store/auth-store';

import { formatTime } from '@/utils/date-time';
import { isOwnMessage } from '@/utils/message';

import { StatusIcon } from '@/components/status-icon';

import styles from './styles.module.css';

interface Props {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem = ({ chat, isActive, onClick }: Props) => {
  const currentUserId = useCurrentUserId();
  const lastMessage = chat.lastMessage;
  const isOwn = lastMessage ? isOwnMessage(lastMessage, currentUserId) : false;

  return (
    <button
      onClick={onClick}
      className={clsx(styles.item, isActive && styles.itemActive)}
      data-testid="chat-list-item"
      data-active={isActive}
    >
      <img src={chat.avatar} alt={chat.name} className={styles.avatar} />

      <div className={styles.content}>
        <div className={styles.row}>
          <span className={styles.name}>{chat.name}</span>
          <div className={styles.meta}>
            {isOwn && lastMessage && <StatusIcon status={lastMessage.status} size={16} />}
            <span className={styles.time}>
              {lastMessage && formatTime(lastMessage.timestamp)}
            </span>
          </div>
        </div>

        <span className={styles.message}>{lastMessage?.text || 'Нет сообщений'}</span>
      </div>
    </button>
  );
};
