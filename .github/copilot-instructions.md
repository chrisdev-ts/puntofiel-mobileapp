# Contexto del proyecto: PuntoFiel

Este documento proporciona el contexto completo para el desarrollo de "PuntoFiel". Por favor, utiliza esta información como la única fuente de verdad al generar código, sugerencias o explicaciones.

## 1. Visión general y metodología

**PuntoFiel** es una aplicación móvil de fidelización para negocios locales, desarrollada en 3 meses por un equipo de 5 personas.

Utilizamos un modelo híbrido **Kanban + Crystal Clear**, enfocado en el flujo continuo, la comunicación radical y la mejora constante. Nuestra prioridad es **terminar trabajo antes de empezar nuevo trabajo.**

---

## 2. Arquitectura de la aplicación: Arquitectura Limpia (Clean Architecture)

La estructura del código sigue estrictamente los principios de la Arquitectura Limpia para asegurar la separación de responsabilidades y la testabilidad. **La regla de oro es la Inversión de Dependencia:** las capas externas dependen de las internas, pero el `core` no depende de nada.

### 2.1. Capas y estructura de carpetas

```

src/
├── core/             \# Capa de Dominio: Lógica de negocio pura (agnóstica al framework).
│   ├── entities/     \#  - Interfaces de datos (User, Business).
│   ├── repositories/ \#  - Interfaces de repositorios (IUserRepository).
│   └── usecases/     \#  - Clases con acciones de negocio (LoginUserUseCase).
│
├── infrastructure/   \# Capa de Datos: Servicios externos, APIs, base de datos.
│   ├── repositories/ \#  - Implementaciones (SupabaseUserRepository).
│   ├── services/     \#  - Clientes externos (Supabase, Sentry).
│   └── config/       \#  - Configuración (variables de entorno).
│
└── presentation/     \# Capa de UI: Componentes, hooks y pantallas de React Native.
├── components/   \#  - Componentes de UI reutilizables.
├── hooks/        \#  - Hooks de React que conectan la UI con los 'usecases'.
└── screens/      \#  - Pantallas completas de la aplicación.

````

* **Rutas:** La carpeta `app/` en la raíz contiene **únicamente** la definición de rutas de **Expo Router**. Estos archivos solo importan y renderizan las pantallas reales desde `src/presentation/screens/`.

### 2.2. Flujo de datos y patrones de diseño

* **Flujo:** `Presentation (Hook)` → `Core (UseCase)` → `Core (Repository Interface)` → `Infrastructure (Repository Implementation)` → `Supabase`.
* **Patrones Clave:**
    * **Repositorio:** Interfaces en `core`, implementaciones en `infrastructure`.
    * **MVVM:** Dentro de `presentation`, el componente de React Native actúa como `ViewModel`.
    * **Singleton:** Para el cliente de Supabase.
    * **Facade:** Para simplificar procesos complejos (ej. escaneo de QR).
    * **Observer:** Para actualizaciones reactivas de la UI.

---

## 3. Stack tecnológico

* **Framework:** Expo (~54.0) con React Native (0.81.4)
* **Lenguaje:** TypeScript
* **Backend:** Supabase (PostgreSQL)
* **Navegación:** Expo Router
* **UI:** gluestack-ui
* **Estado del Servidor:** TanStack Query (`@tanstack/react-query`)
* **Estado del Cliente:** Zustand
* **Formularios:** React Hook Form & Zod
* **Calidad de Código:** Biome (linter y formateador)
* **Gestor de Paquetes:** pnpm
* **Control de Versiones:** Git y GitHub
* **CI/CD:** GitHub Actions y Expo EAS

---

## 4. Convenciones y flujos de trabajo

### 4.1. Convenciones de importación

**Siempre usar el alias de ruta `@/`** - nunca importaciones relativas (`../`):

```typescript
// ✅ Correcto
import { User } from '@/src/core/entities/User';
import { supabase } from '@/src/infrastructure/services/supabase';

// ❌ Incorrecto
import { User } from '../../../core/entities/User';
````

### 4.2. Variables de entorno

Las variables de entorno deben usar el prefijo `EXPO_PUBLIC_` para ser accesibles en el cliente. Se gestionan en `src/infrastructure/config/env.ts`.

  * **Variables requeridas en `.env`:**
      * `EXPO_PUBLIC_SUPABASE_URL`
      * `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 4.3. Flujos de trabajo en la terminal

  * **Desarrollo:**
    ```bash
    pnpm start          # Iniciar el servidor de desarrollo de Expo
    pnpm run android    # Ejecutar en Android
    pnpm run ios        # Ejecutar en iOS
    ```
  * **Calidad de código:**
    ```bash
    pnpm run check      # Ejecutar linter y formateador de Biome
    ```

### 4.4. Integración con Supabase

El cliente de Supabase está pre-configurado en `src/infrastructure/services/supabase.ts`.

```typescript
import { supabase } from '@/src/infrastructure/services/supabase';

// Operaciones de base de datos
const { data, error } = await supabase.from('table_name').select('*');

// Operaciones de autenticación
const { data, error } = await supabase.auth.signUp({ email, password });
```

### 4.5. Nomenclatura y comentarios

  * **Nomenclatura:** `PascalCase` para componentes y clases. `camelCase` para funciones y variables.
  * **Comentarios:** Usar español para explicar la lógica de negocio.