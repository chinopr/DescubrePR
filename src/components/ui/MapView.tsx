'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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
    url: string;
}

interface MapViewProps {
    markers: MapCoordinate[];
    center?: [number, number];
    zoom?: number;
    className?: string;
}

export default function MapView({
    markers,
    center = [18.2208, -66.5901], // Center of Puerto Rico
    zoom = 9,
    className = "h-[400px] w-full rounded-xl z-0 relative"
}: MapViewProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                            <div className="text-center">
                                <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                                <p className="text-xs text-slate-500 mb-2">{marker.category}</p>
                                <a
                                    href={marker.url}
                                    className="text-white bg-primary hover:bg-primary-hover transition-colors px-3 py-1 rounded-full text-xs inline-block"
                                >
                                    Ver Detalle
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
