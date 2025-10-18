# Estado: ¿Zustand o TanStack Query?

Tenemos dos herramientas de estado. Usarlas mal es la forma más rápida de crear bugs y código lento.

* **TanStack Query** maneja **Estado del Servidor** (Datos que viven en Supabase).
* **Zustand** maneja **Estado Global del Cliente** (Datos que *solo* existen en la app).

---

## 1. TanStack Query (el dueño de los datos del servidor)

Usamos `useQuery` y `useMutation` para CUALQUIER operación de Supabase. Esto nos da gratis:
* Caching
* Revalidación automática (Refetch)
* Estados de `isLoading`, `isError`, `isSuccess`

### Cuándo usarlo:

* **`useQuery` (Leer datos):**
    * Obtener el perfil del usuario.
    * Obtener la lista de recompensas de un negocio.
    * Obtener el historial de transacciones.

* **`useMutation` (Escribir datos):**
    * Login (`signInWithPassword`).
    * Registro (`signUp`).
    * Procesar una compra (`processPurchase`).
    * Canjear una recompensa.

Tu `useAuth.ts` y `useScan.ts` **ya siguen este patrón** al usar `useMutation`. Perfecto. Sigan así.

**❌ ANTIPATRÓN:** Nunca hagas esto:
```tsx
// ¡MAL! No guardes datos del servidor en Zustand manualmente.
const { data } = await supabase.from('profile')...
useProfileStore.setState({ profile: data }) // 👈 ¡NO!
````

-----

## 2. Zustand (el dueño del estado de la UI global)

Usamos Zustand para datos globales que **no** viven en la base de datos. Es para estado efímero de la UI que múltiples pantallas necesitan conocer.

### Cuándo usarlo:

  * **El estado de la sesión:** ¿Hay un usuario logueado *ahora mismo*? (El hook `useAuth` debe poner el objeto `session` de Supabase aquí para que toda la app reaccione).
  * **Flujos de UI:** ¿El usuario ya completó el *onboarding*?
  * **Preferencias del Dispositivo:** ¿Está el modo oscuro activado?
  * **Datos temporales:** Guardar los datos del formulario de registro *mientras* el usuario pasa de la "Paso 1" al "Paso 2".

-----

## Resumen

| ¿Qué quieres guardar? | ¿Dónde va? | Ejemplo |
| :--- | :--- | :--- |
| ¿Datos de la BD? (Perfil, Puntos, Recompensas) | **TanStack Query** | `useQuery(['profile', userId], ...)` |
| ¿Vas a cambiar datos en la BD? (Login, Compra) | **TanStack Query** | `useMutation({ mutationFn: loginUseCase })` |
| ¿Estado de la sesión? (Quién está logueado) | **Zustand** | `useSessionStore(s => s.session)` |
| ¿Estado global de la UI? (Modo oscuro) | **Zustand** | `useSettingsStore(s => s.theme)` |