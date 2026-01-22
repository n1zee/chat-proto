import { ErrorBoundary } from '@/components/error-boundary';
import { ChatLayout } from '@/components/chat-layout';

export const App = () => {
  return (
    <ErrorBoundary>
      <ChatLayout />
    </ErrorBoundary>
  );
};
