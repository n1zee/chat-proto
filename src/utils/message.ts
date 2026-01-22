import { type Message } from '@/types';

export const isOwnMessage = (message: Message, currentUserId: string): boolean => {
  return message.senderId === currentUserId;
};
