export const CATEGORIES = [
    { id: 'playas', name: 'Playas', icon: 'beach_access' },
    { id: 'chinchorros', name: 'Chinchorros', icon: 'local_dining' },
    { id: 'hiking', name: 'Hiking', icon: 'hiking' },
    { id: 'restaurants', name: 'Restaurants', icon: 'restaurant' },
    { id: 'nightlife', name: 'Nightlife', icon: 'nightlife' },
    { id: 'historical', name: 'Historical', icon: 'castle' },
    { id: 'rivers', name: 'Ríos/Charcos', icon: 'waves' },
    { id: 'viewpoints', name: 'Miradores', icon: 'landscape' },
    { id: 'museums', name: 'Museos', icon: 'museum' },
    { id: 'services', name: 'Servicios', icon: 'home_repair_service' },
] as const;

export const MUNICIPIOS = [
    "Adjuntas", "Aguada", "Aguadilla", "Aguas Buenas", "Aibonito", "Añasco", "Arecibo", "Arroyo", "Barceloneta", "Barranquitas",
    "Bayamón", "Cabo Rojo", "Caguas", "Camuy", "Canóvanas", "Carolina", "Cataño", "Cayey", "Ceiba", "Ciales",
    "Cidra", "Coamo", "Comerío", "Corozal", "Culebra", "Dorado", "Fajardo", "Florida", "Guánica", "Guayama",
    "Guayanilla", "Guaynabo", "Gurabo", "Hatillo", "Hormigueros", "Humacao", "Isabela", "Jayuya", "Juana Díaz", "Juncos",
    "Lajas", "Lares", "Las Marías", "Las Piedras", "Loíza", "Luquillo", "Manatí", "Maricao", "Maunabo", "Mayagüez",
    "Moca", "Morovis", "Naguabo", "Naranjito", "Orocovis", "Patillas", "Peñuelas", "Ponce", "Quebradillas", "Rincón",
    "Río Grande", "Sabana Grande", "Salinas", "San Germán", "San Juan", "San Lorenzo", "San Sebastián", "Santa Isabel", "Toa Alta", "Toa Baja",
    "Trujillo Alto", "Utuado", "Vega Alta", "Vega Baja", "Vieques", "Villalba", "Yabucoa", "Yauco"
] as const;

export const ROLES = {
    USER: 'user',
    BUSINESS: 'business',
    ADMIN: 'admin'
} as const;

export const STATUS = {
    PENDING: 'pending',
    PUBLISHED: 'published',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DRAFT: 'draft'
} as const;
