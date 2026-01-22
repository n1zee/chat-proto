import { Check, CheckCheck, Clock } from 'lucide-react';

import { type Message } from '@/types';

import styles from './styles.module.css';

interface Props {
    status: Message['status'];
    size?: number;
}

export const StatusIcon = ({ status, size = 14 }: Props) => {
    switch (status) {
        case 'sending':
            return <Clock size={size} className={styles.sending} data-testid="status-sending" />;
        case 'sent':
            return <Check size={size} className={styles.status} data-testid="status-sent" />;
        case 'delivered':
            return <CheckCheck size={size} className={styles.status} data-testid="status-delivered" />;
        case 'read':
            return <CheckCheck size={size} className={styles.status} data-testid="status-read" />;
        default:
            return null;
    }
};
