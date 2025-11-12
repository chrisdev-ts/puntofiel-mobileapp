# Guía de UI: gluestack-ui + NativeWind

Usamos una combinación:
1.  **gluestack-ui**: Nos da los **componentes** (el "Qué").
2.  **NativeWind (Tailwind)**: Nos da los **estilos** (el "Cómo").

---

## 1. El "Qué": Componentes de gluestack-ui

**Regla:** No reinventes la rueda. **SIEMPRE usa los componentes nativos de gluestack-ui antes de crear componentes personalizados.**

`gluestack-ui` es nuestra librería de componentes base. Nos da los bloques de construcción accesibles y listos para usar.

➡️ **Documentación oficial:** [https://gluestack.io/ui/docs/components/all-components](https://gluestack.io/ui/docs/components/all-components)

### 1.1. Componentes Disponibles

Estos son **TODOS** los componentes de gluestack-ui que puedes usar en el proyecto:

#### Layout & Structure
- `accordion` - Acordeones colapsables
- `box` - Contenedor genérico (equivalente a `<div>`)
- `card` - Tarjetas de contenido
- `center` - Centrar contenido
- `divider` - Líneas separadoras
- `grid` - Sistema de grid
- `hstack` - Stack horizontal
- `vstack` - Stack vertical

#### Forms & Inputs
- `checkbox` - Casillas de verificación
- `form-control` - Control de formularios
- `input` - Campos de texto
- `radio` - Botones de radio
- `select` - Selectores desplegables
- `slider` - Deslizadores de valor
- `switch` - Interruptores on/off
- `textarea` - Áreas de texto multilínea

#### Navigation & Actions
- `actionsheet` - Hojas de acciones
- `button` - Botones
- `fab` - Botón flotante de acción
- `link` - Enlaces
- `menu` - Menús desplegables
- `pressable` - Área presionable

#### Feedback & Overlays
- `alert` - Alertas y mensajes de feedback
- `alert-dialog` - Diálogos de confirmación
- `drawer` - Cajón lateral
- `modal` - Modales
- `popover` - Popovers
- `portal` - Portales para renderizado
- `spinner` - Indicadores de carga
- `toast` - Notificaciones temporales
- `tooltip` - Tooltips informativos
- `progress` - Barras de progreso
- `skeleton` - Esqueletos de carga

#### Content & Media
- `avatar` - Avatares de usuario
- `badge` - Insignias
- `heading` - Encabezados
- `icon` - Iconos
- `image` - Imágenes
- `table` - Tablas
- `text` - Texto

### 1.2. Instalación de componentes

**Los componentes de gluestack-ui se instalan bajo demanda.** Si un componente no está en la carpeta `components/ui/`, debes instalarlo primero:

```bash
npx gluestack-ui add <nombre-componente>
```

**Ejemplos:**

```bash
npx gluestack-ui add alert      # Para mensajes de feedback
npx gluestack-ui add toast      # Para notificaciones
npx gluestack-ui add spinner    # Para indicadores de carga
npx gluestack-ui add skeleton   # Para estados de carga
npx gluestack-ui add modal      # Para modales
```

---

## 2. El "Cómo": Estilos con NativeWind (Tailwind)

**Regla:** Usamos `className` para todo.

NativeWind nos permite usar la sintaxis de Tailwind CSS directamente en los componentes de React Native. Es rápido, consistente y está configurado en todo el proyecto.

* **En lugar de (style):** `style={{ padding: 16, marginTop: 8 }}`
* **Usa (className):** `className="p-4 mt-2"`

---

## 3. Cómo combinarlos

Este es el patrón que **debes** seguir. Importas el componente de `gluestack-ui` y lo estilizas *exclusivamente* con `className`.

```tsx
import { Box, Heading, Button, Text } from '@gluestack-ui/themed';
import { Link } from 'expo-router';

export function MiPantalla() {
  return (
    // Box de gluestack, estilizado con NativeWind
    <Box className="flex-1 bg-white p-6 justify-center">
      
      <Heading className="text-3xl font-bold text-center text-gray-900 mb-4">
        Bienvenido
      </Heading>

      <Text className="text-lg text-gray-600 text-center mb-8">
        Usa gluestack para los bloques y NativeWind para los estilos.
      </Text>

      <Button className="bg-blue-600 active:bg-blue-700 rounded-lg">
        <Text className="text-white font-semibold">Comenzar</Text>
      </Button>

    </Box>
  );
}