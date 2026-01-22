import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatListItem } from './index';

import {
  createMockChat,
  createMockMessage,
  resetFactoryCounters,
  MOCK_CURRENT_USER_ID,
} from '@/test/factories';

vi.mock('@/store/auth-store', () => ({
  useCurrentUserId: () => 'current-user',
}));

describe('ChatListItem', () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  const mockChat = createMockChat({
    id: 'chat-1',
    name: 'Test User',
    avatar: 'https://example.com/avatar.png',
    lastMessage: createMockMessage({
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      text: 'Hello there!',
      timestamp: new Date('2026-01-15T10:30:00').getTime(),
      status: 'delivered',
    }),
  });

  it('renders chat name', () => {
    render(<ChatListItem chat={mockChat} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders avatar', () => {
    render(<ChatListItem chat={mockChat} isActive={false} onClick={vi.fn()} />);
    const img = screen.getByAltText('Test User');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('renders last message text', () => {
    render(<ChatListItem chat={mockChat} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('renders "Нет сообщений" when no last message', () => {
    const chatWithoutMessage = createMockChat({ lastMessage: null });
    render(
      <ChatListItem
        chat={chatWithoutMessage}
        isActive={false}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Нет сообщений')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatListItem chat={mockChat} isActive={false} onClick={onClick} />);

    await user.click(screen.getByTestId('chat-list-item'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows status icon for own messages', () => {
    const chatWithOwnMessage = createMockChat({
      lastMessage: createMockMessage({ senderId: MOCK_CURRENT_USER_ID }),
    });
    render(
      <ChatListItem
        chat={chatWithOwnMessage}
        isActive={false}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByTestId('status-sent')).toBeInTheDocument();
  });

  it('does not show status icon for other messages', () => {
    render(<ChatListItem chat={mockChat} isActive={false} onClick={vi.fn()} />);
    expect(screen.queryByTestId('status-delivered')).not.toBeInTheDocument();
  });

  it('marks item as active when isActive is true', () => {
    render(<ChatListItem chat={mockChat} isActive={true} onClick={vi.fn()} />);
    expect(screen.getByTestId('chat-list-item')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('marks item as inactive when isActive is false', () => {
    render(<ChatListItem chat={mockChat} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByTestId('chat-list-item')).toHaveAttribute(
      'data-active',
      'false',
    );
  });
});
