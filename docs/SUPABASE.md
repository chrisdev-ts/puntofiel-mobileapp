# Patrones de acceso a datos

## ⚠️ Configuración inicial requerida

Antes de usar la aplicación, **debes ejecutar el script SQL maestro** en tu base de datos de Supabase:

1. Ve al proyecto en [Supabase Dashboard](https://supabase.com/dashboard/project/ardzmfnmuvgwmdrmpzlh)
2. Navega a **SQL Editor**
3. Abre el archivo `docs/script-maestro-puntofiel.sql`
4. Copia todo el contenido y pégalo en el editor SQL
5. Ejecuta el script (botón "Run")

Este script crea:
- ✅ Todas las tablas necesarias (`profiles`, `businesses`, `loyalty_cards`, `rewards`, etc.)
- ✅ Funciones RPC (`get_customer_loyalty_summary`, `process_loyalty`, etc.)
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers y funciones auxiliares

**Sin este script, la aplicación no funcionará correctamente.**

---

## ¿Dónde va este código?

* **ÚNICAMENTE** dentro de los archivos de implementación en `src/infrastructure/repositories/`.
* Ningún otro archivo en el proyecto (especialmente en `core` o `presentation`) debe importar `supabase`.
* Cada `Supabase...Repository` debe implementar una interfaz de `src/core/repositories/`.

---

## 1. Cómo importar el cliente

Siempre usa el cliente singleton que ya está configurado. Este cliente tiene las variables de entorno (`EXPO_PUBLIC_SUPABASE_URL`) cargadas.

```typescript
// En tu archivo (ej: src/infrastructure/repositories/SupabaseMiRepo.ts)
import { supabase } from '@/src/infrastructure/services/supabase';
````

-----

## 2. Manejo de errores

Casi todas las llamadas al SDK de Supabase devuelven un objeto con `{ data, error }`. **Siempre** debes manejar el `error`.

```typescript
const { data, error } = await supabase.from('mi_tabla')...

if (error) {
  // Opcional: loggear el error a Sentry/PostHog
  console.error('Error de Supabase:', error.message);
  // Lanzar el error para que el UseCase (y TanStack Query) lo atrape
  throw new Error(error.message);
}

// Si no hay error, devuelve la data
return data;
```

-----

## 3. Consultas comunes

### Patrón 1: Autenticación (Auth)

Para `login` y `register`, usas `supabase.auth`, no `from()`.

```typescript
// Ejemplo de src/infrastructure/repositories/SupabaseUserRepository.ts

// --- Para Login ---
async signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data.user;
}

// --- Para Registro ---
async signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // data se usará para poblar la tabla 'users' vía un Trigger de BD
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw new Error(error.message);
  return data.user;
}
```

### Patrón 2: Leer datos (SELECT)

Para obtener datos de una tabla.

```typescript
// --- Obtener MÚLTIPLES filas (ej. lista de recompensas) ---
async getRewards(businessId: string) {
  const { data, error } = await supabase
    .from('rewards') // Nombre de la tabla
    .select('*') // Qué columnas quieres
    .eq('business_id', businessId); // Filtro (WHERE business_id = ...)

  if (error) throw new Error(error.message);
  return data; // Devuelve un array
}

// --- Obtener UNA SOLA fila (ej. perfil de usuario) ---
// Ejemplo de src/infrastructure/repositories/SupabaseUserRepository.ts
async getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId) // Filtro (WHERE id = ...)
    .single(); // Le dice a Supabase que solo esperas UN objeto

  if (error) throw new Error(error.message);
  return data; // Devuelve un objeto, no un array
}
```

### Patrón 3: Escribir datos (INSERT / UPDATE)

Para crear o modificar filas.

```typescript
// --- Crear una fila (INSERT) ---
async createBusinessProfile(profileData) {
  const { data, error } = await supabase
    .from('business_profiles')
    .insert(profileData) // Inserta el objeto
    .single(); // Opcional: devuelve la fila recién creada

  if (error) throw new Error(error.message);
  return data;
}

// --- Actualizar una fila (UPDATE) ---
async updateBusinessProfile(profileId, updates) {
  const { data, error } = await supabase
    .from('business_profiles')
    .update(updates) // El objeto con los campos a cambiar
    .eq('id', profileId); // El filtro (WHERE id = ...)

  if (error) throw new Error(error.message);
  return data;
}
```

### Patrón 4: Lógica de negocio segura (RPC)

Para lógica compleja (como registrar una compra), no usamos `insert` o `update` directo. Llamamos a una **Función de PostgreSQL (RPC)** que hace el trabajo de forma segura en la base de datos.

```typescript
// Ejemplo de src/infrastructure/repositories/SupabaseLoyaltyRepository.ts

async processPurchase(userId: string, businessId: string, amount: number) {
  const { data, error } = await supabase
    .rpc('process_purchase', { // Nombre de la función en PostgreSQL
      // Argumentos que recibe la función
      p_user_id: userId,
      p_business_id: businessId,
      p_amount: amount,
    });

  if (error) {
    // La función de BD puede devolver errores personalizados
    throw new Error(`Error al procesar la compra: ${error.message}`);
  }
  return data; // La función puede devolver un resultado (ej. puntos nuevos)
}
```