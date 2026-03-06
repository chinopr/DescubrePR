import Link from 'next/link';

interface EventCardProps {
    id: string;
    title: string;
    dateStr: string;
    location: string;
    imageUrl: string;
}

export default function EventCard({ id, title, dateStr, location, imageUrl }: EventCardProps) {
    return (
        <div className="flex gap-3 group cursor-pointer bg-white dark:bg-slate-800 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div
                className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url("${imageUrl}")` }}
            />
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <Link href={`/events/${id}`} className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1 block">
                    {title}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {dateStr} • {location}
                </p>
            </div>
        </div>
    );
}
