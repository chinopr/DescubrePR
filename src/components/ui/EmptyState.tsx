interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-primary">{icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">{description}</p>
            {action}
        </div>
    );
}
