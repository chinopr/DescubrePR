'use client';

import { useSyncExternalStore } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Fix Leaflet icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

export const defaultIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

// Component to dynamically update map view
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

interface MapCoordinate {
    id: string;
    lat: number;
    lng: number;
    title: string;
    category: string;
    municipio?: string;
    url: string;
}

interface MapViewProps {
    markers: MapCoordinate[];
    center?: [number, number];
    zoom?: number;
    className?: string;
    userLocation?: [number, number] | null;
}

export default function MapView({
    markers,
    center = [18.2208, -66.5901], // Center of Puerto Rico
    zoom = 9,
    className = "h-[400px] w-full rounded-xl z-0 relative",
    userLocation = null,
}: MapViewProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    if (!mounted) {
        return (
            <div className={`${className} bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className={className}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%', zIndex: 0, borderRadius: 'inherit' }}
            >
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={[marker.lat, marker.lng]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <div className="text-center min-w-40">
                                <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{marker.category}</p>
                                {marker.municipio && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{marker.municipio}</p>
                                )}
                                <div className="flex items-center justify-center gap-2">
                                    <Link
                                        href={marker.url}
                                        className="text-white bg-primary hover:bg-primary-hover transition-colors px-3 py-1 rounded-full text-xs inline-block"
                                    >
                                        Ver Detalle
                                    </Link>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-primary/10 dark:hover:bg-primary/15 hover:border-primary/40 transition-colors px-3 py-1 rounded-full text-xs inline-block"
                                    >
                                        Cómo llegar
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {userLocation && (
                    <CircleMarker
                        center={userLocation}
                        radius={10}
                        pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.9, weight: 3 }}
                    >
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-sm">Tu ubicación</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Usando geolocalización del navegador</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}
            </MapContainer>
        </div>
    );
}
