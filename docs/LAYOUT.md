# Layout: La estructura de tus pantallas

Todas las pantallas siguen la misma estructura visual. **`AppLayout` es el único componente que debes usar** para armar tus pantallas. No compongas manualmente `Header` y `NavBar` a menos que tengas un caso muy especial.

---

## `AppLayout` te da:


* **Padding de 16px** en todo el contenido (horizontal y vertical, gestionado automáticamente).
* **Espaciado vertical** entre elementos con `VStack` (configurable con `contentSpacing`).
* **Header y NavBar opcionales** (los activas/desactivas según necesites).
* **Scrollable o fijo** (para cuando necesites un `FlatList` interno).
* **Cálculo automático del `safe area`** para iOS y Android.

### Props principales:

```typescript
interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;              // Default: true
  showNavBar?: boolean;              // Default: true
  headerVariant?: "default" | "back"; // "default" = logo, "back" = botón volver
  headerTitle?: string;              // Solo en variant="back"
  headerRightElement?: ReactNode;    // Solo en variant="default"
  onBackPress?: () => void;          // Función custom al presionar back
  scrollable?: boolean;              // Default: true
  backgroundColor?: string;          // Default: "bg-gray-50"
  contentSpacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"; // Default: "lg"
}
```

---

## Casos de uso comunes

### 1. Pantalla básica con Header + NavBar

La configuración más común. El usuario puede navegar entre tabs y ver el logo de la app.

```tsx
import { AppLayout } from "@/src/presentation/components/layout";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function HomeScreen() {
  return (
    <AppLayout> {/* Todo por defecto */}
      <Heading size="xl" className="text-primary-500">
        Inicio
      </Heading>
      <Text>Bienvenido a PuntoFiel</Text>
      {/* Los children se envuelven automáticamente en VStack con space="lg" */}
    </AppLayout>
  );
}
```

### 2. Header con botón "Volver" (sin NavBar)

Para pantallas de detalle o formularios. El `variant="back"` muestra automáticamente una flecha `<-` a la izquierda.

```tsx
import { AppLayout } from "@/src/presentation/components/layout";
import { RewardForm } from "@/src/presentation/components/rewards";

export default function EditRewardScreen() {
  return (
    <AppLayout
      headerVariant="back"           // Muestra el botón de back
      headerTitle="Editar recompensa" // Título al lado del botón
      showNavBar={false}             // No mostrar tabs aquí
    >
      <RewardForm mode="edit" />
    </AppLayout>
  );
}
```

### 3. Header con elemento personalizado a la derecha

Por ejemplo, un botón de notificaciones o de configuración.

```tsx
import { AppLayout } from "@/src/presentation/components/layout";
import { Pressable } from "react-native";
import { SettingsIcon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

export default function ProfileScreen() {
  const handleSettings = () => {
    console.log("Abrir configuración");
  };

  return (
    <AppLayout
      headerVariant="default"        // Muestra el logo
      headerRightElement={
        <Pressable onPress={handleSettings}>
          <Icon as={SettingsIcon} size="xl" className="text-primary-500" />
        </Pressable>
      }
    >
      {/* Contenido del perfil */}
    </AppLayout>
  );
}
```

### 4. Sin Header ni NavBar (modal o flujo especial)

Para pantallas de autenticación, onboarding o modales a pantalla completa.

```tsx
import { AppLayout } from "@/src/presentation/components/layout";
import { LoginForm } from "@/src/presentation/components/auth";

export default function LoginScreen() {
  return (
    <AppLayout
      showHeader={false}
      showNavBar={false}
      backgroundColor="bg-white"
    >
      <LoginForm />
    </AppLayout>
  );
}
```

### 5. Contenido fijo (para `FlatList` o `SectionList`)

Cuando el scroll no lo maneja `AppLayout`, sino un componente interno como `FlatList`.

```tsx
import { AppLayout } from "@/src/presentation/components/layout";
import { FlatList } from "react-native";
import { RewardCard } from "@/src/presentation/components/rewards";

export default function RewardsListScreen({ rewards }) {
  return (
    <AppLayout
      scrollable={false} // Importante: el FlatList hace su propio scroll
      contentSpacing="md" // Ajusta el espacio según diseño
    >
      <FlatList
        data={rewards}
        renderItem={({ item }) => <RewardCard reward={item} />}
        keyExtractor={(item) => item.id}
      />
    </AppLayout>
  );
}
```

### 6. Espaciado personalizado entre elementos

Por defecto, `AppLayout` usa `space="lg"` en el `VStack`. Puedes cambiarlo con `contentSpacing`.

```tsx
import { AppLayout } from "@/src/presentation/components/layout";
import { Button, ButtonText } from "@/components/ui/button";

export default function ActionsScreen() {
  return (
    <AppLayout contentSpacing="sm"> {/* Menos espacio entre botones */}
      <Button><ButtonText>Acción 1</ButtonText></Button>
      <Button><ButtonText>Acción 2</ButtonText></Button>
      <Button><ButtonText>Acción 3</ButtonText></Button>
    </AppLayout>
  );
}
```

---

## Header y NavBar (componentes internos)

**Nota:** Normalmente **NO** usas estos componentes directamente. `AppLayout` los maneja por ti.

### Header

Dos variantes: `default` (con logo) y `back` (con flecha de volver).

```tsx
// variant="default": Logo a la izquierda + elemento derecho opcional
<Header
  variant="default"
  rightElement={<BellIcon />} // Si no pasas nada, muestra notificaciones por defecto
/>

// variant="back": Flecha + título
<Header
  variant="back"
  title="Detalle de recompensa"
  onBackPress={() => router.back()} // Opcional, por defecto usa router.back()
/>
```

### NavBar

La navegación inferior se adapta automáticamente según el **rol del usuario** (detectado con `useAuth`):

| Rol        | Tabs                                           |
| :--------- | :--------------------------------------------- |
| `customer` | Inicio, Mi QR, Perfil (3 tabs)                 |
| `owner`    | Inicio, Recompensas, Escanear, Rifas, Perfil (5 tabs) |
| `employee` | Escanear, Perfil (2 tabs)                      |

El `NavBar` detecta automáticamente la ruta activa y pinta el tab correspondiente con `primary-500`.