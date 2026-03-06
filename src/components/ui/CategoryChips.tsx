import { CATEGORIES } from '@/lib/constants';

interface CategoryChipsProps {
    selectedCategory?: string;
    onSelect?: (categoryId: string) => void;
}

export default function CategoryChips({ selectedCategory = 'all', onSelect }: CategoryChipsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            <button
                onClick={() => onSelect?.('all')}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 font-medium shadow-sm transition-colors ${selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary'
                    }`}
            >
                Todos
            </button>

            {CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect?.(cat.id)}
                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-colors ${selectedCategory === cat.id
                            ? 'bg-primary text-white border border-primary shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary'
                        }`}
                >
                    <span className={`material-symbols-outlined text-[20px] ${selectedCategory === cat.id ? 'text-white' : 'text-primary'}`}>
                        {cat.icon}
                    </span>
                    <span className={`font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {cat.name}
                    </span>
                </button>
            ))}
        </div>
    );
}
