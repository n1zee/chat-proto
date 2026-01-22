import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MessageItem } from './index';
import {
  createMockMessage,
  resetFactoryCounters,
  MOCK_CURRENT_USER_ID,
} from '@/test/factories';

vi.mock('@/store/auth-store', () => ({
  useCurrentUserId: () => 'current-user',
}));

describe('MessageItem', () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  const baseMessage = createMockMessage({
    id: 'msg-1',
    chatId: 'chat-1',
    senderId: 'user-1',
    text: 'Hello, world!',
    timestamp: new Date('2026-01-15T10:30:00').getTime(),
    status: 'delivered',
  });

  it('renders message text', () => {
    render(<MessageItem message={baseMessage} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders formatted time', () => {
    render(<MessageItem message={baseMessage} />);
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('shows status icon for own messages', () => {
    const ownMessage = createMockMessage({
      senderId: MOCK_CURRENT_USER_ID,
      status: 'sent',
    });
    render(<MessageItem message={ownMessage} />);
    expect(screen.getByTestId('status-sent')).toBeInTheDocument();
  });

  it('does not show status icon for other messages', () => {
    render(<MessageItem message={baseMessage} />);
    expect(screen.queryByTestId('status-delivered')).not.toBeInTheDocument();
  });

  it('marks own message with data-own=true', () => {
    const ownMessage = createMockMessage({ senderId: MOCK_CURRENT_USER_ID });
    render(<MessageItem message={ownMessage} />);
    expect(screen.getByTestId('message-item')).toHaveAttribute(
      'data-own',
      'true',
    );
  });

  it('marks other message with data-own=false', () => {
    render(<MessageItem message={baseMessage} />);
    expect(screen.getByTestId('message-item')).toHaveAttribute(
      'data-own',
      'false',
    );
  });

  it('renders different statuses for own messages', () => {
    const sendingMessage = createMockMessage({
      senderId: MOCK_CURRENT_USER_ID,
      status: 'sending',
    });
    render(<MessageItem message={sendingMessage} />);
    expect(screen.getByTestId('status-sending')).toBeInTheDocument();
  });

  it('shows delivered status icon', () => {
    const deliveredMessage = createMockMessage({
      senderId: MOCK_CURRENT_USER_ID,
      status: 'delivered',
    });
    render(<MessageItem message={deliveredMessage} />);
    expect(screen.getByTestId('status-delivered')).toBeInTheDocument();
  });

  it('shows read status icon', () => {
    const readMessage = createMockMessage({
      senderId: MOCK_CURRENT_USER_ID,
      status: 'read',
    });
    render(<MessageItem message={readMessage} />);
    expect(screen.getByTestId('status-read')).toBeInTheDocument();
  });
});
