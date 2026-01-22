export interface User {
  id: string;
  name: string;
  avatar: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: Message | null;
  participants: User[];
}
