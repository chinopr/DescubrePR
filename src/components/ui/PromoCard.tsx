import Link from 'next/link';
import Image from 'next/image';

interface PromoCardProps {
    id: string;
    title: string;
    businessName: string;
    location: string;
    discountBadge?: string;
    imageUrl: string;
    variant?: 'default' | 'featured';
}

export default function PromoCard({
    id,
    title,
    businessName,
    location,
    discountBadge = 'PROMO',
    imageUrl,
    variant = 'default',
}: PromoCardProps) {
    const isFeatured = variant === 'featured';

    return (
        <div
            className={`rounded-lg p-4 shadow-sm border relative overflow-hidden group hover:shadow-md transition-shadow ${
                isFeatured
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
            }`}
        >
            {discountBadge && (
                <div className="absolute top-0 right-0 z-10 bg-primary text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                    {discountBadge}
                </div>
            )}

            <div className="relative">
                <div className="w-full aspect-[4/3] rounded-lg relative overflow-hidden mb-3 bg-slate-200 dark:bg-slate-700">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isFeatured && <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />}
                </div>
            </div>

            <h4
                className={`font-bold text-lg mb-1 transition-colors line-clamp-1 ${
                    isFeatured
                        ? 'text-white group-hover:text-primary'
                        : 'text-slate-900 dark:text-white group-hover:text-primary'
                }`}
            >
                {title}
            </h4>
            <p className={`text-sm mb-3 truncate ${isFeatured ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                {businessName} • {location}
            </p>

            <Link
                href={`/promos/${id}`}
                className={`block w-full text-center border font-bold py-2 rounded-md transition-colors text-sm ${
                    isFeatured
                        ? 'bg-slate-800 border-slate-700 hover:bg-primary/10 hover:border-primary/40 text-white'
                        : 'bg-slate-100 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 hover:bg-primary/10 dark:hover:bg-primary/15 hover:border-primary/40 text-slate-900 dark:text-slate-100'
                }`}
            >
                Ver Detalle
            </Link>
        </div>
    );
}
