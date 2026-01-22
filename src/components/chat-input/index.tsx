import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

import { useChatStore, useSendMessage } from '@/store/chat-store';

import styles from './styles.module.css';

export const ChatInput = () => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeChat = useChatStore((state) => state.activeChat);
  const sendMessage = useSendMessage();

  const handleSend = useCallback(() => {
    if (!activeChat || !text.trim()) return;

    sendMessage(activeChat, text.trim());
    setText('');
  }, [activeChat, text, sendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  if (!activeChat) return null;

  return (
    <div className={styles.container}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение"
        rows={1}
        className={styles.input}
      />
      {text.trim() && (
        <button onClick={handleSend} className={styles.sendButton}>
          <Send size={20} />
        </button>
      )}
    </div>
  );
};
