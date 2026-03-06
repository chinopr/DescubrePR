'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Explore', href: '/', icon: 'travel_explore' },
        { name: 'Map', href: '/map', icon: 'map' },
        { name: 'Events', href: '/events', icon: 'event' },
        { name: 'Promos', href: '/promos', icon: 'local_offer' },
        { name: 'Services', href: '/services', icon: 'home_repair_service' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around items-center h-16 pb-safe z-50">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <span className={`material-symbols-outlined ${isActive ? 'font-variation-fill' : ''}`}>{item.icon}</span>
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
