# Formularios Multi-Paso

Esta es la **receta oficial** para crear formularios con múltiples pasos. Usamos componentes reutilizables que siguen los principios de Clean Architecture y el Single Responsibility Principle.

**¿Qué es un formulario multi-paso?**

Un formulario dividido en secciones lógicas (steps), donde el usuario avanza paso a paso, validando información antes de continuar. Ejemplos:
- Crear/Editar negocio (3 pasos: Info básica → Horarios → Logo)
- Crear recompensa (2 pasos: Detalles → Imagen)

---

## Componentes clave del patrón

### 1. `ProgressBar` - Barra de progreso visual

Muestra el progreso actual del usuario en el formulario.

**Props:**
```typescript
interface ProgressBarProps {
  currentStep: number;        // Paso actual (1-based)
  totalSteps: number;         // Total de pasos
  showLabels?: boolean;       // Mostrar "Paso X de Y" y "X%"
  showHelperText?: boolean;   // Mostrar mensaje de ayuda
  helperText?: string;        // Texto personalizado del mensaje
  height?: number;            // Altura de la barra (px)
}
```

**Ejemplo:**
```tsx
import { ProgressBar } from "@/src/presentation/components/common";

<ProgressBar
  currentStep={2}
  totalSteps={3}
  showLabels={true}
  showHelperText={true}
  helperText="Completa todos los campos para avanzar"
/>
```

**Resultado visual:**
```
Paso 2 de 3                    67%
████████████████████░░░░░░░░░░
Completa todos los campos para avanzar
```

---

### 2. `ImagePicker` - Selector de imágenes

Componente reutilizable para seleccionar imágenes desde galería o cámara.

**Props:**
```typescript
interface ImagePickerProps {
  selectedImage: ImagePickerAsset | null;
  onImageSelected: (image: ImagePickerAsset | null) => void;
  title?: string;
  helperText?: string;
  maxSize?: number;           // MB (default: 5)
  aspectRatio?: [number, number]; // default: [1, 1]
  quality?: number;           // 0-1 (default: 0.5)
  imageHeight?: number;       // px (default: 300)
}
```

**Ejemplo:**
```tsx
import { ImagePicker } from "@/src/presentation/components/common";
import type { ImagePickerAsset } from "expo-image-picker";

const [image, setImage] = useState<ImagePickerAsset | null>(null);

<ImagePicker
  selectedImage={image}
  onImageSelected={setImage}
  title="Sube el logo de tu negocio"
  helperText="Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP"
  aspectRatio={[1, 1]}
  quality={0.8}
/>
```

**Características:**
- ✅ Manejo automático de permisos (cámara y galería)
- ✅ Validación de tamaño de archivo
- ✅ Preview de imagen seleccionada
- ✅ Botones para cambiar imagen (Galería / Cámara)
- ✅ Aspect ratio configurable
- ✅ Compresión de imagen

---

### 3. `AppLayout` con header dinámico

Para formularios multi-paso, usa `AppLayout` con `headerVariant` dinámico.

**Props clave:**
```typescript
interface AppLayoutProps {
  headerVariant?: "default" | "back";  // Cambia según modo
  headerTitle?: string;                // Título en modo "back"
  onBackPress?: () => void;            // Handler personalizado
  showNavBar?: boolean;                // Ocultar tabs en formularios
}
```

**Patrón recomendado:**
```tsx
const [currentStep, setCurrentStep] = useState(1);
const isEditMode = mode === "edit";

const handleHeaderBack = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1); // Retroceder step
  } else {
    router.back(); // Salir del formulario
  }
};

<AppLayout
  showNavBar={false}
  headerVariant={isEditMode ? "back" : "default"}
  headerTitle={isEditMode ? "Editar negocio" : undefined}
  onBackPress={handleHeaderBack}
>
  {/* Contenido del formulario */}
</AppLayout>
```

---

### Estructura de archivos

```
components/
  business/
    BusinessFormStep1.tsx  # Paso 1: Info básica
    BusinessFormStep2.tsx  # Paso 2: Horarios
    BusinessFormStep3.tsx  # Paso 3: Logo
    index.ts               # Exporta todos los steps
  rewards/
    RewardFormStep1.tsx    # Paso 1: Detalles
    RewardFormStep2.tsx    # Paso 2: Imagen
    index.ts
```

---

## Ejemplo completo: Formulario de 3 pasos

### Paso 1: Crear los componentes de Steps

#### `BusinessFormStep1.tsx`

```tsx
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import type { BusinessFormData } from "./BusinessFormSchema";

type BusinessFormStep1Props = {
  control: Control<BusinessFormData>;
  errors: FieldErrors<BusinessFormData>;
  onNext: () => void;
};

export function BusinessFormStep1({ control, errors, onNext }: BusinessFormStep1Props) {
  return (
    <VStack className="gap-4">
      <FormControl isInvalid={!!errors.name} isRequired>
        <FormControlLabel>
          <FormControlLabelText>Nombre del negocio</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Ej: Cafetería El Portal"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />
      </FormControl>

      <Button onPress={onNext} variant="solid" action="primary">
        <ButtonText>Continuar</ButtonText>
      </Button>
    </VStack>
  );
}
```

#### `BusinessFormStep2.tsx`

```tsx
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { BusinessHoursSelector } from "./BusinessHoursSelector";
import type { BusinessFormData } from "./BusinessFormSchema";

type BusinessFormStep2Props = {
  control: Control<BusinessFormData>;
  onNext: () => void;
  onBack: () => void;
};

export function BusinessFormStep2({ control, onNext, onBack }: BusinessFormStep2Props) {
  return (
    <VStack className="gap-4">
      <Controller
        control={control}
        name="openingHours"
        render={({ field: { onChange, value } }) => (
          <BusinessHoursSelector onChange={onChange} initialValue={value} />
        )}
      />

      <HStack className="gap-3">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <ButtonText>Atrás</ButtonText>
        </Button>
        <Button onPress={onNext} className="flex-1" variant="solid" action="primary">
          <ButtonText>Continuar</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}
```

#### `BusinessFormStep3.tsx`

```tsx
import type { ImagePickerAsset } from "expo-image-picker";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ImagePicker } from "@/src/presentation/components/common";

type BusinessFormStep3Props = {
  logoImage: ImagePickerAsset | null;
  onImageSelected: (image: ImagePickerAsset | null) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
};

export function BusinessFormStep3({
  logoImage,
  onImageSelected,
  onSubmit,
  onBack,
  isSubmitting,
  isEditMode,
}: BusinessFormStep3Props) {
  return (
    <VStack className="gap-4">
      <ImagePicker
        selectedImage={logoImage}
        onImageSelected={onImageSelected}
        title="Sube el logo de tu negocio"
        helperText="Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP"
      />

      <HStack className="gap-3">
        <Button variant="outline" onPress={onBack} className="flex-1" isDisabled={isSubmitting}>
          <ButtonText>Atrás</ButtonText>
        </Button>
        <Button onPress={onSubmit} className="flex-1" isDisabled={isSubmitting} variant="solid" action="primary">
          <ButtonText>
            {isSubmitting
              ? isEditMode ? "Actualizando..." : "Registrando..."
              : isEditMode ? "Guardar cambios" : "Finalizar"}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}
```

### Paso 2: Exportar desde `index.ts`

```tsx
// components/business/index.ts
export { BusinessFormStep1 } from "./BusinessFormStep1";
export { BusinessFormStep2 } from "./BusinessFormStep2";
export { BusinessFormStep3 } from "./BusinessFormStep3";
```

### Paso 3: Crear el formulario principal (Orquestador)

```tsx
// screens/owner/business/CreateBusinessFlow.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import type { ImagePickerAsset } from "expo-image-picker";
import { Heading } from "@/components/ui/heading";
import { AppLayout } from "@/src/presentation/components/layout";
import { ProgressBar } from "@/src/presentation/components/common";
import {
  BusinessFormStep1,
  BusinessFormStep2,
  BusinessFormStep3,
} from "@/src/presentation/components/business";
import { businessFormSchema, type BusinessFormData } from "./BusinessFormSchema";
import { useCreateBusiness } from "@/src/presentation/hooks/useCreateBusiness";

export default function CreateBusinessFlow({ isEditMode = false, businessId }: CreateBusinessFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [logoImage, setLogoImage] = useState<ImagePickerAsset | null>(null);

  const { createBusinessAsync, isCreating } = useCreateBusiness();

  const { control, handleSubmit, formState: { errors }, watch } = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      category: undefined,
      locationAddress: "",
      directions: "",
      openingHours: "",
    },
  });

  // Validación antes de avanzar
  const validateCurrentStep = (): boolean => {
    const formData = watch();
    if (currentStep === 1) {
      return !!formData.name && formData.name.length >= 3 && !!formData.category;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      // Mostrar toast de error
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleHeaderBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: BusinessFormData) => {
    await createBusinessAsync({
      businessData: {
        ownerId: user.id,
        name: data.name,
        category: data.category,
        locationAddress: data.locationAddress || undefined,
        openingHours: data.openingHours || undefined,
      },
      logoUri: logoImage?.uri,
    });
    router.back();
  };

  return (
    <AppLayout
      showNavBar={false}
      headerVariant={isEditMode ? "back" : "default"}
      headerTitle={isEditMode ? "Editar negocio" : undefined}
      onBackPress={handleHeaderBack}
    >
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        showLabels={true}
        showHelperText={true}
      />

      <Heading size="xl" className="text-gray-900">
        {isEditMode ? "Editar negocio" : "Registrar negocio"}
      </Heading>

      {currentStep === 1 && (
        <BusinessFormStep1
          control={control}
          errors={errors}
          onNext={handleNext}
        />
      )}

      {currentStep === 2 && (
        <BusinessFormStep2
          control={control}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <BusinessFormStep3
          logoImage={logoImage}
          onImageSelected={setLogoImage}
          onSubmit={handleSubmit(onSubmit)}
          onBack={handleBack}
          isSubmitting={isCreating}
          isEditMode={isEditMode}
        />
      )}
    </AppLayout>
  );
}
```
