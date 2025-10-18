# Formularios: RHF + Zod + gluestack

Esta es la receta **oficial** para crear formularios. Usamos este stack para validar datos, manejar el estado de los *inputs* y mostrar errores de forma automática y consistente.

* **React Hook Form (RHF):** Gestiona el estado del formulario, el *submit* y la validación.
* **Zod:** Define el "esquema" (la forma) de nuestros datos y las reglas de validación.
* **gluestack-ui:** Provee los componentes (`Input`, `FormControl`, etc.).

---

## Ejemplo: "Crear un formulario de login"

Sigue estos 3 pasos.

### Paso 1. Definir el esquema (con Zod)

Define la forma de tus datos y sus reglas. Esto vive en el mismo archivo que la pantalla o en un archivo `schema.ts` separado.

```typescript
// src/presentation/screens/Auth/LoginSchema.ts
import { z } from 'zod';

// 1. Define el esquema de validación
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email no válido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// 2. Infiere el "tipo" de TypeScript desde el esquema
export type LoginFormValues = z.infer<typeof loginSchema>;
```

### Paso 2. Configurar `useForm` (en la screen)

En tu componente de pantalla, instancia `useForm` y conéctalo a Zod usando el `zodResolver`.

```typescript
// src/presentation/screens/Auth/LoginScreen.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from './LoginSchema';
import { useAuth } from '@/src/presentation/hooks/useAuth'; // Tu hook de mutación

// ... (importa Button, Input, FormControl, etc. de gluestack)

export default function LoginScreen() {
  // Tu hook de TanStack Query
  const { login, isLoading } = useAuth();

  // 1. Configura RHF
  const {
    control, // El "cerebro" que conecta los inputs
    handleSubmit, // Envuelve tu función de submit
    formState: { errors }, // Objeto con todos los errores de validación
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // Conecta RHF con Zod
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 2. Función de Submit (limpia)
  // Esta función SOLO se llama si la validación de Zod pasa
  const onSubmit = (data: LoginFormValues) => {
    login(data); // Llama a la mutación de TanStack Query
  };

  // ... (el JSX va abajo)
}
```

### Paso 3. Conectar la UI (con `Controller`)

**Este es el paso más importante.** No puedes usar `Input` de gluestack directamente. Debes envolverlo en un componente `Controller` de RHF para que el estado y los errores se manejen automáticamente.

```typescript
// ... (Dentro del return de LoginScreen)

<VStack space="md" className="w-full">
  {/* CAMPO DE EMAIL */}
  <FormControl
    isInvalid={!!errors.email} // Pinta el campo de rojo si hay error
    className="mb-4"
  >
    <FormControlLabel>
      <FormControlLabelText>Email</FormControlLabelText>
    </FormControlLabel>
    
    <Controller
      control={control}
      name="email" // Debe coincidir con el nombre en el schema Zod
      render={({ field: { onChange, onBlur, value } }) => (
        <Input>
          <InputField
            placeholder="correo@ejemplo.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </Input>
      )}
    />
    
    {/* Muestra el mensaje de error de Zod */}
    <FormControlError>
      <FormControlErrorIcon as={AlertCircleIcon} />
      <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
    </FormControlError>
  </FormControl>

  {/* ... (Repetir el patrón para el campo "password") ... */}

  {/* BOTÓN DE SUBMIT */}
  <Button
    onPress={handleSubmit(onSubmit)} // Usa handleSubmit para validar antes de llamar a onSubmit
    isDisabled={isLoading}
    className="bg-blue-600"
  >
    {isLoading ? <Spinner /> : <ButtonText>Entrar</ButtonText>}
  </Button>
</VStack>
```