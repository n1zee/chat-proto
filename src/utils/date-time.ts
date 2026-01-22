export const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    }

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

export const formatMessageTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });
};