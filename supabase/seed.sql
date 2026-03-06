-- Seed Data for DescubrePR MVP

-- We need a dummy user to be the owner for seed businesses
-- Note: User MUST be created via Auth first to have an entry in auth.users.
-- Since this is a direct SQL seed, we'll insert a mock auth user (NOT RECOMMENDED for production, but okay for local seed)

do $$
declare
  mock_admin_id uuid := '00000000-0000-0000-0000-000000000001';
  business_1_id uuid := gen_random_uuid();
  business_2_id uuid := gen_random_uuid();
  place_1_id uuid := gen_random_uuid();
  place_2_id uuid := gen_random_uuid();
begin
  -- 1. Insert mock admin user into auth.users (requires bypassing some auth logic if on hosted, but works on local)
  -- For a hosted project, we just insert into profiles and assume constraints are relaxed or we've created a user via API.
  -- To be safe, we will just insert into profiles directly if constraint allows, but fk prevents it.
  -- Safe approach: Let's assume the user will sign up. We'll leave the seed for places which don't strictly require an owner initially.
  
  -- Insert Places (Places don't require an owner)
  insert into public.places (id, nombre, descripcion, municipio, lat, lng, categorias, costo, estado)
  values 
  (
    place_1_id,
    'Playa Flamenco',
    'Hermosa playa de arena blanca y aguas cristalinas, reconocida mundialmente.',
    'Culebra',
    18.3283,
    -65.3186,
    array['playa', 'familia'],
    'free',
    'published'
  ),
  (
    place_2_id,
    'El Yunque',
    'El único bosque lluvioso tropical en el sistema forestal de los EE. UU.',
    'Rio Grande',
    18.3155,
    -65.7951,
    array['bosque', 'hiking'],
    'free',
    'published'
  ),
  (
    gen_random_uuid(),
    'Cueva Ventana',
    'Cueva escénica que ofrece vistas espectaculares del valle de Arecibo.',
    'Arecibo',
    18.3751,
    -66.6923,
    array['cueva', 'aventura'],
    'paid',
    'published'
  ),
  (
    gen_random_uuid(),
    'Viejo San Juan',
    'Ciudad colonial histórica con calles adoquinadas y colorida arquitectura española.',
    'San Juan',
    18.4655,
    -66.1167,
    array['historia', 'ciudad'],
    'free',
    'published'
  ),
  (
    gen_random_uuid(),
    'Bahía Bioluminiscente Mosquito',
    'Una de las bahías bioluminiscentes más brillantes del mundo.',
    'Vieques',
    18.1026,
    -65.4475,
    array['naturaleza', 'tour'],
    'paid',
    'published'
  );

  -- We won't insert businesses/events/promos here because they require a valid owner_id pointing to auth.users
  -- We'll create those manually via the app UI once we register a user to ensure data integrity.
  
end $$;
