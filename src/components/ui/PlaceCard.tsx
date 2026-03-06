import Link from 'next/link';

interface PlaceCardProps {
    id: string;
    title: string;
    location: string;
    category: string;
    imageUrl: string;
    rating?: number;
    description: string;
}

export default function PlaceCard({ id, title, location, category, imageUrl, rating = 4.5, description }: PlaceCardProps) {
    return (
        <Link href={`/places/${id}`} className="flex flex-col gap-3 group cursor-pointer bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 p-3 h-full">
            <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg relative overflow-hidden"
                style={{ backgroundImage: `url("${imageUrl}")` }}
            >
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-[16px] font-variation-fill">star</span>
                    <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                </div>
            </div>
            <div className="px-1 flex-1 flex flex-col">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-1 gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{location}</span>
                    <span className="mx-1 shrink-0">•</span>
                    <span className="whitespace-nowrap">{category}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 line-clamp-2">{description}</p>
            </div>
        </Link>
    );
}
