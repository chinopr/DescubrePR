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

-- 8. Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  titulo text not null,
  mensaje text not null,
  leida boolean default false not null,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.notifications enable row level security;

-- 9. Subscriptions Table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan_id text check (plan_id in ('basico', 'pro', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_checkout_session_id text,
  status text check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')) default 'incomplete',
  cancel_at_period_end boolean default false not null,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.subscriptions enable row level security;

-- 10. Push Subscriptions Table
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  expiration_time bigint,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.push_subscriptions enable row level security;

-- 11. Reports Table (Moderation)
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

-- 12. Admin Audit Logs
create table public.admin_audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb default '{}'::jsonb not null,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.admin_audit_logs enable row level security;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and rol = 'admin'
  );
$$;

create or replace function public.guard_profile_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  if new.id <> auth.uid() then
    raise exception 'Not allowed';
  end if;

  new.id := old.id;
  new.email := old.email;
  new.rol := old.rol;
  new.created_at := old.created_at;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.guard_business_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.owner_id := auth.uid();
    if new.estado not in ('draft', 'pending') then
      new.estado := 'pending';
    end if;
    new.verificado := false;
  else
    new.owner_id := old.owner_id;
    new.estado := old.estado;
    new.verificado := old.verificado;
    new.created_at := old.created_at;
  end if;

  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.guard_place_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  new.estado := 'pending';
  new.fuente := 'user';
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.guard_event_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.estado := 'pending';
    new.destacado := false;
  else
    new.created_by := old.created_by;
    new.estado := old.estado;
    new.destacado := old.destacado;
    new.business_id := old.business_id;
    new.place_id := old.place_id;
    new.created_at := old.created_at;
  end if;

  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.guard_promotion_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.estado := 'pending';
    new.destacado := false;
  else
    new.business_id := old.business_id;
    new.estado := old.estado;
    new.destacado := old.destacado;
    new.created_at := old.created_at;
  end if;

  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.guard_service_listing_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.estado := 'pending';
    new.destacado := false;
  else
    new.user_id := old.user_id;
    new.estado := old.estado;
    new.destacado := old.destacado;
    new.created_at := old.created_at;
  end if;

  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

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
    case
      when coalesce(new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'rol') = 'business' then 'business'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger on_profiles_before_update
  before update on public.profiles
  for each row execute procedure public.guard_profile_write();

create trigger on_businesses_before_write
  before insert or update on public.businesses
  for each row execute procedure public.guard_business_write();

create trigger on_places_before_write
  before insert or update on public.places
  for each row execute procedure public.guard_place_write();

create trigger on_events_before_write
  before insert or update on public.events
  for each row execute procedure public.guard_event_write();

create trigger on_promotions_before_write
  before insert or update on public.promotions
  for each row execute procedure public.guard_promotion_write();

create trigger on_service_listings_before_write
  before insert or update on public.service_listings
  for each row execute procedure public.guard_service_listing_write();


-- RLS POLICIES

-- Profiles
create policy "Users can view own profile."
  on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles."
  on profiles for select using (public.is_admin());
create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins can update profiles."
  on profiles for update using (public.is_admin()) with check (public.is_admin());

-- Businesses
create policy "Published businesses viewable by everyone."
  on businesses for select using (estado = 'published');
create policy "Users can view their own businesses, regardless of status."
  on businesses for select using (auth.uid() = owner_id);
create policy "A user can create a business."
  on businesses for insert with check (
    auth.uid() = owner_id
    and estado in ('draft', 'pending')
    and verificado = false
  );
create policy "A user can update their own business."
  on businesses for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "A user can delete their own business."
  on businesses for delete using (auth.uid() = owner_id);

-- Places
create policy "Public can view approved places"
  on places for select using (estado = any (array['approved', 'published']));
create policy "Admins can view all places"
  on places for select using (public.is_admin());
create policy "Admins can insert places"
  on places for insert with check (public.is_admin());
create policy "Admins can update places"
  on places for update using (public.is_admin());
create policy "Admins can delete places"
  on places for delete using (public.is_admin());
  
-- Events
create policy "Approved events viewable by everyone."
  on events for select using (estado = 'approved');
create policy "Owners can view their own events."
  on events for select using (auth.uid() = created_by);
create policy "Authenticated users can create events."
  on events for insert with check (
    auth.role() = 'authenticated'
    and auth.uid() = created_by
    and estado = 'pending'
    and destacado = false
  );
create policy "Users can update their own events."
  on events for update using (auth.uid() = created_by) with check (auth.uid() = created_by);
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
    estado = 'pending'
    and destacado = false
    and exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  );
create policy "Business owners can update their promos."
  on promotions for update using (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  ) with check (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  );

-- Service Listings
create policy "Approved service listings viewable by everyone."
  on service_listings for select using (estado = 'approved');
create policy "Owners can view their own listings."
  on service_listings for select using (auth.uid() = user_id);
create policy "A user can create a service listing."
  on service_listings for insert with check (
    auth.uid() = user_id
    and estado = 'pending'
    and destacado = false
  );
create policy "A user can update their own service listing."
  on service_listings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "A user can delete their own service listing."
  on service_listings for delete using (auth.uid() = user_id);

-- Favorites
create policy "Users can view their own favorites."
  on favorites for select using (auth.uid() = user_id);
create policy "Users can insert their own favorites."
  on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete their own favorites."
  on favorites for delete using (auth.uid() = user_id);

-- Notifications
create policy "Users can view their own notifications."
  on notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications."
  on notifications for update using (auth.uid() = user_id);
create policy "Admins can insert notifications."
  on notifications for insert with check (
    public.is_admin()
  );

-- Subscriptions
create policy "Users can view their own subscriptions."
  on subscriptions for select using (auth.uid() = user_id);

-- Push subscriptions
create policy "Users can view their own push subscriptions."
  on push_subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert their own push subscriptions."
  on push_subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update their own push subscriptions."
  on push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own push subscriptions."
  on push_subscriptions for delete using (auth.uid() = user_id);
create policy "Admins can view push subscriptions."
  on push_subscriptions for select using (public.is_admin());

-- Reports
create policy "Users can insert reports."
  on reports for insert with check (auth.role() = 'authenticated');
create policy "Users can view their own reports."
  on reports for select using (auth.uid() = reporter_id);
create policy "Admins can view reports."
  on reports for select using (public.is_admin());

-- Admin audit logs
create policy "Admins can view audit logs."
  on admin_audit_logs for select using (public.is_admin());
create policy "Admins can insert audit logs."
  on admin_audit_logs for insert with check (public.is_admin());

-- Storage bucket for media (public)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage RLS
create policy "Public read access to media" 
on storage.objects for select using ( bucket_id = 'media' );

create policy "Authenticated users can upload media" 
on storage.objects for insert with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

create policy "Users can update own media" 
on storage.objects for update using ( bucket_id = 'media' and auth.uid() = owner);

create policy "Users can delete own media" 
on storage.objects for delete using ( bucket_id = 'media' and auth.uid() = owner);
