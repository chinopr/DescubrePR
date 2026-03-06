import Link from 'next/link';

interface PromoCardProps {
    id: string;
    title: string;
    businessName: string;
    location: string;
    discountBadge?: string;
    imageUrl: string;
}

export default function PromoCard({ id, title, businessName, location, discountBadge = 'PROMO', imageUrl }: PromoCardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-shadow">
            {discountBadge && (
                <div className="absolute top-0 right-0 z-10 bg-primary text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                    {discountBadge}
                </div>
            )}

            <div className="relative">
                <div
                    className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg relative overflow-hidden mb-3"
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
            </div>

            <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 truncate">
                {businessName} • {location}
            </p>

            <Link href={`/promos/${id}`} className="block w-full text-center bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 rounded-md transition-colors text-sm">
                Ver Detalle
            </Link>
        </div>
    );
}
