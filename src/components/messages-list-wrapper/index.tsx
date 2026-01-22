import { Loader2, MessageCircle } from "lucide-react";

import { type Chat } from "@/types";

import { MessageList } from "@/components/message-list";
import { ChatInput } from "@/components/chat-input";

import styles from "./styles.module.css";


interface Props {
    activeChat: string | null;
    isLoadingMessages: boolean;
    activeChatData?: Chat;
}

export const MessagesListWrapper = ({ activeChat, isLoadingMessages, activeChatData }: Props) => {
    if (!activeChat) {
        return (
            <div className={styles.emptyState}>
                <MessageCircle className={styles.emptyIcon} strokeWidth={1} />
                <p className={styles.emptyTitle}>Выберите чат</p>
                <p className={styles.emptyText}>Чтобы начать переписку</p>
            </div>
        );
    }

    if (isLoadingMessages) {
        return (
            <div className={styles.loading}>
                <Loader2 className="spinner" />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                    <img
                        src={activeChatData?.avatar}
                        alt={activeChatData?.name}
                        className={styles.chatAvatar}
                    />
                    <div>
                        <div className={styles.chatName}>{activeChatData?.name}</div>
                        <div className={styles.chatStatus}>онлайн</div>
                    </div>
                </div>
            </header>
            <div className={styles.messageArea}>
                <MessageList />
            </div>
            <ChatInput />
        </div>
    );
};