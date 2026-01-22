import { type Chat, type Message, type User } from '@/types';

const NAMES = ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 'Елена', 'Иван', 'Ольга'];

const getAvatar = (seed: string) => `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`;

const MESSAGE_TEXTS = [
  'Привет! Как дела?',
  'Отлично, спасибо!',
  'Что делаешь?',
  'Работаю над проектом',
  'Интересно, расскажи подробнее',
  'Это новый мессенджер на React',
  'Круто! Когда будет готов?',
  'Скоро, осталось немного',
  'Удачи с проектом!',
  'Спасибо!',
  'Давай созвонимся завтра',
  'Хорошо, во сколько?',
  'В 15:00 удобно?',
  'Да, договорились',
  'До связи!',
];

export const currentUserId = 'current-user';

const delay = (min: number, max: number) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));

function generateMessages(chatId: string, participants: User[], count: number): Message[] {
  const messages: Message[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isCurrentUser = Math.random() > 0.5;
    const sender = isCurrentUser
      ? { id: currentUserId, name: 'Вы', avatar: getAvatar('me') }
      : participants[Math.floor(Math.random() * participants.length)];

    messages.push({
      id: `msg-${chatId}-${i}`,
      chatId,
      senderId: sender.id,
      text: MESSAGE_TEXTS[Math.floor(Math.random() * MESSAGE_TEXTS.length)],
      timestamp: now - (count - i) * 60000,
      status: 'delivered',
    });
  }

  return messages;
}

const chatsCache: Chat[] = [];
const messagesCache: Record<string, Message[]> = {};

function initializeData() {
  if (chatsCache.length > 0) return;

  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[i];
    const participant: User = {
      id: `user-${i}`,
      name,
      avatar: getAvatar(name),
    };
    const chatId = `chat-${i}`;
    const messages = generateMessages(chatId, [participant], 5000 + Math.floor(Math.random() * 1000));

    messagesCache[chatId] = messages;

    chatsCache.push({
      id: chatId,
      name,
      avatar: participant.avatar,
      lastMessage: messages[messages.length - 1] ?? null,
      participants: [participant],
    });
  }
}

export async function getChats(): Promise<Chat[]> {
  initializeData();
  await delay(300, 500);
  return [...chatsCache];
}

export async function getMessages(chatId: string): Promise<Message[]> {
  initializeData();
  await delay(400, 600);
  return messagesCache[chatId] ?? [];
}
