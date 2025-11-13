import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import type { BusinessCategory } from "@/src/core/entities/Business";
import { AppLayout } from "@/src/presentation/components/layout";
import { useCreateBusiness } from "@/src/presentation/hooks/useCreateBusiness";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { CameraIcon, ImageIcon } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView } from "react-native";
import { z } from "zod";

// Esquema de validación con Zod
const businessFormSchema = z.object({
    name: z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    category: z.enum([
        "food",
        "cafe",
        "restaurant",
        "retail",
        "services",
        "entertainment",
        "health",
        "other",
    ], {
        errorMap: () => ({ message: "Selecciona una categoría válida" }),
    }),
    locationAddress: z.string().optional(),
    directions: z.string().optional(),
    openingHours: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

const CATEGORY_LABELS: Record<BusinessCategory, string> = {
    food: "Comida",
    cafe: "Cafetería",
    restaurant: "Restaurante",
    retail: "Retail/Ropa",
    services: "Servicios",
    entertainment: "Entretenimiento",
    health: "Salud y Bienestar",
    other: "Otro",
};

export default function CreateBusinessFlow() {
    const router = useRouter();
    const toast = useToast();
    const user = useAuthStore((state) => state.user);
    const { createBusinessAsync, isCreating } = useCreateBusiness();

    // Control de pasos
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Estado para la imagen
    const [logoImage, setLogoImage] = useState<ImagePickerAsset | null>(null);

    // Estado para diálogo de éxito/error
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        message: string;
        type: "success" | "error";
    }>({ title: "", message: "", type: "success" });

    // Formulario con react-hook-form
    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<BusinessFormData>({
        resolver: zodResolver(businessFormSchema),
        defaultValues: {
            name: "",
            category: "other",
            locationAddress: "",
            directions: "",
            openingHours: "",
        },
        mode: "onChange",
    });

    // Observar cambios en todos los campos
    const formValues = watch();

    // Calcular progreso dinámicamente
    const calculateProgress = (): number => {
        let completedFields = 0;
        const totalFields = 6; // name, category, address, directions, hours, logo

        // Campos obligatorios (peso: 2 puntos cada uno)
        if (formValues.name && formValues.name.length >= 3) completedFields += 2;
        if (formValues.category && formValues.category !== "other") completedFields += 2;

        // Campos opcionales (peso: 1 punto cada uno)
        if (formValues.locationAddress && formValues.locationAddress.trim()) completedFields += 1;
        if (formValues.directions && formValues.directions.trim()) completedFields += 1;
        if (formValues.openingHours && formValues.openingHours.trim()) completedFields += 1;

        // Logo (peso: 1 punto)
        if (logoImage) completedFields += 1;

        // Calcular porcentaje (sobre 8 puntos totales)
        return Math.round((completedFields / 8) * 100);
    };

    const progressPercentage = calculateProgress();

    // Solicitar permisos de cámara y galería
    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryPermission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
            cameraPermission.status !== "granted" ||
            mediaLibraryPermission.status !== "granted"
        ) {
            toast.show({
                placement: "top",
                duration: 4000,
                render: ({ id }) => {
                    const uniqueToastId = `toast-${id}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="warning" variant="solid">
                            <ToastTitle>Permisos requeridos</ToastTitle>
                            <ToastDescription>
                                Necesitas otorgar permisos a la cámara y galería.
                            </ToastDescription>
                        </Toast>
                    );
                },
            });
            return false;
        }
        return true;
    };

    // Abrir galería
    const pickImageFromGallery = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5, // Compresión al 50% para reducir tamaño
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];

            // Validar tamaño (5MB = 5242880 bytes)
            if (asset.fileSize && asset.fileSize > 5242880) {
                toast.show({
                    placement: "top",
                    duration: 4000,
                    render: ({ id }) => {
                        const uniqueToastId = `toast-${id}`;
                        return (
                            <Toast nativeID={uniqueToastId} action="error" variant="solid">
                                <ToastTitle>Imagen muy grande</ToastTitle>
                                <ToastDescription>
                                    La imagen debe ser menor a 5MB. Por favor selecciona otra.
                                </ToastDescription>
                            </Toast>
                        );
                    },
                });
                return;
            }

            setLogoImage(asset);
        }
    };

    // Abrir cámara
    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5, // Compresión al 50%
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];

            // Validar tamaño
            if (asset.fileSize && asset.fileSize > 5242880) {
                toast.show({
                    placement: "top",
                    duration: 4000,
                    render: ({ id }) => {
                        const uniqueToastId = `toast-${id}`;
                        return (
                            <Toast nativeID={uniqueToastId} action="error" variant="solid">
                                <ToastTitle>Imagen muy grande</ToastTitle>
                                <ToastDescription>
                                    La imagen debe ser menor a 5MB. Por favor toma otra foto.
                                </ToastDescription>
                            </Toast>
                        );
                    },
                });
                return;
            }

            setLogoImage(asset);
        }
    };

    // Validar paso actual antes de continuar
    const validateCurrentStep = (): boolean => {
        const formData = watch();

        if (currentStep === 1) {
            return !!formData.name && formData.name.length >= 3 && !!formData.category;
        }
        return true;
    };

    // Navegar entre pasos
    const handleNext = () => {
        if (!validateCurrentStep()) {
            toast.show({
                placement: "top",
                duration: 3000,
                render: ({ id }) => {
                    const uniqueToastId = `toast-${id}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>Campos incompletos</ToastTitle>
                            <ToastDescription>
                                Por favor completa los campos obligatorios.
                            </ToastDescription>
                        </Toast>
                    );
                },
            });
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Enviar formulario
    const onSubmit = async (data: BusinessFormData) => {
        if (!user?.id) {
            setAlertConfig({
                title: "Error",
                message: "No se encontró el usuario autenticado",
                type: "error",
            });
            setShowAlert(true);
            return;
        }

        try {
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

            setAlertConfig({
                title: "¡Éxito!",
                message: "Tu negocio ha sido registrado correctamente",
                type: "success",
            });
            setShowAlert(true);
        } catch (error) {
            console.error("Error creando negocio:", error);
            setAlertConfig({
                title: "Error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Ocurrió un error al crear el negocio",
                type: "error",
            });
            setShowAlert(true);
        }
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        if (alertConfig.type === "success") {
            router.replace("/(owner)/(tabs)/home");
        }
    };

    return (
        <AppLayout>
            <ScrollView className="flex-1 bg-white">
                <VStack className="p-6 gap-6">
                    {/* Barra de progreso dinámica */}
                    <VStack className="gap-2">
                        <HStack className="justify-between items-center">
                            <Text className="text-sm text-gray-600">
                                Paso {currentStep} de {totalSteps}
                            </Text>
                            <Text className="text-sm font-semibold text-blue-600">
                                {progressPercentage}%
                            </Text>
                        </HStack>
                        <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <Box
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </Box>
                        {progressPercentage < 100 && (
                            <Text className="text-xs text-gray-500">
                                Completa todos los campos para avanzar
                            </Text>
                        )}
                    </VStack>

                    {/* Título */}
                    <Heading size="xl" className="text-gray-900">
                        Registrar Negocio
                    </Heading>

                    {/* Paso 1: Información básica */}
                    {currentStep === 1 && (
                        <VStack className="gap-4">
                            <Text className="text-base text-gray-700">
                                Ingresa la información básica de tu negocio
                            </Text>

                            {/* Nombre del negocio */}
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
                                {errors.name && (
                                    <FormControlError>
                                        <FormControlErrorText>{errors.name.message}</FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            {/* Categoría */}
                            <FormControl isInvalid={!!errors.category} isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText>Categoría</FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field: { onChange, value } }) => (
                                        <Select selectedValue={value} onValueChange={onChange}>
                                            <SelectTrigger>
                                                <SelectInput placeholder="Selecciona una categoría" />
                                                <SelectIcon className="mr-3" />
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper>
                                                        <SelectDragIndicator />
                                                    </SelectDragIndicatorWrapper>
                                                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                        <SelectItem key={key} label={label} value={key} />
                                                    ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    )}
                                />
                                {errors.category && (
                                    <FormControlError>
                                        <FormControlErrorText>
                                            {errors.category.message}
                                        </FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            {/* Dirección */}
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText>Dirección</FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="locationAddress"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input>
                                            <InputField
                                                placeholder="Calle, número, colonia"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                            />
                                        </Input>
                                    )}
                                />
                            </FormControl>

                            {/* Indicaciones (opcional) */}
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText>
                                        Indicaciones adicionales (opcional)
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="directions"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input>
                                            <InputField
                                                placeholder="Ej: Frente al parque central"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                multiline
                                                numberOfLines={2}
                                            />
                                        </Input>
                                    )}
                                />
                            </FormControl>
                        </VStack>
                    )}

                    {/* Paso 2: Horarios */}
                    {currentStep === 2 && (
                        <VStack className="gap-4">
                            <Text className="text-base text-gray-700">
                                Define tus horarios de atención
                            </Text>

                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText>Horarios de atención</FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="openingHours"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input>
                                            <InputField
                                                placeholder="Ej: Lunes a Viernes: 9:00 AM - 6:00 PM"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                multiline
                                                numberOfLines={3}
                                            />
                                        </Input>
                                    )}
                                />
                            </FormControl>

                            <Text className="text-sm text-gray-500 mt-2">
                                Puedes dejar este campo vacío y configurarlo después
                            </Text>
                        </VStack>
                    )}

                    {/* Paso 3: Logo */}
                    {currentStep === 3 && (
                        <VStack className="gap-4">
                            <Text className="text-base text-gray-700">
                                Sube el logo de tu negocio
                            </Text>

                            {/* Preview de la imagen */}
                            {logoImage ? (
                                <VStack className="gap-3">
                                    <Image
                                        source={{ uri: logoImage.uri }}
                                        alt="Logo del negocio"
                                        className="w-full h-64 rounded-lg"
                                        resizeMode="cover"
                                    />
                                    <Button
                                        variant="outline"
                                        onPress={() => setLogoImage(null)}
                                        className="border-red-500"
                                    >
                                        <ButtonText className="text-red-500">Eliminar imagen</ButtonText>
                                    </Button>
                                </VStack>
                            ) : (
                                <VStack className="gap-3">
                                    <Box className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center bg-gray-50">
                                        <Icon as={ImageIcon} size="xl" className="text-gray-400 mb-2" />
                                        <Text className="text-gray-600 text-center">
                                            No se ha seleccionado ninguna imagen
                                        </Text>
                                    </Box>

                                    {/* Botones para seleccionar imagen */}
                                    <HStack className="gap-3">
                                        <Pressable
                                            onPress={pickImageFromGallery}
                                            className="flex-1 bg-blue-500 p-4 rounded-lg items-center justify-center"
                                        >
                                            <Icon as={ImageIcon} size="lg" className="text-white mb-1" />
                                            <Text className="text-white font-semibold">Galería</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={takePhoto}
                                            className="flex-1 bg-blue-500 p-4 rounded-lg items-center justify-center"
                                        >
                                            <Icon as={CameraIcon} size="lg" className="text-white mb-1" />
                                            <Text className="text-white font-semibold">Cámara</Text>
                                        </Pressable>
                                    </HStack>
                                </VStack>
                            )}

                            <Text className="text-sm text-gray-500 mt-2">
                                Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP
                            </Text>
                        </VStack>
                    )}

                    {/* Botones de navegación */}
                    <HStack className="gap-3 mt-6">
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onPress={handleBack}
                                className="flex-1"
                                isDisabled={isCreating}
                            >
                                <ButtonText>Atrás</ButtonText>
                            </Button>
                        )}

                        {currentStep < totalSteps ? (
                            <Button onPress={handleNext} className="flex-1 bg-blue-500">
                                <ButtonText>Continuar</ButtonText>
                            </Button>
                        ) : (
                            <Button
                                onPress={handleSubmit(onSubmit)}
                                className="flex-1 bg-blue-500"
                                isDisabled={isCreating}
                            >
                                <ButtonText>
                                    {isCreating ? "Registrando..." : "Finalizar"}
                                </ButtonText>
                            </Button>
                        )}
                    </HStack>
                </VStack>
            </ScrollView>

            {/* AlertDialog para éxito/error */}
            <AlertDialog isOpen={showAlert} onClose={handleAlertClose}>
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading size="lg">{alertConfig.title}</Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text>{alertConfig.message}</Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onPress={handleAlertClose} className="bg-blue-500">
                            <ButtonText>Aceptar</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}