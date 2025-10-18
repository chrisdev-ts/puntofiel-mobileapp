# Guía de UI: gluestack-ui + NativeWind

Usamos una combinación:
1.  **gluestack-ui**: Nos da los **componentes** (el "Qué").
2.  **NativeWind (Tailwind)**: Nos da los **estilos** (el "Cómo").

---

## 1. El "Qué": Componentes de gluestack-ui

**Regla:** No reinventes la rueda.

`gluestack-ui` es nuestra librería de componentes base. Nos da los bloques de construcción accesibles y listos para usar:

* `Box`, `VStack`, `HStack`
* `Text`, `Heading`
* `Button`, `Input`, `FormControl`
* `Modal`, `Card`, `Spinner`
* ...y muchos más.

➡️ **Documentación oficial:** [https://gluestack.io/ui/docs/components/all-components](https://gluestack.io/ui/docs/components/all-components)

### 1.1. Instalación de componentes

**Los componentes de gluestack-ui se instalan bajo demanda.** Si un componente no está en la carpeta `components/ui/`, debes instalarlo primero:

```bash
npx gluestack-ui add <nombre-del-componente>
```

**Ejemplos:**

```bash
npx gluestack-ui add box
npx gluestack-ui add button
npx gluestack-ui add input
npx gluestack-ui add spinner
npx gluestack-ui add toast
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