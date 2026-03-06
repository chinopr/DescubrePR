-- DescubrePR Minimum Viable Product Schema

-- 1. Profiles Table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  nombre text not null,
  email text not null,
  rol text check (rol in ('user', 'business', 'admin')) default 'user',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

-- 2. Businesses Table
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  descripcion text,
  telefono text,
  whatsapp text,
  instagram text,
  website text,
  address_text text,
  municipio text not null,
  lat double precision,
  lng double precision,
  horarios jsonb,
  categorias text[] default '{}',
  verificado boolean default false,
  estado text check (estado in ('draft', 'pending', 'published', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.businesses enable row level security;

-- 3. Places Table (Beaches, Rivers, Forests, etc.)
create table public.places (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  municipio text not null,
  lat double precision,
  lng double precision,
  address_text text,
  categorias text[] default '{}',
  costo text check (costo in ('free', 'paid', 'varies')) default 'free',
  horarios jsonb,
  fotos text[] default '{}',
  estado text check (estado in ('pending', 'published', 'rejected')) default 'pending',
  fuente text check (fuente in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.places enable row level security;

-- 4. Events Table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete set null,
  business_id uuid references public.businesses(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  titulo text not null,
  descripcion text,
  start_datetime timestamp with time zone not null,
  end_datetime timestamp with time zone not null,
  municipio text not null,
  lat double precision,
  lng double precision,
  costo numeric(10,2) default 0,
  link text,
  whatsapp text,
  fotos text[] default '{}',
  estado text check (estado in ('pending', 'approved', 'rejected')) default 'pending',
  destacado boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.events enable row level security;

-- 5. Promotions Table
create table public.promotions (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  titulo text not null,
  descripcion text,
  start_date date not null,
  end_date date not null,
  codigo text,
  condiciones text,
  fotos text[] default '{}',
  estado text check (estado in ('pending', 'approved', 'rejected', 'expired')) default 'pending',
  destacado boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.promotions enable row level security;

-- 6. Service Listings Table (Classifieds)
create table public.service_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tipo text check (tipo in ('servicio', 'producto', 'alquiler')) not null,
  titulo text not null,
  descripcion text,
  municipio text not null,
  lat double precision,
  lng double precision,
  precio numeric(10,2),
  telefono text,
  whatsapp text,
  fotos text[] default '{}',
  estado text check (estado in ('pending', 'approved', 'rejected', 'sold')) default 'pending',
  destacado boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.service_listings enable row level security;

-- 7. Favorites Table
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_type text check (target_type in ('place', 'business', 'event', 'promotion', 'service')) not null,
  target_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, target_type, target_id)
);
alter table public.favorites enable row level security;

-- 8. Reports Table (Moderation)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text check (target_type in ('place', 'business', 'event', 'promotion', 'service', 'profile')) not null,
  target_id uuid not null,
  motivo text not null,
  status text check (status in ('pending', 'reviewed', 'resolved', 'dismissed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reports enable row level security;

-- Function to handle user creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, email, avatar_url, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    cast(coalesce(new.raw_user_meta_data->>'role', 'user') as text)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- RLS POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);
create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id);

-- Businesses
create policy "Published businesses viewable by everyone."
  on businesses for select using (estado = 'published');
create policy "Users can view their own businesses, regardless of status."
  on businesses for select using (auth.uid() = owner_id);
create policy "A user can create a business."
  on businesses for insert with check (auth.uid() = owner_id);
create policy "A user can update their own business."
  on businesses for update using (auth.uid() = owner_id);
create policy "A user can delete their own business."
  on businesses for delete using (auth.uid() = owner_id);

-- Places
create policy "Published places viewable by everyone."
  on places for select using (estado = 'published');
create policy "Authenticated users can create places (starts pending)."
  on places for insert with check (auth.role() = 'authenticated');
  
-- Events
create policy "Approved events viewable by everyone."
  on events for select using (estado = 'approved');
create policy "Owners can view their own events."
  on events for select using (auth.uid() = created_by);
create policy "Authenticated users can create events."
  on events for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own events."
  on events for update using (auth.uid() = created_by);
create policy "Users can delete their own events."
  on events for delete using (auth.uid() = created_by);

-- Promotions
create policy "Approved promotions viewable by everyone."
  on promotions for select using (estado = 'approved');
create policy "Business owners can view their own promos."
  on promotions for select using (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  );
create policy "Business owners can create promos."
  on promotions for insert with check (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  );
create policy "Business owners can update their promos."
  on promotions for update using (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  );

-- Service Listings
create policy "Approved service listings viewable by everyone."
  on service_listings for select using (estado = 'approved');
create policy "Owners can view their own listings."
  on service_listings for select using (auth.uid() = user_id);
create policy "A user can create a service listing."
  on service_listings for insert with check (auth.uid() = user_id);
create policy "A user can update their own service listing."
  on service_listings for update using (auth.uid() = user_id);
create policy "A user can delete their own service listing."
  on service_listings for delete using (auth.uid() = user_id);

-- Favorites
create policy "Users can view their own favorites."
  on favorites for select using (auth.uid() = user_id);
create policy "Users can insert their own favorites."
  on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete their own favorites."
  on favorites for delete using (auth.uid() = user_id);

-- Reports
create policy "Users can insert reports."
  on reports for insert with check (auth.role() = 'authenticated');
create policy "Users can view their own reports."
  on reports for select using (auth.uid() = reporter_id);

-- Storage bucket for uploads (public)
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);

-- Storage RLS
create policy "Public read access to uploads" 
on storage.objects for select using ( bucket_id = 'uploads' );

create policy "Authenticated users can upload" 
on storage.objects for insert with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

create policy "Users can update own uploads" 
on storage.objects for update using ( bucket_id = 'uploads' and auth.uid() = owner);

create policy "Users can delete own uploads" 
on storage.objects for delete using ( bucket_id = 'uploads' and auth.uid() = owner);
