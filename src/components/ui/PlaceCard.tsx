import Link from 'next/link';
import Image from 'next/image';

interface PlaceCardProps {
    id: string;
    title: string;
    location: string;
    category: string;
    imageUrl: string;
    rating?: number;
    description: string;
    variant?: 'default' | 'featured';
}

export default function PlaceCard({
    id,
    title,
    location,
    category,
    imageUrl,
    rating = 4.5,
    description,
    variant = 'default',
}: PlaceCardProps) {
    const isFeatured = variant === 'featured';

    return (
        <Link
            href={`/places/${id}`}
            className={`flex flex-col gap-3 group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border p-3 h-full ${
                isFeatured
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
            }`}
        >
            <div className="w-full aspect-video rounded-lg relative overflow-hidden bg-slate-200 dark:bg-slate-700">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                />
                {isFeatured && <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-10">
                    <span className="material-symbols-outlined text-primary text-[16px] font-variation-fill">star</span>
                    <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                </div>
            </div>
            <div className="px-1 flex-1 flex flex-col">
                <h3
                    className={`text-lg font-bold transition-colors line-clamp-1 ${
                        isFeatured
                            ? 'text-white group-hover:text-primary'
                            : 'text-slate-900 dark:text-white group-hover:text-primary'
                    }`}
                >
                    {title}
                </h3>
                <div
                    className={`flex items-center text-sm mt-1 gap-1 ${
                        isFeatured ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{location}</span>
                    <span className="mx-1 shrink-0">•</span>
                    <span className="whitespace-nowrap">{category}</span>
                </div>
                <p className={`text-sm mt-2 line-clamp-2 ${isFeatured ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {description}
                </p>
            </div>
        </Link>
    );
}
