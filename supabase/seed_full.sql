-- DescubrePR Full Seed Data
-- Admin user: admin@descubrepr.com / SeedAdmin1234
-- Business user: negocio@descubrepr.com / SeedBusiness1234

do $$
declare
  admin_id uuid := 'a5c9b602-cdef-4bb6-8318-a5750c9d2b1f';
  biz_owner_id uuid := '08ac7454-666d-4931-98b5-c38eb84f4bd5';
  biz1_id uuid := gen_random_uuid();
  biz2_id uuid := gen_random_uuid();
  biz3_id uuid := gen_random_uuid();
  biz4_id uuid := gen_random_uuid();
  biz5_id uuid := gen_random_uuid();
begin

  -- ============================================================
  -- ADDITIONAL PLACES (ya hay 5 del seed original)
  -- ============================================================
  INSERT INTO public.places (nombre, descripcion, municipio, lat, lng, categorias, costo, estado, fotos) VALUES
  ('Charco Azul', 'Piscina natural de aguas cristalinas en medio de la montaña. Ideal para un chapuzón refrescante.', 'Patillas', 18.0127, -66.0137, array['rivers', 'hiking'], 'free', 'published', array['https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=80']),
  ('Playa Sucia (La Playuela)', 'Playa escondida con arena dorada y aguas turquesas, accesible solo caminando. Una joya del suroeste.', 'Cabo Rojo', 17.9327, -67.1934, array['playas', 'hiking'], 'free', 'published', array['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80']),
  ('Bosque Seco de Guanica', 'Reserva de la biosfera UNESCO, hogar de cactus gigantes y aves endémicas.', 'Guanica', 17.9584, -66.8636, array['hiking', 'naturaleza'], 'free', 'published', array['https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80']),
  ('Castillo San Felipe del Morro', 'Fortaleza española del siglo XVI que protegía la bahía de San Juan. Patrimonio de la Humanidad.', 'San Juan', 18.4707, -66.1236, array['historical', 'museums'], 'paid', 'published', array['https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&q=80']),
  ('Lago Dos Bocas', 'Lago rodeado de montañas con paseos en lancha gratis y restaurantes flotantes.', 'Utuado', 18.3259, -66.6825, array['rivers', 'chinchorros'], 'free', 'published', array['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80']),
  ('Faro de Cabo Rojo', 'Icónico faro en los acantilados de piedra caliza con vistas impresionantes al mar Caribe.', 'Cabo Rojo', 17.9319, -67.1956, array['viewpoints', 'historical'], 'free', 'published', array['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80']),
  ('Playa Crash Boat', 'Popular playa con puente colorido, ideal para snorkeling y buceo.', 'Aguadilla', 18.4879, -67.1667, array['playas', 'nightlife'], 'free', 'published', array['https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80']),
  ('Cañon San Cristobal', 'El cañón más profundo del Caribe con cascadas espectaculares. Requiere guía autorizado.', 'Barranquitas', 18.1971, -66.3188, array['hiking', 'rivers'], 'paid', 'published', array['https://images.unsplash.com/photo-1432405972618-c6b0cfba8426?auto=format&fit=crop&q=80']),
  ('Ruta del Lechon - Guavate', 'Legendaria carretera de chinchorros con lechón asado, música en vivo y ambiente boricua.', 'Cayey', 18.1289, -66.0983, array['chinchorros', 'restaurants'], 'varies', 'published', array['https://images.unsplash.com/photo-1544025162-811c7df0e047?auto=format&fit=crop&q=80']),
  ('Observatorio de Arecibo (Mirador)', 'Mirador desde donde se puede ver la estructura del antiguo radiotelescopio. Centro de visitantes abierto.', 'Arecibo', 18.3441, -66.7527, array['museums', 'viewpoints'], 'paid', 'published', array['https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80']);

  -- ============================================================
  -- BUSINESSES
  -- ============================================================
  INSERT INTO public.businesses (id, owner_id, nombre, descripcion, municipio, lat, lng, telefono, whatsapp, instagram, website, address_text, categorias, verificado, estado, horarios) VALUES
  (biz1_id, biz_owner_id, 'Cafe Don Luis', 'Cafe artesanal 100% puertorriqueño desde 1985. Especialidad en postres caseros y comida criolla en un ambiente acogedor y pet-friendly.', 'Yauco', 18.0343, -66.8500, '787-555-0192', '7875550192', 'cafedonluispr', 'https://cafedonluis.com', 'Calle Comercio #12, Yauco PR 00698', array['restaurants', 'chinchorros'], true, 'published', '{"Lunes a Viernes": "7:00 AM - 3:00 PM", "Sabado y Domingo": "8:00 AM - 4:00 PM"}'::jsonb),
  (biz2_id, biz_owner_id, 'East Island Excursions', 'Tours en catamarán a las islas de Culebra e Icacos. Snorkeling, playas vírgenes y atardeceres inolvidables.', 'Fajardo', 18.3358, -65.6523, '787-555-0283', '7875550283', 'eastislandpr', 'https://eastislandexcursions.com', 'Marina Puerto del Rey, Fajardo PR 00738', array['playas', 'tours'], true, 'published', '{"Lunes a Domingo": "7:00 AM - 5:00 PM"}'::jsonb),
  (biz3_id, biz_owner_id, 'La Casita Criolla', 'Restaurante familiar con la mejor mofongo de Puerto Rico. Terraza al aire libre con vista a las montañas.', 'Orocovis', 18.2277, -66.3917, '787-555-0374', '7875550374', 'casitacriollapr', NULL, 'Carr. 143 Km 32.4, Orocovis PR 00720', array['restaurants', 'chinchorros'], false, 'published', '{"Jueves a Domingo": "11:00 AM - 8:00 PM"}'::jsonb),
  (biz4_id, biz_owner_id, 'Rincon Surf School', 'Clases de surf para todos los niveles. Tabla y equipo incluido. Instructores certificados por ISA.', 'Rincon', 18.3408, -67.2518, '787-555-0465', '7875550465', 'rinconsurfschool', 'https://rinconsurfschool.com', 'Playa Sandy Beach, Rincon PR 00677', array['playas', 'tours'], true, 'published', '{"Lunes a Sabado": "8:00 AM - 5:00 PM"}'::jsonb),
  (biz5_id, biz_owner_id, 'Museo de Arte de Ponce', 'El museo de arte más importante del Caribe con más de 4,500 obras. Arquitectura icónica de Edward Durell Stone.', 'Ponce', 18.0111, -66.6141, '787-555-0556', NULL, 'museoarteponce', 'https://museoarteponce.org', 'Av. Las Americas #2325, Ponce PR 00717', array['museums', 'historical'], true, 'published', '{"Miercoles a Lunes": "10:00 AM - 5:00 PM", "Martes": "Cerrado"}'::jsonb);

  -- ============================================================
  -- EVENTS (fechas futuras relativas a hoy)
  -- ============================================================
  INSERT INTO public.events (created_by, business_id, titulo, descripcion, start_datetime, end_datetime, municipio, lat, lng, fotos, estado, destacado) VALUES
  (biz_owner_id, biz1_id, 'Noche de Poesia y Cafe', 'Velada de poesía puertorriqueña acompañada de café artesanal y postres. Micrófono abierto.', now() + interval '2 hours', now() + interval '5 hours', 'Yauco', 18.0343, -66.8500, array['https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, biz2_id, 'Sunset Catamaran Tour', 'Tour especial al atardecer con música en vivo, open bar y snorkeling en Cayo Icacos.', now() + interval '1 day 4 hours', now() + interval '1 day 8 hours', 'Fajardo', 18.3358, -65.6523, array['https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, NULL, 'Festival de la Pina Colada', 'Celebracion de la bebida nacional de Puerto Rico con DJs, food trucks y competencias de bartending.', now() + interval '3 days', now() + interval '3 days 6 hours', 'Lajas', 18.0497, -67.0650, array['https://images.unsplash.com/photo-1533174000220-db9284bd06b0?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, NULL, 'Salsa Night en la Placita', 'Noche de salsa en vivo con las mejores orquestas de Puerto Rico. Clase de baile gratis a las 8PM.', now() + interval '5 hours', now() + interval '10 hours', 'San Juan', 18.4655, -66.1167, array['https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, biz3_id, 'Chinchorreo Dominguero', 'Lechon asado en vara, arroz con gandules, y musica jibara en vivo. Ambiente familiar.', now() + interval '2 days', now() + interval '2 days 8 hours', 'Orocovis', 18.2277, -66.3917, array['https://images.unsplash.com/photo-1544025162-811c7df0e047?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, NULL, 'Food Truck Festival', 'Mas de 30 food trucks en un solo lugar. Cervezas artesanales, postres y musica en vivo.', now() + interval '4 days', now() + interval '4 days 6 hours', 'Bayamon', 18.3985, -66.1547, array['https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, biz5_id, 'Taller de Ceramica Basica', 'Taller introductorio al mundo de la cerámica. Materiales incluidos. Cupo limitado a 15 personas.', now() + interval '6 days', now() + interval '6 days 3 hours', 'Ponce', 18.0111, -66.6141, array['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, NULL, 'Mercado Agricola Comunitario', 'Productos orgánicos de agricultores locales. Frutas, vegetales, miel, quesos y mas.', now() + interval '1 day', now() + interval '1 day 5 hours', 'Ponce', 17.9840, -66.6225, array['https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, biz4_id, 'Competencia de Surf - Rincon Classic', 'Competencia anual de surf con surfistas locales e internacionales. Entrada gratis para espectadores.', now() + interval '7 days', now() + interval '8 days', 'Rincon', 18.3408, -67.2518, array['https://images.unsplash.com/photo-1502680390548-bdbac40a5751?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, NULL, 'Yoga al Amanecer en la Playa', 'Sesion de yoga frente al mar con instructor certificado. Trae tu mat. Principiantes bienvenidos.', now() + interval '1 day 12 hours', now() + interval '1 day 14 hours', 'Isabela', 18.5000, -67.0500, array['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80'], 'approved', false);

  -- ============================================================
  -- PROMOTIONS
  -- ============================================================
  INSERT INTO public.promotions (business_id, titulo, descripcion, start_date, end_date, codigo, condiciones, fotos, estado, destacado) VALUES
  (biz2_id, 'Catamaran Tour 20% OFF', 'Reserva tu tour en catamarán con 20% de descuento. Incluye snorkeling, almuerzo y bebidas.', CURRENT_DATE, CURRENT_DATE + 30, 'ISLA20', 'Válido para grupos de 2+. No combinable con otras ofertas.', array['https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80'], 'approved', true),
  (biz1_id, '2x1 en Cafe Especial', 'Compra un café especial y llévate el segundo gratis. Válido de lunes a jueves.', CURRENT_DATE, CURRENT_DATE + 14, '2X1CAFE', 'Lunes a Jueves. No aplica a bebidas frías.', array['https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80'], 'approved', false),
  (biz3_id, 'Almuerzo Ejecutivo $10.99', 'Mofongo con tu elección de pollo, cerdo o camarones + bebida + postre del dia.', CURRENT_DATE, CURRENT_DATE + 60, NULL, 'Jueves a Viernes de 11AM a 2PM.', array['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80'], 'approved', false),
  (biz4_id, 'Clase de Surf Gratis', 'Tu primera clase de surf es GRATIS. Solo trae traje de baño y ganas de aprender.', CURRENT_DATE, CURRENT_DATE + 45, 'SURFGRATIS', 'Primera clase solamente. Reserva requerida.', array['https://images.unsplash.com/photo-1502680390548-bdbac40a5751?auto=format&fit=crop&q=80'], 'approved', true),
  (biz5_id, '50% Entrada General al Museo', 'Media entrada para todos los miércoles. Acceso a todas las exhibiciones permanentes y temporales.', CURRENT_DATE, CURRENT_DATE + 90, 'MUSEO50', 'Solo miércoles. No incluye eventos especiales.', array['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80'], 'approved', false),
  (biz1_id, 'Brunch Dominical $14.99', 'Brunch buffet con pancakes, huevos benedictinos, frutas frescas, café ilimitado y mimosas.', CURRENT_DATE, CURRENT_DATE + 30, NULL, 'Domingos de 9AM a 1PM. Reserva recomendada.', array['https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80'], 'approved', false);

  -- ============================================================
  -- SERVICE LISTINGS
  -- ============================================================
  INSERT INTO public.service_listings (user_id, tipo, titulo, descripcion, municipio, lat, lng, precio, telefono, whatsapp, fotos, estado, destacado) VALUES
  (biz_owner_id, 'servicio', 'Plomeria Residencial 24/7', 'Servicio de plomería certificado. Emergencias las 24 horas en toda el area metro. Destapes, fugas, instalaciones.', 'San Juan', 18.4655, -66.1167, 85, '787-555-1001', '7875551001', array['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, 'producto', 'Kayak Doble en Venta', 'Kayak doble marca Perception en excelentes condiciones. Color azul. Incluye 2 remos y chalecos salvavidas.', 'Fajardo', 18.3358, -65.6523, 450, '787-555-1002', '7875551002', array['https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, 'alquiler', 'Apartamento Frente al Mar', 'Hermoso apartamento frente al mar en Rincon. 1 habitación, 1 baño, cocina completa. Capacidad 2-4 personas. WiFi incluido.', 'Rincon', 18.3408, -67.2518, 120, '787-555-1003', '7875551003', array['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, 'servicio', 'Electricista Certificado - Perito', 'Todo tipo de trabajo eléctrico residencial y comercial. Perito electricista licenciado. Estimados gratis.', 'Bayamon', 18.3985, -66.1547, 0, '787-555-1004', '7875551004', array['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, 'servicio', 'Fotografo Profesional - Bodas y Eventos', 'Fotografía profesional para bodas, quinceañeros, graduaciones y eventos corporativos. Drone disponible.', 'Ponce', 18.0111, -66.6141, 200, '787-555-1005', '7875551005', array['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, 'producto', 'Stand Up Paddle Board', 'SUP inflable de 10 pies con remo, bomba y mochila de transporte. Usado 3 veces, como nuevo.', 'Luquillo', 18.3726, -65.7167, 350, '787-555-1006', '7875551006', array['https://images.unsplash.com/photo-1526188717906-ab4a2f949f74?auto=format&fit=crop&q=80'], 'approved', false),
  (biz_owner_id, 'alquiler', 'Glamping en la Montana', 'Tienda glamping con cama queen, electricidad, ducha y vista panorámica a las montañas. Desayuno incluido.', 'Jayuya', 18.2185, -66.5916, 95, '787-555-1007', '7875551007', array['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'], 'approved', true),
  (biz_owner_id, 'servicio', 'Limpieza Residencial Profesional', 'Servicio de limpieza profunda para casas y apartamentos. Productos eco-friendly. Personal de confianza.', 'Carolina', 18.3811, -65.9572, 75, '787-555-1008', '7875551008', array['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80'], 'approved', false);

END $$;
