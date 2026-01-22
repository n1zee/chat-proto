import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StatusIcon } from './index';
import type { Message } from '@/types';

describe('StatusIcon', () => {
  it('renders clock icon for sending status', () => {
    render(<StatusIcon status="sending" />);
    expect(screen.getByTestId('status-sending')).toBeInTheDocument();
  });

  it('renders check icon for sent status', () => {
    render(<StatusIcon status="sent" />);
    expect(screen.getByTestId('status-sent')).toBeInTheDocument();
  });

  it('renders double check for delivered status', () => {
    render(<StatusIcon status="delivered" />);
    expect(screen.getByTestId('status-delivered')).toBeInTheDocument();
  });

  it('renders double check for read status', () => {
    render(<StatusIcon status="read" />);
    expect(screen.getByTestId('status-read')).toBeInTheDocument();
  });

  it('renders null for unknown status', () => {
    const { container } = render(
      <StatusIcon status={'unknown' as Message['status']} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('applies custom size', () => {
    render(<StatusIcon status="sent" size={20} />);
    const icon = screen.getByTestId('status-sent');
    expect(icon).toHaveAttribute('width', '20');
    expect(icon).toHaveAttribute('height', '20');
  });

  it('uses default size of 14', () => {
    render(<StatusIcon status="sent" />);
    const icon = screen.getByTestId('status-sent');
    expect(icon).toHaveAttribute('width', '14');
    expect(icon).toHaveAttribute('height', '14');
  });
});
