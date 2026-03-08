'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando mapa...</p>
        </div>
    )
});

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    category: string;
    municipio: string;
    type: 'place' | 'business';
    url: string;
}

function normalizeText(value: string) {
    return value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
}

function getDistanceKm(from: [number, number], to: [number, number]) {
    const [lat1, lng1] = from;
    const [lat2, lng2] = to;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

function MapContent() {
    const searchParams = useSearchParams();
    const initialPueblo = searchParams.get('pueblo') || '';
    const initialQuery = searchParams.get('q') || '';
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        let cancelled = false;

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

            if (cancelled) return;

            const placeMarkers: MapMarker[] = (placesRes.data || []).map(p => ({
                id: p.id,
                lat: p.lat!,
                lng: p.lng!,
                title: p.nombre,
                category: p.categorias[0] || 'Lugar',
                municipio: p.municipio,
                type: 'place',
                url: `/places/${p.id}`,
            }));

            const businessMarkers: MapMarker[] = (businessesRes.data || []).map(b => ({
                id: b.id,
                lat: b.lat!,
                lng: b.lng!,
                title: b.nombre,
                category: b.categorias[0] || 'Negocio',
                municipio: b.municipio,
                type: 'business',
                url: `/businesses/${b.id}`,
            }));

            setMarkers([...placeMarkers, ...businessMarkers]);
            setLoading(false);
        }

        void fetchMarkers();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    const filteredMarkers = useMemo(() => {
        const normalizedQuery = normalizeText(initialQuery);
        const normalizedPueblo = normalizeText(initialPueblo);

        return markers.filter((marker) => {
            const matchesPueblo = !normalizedPueblo || normalizeText(marker.municipio) === normalizedPueblo;
            const haystack = normalizeText(`${marker.title} ${marker.category} ${marker.municipio} ${marker.type}`);
            const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
            return matchesPueblo && matchesQuery;
        });
    }, [initialPueblo, initialQuery, markers]);

    const visibleMarkers = useMemo(() => {
        const withDistance = filteredMarkers.map((marker) => ({
            marker,
            distanceKm: userLocation ? getDistanceKm(userLocation, [marker.lat, marker.lng]) : null,
        }));

        if (userLocation) {
            withDistance.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        }

        return withDistance;
    }, [filteredMarkers, userLocation]);

    const activeMarker = useMemo(() => {
        if (!selectedMarkerId) return visibleMarkers[0]?.marker || null;
        return visibleMarkers.find(({ marker }) => marker.id === selectedMarkerId)?.marker || visibleMarkers[0]?.marker || null;
    }, [selectedMarkerId, visibleMarkers]);

    const center: [number, number] = useMemo(() => {
        if (userLocation) return userLocation;
        if (activeMarker) return [activeMarker.lat, activeMarker.lng];
        if (filteredMarkers.length === 0) return [18.2208, -66.5901];
        const lat = filteredMarkers.reduce((sum, m) => sum + m.lat, 0) / filteredMarkers.length;
        const lng = filteredMarkers.reduce((sum, m) => sum + m.lng, 0) / filteredMarkers.length;
        return [lat, lng];
    }, [activeMarker, filteredMarkers, userLocation]);

    const zoom = userLocation ? 12 : activeMarker ? 11 : 8;

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            setGeoError('Tu navegador no soporta geolocalización.');
            return;
        }

        setGeoLoading(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
                setGeoLoading(false);
            },
            () => {
                setGeoError('No pudimos obtener tu ubicación. Revisa los permisos del navegador.');
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

    return (
        <main className="flex-1 flex flex-col md:flex-row relative h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] pb-16 md:pb-0">
            <div className="w-full md:w-96 lg:w-[400px] h-full flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 z-10 shadow-lg shrink-0 absolute md:relative bottom-0 transition-transform duration-300 transform translate-y-[calc(100%-80px)] md:translate-y-0 pb-16 md:pb-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 sticky top-0 md:rounded-tr-none rounded-t-2xl z-20 shadow-sm cursor-pointer md:cursor-auto">
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 md:hidden"></div>
                    <h2 className="text-xl font-bold mb-4 !text-slate-900 dark:!text-slate-100">Filtrar Mapa</h2>
                    <SearchBar
                        initialPueblo={initialPueblo}
                        initialQuery={initialQuery}
                        actionPath="/map"
                        className="!shadow-none border border-slate-200 dark:border-slate-700 w-full"
                    />
                    <button
                        onClick={handleLocateMe}
                        disabled={geoLoading}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined">my_location</span>
                        {geoLoading ? 'Ubicando...' : userLocation ? 'Centrado en ti' : 'Buscar Cerca de Mí'}
                    </button>
                    {geoError && (
                        <p className="mt-3 text-sm text-red-500">{geoError}</p>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <h3 className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">
                        {loading ? 'Cargando...' : `Resultados (${visibleMarkers.length})`}
                    </h3>
                    {(initialQuery || initialPueblo || userLocation) && !loading && (
                        <div className="flex flex-wrap gap-2">
                            {initialPueblo && (
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Pueblo: {initialPueblo}
                                </span>
                            )}
                            {initialQuery && (
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Búsqueda: {initialQuery}
                                </span>
                            )}
                            {userLocation && (
                                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                                    Ordenado por cercanía
                                </span>
                            )}
                        </div>
                    )}

                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)
                    ) : visibleMarkers.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No hay resultados para esos filtros en el mapa.</p>
                    ) : (
                        visibleMarkers.map(({ marker, distanceKm }) => (
                            <div
                                key={marker.id}
                                className={`flex flex-col p-3 rounded-lg border transition-all ${
                                    selectedMarkerId === marker.id
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-md'
                                }`}
                            >
                                <button
                                    onClick={() => setSelectedMarkerId(marker.id)}
                                    className="text-left group"
                                >
                                    <div className="flex justify-between items-start mb-1 gap-3">
                                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{marker.title}</h4>
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-sm">my_location</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                                        <span className="material-symbols-outlined text-[16px]">category</span>
                                        {marker.category}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                        <span className="material-symbols-outlined text-[16px]">location_city</span>
                                        {marker.municipio}
                                        {distanceKm !== null && (
                                            <span className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-300">
                                                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <div className="mt-3 flex gap-2">
                                    <Link
                                        href={marker.url}
                                        className="flex-1 text-center rounded-lg bg-primary text-white text-sm font-medium py-2 px-3 hover:bg-primary-hover transition-colors"
                                    >
                                        Ver detalle
                                    </Link>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cómo llegar
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 relative h-full w-full z-0 bg-slate-100 dark:bg-slate-800">
                {!loading && (
                    <MapView
                        markers={visibleMarkers.map(({ marker }) => marker)}
                        center={center}
                        zoom={zoom}
                        userLocation={userLocation}
                        className="w-full h-full"
                    />
                )}
            </div>
        </main>
    );
}

export default function MapPageClient() {
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
