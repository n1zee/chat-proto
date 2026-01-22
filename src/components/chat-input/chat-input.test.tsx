import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatInput } from './index';

const mockSendMessage = vi.fn();

vi.mock('@/store/chat-store', () => ({
  useChatStore: vi.fn((selector) => {
    const state = {
      activeChat: 'chat-1',
      sendMessage: mockSendMessage,
    };
    return selector(state);
  }),
  useSendMessage: () => mockSendMessage,
}));

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea', () => {
    render(<ChatInput />);
    expect(screen.getByPlaceholderText('Сообщение')).toBeInTheDocument();
  });

  it('does not show send button when input is empty', () => {
    render(<ChatInput />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows send button when text is entered', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение');
    await user.type(textarea, 'Hello');

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sends message on button click', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение');
    await user.type(textarea, 'Hello world');
    await user.click(screen.getByRole('button'));

    expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Hello world');
  });

  it('sends message on Enter key', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение');
    await user.type(textarea, 'Hello world{Enter}');

    expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Hello world');
  });

  it('does not send message on Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение');
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}world');

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение') as HTMLTextAreaElement;
    await user.type(textarea, 'Hello world');
    await user.click(screen.getByRole('button'));

    expect(textarea.value).toBe('');
  });

  it('trims whitespace before sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение');
    await user.type(textarea, '  Hello world  ');
    await user.click(screen.getByRole('button'));

    expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Hello world');
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);

    const textarea = screen.getByPlaceholderText('Сообщение');
    await user.type(textarea, '   ');

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
