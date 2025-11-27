-- ============================================================================
-- PUNTOFIEL - SCRIPT COMPLETO DE BASE DE DATOS Y CONFIGURACIÓN
-- ============================================================================

---------------------------------------------------------------------------
-- ⚠️ ESTRATEGIA DE RESETEO (Para asegurar idempotencia total)
---------------------------------------------------------------------------


-- 1. LIMPIEZA (ORDEN DE ELIMINACIÓN POR DEPENDENCIAS)
DROP TABLE IF EXISTS public.raffle_tickets CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.annual_raffles CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_cards CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. LIMPIEZA DE FUNCIONES
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.check_email_exists(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.process_loyalty(UUID, UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_customer_loyalty_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_employee_password(UUID, TEXT) CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS business_category_enum CASCADE;

---------------------------------------------------------------------------
-- 3. ESTRUCTURA (TABLAS Y FUNCIONES)
---------------------------------------------------------------------------

-- Trigger Updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tipos
CREATE TYPE user_role_enum AS ENUM ('customer', 'owner', 'employee');
CREATE TYPE business_category_enum AS ENUM ('food', 'cafe', 'restaurant', 'retail', 'services', 'entertainment', 'health', 'other');

-- Perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    second_last_name TEXT,
    role user_role_enum NOT NULL DEFAULT 'customer'
);
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Negocios
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    owner_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category business_category_enum NOT NULL DEFAULT 'other',
    location_address TEXT,
    opening_hours TEXT,
    logo_url TEXT
);
CREATE TRIGGER on_businesses_updated BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their own business." ON public.businesses FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can view businesses" ON public.businesses FOR SELECT USING (auth.role() = 'authenticated');

-- Empleados
CREATE TABLE IF NOT EXISTS public.employees (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(business_id, profile_id)
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage employees for their business." ON public.employees FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Employees can view their own employment." ON public.employees FOR SELECT USING (profile_id = auth.uid());

-- Loyalty Cards (Wallets)
CREATE TABLE IF NOT EXISTS public.loyalty_cards (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    UNIQUE(customer_id, business_id)
);
CREATE TRIGGER on_loyalty_cards_updated BEFORE UPDATE ON public.loyalty_cards FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own loyalty cards." ON public.loyalty_cards FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Business staff can view cards for their business." ON public.loyalty_cards FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() UNION SELECT business_id FROM public.employees WHERE profile_id = auth.uid()));

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    card_id BIGINT NOT NULL REFERENCES public.loyalty_cards(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase_earn', 'redeem')),
    purchase_amount NUMERIC(10, 2) DEFAULT 0 CHECK (purchase_amount >= 0),
    points_change NUMERIC(12, 4) NOT NULL,
    invoice_ref TEXT
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their transactions." ON public.transactions FOR SELECT USING (auth.uid() = (SELECT customer_id FROM public.loyalty_cards WHERE id = card_id));
CREATE POLICY "Business staff can insert purchases for their business." ON public.transactions FOR INSERT WITH CHECK ((SELECT business_id FROM public.loyalty_cards WHERE id = card_id) IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() UNION SELECT business_id FROM public.employees WHERE profile_id = auth.uid()));

-- Rewards
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business staff can manage rewards for their business." ON public.rewards FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() UNION SELECT business_id FROM public.employees WHERE profile_id = auth.uid()));
CREATE POLICY "Authenticated users can view active rewards" ON public.rewards FOR SELECT USING (is_active = TRUE);

-- Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TRIGGER on_promotions_updated BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business staff can manage their promotions." ON public.promotions FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() UNION SELECT business_id FROM public.employees WHERE profile_id = auth.uid()));
CREATE POLICY "Authenticated users can view active promotions." ON public.promotions FOR SELECT USING (is_active = TRUE AND (end_date IS NULL OR end_date > NOW()));

-- Annual Raffles
CREATE TABLE IF NOT EXISTS public.annual_raffles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prize TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    max_tickets_per_user INTEGER NOT NULL DEFAULT 1 CHECK (max_tickets_per_user > 0),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    winner_customer_id UUID REFERENCES public.profiles(id),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);
CREATE TRIGGER on_raffles_updated BEFORE UPDATE ON public.annual_raffles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
ALTER TABLE public.annual_raffles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business staff can manage their raffles." ON public.annual_raffles FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() UNION SELECT business_id FROM public.employees WHERE profile_id = auth.uid()));
CREATE POLICY "Authenticated users can view active raffles" ON public.annual_raffles FOR SELECT USING (end_date > NOW() OR is_completed = TRUE);

-- Raffle Tickets
CREATE TABLE IF NOT EXISTS public.raffle_tickets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raffle_id BIGINT NOT NULL REFERENCES public.annual_raffles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own raffle tickets." ON public.raffle_tickets FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can participate in raffles." ON public.raffle_tickets FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Business staff can view tickets for their raffles." ON public.raffle_tickets FOR SELECT USING (raffle_id IN (SELECT id FROM public.annual_raffles WHERE business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() UNION SELECT business_id FROM public.employees WHERE profile_id = auth.uid())));

-- Funciones RPC (Re-creación)
CREATE OR REPLACE FUNCTION public.process_loyalty(p_customer_id UUID, p_business_id UUID, p_amount NUMERIC, p_notes TEXT DEFAULT NULL) RETURNS TABLE (success BOOLEAN, message TEXT, new_points_balance INTEGER) AS $$
DECLARE
    v_card_id BIGINT;
    v_points_earned INTEGER;
    v_new_balance INTEGER;
BEGIN
    IF p_amount <= 0 THEN RETURN QUERY SELECT FALSE, 'El monto debe ser mayor a 0'::TEXT, NULL::INTEGER; RETURN; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_customer_id AND role = 'customer') THEN RETURN QUERY SELECT FALSE, 'Cliente no encontrado'::TEXT, NULL::INTEGER; RETURN; END IF;
    v_points_earned := ROUND(p_amount * 0.01);
    SELECT id INTO v_card_id FROM public.loyalty_cards WHERE customer_id = p_customer_id AND business_id = p_business_id;
    IF v_card_id IS NULL THEN
        INSERT INTO public.loyalty_cards (customer_id, business_id, points) VALUES (p_customer_id, p_business_id, v_points_earned) RETURNING id INTO v_card_id;
        v_new_balance := v_points_earned;
    ELSE
        UPDATE public.loyalty_cards SET points = points + v_points_earned WHERE id = v_card_id RETURNING points INTO v_new_balance;
    END IF;
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref) VALUES (v_card_id, 'purchase_earn', p_amount, v_points_earned, p_notes);
    RETURN QUERY SELECT TRUE, 'Transacción exitosa', v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.process_loyalty(UUID, UUID, NUMERIC, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_customer_loyalty_summary(p_customer_id UUID) RETURNS TABLE (card_id BIGINT, points INTEGER, business_id UUID, business_name TEXT, business_logo_url TEXT, next_reward_points INTEGER, next_reward_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT lc.id, lc.points, b.id, b.name, b.logo_url, r.points_required, r.name
  FROM public.loyalty_cards lc
  JOIN public.businesses b ON lc.business_id = b.id
  LEFT JOIN LATERAL (SELECT r_sub.points_required, r_sub.name FROM public.rewards r_sub WHERE r_sub.business_id = lc.business_id AND r_sub.is_active = TRUE AND r_sub.points_required > lc.points ORDER BY r_sub.points_required ASC LIMIT 1) r ON TRUE
  WHERE lc.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;
GRANT EXECUTE ON FUNCTION public.get_customer_loyalty_summary(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_param TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = email_param); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;

---------------------------------------------------------------------------
-- 4. DATA SEEDING MASSIVO (LO QUE PEDISTE)
---------------------------------------------------------------------------

-- Primero re-insertamos los perfiles (Usuarios no cambian)
INSERT INTO public.profiles (id, first_name, last_name, second_last_name, role) VALUES
    ('02c05bc0-afeb-439b-8841-049176d8eab6', 'Amairany', 'Meza', 'Vilorio', 'owner'),
    ('22f3022e-8402-4592-a87f-895f8a78b699', 'Ismael', 'Flores', 'Luna', 'owner'),
    ('63664654-44dc-476a-b79c-ce9680440f74', 'Juan de Dios', 'Madrid', 'Ortiz', 'owner'),
    ('df014b67-7f18-4007-93f3-1734e7135c0e', 'José Aaron', 'Hernández', 'Rodríguez', 'owner'),
    ('3234cb32-b89f-4bd4-932b-6d3b1d72935c', 'Jorge Christian', 'Serrano', 'Puertos', 'customer'),
    ('66b54f8c-3d8a-4934-8848-f7810e8613a2', 'Erick Ernesto', 'López', 'Valdés', 'employee');

DO $$
DECLARE
    -- IDs de Usuarios (Fijos)
    owner_ama_id UUID := '02c05bc0-afeb-439b-8841-049176d8eab6';
    owner_ismael_id UUID := '22f3022e-8402-4592-a87f-895f8a78b699';
    owner_madrid_id UUID := '63664654-44dc-476a-b79c-ce9680440f74';
    owner_aaron_id UUID := 'df014b67-7f18-4007-93f3-1734e7135c0e';
    customer_chris_id UUID := '3234cb32-b89f-4bd4-932b-6d3b1d72935c';
    employee_erick_id UUID := '66b54f8c-3d8a-4934-8848-f7810e8613a2';

    -- IDs Generados para Negocios
    cafe_id UUID;
    gym_id UUID;
    tacos_id UUID;
    pizza_id UUID;

    -- IDs Generados para Tarjetas
    card_cafe_id BIGINT;
    card_gym_id BIGINT;
    card_tacos_id BIGINT;
    card_pizza_id BIGINT;

    -- IDs Generados para Rifas
    rifa_cafe_id BIGINT;
    rifa_gym_activa_id BIGINT;
    rifa_gym_pasada_id BIGINT;
    rifa_tacos_id BIGINT;
    rifa_pizza_id BIGINT;
BEGIN

    -- ========================================================================
    -- 1. CREACIÓN DE NEGOCIOS
    -- ========================================================================

    -- Café
    INSERT INTO public.businesses (owner_id, name, category, location_address, opening_hours, logo_url)
    VALUES (owner_ama_id, 'Café El Portal', 'cafe', 'Av. 1 Ote. 215, Centro', 'Lunes a Sábado: 8AM - 9PM', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500')
    RETURNING id INTO cafe_id;

    -- Gym
    INSERT INTO public.businesses (owner_id, name, category, location_address, opening_hours, logo_url)
    VALUES (owner_ismael_id, 'GymZone Fitness', 'health', 'Calle 5 de Mayo 123', '24/7 Acceso', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500')
    RETURNING id INTO gym_id;

    -- Tacos
    INSERT INTO public.businesses (owner_id, name, category, location_address, opening_hours, logo_url)
    VALUES (owner_madrid_id, 'Tacos El Rey', 'restaurant', 'Av. Insurgentes 456', 'Daily 11 AM - 1 AM', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500')
    RETURNING id INTO tacos_id;

    -- Pizza
    INSERT INTO public.businesses (owner_id, name, category, location_address, opening_hours, logo_url)
    VALUES (owner_aaron_id, 'Pizzería Napoli', 'restaurant', 'Calle 3 Sur 789', 'Martes a Domingo 1PM - 11PM', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500')
    RETURNING id INTO pizza_id;

    -- Asignar empleado (Erick en Café)
    INSERT INTO public.employees (business_id, profile_id) VALUES (cafe_id, employee_erick_id);


    -- ========================================================================
    -- 2. CREACIÓN MASIVA DE RECOMPENSAS (Rewards)
    -- ========================================================================

    -- Café El Portal (8 Recompensas)
    INSERT INTO public.rewards (business_id, name, description, points_required, image_url, is_active) VALUES
    (cafe_id, 'Espresso Doble', 'Energía pura para tu día.', 8, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500', true),
    (cafe_id, 'Café Americano', 'El clásico de siempre.', 10, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', true),
    (cafe_id, 'Galleta de Avena', 'Horneada cada mañana.', 12, 'https://images.unsplash.com/photo-1499636138143-bd649043ea80?w=500', true),
    (cafe_id, 'Muffin de Chocolate', 'Esponjoso y delicioso.', 15, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500', true),
    (cafe_id, 'Frappé Moka', 'Con crema batida extra.', 25, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500', true),
    (cafe_id, 'Sandwich Gourmet', 'Jamón serrano y queso brie.', 40, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', true),
    (cafe_id, 'Bolsa de Café 500g', 'Llévate el sabor a casa.', 80, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', true),
    (cafe_id, 'Termo Oficial', 'Edición limitada El Portal.', 150, 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500', true);

    -- GymZone (6 Recompensas)
    INSERT INTO public.rewards (business_id, name, description, points_required, image_url, is_active) VALUES
    (gym_id, 'Barra de Proteína', 'Recuperación rápida.', 15, 'https://images.unsplash.com/photo-1622484211148-9962b9827d39?w=500', true),
    (gym_id, 'Shake Post-Entreno', 'Vainilla o Chocolate.', 20, 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=500', true),
    (gym_id, 'Toalla GymZone', 'Microfibra de alta calidad.', 40, 'https://images.unsplash.com/photo-1616690710400-a16d1469271d?w=500', true),
    (gym_id, 'Clase VIP Spinning', 'Reserva preferencial.', 50, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', true),
    (gym_id, 'Mes de Casillero', 'Guarda tus cosas seguro.', 80, 'https://images.unsplash.com/photo-1595583653637-b981721e2291?w=500', true),
    (gym_id, 'Entrenador Personal (1hr)', 'Asesoría 1 a 1.', 200, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500', true);

    -- Tacos El Rey (7 Recompensas)
    INSERT INTO public.rewards (business_id, name, description, points_required, image_url, is_active) VALUES
    (tacos_id, 'Refresco de Lata', 'Bien frío.', 8, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', true),
    (tacos_id, 'Orden de Cebollitas', 'Preparadas con limón.', 10, 'https://images.unsplash.com/photo-1611601552832-57528545b862?w=500', true),
    (tacos_id, 'Tacos al Pastor (3)', 'Con todo.', 20, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500', true),
    (tacos_id, 'Gringa de Pastor', 'Queso derretido y sabor.', 25, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500', true),
    (tacos_id, 'Nachos con Carne', 'Para compartir.', 35, 'https://images.unsplash.com/photo-1582169296194-e9d648411dff?w=500', true),
    (tacos_id, 'Agua de Horchata 1L', 'Casera y fresca.', 15, 'https://images.unsplash.com/photo-1549048085-bab2f1f49f65?w=500', true),
    (tacos_id, 'Parrillada para 2', 'Bistec, chorizo y pastor.', 120, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', true);

    -- Pizzería Napoli (6 Recompensas)
    INSERT INTO public.rewards (business_id, name, description, points_required, image_url, is_active) VALUES
    (pizza_id, 'Pan de Ajo', '4 piezas crujientes.', 12, 'https://images.unsplash.com/photo-1573140247632-f84660f67627?w=500', true),
    (pizza_id, 'Ensalada César', 'Aderezo de la casa.', 18, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500', true),
    (pizza_id, 'Pizza Personal', '1 ingrediente.', 25, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', true),
    (pizza_id, 'Lasagna Boloñesa', 'Receta de la nonna.', 45, 'https://images.unsplash.com/photo-1574868261180-9f9480e9cb8a?w=500', true),
    (pizza_id, 'Botella de Vino Tinto', 'Lambrusco o Cabernet.', 100, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500', true),
    (pizza_id, 'Pizza Familiar Especial', 'Cualquier especialidad.', 150, 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500', true);


    -- ========================================================================
    -- 3. CREACIÓN MASIVA DE PROMOCIONES (Promotions)
    -- ========================================================================

    -- Café El Portal
    INSERT INTO public.promotions (business_id, title, content, start_date, end_date, is_active, image_url) VALUES
    (cafe_id, '¡Jueves de Doble Punto!', 'Doble de puntos en todas tus bebidas.', NOW(), NOW() + INTERVAL '3 months', true, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500'),
    (cafe_id, 'Desayuno Ejecutivo', 'Café + Bagel por $89.', NOW() - INTERVAL '5 days', NOW() + INTERVAL '20 days', true, 'https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?w=500'),
    (cafe_id, 'Promo Expirada (Prueba)', 'Esta promo ya no debería verse.', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', true, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'); -- Pasada

    -- GymZone
    INSERT INTO public.promotions (business_id, title, content, start_date, end_date, is_active, image_url) VALUES
    (gym_id, 'Operación Verano', 'Inscripción gratis todo este mes.', NOW(), NOW() + INTERVAL '15 days', true, 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500'),
    (gym_id, 'Trae un Amigo', 'Si se inscribe, ganas 50 puntos.', NOW(), NOW() + INTERVAL '60 days', true, 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500');

    -- Tacos El Rey
    INSERT INTO public.promotions (business_id, title, content, start_date, end_date, is_active, image_url) VALUES
    (tacos_id, 'Festival del Taco', 'Tacos de canasta a $5.', NOW() + INTERVAL '2 days', NOW() + INTERVAL '10 days', true, 'https://images.unsplash.com/photo-1562059390-a761a08476d0?w=500'); -- Futura

    -- Pizzería Napoli
    INSERT INTO public.promotions (business_id, title, content, start_date, end_date, is_active, image_url) VALUES
    (pizza_id, 'Noche de Pastas', '2x1 en pastas a partir de las 7PM.', NOW(), NOW() + INTERVAL '30 days', true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500');


    -- ========================================================================
    -- 4. VINCULACIÓN DE CHRISTIAN A TODOS LOS NEGOCIOS + TRANSACCIONES
    -- ========================================================================

    -- >>> A. CHRISTIAN EN CAFÉ EL PORTAL <<<
    INSERT INTO public.loyalty_cards (customer_id, business_id, points) VALUES (customer_chris_id, cafe_id, 0) RETURNING id INTO card_cafe_id;
    -- Historial
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref, created_at) VALUES
    (card_cafe_id, 'purchase_earn', 150.00, 2, 'TICKET-C001', NOW() - INTERVAL '20 days'), -- Compra vieja
    (card_cafe_id, 'purchase_earn', 500.00, 5, 'TICKET-C002', NOW() - INTERVAL '15 days'),
    (card_cafe_id, 'redeem', 0, -7, 'CANJE-MUFFIN', NOW() - INTERVAL '14 days'), -- Gastó puntos
    (card_cafe_id, 'purchase_earn', 1200.00, 12, 'TICKET-C003', NOW() - INTERVAL '2 days'),
    (card_cafe_id, 'purchase_earn', 300.00, 3, 'TICKET-C004', NOW());
    -- Actualizar saldo Café: (2 + 5 - 7 + 12 + 3) = 15
    UPDATE public.loyalty_cards SET points = 15 WHERE id = card_cafe_id;

    -- >>> B. CHRISTIAN EN GYMZONE <<<
    INSERT INTO public.loyalty_cards (customer_id, business_id, points) VALUES (customer_chris_id, gym_id, 0) RETURNING id INTO card_gym_id;
    -- Historial
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref, created_at) VALUES
    (card_gym_id, 'purchase_earn', 4500.00, 45, 'MEMBRESIA-ANUAL', NOW() - INTERVAL '3 months'),
    (card_gym_id, 'purchase_earn', 500.00, 5, 'AGUA-Y-BARRA', NOW() - INTERVAL '2 months'),
    (card_gym_id, 'redeem', 0, -40, 'CANJE-TOALLA', NOW() - INTERVAL '1 month'),
    (card_gym_id, 'purchase_earn', 800.00, 8, 'PROTEINA', NOW());
    -- Actualizar saldo Gym: (45 + 5 - 40 + 8) = 18
    UPDATE public.loyalty_cards SET points = 18 WHERE id = card_gym_id;

    -- >>> C. CHRISTIAN EN TACOS EL REY <<<
    INSERT INTO public.loyalty_cards (customer_id, business_id, points) VALUES (customer_chris_id, tacos_id, 0) RETURNING id INTO card_tacos_id;
    -- Historial
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref, created_at) VALUES
    (card_tacos_id, 'purchase_earn', 800.00, 8, 'CENA-FAMILIA', NOW() - INTERVAL '10 days'),
    (card_tacos_id, 'purchase_earn', 250.00, 3, 'TACOS-SOLO', NOW() - INTERVAL '5 days'),
    (card_tacos_id, 'redeem', 0, -10, 'CANJE-CEBOLLITAS', NOW() - INTERVAL '5 days'),
    (card_tacos_id, 'purchase_earn', 2000.00, 20, 'FIESTA', NOW());
    -- Actualizar saldo Tacos: (8 + 3 - 10 + 20) = 21
    UPDATE public.loyalty_cards SET points = 21 WHERE id = card_tacos_id;

    -- >>> D. CHRISTIAN EN PIZZERÍA NAPOLI <<<
    INSERT INTO public.loyalty_cards (customer_id, business_id, points) VALUES (customer_chris_id, pizza_id, 0) RETURNING id INTO card_pizza_id;
    -- Historial (Usuario nuevo aquí, solo acumulando)
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref, created_at) VALUES
    (card_pizza_id, 'purchase_earn', 350.00, 4, 'CENA-DOMINGO', NOW() - INTERVAL '3 days'),
    (card_pizza_id, 'purchase_earn', 550.00, 6, 'PIZZA-AMIGOS', NOW());
    -- Actualizar saldo Pizza: 10
    UPDATE public.loyalty_cards SET points = 10 WHERE id = card_pizza_id;


    -- ========================================================================
    -- 5. RIFAS (ANNUAL RAFFLES) Y TICKETS
    -- ========================================================================

    -- Rifa Café (Activa)
    INSERT INTO public.annual_raffles (business_id, name, prize, description, points_required, max_tickets_per_user, end_date, image_url)
    VALUES (cafe_id, 'Rifa Barista Amateur', 'Kit de Prensa Francesa + Café', 'Todo para ser un experto.', 30, 3, NOW() + INTERVAL '15 days', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500')
    RETURNING id INTO rifa_cafe_id;
    -- Christian participa
    INSERT INTO public.raffle_tickets (raffle_id, customer_id) VALUES (rifa_cafe_id, customer_chris_id);

    -- Rifa Gym Activa (El Gran Premio)
    INSERT INTO public.annual_raffles (business_id, name, prize, description, points_required, max_tickets_per_user, end_date, image_url)
    VALUES (gym_id, 'Reto Fit 2025', '1 Año de Gym Gratis + Suplementos', 'Valorado en $6,000 MXN.', 100, 5, NOW() + INTERVAL '25 days', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500')
    RETURNING id INTO rifa_gym_activa_id;
    -- Christian va con todo (2 boletos)
    INSERT INTO public.raffle_tickets (raffle_id, customer_id) VALUES (rifa_gym_activa_id, customer_chris_id), (rifa_gym_activa_id, customer_chris_id);

    -- Rifa Gym Pasada (Finalizada, Christian perdió)
    INSERT INTO public.annual_raffles (business_id, name, prize, description, points_required, max_tickets_per_user, start_date, end_date, image_url, is_completed)
    VALUES (gym_id, 'Rifa Smartwatch', 'Garmin Forerunner', 'Rifa del mes pasado.', 50, 1, NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', 'https://images.unsplash.com/photo-1551817958-c9b529973860?w=500', true)
    RETURNING id INTO rifa_gym_pasada_id;
    -- Christian participó
    INSERT INTO public.raffle_tickets (raffle_id, customer_id) VALUES (rifa_gym_pasada_id, customer_chris_id);

    -- Rifa Tacos (Activa)
    INSERT INTO public.annual_raffles (business_id, name, prize, description, points_required, max_tickets_per_user, end_date, image_url)
    VALUES (tacos_id, 'Tquiza para 20 Personas', 'Servicio a domicilio incluido.', 'Ideal para tu cumpleaños.', 50, 2, NOW() + INTERVAL '5 days', 'https://images.unsplash.com/photo-1599974481985-530d4d87e6d3?w=500')
    RETURNING id INTO rifa_tacos_id;
    -- Christian participa
    INSERT INTO public.raffle_tickets (raffle_id, customer_id) VALUES (rifa_tacos_id, customer_chris_id);

    -- Rifa Pizza (Activa)
    INSERT INTO public.annual_raffles (business_id, name, prize, description, points_required, max_tickets_per_user, end_date, image_url)
    VALUES (pizza_id, 'Viaje Culinario', 'Cena de 5 tiempos con maridaje', 'Experiencia gourmet exclusiva.', 60, 1, NOW() + INTERVAL '20 days', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500')
    RETURNING id INTO rifa_pizza_id;

END $$;

-- 5. RESTAURAR SEGURIDAD (SOLO DEV)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_raffles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_tickets DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DEV: Allow all operations on puntofiel-assets" ON storage.objects;
CREATE POLICY "DEV: Allow all operations on puntofiel-assets" ON storage.objects FOR ALL TO public USING (bucket_id = 'puntofiel-assets') WITH CHECK (bucket_id = 'puntofiel-assets');

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
