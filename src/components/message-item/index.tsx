import { memo } from 'react';
import clsx from 'clsx';

import { type Message } from '@/types';

import { useCurrentUserId } from '@/store/auth-store';

import { formatMessageTime } from '@/utils/date-time';
import { isOwnMessage } from '@/utils/message';

import { StatusIcon } from '@/components/status-icon';

import styles from './styles.module.css';

interface Props {
  message: Message;
}

const MessageItemComponent = ({ message }: Props) => {
  const currentUserId = useCurrentUserId();
  const isOwn = isOwnMessage(message, currentUserId);

  const time = formatMessageTime(message.timestamp);

  return (
    <div
      className={clsx(styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther)}
      data-testid="message-item"
      data-own={isOwn}
    >
      <div className={clsx(styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther)}>
        <p className={styles.text}>{message.text}</p>
        <div className={styles.meta}>
          <span className={styles.time}>{time}</span>
          {isOwn && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export const MessageItem = memo(MessageItemComponent);
