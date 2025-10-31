-- ============================================================================
-- PUNTOFIEL - SCRIPT COMPLETO DE BASE DE DATOS Y CONFIGURACIÓN (VERSION FINAL)
-- Descripción: Creación de esquema completo (tablas, funciones, triggers, RLS)
--              para el sistema de lealtad PuntoFiel, con lógica RPC.
-- Ultima modificación: 30 de octubre de 2025 a las 11:15 PM
-- ============================================================================

---------------------------------------------------------------------------
-- ⚠️ ESTRATEGIA DE RESETEO (Para asegurar idempotencia total)
---------------------------------------------------------------------------

-- 1. Eliminar objetos dependientes de las tablas
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.annual_raffles CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_cards CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Eliminar funciones y tipos
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.check_email_exists(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.process_loyalty(UUID, UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.get_customer_loyalty_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.process_purchase(UUID, UUID, NUMERIC) CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;


---------------------------------------------------------------------------
-- 1. FUNCIONES AUXILIARES Y LÓGICA RPC
---------------------------------------------------------------------------

-- Función para actualizar "updated_at"
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar la existencia del email en auth.users
CREATE OR REPLACE FUNCTION public.check_email_exists(email_param TEXT)
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = email_param
      );
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PERMISOS: Permitir ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;


-- FUNCIÓN RPC: process_loyalty
-- Esta función registra una transacción de lealtad y otorga puntos al cliente.
CREATE OR REPLACE FUNCTION public.process_loyalty(
    p_customer_id UUID,
    p_business_id UUID,
    p_amount NUMERIC
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    new_points_balance NUMERIC
) AS $$
DECLARE
    v_card_id BIGINT;
    v_points_earned NUMERIC(12, 4);
    v_new_balance NUMERIC(12, 4);
BEGIN
    -- 1. Validar que el monto sea mayor a 0
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT FALSE, 'El monto debe ser mayor a 0'::TEXT, NULL::NUMERIC;
        RETURN;
    END IF;

    -- 2. Validar que el cliente existe y es un customer
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_customer_id AND role = 'customer'
    ) THEN
        RETURN QUERY SELECT FALSE, 'Cliente no encontrado o rol inválido'::TEXT, NULL::NUMERIC;
        RETURN;
    END IF;

    -- 3. Validar que el negocio existe
    IF NOT EXISTS (SELECT 1 FROM public.businesses WHERE id = p_business_id) THEN
        RETURN QUERY SELECT FALSE, 'Negocio no encontrado'::TEXT, NULL::NUMERIC;
        RETURN;
    END IF;

    -- 4. Calcular puntos ganados (1% del monto)
    v_points_earned := p_amount * 0.01;

    -- 5. Buscar o crear la loyalty_card (wallet) del cliente para este negocio
    SELECT id INTO v_card_id
    FROM public.loyalty_cards
    WHERE customer_id = p_customer_id AND business_id = p_business_id;

    IF v_card_id IS NULL THEN
        -- Crear nueva loyalty_card si no existe
        INSERT INTO public.loyalty_cards (customer_id, business_id, points)
        VALUES (p_customer_id, p_business_id, v_points_earned)
        RETURNING id INTO v_card_id;
        
        v_new_balance := v_points_earned;
    ELSE
        -- Actualizar puntos en la loyalty_card existente
        UPDATE public.loyalty_cards
        SET points = points + v_points_earned
        WHERE id = v_card_id
        RETURNING points INTO v_new_balance;
    END IF;

    -- 6. Registrar la transacción en el historial
    INSERT INTO public.transactions (
        card_id,
        transaction_type,
        purchase_amount,
        points_change
    ) VALUES (
        v_card_id,
        'purchase_earn',
        p_amount,
        v_points_earned
    );

    -- 7. Retornar resultado exitoso
    RETURN QUERY SELECT 
        TRUE, 
        'Transacción registrada exitosamente. Puntos otorgados: ' || v_points_earned::TEXT, 
        v_new_balance;

EXCEPTION
    WHEN OTHERS THEN
        -- Manejo de errores genéricos
        RETURN QUERY SELECT FALSE, 'Error al procesar la transacción: ' || SQLERRM, NULL::NUMERIC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PERMISOS: Permitir ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.process_loyalty(UUID, UUID, NUMERIC) TO authenticated;


-- FUNCIÓN RPC: get_customer_loyalty_summary
-- Obtiene el resumen de las tarjetas de lealtad de un cliente, incluyendo la siguiente recompensa.
CREATE OR REPLACE FUNCTION public.get_customer_loyalty_summary(p_customer_id UUID)
RETURNS TABLE (
    card_id BIGINT,
    points NUMERIC,
    business_id UUID,
    business_name TEXT,
    business_logo_url TEXT,
    next_reward_points NUMERIC,
    next_reward_name TEXT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
      lc.id AS card_id,
      lc.points,
      b.id AS business_id,
      b.name AS business_name,
      b.logo_url AS business_logo_url,
      r.points_required AS next_reward_points,
      r.name AS next_reward_name
  FROM
      public.loyalty_cards lc
  JOIN
      public.businesses b ON lc.business_id = b.id
  LEFT JOIN LATERAL (
      SELECT
          r_sub.points_required,
          r_sub.name
      FROM
          public.rewards r_sub
      WHERE
          r_sub.business_id = lc.business_id
          AND r_sub.is_active = TRUE
          AND r_sub.points_required > lc.points 
      ORDER BY
          r_sub.points_required ASC
      LIMIT 1
  ) r ON TRUE
  WHERE
      lc.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- PERMISOS: Permitir ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_customer_loyalty_summary(UUID) TO authenticated;


---------------------------------------------------------------------------
-- 2. TIPOS Y PERFILES DE USUARIO
---------------------------------------------------------------------------

-- Crear el tipo ENUM para roles
CREATE TYPE user_role_enum AS ENUM ('customer', 'owner', 'employee');

-- Crear la tabla "profiles"
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    second_last_name TEXT,
    role user_role_enum NOT NULL DEFAULT 'customer'
);

-- Comentarios en la tabla
COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con información básica y rol del sistema';
COMMENT ON COLUMN public.profiles.id IS 'Identificador único del usuario (referencia a auth.users)';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario en el sistema: customer, owner o employee';

-- Aplicar trigger de updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Activar RLS y definir políticas para perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para ver perfil propio
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
    ON public.profiles FOR SELECT
    USING ( auth.uid() = id );

-- Política para actualizar perfil propio
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );


---------------------------------------------------------------------------
-- 3. TABLA DE NEGOCIOS (BUSINESSES)
---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_address TEXT,
    opening_hours TEXT,
    logo_url TEXT
);

-- Comentarios en la tabla
COMMENT ON TABLE public.businesses IS 'Negocios registrados en la plataforma PuntoFiel';
COMMENT ON COLUMN public.businesses.owner_id IS 'Referencia al dueño del negocio (perfil con role owner)';

-- Aplicar trigger de updated_at
DROP TRIGGER IF EXISTS on_businesses_updated ON public.businesses;
CREATE TRIGGER on_businesses_updated
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Activar RLS y definir políticas para negocios
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Política para Owners (gestión total)
DROP POLICY IF EXISTS "Owners can manage their own business." ON public.businesses;
CREATE POLICY "Owners can manage their own business."
    ON public.businesses FOR ALL
    USING ( auth.uid() = owner_id );

-- Política para usuarios autenticados (ver)
DROP POLICY IF EXISTS "Authenticated users can view all businesses." ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;
CREATE POLICY "Authenticated users can view businesses"
    ON public.businesses FOR SELECT
    USING ( auth.role() = 'authenticated' ); 


---------------------------------------------------------------------------
-- 4. TABLA DE EMPLEADOS (EMPLOYEES)
---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.employees (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(business_id, profile_id)
);

-- Comentarios en la tabla
COMMENT ON TABLE public.employees IS 'Relación entre empleados y negocios.';

-- Activar RLS en la tabla de empleados
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Política para Owners (gestionar empleados de su negocio)
DROP POLICY IF EXISTS "Owners can manage employees for their business." ON public.employees;
CREATE POLICY "Owners can manage employees for their business."
    ON public.employees FOR ALL
    USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Política para Employees (verse a sí mismos)
DROP POLICY IF EXISTS "Employees can view their own employment." ON public.employees;
CREATE POLICY "Employees can view their own employment."
    ON public.employees FOR SELECT
    USING ( profile_id = auth.uid() );


---------------------------------------------------------------------------
-- 5. WALLET/TARJETAS DE LEALTAD (LOYALTY_CARDS)
---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.loyalty_cards (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    points NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (points >= 0),
    UNIQUE(customer_id, business_id)
);

-- Comentarios en la tabla
COMMENT ON TABLE public.loyalty_cards IS 'Tarjetas de lealtad de clientes en cada negocio (Wallet).';

-- Aplicar trigger de updated_at
DROP TRIGGER IF EXISTS on_loyalty_cards_updated ON public.loyalty_cards;
CREATE TRIGGER on_loyalty_cards_updated
    BEFORE UPDATE ON public.loyalty_cards
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Activar RLS y definir políticas para tarjetas de lealtad
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;

-- Política para Customers (ver sus tarjetas)
DROP POLICY IF EXISTS "Customers can view their own loyalty cards." ON public.loyalty_cards;
CREATE POLICY "Customers can view their own loyalty cards."
    ON public.loyalty_cards FOR SELECT
    USING ( auth.uid() = customer_id );

-- Política para Staff (Owners y Employees pueden ver tarjetas de su negocio)
DROP POLICY IF EXISTS "Business staff can view cards for their business." ON public.loyalty_cards;
CREATE POLICY "Business staff can view cards for their business."
    ON public.loyalty_cards FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM public.employees WHERE profile_id = auth.uid()
        )
    );


---------------------------------------------------------------------------
-- 6. TABLA DE TRANSACCIONES
---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    card_id BIGINT NOT NULL REFERENCES public.loyalty_cards(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase_earn', 'redeem')),
    purchase_amount NUMERIC(10, 2) DEFAULT 0 CHECK (purchase_amount >= 0),
    points_change NUMERIC(12, 4) NOT NULL,
    invoice_ref TEXT
);

-- Comentarios en la tabla
COMMENT ON TABLE public.transactions IS 'Historial de transacciones (compras y canjes) en tarjetas de lealtad.';

-- Activar RLS y definir políticas para transacciones
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política para Customers (ver sus transacciones)
DROP POLICY IF EXISTS "Customers can view their transactions." ON public.transactions;
CREATE POLICY "Customers can view their transactions."
    ON public.transactions FOR SELECT
    USING ( auth.uid() = (SELECT customer_id FROM public.loyalty_cards WHERE id = card_id) );

-- Política para Staff (Owners y Employees pueden crear transacciones)
DROP POLICY IF EXISTS "Business staff can insert purchases for their business." ON public.transactions;
CREATE POLICY "Business staff can insert purchases for their business."
    ON public.transactions FOR INSERT
    WITH CHECK ( 
        (SELECT business_id FROM public.loyalty_cards WHERE id = card_id) IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM public.employees WHERE profile_id = auth.uid()
        )
    );


---------------------------------------------------------------------------
-- 7. RECOMPENSAS (REWARDS)
---------------------------------------------------------------------------

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

-- Comentarios en la tabla
COMMENT ON TABLE public.rewards IS 'Recompensas que los negocios ofrecen a sus clientes.';

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_rewards_business_id ON public.rewards(business_id);
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON public.rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON public.rewards(created_at DESC);

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_rewards_updated_at ON public.rewards;
CREATE TRIGGER update_rewards_updated_at
    BEFORE UPDATE ON public.rewards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Activar RLS y definir políticas para recompensas
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Incluye Owners Y Employees para gestionar recompensas (FOR ALL)
DROP POLICY IF EXISTS "Business owners can manage their rewards" ON public.rewards;
DROP POLICY IF EXISTS "Business staff can manage rewards for their business." ON public.rewards;
CREATE POLICY "Business staff can manage rewards for their business."
    ON public.rewards FOR ALL
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid() -- Condición para Owner
            UNION
            SELECT business_id FROM public.employees WHERE profile_id = auth.uid() -- Condición para Employee
        )
    );

-- Política para usuarios autenticados (ver recompensas activas)
DROP POLICY IF EXISTS "Authenticated users can view all active rewards." ON public.rewards;
CREATE POLICY "Authenticated users can view active rewards"
    ON public.rewards FOR SELECT
    USING ( is_active = TRUE );


---------------------------------------------------------------------------
-- 8. PROMOCIONES
---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Comentarios en la tabla
COMMENT ON TABLE public.promotions IS 'Promociones temporales creadas por los negocios.';

-- Aplicar trigger de updated_at
DROP TRIGGER IF EXISTS on_promotions_updated ON public.promotions;
CREATE TRIGGER on_promotions_updated
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Activar RLS y definir políticas para promociones
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Política para Staff (Owners y Employees pueden gestionar promociones)
DROP POLICY IF EXISTS "Business staff can manage their promotions." ON public.promotions;
CREATE POLICY "Business staff can manage their promotions."
    ON public.promotions FOR ALL
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM public.employees WHERE profile_id = auth.uid()
        )
    );

-- Política para usuarios autenticados (ver promociones activas)
DROP POLICY IF EXISTS "Authenticated users can view active promotions." ON public.promotions;
CREATE POLICY "Authenticated users can view active promotions."
    ON public.promotions FOR SELECT
    USING ( is_active = TRUE AND (end_date IS NULL OR end_date > NOW()) );


---------------------------------------------------------------------------
-- 9. RIFA ANUAL (ANNUAL_RAFFLE)
---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.annual_raffles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    raffle_year INT NOT NULL UNIQUE,
    raffle_date DATE NOT NULL,
    winner_customer_id UUID REFERENCES public.profiles(id),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Comentarios en la tabla
COMMENT ON TABLE public.annual_raffles IS 'Rifas anuales de la plataforma PuntoFiel.';

-- Activar RLS y definir políticas para rifas
ALTER TABLE public.annual_raffles ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados (ver rifas)
DROP POLICY IF EXISTS "Authenticated users can view raffles." ON public.annual_raffles;
CREATE POLICY "Authenticated users can view raffles."
    ON public.annual_raffles FOR SELECT
    USING ( auth.role() = 'authenticated' );


---------------------------------------------------------------------------
-- 10. STORAGE BUCKETS Y POLÍTICAS (SUPABASE)
---------------------------------------------------------------------------

-- Insertar bucket para recompensas
INSERT INTO storage.buckets (id, name, public)
VALUES ('rewards', 'rewards', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para rewards (MODO PRODUCCIÓN)
DROP POLICY IF EXISTS "Los usuarios autenticados pueden subir imágenes" ON storage.objects;
CREATE POLICY "Los usuarios autenticados pueden subir imágenes"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'rewards');

DROP POLICY IF EXISTS "Las imágenes son públicamente accesibles" ON storage.objects;
CREATE POLICY "Las imágenes son públicamente accesibles"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'rewards');

DROP POLICY IF EXISTS "Los dueños pueden actualizar sus imágenes" ON storage.objects;
CREATE POLICY "Los dueños pueden actualizar sus imágenes"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'rewards');

DROP POLICY IF EXISTS "Los dueños pueden eliminar sus imágenes" ON storage.objects;
CREATE POLICY "Los dueños pueden eliminar sus imágenes"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'rewards');


---------------------------------------------------------------------------
-- 11. DATOS DE PRUEBA (INSERCIÓN)
---------------------------------------------------------------------------

-- Borrar datos existentes (para idempotencia)
DELETE FROM public.annual_raffles;
DELETE FROM public.promotions;
DELETE FROM public.rewards;
DELETE FROM public.transactions;
DELETE FROM public.employees;
DELETE FROM public.loyalty_cards;
DELETE FROM public.businesses;
DELETE FROM public.profiles;


-- 1. Insertar perfiles de prueba
-- 🔑 CREDENCIALES DE PRUEBA: (Contraseña para todos: 'password123')
-- Dueño: Amairany Meza Vilorio (owner.ama@cafetal.com)
-- Cliente: Jorge Christian Serrano Puertos (customer.chris@email.com)
-- Empleado: Erick Ernesto López Valdés (employee.erick@gmail.com)
INSERT INTO public.profiles (id, first_name, last_name, second_last_name, role)
VALUES 
    ('02c05bc0-afeb-439b-8841-049176d8eab6', 'Amairany', 'Meza', 'Vilorio', 'owner'),
    ('3234cb32-b89f-4bd4-932b-6d3b1d72935c', 'Jorge Christian', 'Serrano', 'Puertos', 'customer'),
    ('66b54f8c-3d8a-4934-8848-f7810e8613a2', 'Erick Ernesto', 'López', 'Valdés', 'employee');


-- 2. Insertar Negocio, Recompensas, Promociones y Empleados
DO $$
DECLARE
    owner_ama_id UUID := '02c05bc0-afeb-439b-8841-049176d8eab6';
    employee_erick_id UUID := '66b54f8c-3d8a-4934-8848-f7810e8613a2';
    cafe_el_portal_id UUID;
BEGIN
    -- 2.1. Crear el negocio
    INSERT INTO public.businesses (owner_id, name, location_address, opening_hours, logo_url)
    VALUES (
        owner_ama_id,
        'Café El Portal',
        'Av. 1 Ote. 215, Centro, 94500 Córdoba, Ver.',
        'Lunes a Sábado: 8:00 AM - 9:00 PM, Domingo: 9:00 AM - 6:00 PM',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop'
    ) RETURNING id INTO cafe_el_portal_id;

    -- 2.2. Insertar recompensas
    INSERT INTO public.rewards (
        business_id, 
        name, 
        description, 
        points_required, 
        image_url, 
        is_active
    )
    VALUES
        (
            cafe_el_portal_id,
            'Café Americano Gratis',
            'Disfruta de un delicioso café americano de la casa completamente gratis.',
            10,
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
            true
        ),
        (
            cafe_el_portal_id,
            '2x1 en Frappés',
            'Compra un frappé de cualquier sabor y llévate el segundo completamente gratis.',
            25,
            'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&h=600&fit=crop',
            true
        ),
        (
            cafe_el_portal_id,
            'Rebanada de Pastel',
            'Acompaña tu bebida favorita con una rebanada de nuestro pastel del día.',
            15,
            'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
            true
        ),
        (
            cafe_el_portal_id,
            'Croissant de la Casa',
            'Croissant artesanal recién horneado con mantequilla francesa.',
            8,
            'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
            true
        ),
        (
            cafe_el_portal_id,
            'Descuento 50% en Smoothies',
            'Aprovecha el 50% de descuento en cualquier smoothie natural.',
            20,
            'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&h=600&fit=crop',
            true
        );

    -- 2.3. Insertar promociones
    INSERT INTO public.promotions (
        business_id, 
        title, 
        content, 
        start_date, 
        end_date, 
        is_active
    )
    VALUES
        (
            cafe_el_portal_id, 
            '¡Jueves de Doble Punto!', 
            'Todos los jueves, cada compra que realices te dará el doble de puntos. ¡No te lo pierdas!', 
            NOW(), 
            NOW() + INTERVAL '3 months', 
            true
        ),
        (
            cafe_el_portal_id, 
            'Happy Hour: 20% de Descuento', 
            'De 3:00 PM a 5:00 PM todos los días, obtén 20% de descuento en bebidas frías.', 
            NOW(), 
            NOW() + INTERVAL '1 month', 
            true
        ),
        (
            cafe_el_portal_id, 
            'Mes del Pastel', 
            'Durante todo el mes, llévate una rebanada de pastel gratis en la compra de 2 bebidas.', 
            NOW(), 
            NOW() + INTERVAL '30 days', 
            true
        );

    -- 2.4. Asignar empleados
    INSERT INTO public.employees (business_id, profile_id)
    VALUES (
        cafe_el_portal_id,
        employee_erick_id
    );
        
END $$;


-- 3. Simular transacciones para un cliente
DO $$
DECLARE
    cliente_chris_id UUID := '3234cb32-b89f-4bd4-932b-6d3b1d72935c';
    cafe_portal_id UUID;
    tarjeta_lealtad_id BIGINT;
BEGIN
    -- Obtener el ID del negocio 'Café El Portal'
    SELECT id INTO cafe_portal_id FROM public.businesses WHERE name = 'Café El Portal';

    -- Crear una tarjeta de lealtad para Christian en 'Café El Portal'
    INSERT INTO public.loyalty_cards (customer_id, business_id, points)
    VALUES (cliente_chris_id, cafe_portal_id, 0)
    RETURNING id INTO tarjeta_lealtad_id;

    -- Transacción 1: Gana 0.50
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref)
    VALUES (tarjeta_lealtad_id, 'purchase_earn', 50.00, 0.50, 'TICKET-001');
    UPDATE public.loyalty_cards SET points = points + 0.50 WHERE id = tarjeta_lealtad_id;

    -- Transacción 2: Gana 1.50 (Total: 2.00)
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref)
    VALUES (tarjeta_lealtad_id, 'purchase_earn', 150.00, 1.50, 'TICKET-002');
    UPDATE public.loyalty_cards SET points = points + 1.50 WHERE id = tarjeta_lealtad_id;
    
    -- Transacción 3: Gana 8.00 (Total: 10.00)
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref)
    VALUES (tarjeta_lealtad_id, 'purchase_earn', 800.00, 8.00, 'TICKET-003');
    UPDATE public.loyalty_cards SET points = points + 8.00 WHERE id = tarjeta_lealtad_id;

    -- Transacción 4: Canjea 10 (Total: 0.00)
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref)
    VALUES (tarjeta_lealtad_id, 'redeem', 0, -10, 'CANJE-001');
    UPDATE public.loyalty_cards SET points = points - 10 WHERE id = tarjeta_lealtad_id;

    -- Transacción 5: Gana 1.20 (Total: 1.20)
    INSERT INTO public.transactions (card_id, transaction_type, purchase_amount, points_change, invoice_ref)
    VALUES (tarjeta_lealtad_id, 'purchase_earn', 120.00, 1.20, 'TICKET-004');
    UPDATE public.loyalty_cards SET points = points + 1.20 WHERE id = tarjeta_lealtad_id;

END $$;


-- 4. Insertar rifa anual
INSERT INTO public.annual_raffles (raffle_year, raffle_date, is_completed)
VALUES (EXTRACT(YEAR FROM NOW()), (EXTRACT(YEAR FROM NOW()) || '-12-31')::DATE, FALSE);


---------------------------------------------------------------------------
-- 12. MODO DESARROLLO (DESACTIVACIÓN TEMPORAL DE RLS Y BYPASS DE STORAGE)
---------------------------------------------------------------------------

-- Desactivar RLS en tablas (para desarrollo)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_raffles DISABLE ROW LEVEL SECURITY;


-- BYPASS TEMPORAL DE RLS PARA STORAGE (Permite operaciones sin autenticación)
-- ----------------------------------------------------------------

-- 1. Eliminar POLÍTICAS DE PRODUCCIÓN existentes
DROP POLICY IF EXISTS "Business owners can upload reward images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update their reward images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete their reward images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view reward images" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Los dueños pueden actualizar sus imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Los dueños pueden eliminar sus imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Las imágenes son públicamente accesibles" ON storage.objects;

-- 2. Eliminar POLÍTICAS DE DESARROLLO existentes (SOLUCIÓN DEL ERROR)
DROP POLICY IF EXISTS "DEV: Allow all uploads to rewards bucket" ON storage.objects;
DROP POLICY IF EXISTS "DEV: Allow all reads from rewards bucket" ON storage.objects;
DROP POLICY IF EXISTS "DEV: Allow all updates to rewards bucket" ON storage.objects;
DROP POLICY IF EXISTS "DEV: Allow all deletes from rewards bucket" ON storage.objects;

-- 3. Crear políticas permisivas para desarrollo
CREATE POLICY "DEV: Allow all uploads to rewards bucket"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'rewards');

CREATE POLICY "DEV: Allow all reads from rewards bucket"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'rewards');

CREATE POLICY "DEV: Allow all updates to rewards bucket"
    ON storage.objects FOR UPDATE
    TO public
    USING (bucket_id = 'rewards')
    WITH CHECK (bucket_id = 'rewards');

CREATE POLICY "DEV: Allow all deletes from rewards bucket"
    ON storage.objects FOR DELETE
    TO public
    USING (bucket_id = 'rewards');


-- ----------------------------------------------------------------
-- CÓDIGO PARA REACTIVAR RLS CUANDO SE TERMINE LA FASE DE DESARROLLO
-- ----------------------------------------------------------------

/*
-- REACTIVAR RLS EN TABLAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_raffles ENABLE ROW LEVEL SECURITY;

-- RESTAURAR POLÍTICAS RLS DE STORAGE (Ver Sección 10 para restaurar)
-- Eliminar las políticas DEV y recrear las de producción.
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================