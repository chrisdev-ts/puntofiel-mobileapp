/**
 * Configuración de desarrollo
 * Este archivo contiene valores hardcodeados para desarrollo que serán reemplazados
 * cuando los módulos correspondientes estén implementados.
 */

/**
 * MOCK_USER_ID - Usuario de prueba para desarrollo
 *
 * TODO: Eliminar cuando el módulo de autenticación esté implementado
 * Una vez implementado, usar `supabase.auth.getUser()` en su lugar
 *
 * @see src/core/usecases/auth/loginUser.ts
 * @see src/core/usecases/auth/registerUser.ts
 */

// Usuario dueño (Amairany) - owner_id del negocio "Café El Portal"
export const MOCK_USER_ID = "02c05bc0-afeb-439b-8841-049176d8eab6";

// Usuario cliente (Christian) - tiene tarjeta de lealtad con transacciones
// export const MOCK_USER_ID = "3234cb32-b89f-4bd4-932b-6d3b1d72935c";

// Usuario empleado (Erick) - trabaja en "Café El Portal"
// export const MOCK_USER_ID = "f6f1570a-af55-4065-95ba-d06f557b9875";

/**
 * Indica si la aplicación está en modo desarrollo con datos mock
 */
export const IS_DEV_MODE = true;
