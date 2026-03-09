'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

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

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function createPopupMarkup(marker: MapCoordinate) {
    const title = escapeHtml(marker.title);
    const category = escapeHtml(marker.category);
    const municipio = marker.municipio ? `<p class="text-xs text-slate-400 mb-3">${escapeHtml(marker.municipio)}</p>` : '';

    return `
        <div class="text-center min-w-40">
            <h3 class="font-bold text-sm mb-1">${title}</h3>
            <p class="text-xs text-slate-500">${category}</p>
            ${municipio}
            <div class="flex items-center justify-center gap-2">
                <a href="${marker.url}" class="text-white bg-[#ec7f13] hover:bg-[#d67211] transition-colors px-3 py-1 rounded-full text-xs inline-block">
                    Ver Detalle
                </a>
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-slate-900 border border-slate-300 hover:bg-orange-50 transition-colors px-3 py-1 rounded-full text-xs inline-block"
                >
                    Cómo llegar
                </a>
            </div>
        </div>
    `;
}

function getClusterSize(count: number) {
    if (count >= 20) return 'large';
    if (count >= 8) return 'medium';
    return 'small';
}

type MarkerClusterGroup = L.MarkerClusterGroup;

function ClusteredMarkers({
    markers,
    selectedMarkerId,
    onSelectMarker,
}: {
    markers: MapCoordinate[];
    selectedMarkerId?: string | null;
    onSelectMarker?: (markerId: string) => void;
}) {
    const map = useMap();
    const clusterGroupRef = useRef<MarkerClusterGroup | null>(null);
    const markerRefs = useRef(new Map<string, L.Marker>());

    useEffect(() => {
        const markerClusterGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 50,
            disableClusteringAtZoom: 14,
            iconCreateFunction(cluster) {
                const count = cluster.getChildCount();
                const size = getClusterSize(count);
                return L.divIcon({
                    html: `<span class="map-cluster-badge" data-size="${size}">${count}</span>`,
                    className: 'map-cluster-icon',
                    iconSize: size === 'large' ? [54, 54] : size === 'medium' ? [48, 48] : [44, 44],
                });
            },
        });

        markerRefs.current = new Map();

        for (const marker of markers) {
            const leafletMarker = L.marker([marker.lat, marker.lng], { icon: defaultIcon });
            leafletMarker.bindPopup(createPopupMarkup(marker), { maxWidth: 220 });
            leafletMarker.on('click', () => onSelectMarker?.(marker.id));
            markerRefs.current.set(marker.id, leafletMarker);
            markerClusterGroup.addLayer(leafletMarker);
        }

        clusterGroupRef.current = markerClusterGroup;
        map.addLayer(markerClusterGroup);

        return () => {
            map.removeLayer(markerClusterGroup);
            clusterGroupRef.current = null;
            markerRefs.current.clear();
        };
    }, [map, markers, onSelectMarker]);

    useEffect(() => {
        if (!selectedMarkerId || !clusterGroupRef.current) return;

        const selectedMarker = markerRefs.current.get(selectedMarkerId);
        if (!selectedMarker) return;

        clusterGroupRef.current.zoomToShowLayer(selectedMarker, () => {
            selectedMarker.openPopup();
        });
    }, [selectedMarkerId]);

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
    selectedMarkerId?: string | null;
    onSelectMarker?: (markerId: string) => void;
}

export default function MapView({
    markers,
    center = [18.2208, -66.5901], // Center of Puerto Rico
    zoom = 9,
    className = "h-[400px] w-full rounded-xl z-0 relative",
    userLocation = null,
    selectedMarkerId = null,
    onSelectMarker,
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
                <ClusteredMarkers
                    markers={markers}
                    selectedMarkerId={selectedMarkerId}
                    onSelectMarker={onSelectMarker}
                />
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
