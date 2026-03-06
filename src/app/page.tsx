'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import SearchBar from '@/components/ui/SearchBar';
import CategoryChips from '@/components/ui/CategoryChips';
import PlaceCard from '@/components/ui/PlaceCard';
import EventCard from '@/components/ui/EventCard';
import PromoCard from '@/components/ui/PromoCard';
import { createClient } from '@/lib/supabase/client';
import type { Place, Event, Promotion } from '@/lib/types/database';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [promos, setPromos] = useState<(Promotion & { businesses?: { nombre: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const placesQuery = supabase
      .from('places')
      .select('*')
      .eq('estado', 'published')
      .order('created_at', { ascending: false })
      .limit(4);

    if (selectedCategory !== 'all') {
      placesQuery.contains('categorias', [selectedCategory]);
    }

    const [placesRes, eventsRes, promosRes] = await Promise.all([
      placesQuery,
      supabase
        .from('events')
        .select('*')
        .eq('estado', 'approved')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(3),
      supabase
        .from('promotions')
        .select('*, businesses(nombre)')
        .eq('estado', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(2),
    ]);

    setPlaces(placesRes.data || []);
    setEvents(eventsRes.data || []);
    setPromos(promosRes.data || []);
    setLoading(false);
  }, [selectedCategory, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const time = date.toLocaleTimeString('es-PR', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday) return `Hoy, ${time}`;
    if (isTomorrow) return `Mañana, ${time}`;
    return date.toLocaleDateString('es-PR', { weekday: 'long', month: 'short', day: 'numeric' }) + `, ${time}`;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden pb-16 md:pb-0">
      <Header />

      <main className="px-4 md:px-10 py-6 md:py-8 flex flex-1 justify-center">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 w-full gap-8">

          {/* HERO SECTION */}
          <section className="@container">
            <div
              className="flex min-h-[300px] md:min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 md:p-8 relative overflow-hidden shadow-lg"
              style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1620982363177-386dbe3eb16b?auto=format&fit=crop&w=2000&q=80")' }}
            >
              <div className="flex flex-col gap-4 text-center z-10 max-w-2xl px-2">
                <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  Discover the Best of Puerto Rico
                </h1>
                <p className="text-white/90 text-base md:text-xl font-medium leading-normal">
                  Find beaches, chinchorros, routes, and more.
                </p>
              </div>
              <SearchBar className="mt-4" />
            </div>
          </section>

          {/* CATEGORIES */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Categories</h2>
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

          {/* MAIN CONTENT SPLIT */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT COL: Featured Places */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Featured Places</h2>
                <a className="text-primary font-medium hover:underline text-sm" href="/map">View all</a>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-64 animate-pulse" />
                  ))}
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <span className="material-symbols-outlined text-5xl mb-2 block">explore</span>
                  <p>No hay lugares publicados en esta categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {places.map(place => (
                    <PlaceCard
                      key={place.id}
                      id={place.id}
                      title={place.nombre}
                      location={place.municipio}
                      category={place.categorias[0] || 'Lugar'}
                      imageUrl={place.fotos[0] || 'https://images.unsplash.com/photo-1620982363177-386dbe3eb16b?auto=format&fit=crop&q=80'}
                      description={place.descripcion || ''}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COL: Sidebar content */}
            <div className="w-full lg:w-80 flex flex-col gap-8">

              {/* EVENTS */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Upcoming</h3>
                  <a className="text-sm text-primary font-medium hover:underline" href="/events">All</a>
                </div>
                <div className="flex flex-col gap-4">
                  {loading ? (
                    [1,2].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />)
                  ) : events.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No hay eventos próximos.</p>
                  ) : (
                    events.map(event => (
                      <EventCard
                        key={event.id}
                        id={event.id}
                        title={event.titulo}
                        dateStr={formatEventDate(event.start_datetime)}
                        location={event.municipio}
                        imageUrl={event.fotos[0] || 'https://images.unsplash.com/photo-1533174000220-db9284bd06b0?auto=format&fit=crop&q=80'}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* PROMOS */}
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 rounded-xl p-4 md:p-5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">local_offer</span>
                  <h3 className="text-xl font-bold">Trending Promos</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {loading ? (
                    <div className="h-24 bg-primary/10 rounded-lg animate-pulse" />
                  ) : promos.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No hay promociones activas.</p>
                  ) : (
                    promos.map(promo => (
                      <PromoCard
                        key={promo.id}
                        id={promo.id}
                        title={promo.titulo}
                        businessName={promo.businesses?.nombre || ''}
                        location=""
                        imageUrl={promo.fotos[0] || 'https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80'}
                      />
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
