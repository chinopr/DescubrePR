'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import SearchBar from '@/components/ui/SearchBar';
import { createClient } from '@/lib/supabase/client';

const MapView = dynamic(() => import('@/components/ui/MapView'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-slate-500">Cargando mapa...</p>
        </div>
    )
});

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    category: string;
    url: string;
}

function MapContent() {
    const searchParams = useSearchParams();
    const initialPueblo = searchParams.get('pueblo') || '';
    const initialQuery = searchParams.get('q') || '';
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchMarkers() {
            const [placesRes, businessesRes] = await Promise.all([
                supabase
                    .from('places')
                    .select('id, nombre, municipio, lat, lng, categorias')
                    .eq('estado', 'published')
                    .not('lat', 'is', null),
                supabase
                    .from('businesses')
                    .select('id, nombre, municipio, lat, lng, categorias')
                    .eq('estado', 'published')
                    .not('lat', 'is', null),
            ]);

            const placeMarkers: MapMarker[] = (placesRes.data || []).map(p => ({
                id: p.id,
                lat: p.lat!,
                lng: p.lng!,
                title: p.nombre,
                category: p.categorias[0] || 'Lugar',
                url: `/places/${p.id}`,
            }));

            const businessMarkers: MapMarker[] = (businessesRes.data || []).map(b => ({
                id: b.id,
                lat: b.lat!,
                lng: b.lng!,
                title: b.nombre,
                category: b.categorias[0] || 'Negocio',
                url: `/businesses/${b.id}`,
            }));

            setMarkers([...placeMarkers, ...businessMarkers]);
            setLoading(false);
        }
        fetchMarkers();
    }, [supabase]);

    const center: [number, number] = useMemo(() => {
        if (markers.length === 0) return [18.2208, -66.5901];
        const lat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
        const lng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
        return [lat, lng];
    }, [markers]);

    return (
        <main className="flex-1 flex flex-col md:flex-row relative h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] pb-16 md:pb-0">

            <div className="w-full md:w-96 lg:w-[400px] h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10 shadow-lg shrink-0 absolute md:relative bottom-0 transition-transform duration-300 transform translate-y-[calc(100%-80px)] md:translate-y-0 pb-16 md:pb-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 md:rounded-tr-none rounded-t-2xl z-20 shadow-sm cursor-pointer md:cursor-auto">
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 md:hidden"></div>
                    <h2 className="text-xl font-bold mb-4">Filtrar Mapa</h2>
                    <SearchBar
                        initialPueblo={initialPueblo}
                        initialQuery={initialQuery}
                        className="!shadow-none border border-slate-200 dark:border-slate-700 w-full"
                    />
                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        <span className="material-symbols-outlined">my_location</span>
                        Buscar Cerca de Mí
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider text-sm">
                        {loading ? 'Cargando...' : `Resultados (${markers.length})`}
                    </h3>

                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)
                    ) : markers.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No hay lugares con coordenadas.</p>
                    ) : (
                        markers.map(marker => (
                            <a
                                key={marker.id}
                                href={marker.url}
                                className="flex flex-col p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold group-hover:text-primary transition-colors">{marker.title}</h4>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-sm">chevron_right</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <span className="material-symbols-outlined text-[16px]">category</span>
                                    {marker.category}
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 relative h-full w-full z-0 bg-slate-100 dark:bg-slate-800">
                {!loading && (
                    <MapView
                        markers={markers}
                        center={center}
                        zoom={8}
                        className="w-full h-full"
                    />
                )}
            </div>
        </main>
    );
}

export default function MapPage() {
    return (
        <div className="flex min-h-screen w-full flex-col group/design-root overflow-hidden">
            <Header />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-800"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <MapContent />
            </Suspense>
            <MobileNav />
        </div>
    );
}
