# Windi Messenger

Прототип интерфейса чата с виртуализированным списком сообщений.

## Технологии

| Технология | Версия | Почему выбрана |
|------------|--------|----------------|
| **React** | 18.3 | — |
| **TypeScript** | 5.6 | Strict mode, строгая типизация |
| **Vite** | 6.0 | Быстрая сборка и HMR |
| **Zustand** | 5.0 | State manager с отличной производительностью |
| **@tanstack/react-virtual** | 3.13 | Headless виртуализация списков |
| **CSS Modules** | — | Изолированные стили без runtime overhead |
| **Vitest** | 4.0 | Быстрый test runner, нативная интеграция с Vite |
| **Testing Library** | 16.x | Тестирование компонентов через user interactions |

### Почему Zustand?

- **Минимальный boilerplate** — не нужны action creators, reducers, middleware
- **Простой API** — создание store в несколько строк
- **Селекторы с useShallow** — компоненты перерендериваются только при изменении нужных данных
- **Доступ к state вне React** — `useStore.getState()` для использования в других stores
- **Размер ~1KB** — не раздувает бандл

### Почему @tanstack/react-virtual?

- **Headless** — полный контроль над разметкой и стилями
- **Динамическая высота** — автоматическое измерение элементов
- **Производительность** — рендерит только видимые элементы (5000+ сообщений)

## Архитектура

### State Management

Два Zustand store:

- **auth-store** — текущий пользователь (`currentUserId`)
- **chat-store** — чаты, сообщения, loading/error состояния

### Error Handling

- **ErrorBoundary** — перехват ошибок в компонентах с fallback UI
- **Error state в store** — обработка ошибок API с возможностью retry

### Утилиты

- `isOwnMessage(message, currentUserId)` — функция для определения своих сообщений
- `formatTime()` / `formatMessageTime()` — форматирование дат

## Mock WebSocket

Имитация real-time.

### Как работает

1. **Подключение** — при монтировании `ChatLayout` вызывается `mockWebSocket.connect()`

2. **Отправка сообщения**:
   - Сообщение сразу добавляется в store со статусом `sent` (оптимистичное обновление)
   - Через 500ms статус меняется на `delivered`
   - Через 1500ms статус меняется на `read`
   - Через 2000ms приходит автоматический ответ

3. **Автоматические сообщения** — если пользователь неактивен 30 секунд:
   - Запускается интервал отправки сообщений каждые 5-10 секунд
   - При активности пользователя автосообщения останавливаются

4. **Подписки**:
   - `onMessage(handler)` — новые входящие сообщения
   - `onStatusChange(handler)` — изменение статуса сообщений

## Тестирование

```bash
# Запуск тестов
yarn test

# Запуск тестов однократно
yarn test:run

# Запуск с покрытием
yarn test:coverage
```

### Покрытие

| Модуль | Покрытие |
|--------|----------|
| `utils/` | 100% |
| `components/status-icon` | 100% |
| `components/message-item` | 100% |
| `components/chat-list-item` | 100% |
| `components/chat-input` | 91% |
| `store/chat-store` | 84% |

## Запуск

### Требования

- Node.js >= 24.0.0
- Yarn 4.x

### Установка и запуск

```bash
# Установка зависимостей
yarn install

# Запуск dev-сервера
yarn dev

# Сборка
yarn build

# Линтинг
yarn lint

# Форматирование
yarn format
```

## Структура проекта

```
src/
├── components/
│   ├── chat-input/           # Поле ввода сообщения
│   ├── chat-layout/          # Основной layout
│   ├── chat-list/            # Список чатов
│   ├── chat-list-item/       # Элемент списка чатов
│   ├── error-boundary/       # Error Boundary для перехвата ошибок
│   ├── message-item/         # Сообщение
│   ├── message-list/         # Виртуализированный список сообщений
│   ├── messages-list-wrapper/ # Обертка с header и input
│   └── status-icon/          # Иконка статуса сообщения
├── services/
│   ├── mock-api.ts           # Mock API (getChats, getMessages)
│   └── mock-websocket.ts     # Mock WebSocket
├── store/
│   ├── auth-store.ts         # Store авторизации
│   └── chat-store.ts         # Store чатов и сообщений
├── test/
│   ├── factories.ts          # Фабрики для тестовых данных
│   └── setup.ts              # Настройка тестового окружения
├── types/
│   └── index.ts              # TypeScript типы
├── utils/
│   ├── date-time.ts          # Форматирование даты/времени
│   └── message.ts            # Утилиты для сообщений
├── App.tsx
├── main.tsx
└── index.css                 # Глобальные стили и CSS переменные
```
