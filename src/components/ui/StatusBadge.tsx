import { STATUS } from '@/lib/constants';

type StatusType = typeof STATUS[keyof typeof STATUS];

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    let bgColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    let label = 'Desconocido';

    switch (status) {
        case STATUS.PUBLISHED:
        case STATUS.APPROVED:
            bgColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50';
            label = status === STATUS.PUBLISHED ? 'Publicado' : 'Aprobado';
            break;
        case STATUS.PENDING:
            bgColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';
            label = 'Pendiente';
            break;
        case STATUS.REJECTED:
            bgColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50';
            label = 'Rechazado';
            break;
        case STATUS.DRAFT:
            bgColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
            label = 'Borrador';
            break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${className}`}>
            {label}
        </span>
    );
}
