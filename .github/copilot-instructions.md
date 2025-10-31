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

### 4.6. Documentación técnica

**Antes de implementar cualquier funcionalidad, revisa la documentación en la carpeta `docs/`:**

  * **`ARCHITECTURE.md`** - Detalles de la arquitectura limpia y estructura de carpetas
  * **`SUPABASE.md`** - Configuración de Supabase, patrones de uso y funciones RPC
  * **`FORMS.md`** - Manejo de formularios con React Hook Form y Zod
  * **`STATE.md`** - Gestión de estado con Zustand y TanStack Query
  * **`GLUESTACK.md`** - Uso de componentes de gluestack-ui
  * **`LAYOUT.md`** - Estructura de navegación con Expo Router
  * **`script-maestro-puntofiel.sql`** - ⚠️ **FUENTE DE VERDAD ABSOLUTA** sobre la base de datos (tablas, funciones RPC, políticas RLS, triggers, índices)

Esta documentación contiene patrones establecidos, ejemplos de código y mejores prácticas específicas del proyecto.

**⚠️ IMPORTANTE - Base de Datos:**

Antes de trabajar con cualquier funcionalidad relacionada con Supabase o la base de datos:

1. **SIEMPRE revisa `docs/script-maestro-puntofiel.sql`** - Es la única fuente de verdad sobre el esquema de la base de datos
2. **Verifica la fecha de última modificación** en el encabezado del archivo (línea 5: "Ultima modificación")
3. **Recuerda al usuario verificar la fecha** para asegurarse de que está trabajando con la versión más reciente del script
4. Si encuentras inconsistencias entre el código y el script SQL, **el script SQL tiene prioridad absoluta**

### 4.7. Estándares de código y estilos

**Al modificar o crear componentes, sigue estas reglas:**

  * **Estilos:** Usar **siempre Tailwind CSS** (NativeWind) para estilos. **NO usar estilos inline ni StyleSheet** a menos que sea estrictamente necesario (ej: transformaciones dinámicas complejas).
  * **Valores hardcodeados:** Evitar valores hardcodeados (colores, tamaños, espaciados). Usar tokens de Tailwind o constantes centralizadas.
  * **Refactorización automática:** Si encuentras código con estilos inline, StyleSheet, o valores hardcodeados, **cámbialos a Tailwind automáticamente** sin preguntar, a menos que haya una razón técnica válida documentada en el código.

```typescript
// ❌ Incorrecto
<View style={{ backgroundColor: '#3B82F6', padding: 16, marginTop: 20 }}>
  <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Hola</Text>
</View>

// ❌ Incorrecto
const styles = StyleSheet.create({
  container: { backgroundColor: '#3B82F6', padding: 16 }
});

// ✅ Correcto
<View className="bg-blue-500 p-4 mt-5">
  <Text className="text-white text-lg">Hola</Text>
</View>
```