import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useCurrentUserId } from '@/store/auth-store';
import { useMessageListData } from '@/store/chat-store';
import { isOwnMessage } from '@/utils/message';

import { MessageItem } from '@/components/message-item';

import styles from './styles.module.css';

const ESTIMATED_ITEM_SIZE = 60;

export const MessageList = () => {
  const currentUserId = useCurrentUserId();
  const { activeChat, messages } = useMessageListData();
  const parentRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  const chatMessages = useMemo(
    () => (activeChat ? (messages[activeChat] ?? []) : []),
    [activeChat, messages]
  );

  const virtualizer = useVirtualizer({
    count: chatMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_SIZE,
    overscan: 10,
  });

  useEffect(() => {
    virtualizer.measure();
    isAtBottomRef.current = true;
    prevMessageCountRef.current = 0;
  }, [activeChat, virtualizer]);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = chatMessages.length;

    if (currentCount > prevCount && currentCount > 0) {
      const lastMessage = chatMessages[currentCount - 1];

      if (isOwnMessage(lastMessage, currentUserId) || isAtBottomRef.current) {
        virtualizer.scrollToIndex(currentCount - 1, { align: 'end' });
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [chatMessages, virtualizer, currentUserId]);

  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  return (
    <div ref={parentRef} className={styles.container} onScroll={handleScroll}>
      <div className={styles.inner} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = chatMessages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={styles.virtualItem}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <MessageItem message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
