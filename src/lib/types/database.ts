// Types matching the Supabase schema in supabase/schema.sql

export type UserRole = 'user' | 'business' | 'admin';
export type ContentStatus = 'draft' | 'pending' | 'published' | 'approved' | 'rejected' | 'expired' | 'sold';
export type PlaceCost = 'free' | 'paid' | 'varies';
export type ListingType = 'servicio' | 'producto' | 'alquiler';
export type FavoriteTarget = 'place' | 'business' | 'event' | 'promotion' | 'service';
export type ReportTarget = FavoriteTarget | 'profile';
export type PlaceSource = 'user' | 'admin';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused';

export interface Profile {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  nombre: string;
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  address_text: string | null;
  municipio: string;
  lat: number | null;
  lng: number | null;
  horarios: Record<string, string> | null;
  categorias: string[];
  verificado: boolean;
  estado: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  nombre: string;
  descripcion: string | null;
  municipio: string;
  lat: number | null;
  lng: number | null;
  address_text: string | null;
  categorias: string[];
  costo: PlaceCost;
  horarios: Record<string, string> | null;
  fotos: string[];
  estado: ContentStatus;
  fuente: PlaceSource;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  created_by: string | null;
  business_id: string | null;
  place_id: string | null;
  titulo: string;
  descripcion: string | null;
  start_datetime: string;
  end_datetime: string;
  municipio: string;
  lat: number | null;
  lng: number | null;
  costo: number;
  link: string | null;
  whatsapp: string | null;
  fotos: string[];
  estado: ContentStatus;
  destacado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  business_id: string;
  titulo: string;
  descripcion: string | null;
  start_date: string;
  end_date: string;
  codigo: string | null;
  condiciones: string | null;
  fotos: string[];
  estado: ContentStatus;
  destacado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceListing {
  id: string;
  user_id: string;
  tipo: ListingType;
  titulo: string;
  descripcion: string | null;
  municipio: string;
  lat: number | null;
  lng: number | null;
  precio: number | null;
  telefono: string | null;
  whatsapp: string | null;
  fotos: string[];
  estado: ContentStatus;
  destacado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  target_type: FavoriteTarget;
  target_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_checkout_session_id: string | null;
  status: SubscriptionStatus;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  expiration_time: number | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  target_type: ReportTarget;
  target_id: string;
  motivo: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Extended types with relations
export interface EventWithBusiness extends Event {
  business: Pick<Business, 'id' | 'nombre'> | null;
}

export interface PromotionWithBusiness extends Promotion {
  business: Pick<Business, 'id' | 'nombre'>;
}
