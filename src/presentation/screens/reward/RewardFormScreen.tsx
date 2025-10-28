import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useBusinessId } from '@/src/presentation/hooks/useBusinessId';
import { useReward } from '@/src/presentation/hooks/useReward';
import { Spinner, Textarea, TextareaInput } from '@gluestack-ui/themed';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CameraIcon, ImageIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Platform, Pressable, ScrollView } from 'react-native';
import type { CreateRewardFormValues } from './RewardSchema';
import { createRewardSchema } from './RewardSchema';


type RewardFormScreenProps = {
    mode: 'create' | 'edit';
    initialData?: {
        name: string;
        description?: string;
        points_required: number;
        image_url?: string;
    };
    rewardId?: string; // Necesario para modo edit
};

export default function RewardFormScreen({
    mode = 'create',
    initialData,
    rewardId,
}: RewardFormScreenProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const isEditMode = mode === 'edit';

    // Hooks de TanStack Query
    const { data: businessId, isLoading: loadingBusiness } = useBusinessId();
    const {
        createReward,
        isCreating,
        createError,
        createSuccess,
        updateReward,
        isUpdating,
        updateError,
        updateSuccess,
        resetCreate,
        resetUpdate,
    } = useReward(businessId);

    // React Hook Form
    const {
        control,
        handleSubmit,
        formState: { errors },
        trigger,
    } = useForm<CreateRewardFormValues>({
        resolver: zodResolver(createRewardSchema),
        defaultValues: initialData || {
            name: '',
            description: '',
            points_required: 0,
        },
    });

    // Navegación automática cuando success
    useEffect(() => {
        if (createSuccess || updateSuccess) {
            Alert.alert(
                'Éxito',
                isEditMode
                    ? 'Recompensa actualizada correctamente'
                    : 'Recompensa creada correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetCreate();
                            resetUpdate();
                            router.back();
                        },
                    },
                ]
            );
        }
    }, [createSuccess, updateSuccess, isEditMode, router, resetCreate, resetUpdate]);

    // Permisos de imagen
    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryPermission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
            cameraPermission.status !== 'granted' ||
            mediaLibraryPermission.status !== 'granted'
        ) {
            Alert.alert(
                'Permisos requeridos',
                'Necesitas otorgar permisos a la cámara y galería para continuar.'
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // Avanzar al paso 2
    const handleNextStep = async () => {
        const isValid = await trigger(['name', 'description', 'points_required']);
        if (isValid) {
            setStep(2);
        }
    };

    // Submit final
    const handleFormSubmit = (data: CreateRewardFormValues) => {
        if (!businessId) {
            Alert.alert('Error', 'No se encontró el ID del negocio');
            return;
        }

        if (isEditMode && rewardId) {
            // Actualizar recompensa
            updateReward({
                rewardId,
                dto: {
                    name: data.name,
                    description: data.description || undefined,
                    pointsRequired: data.points_required,
                },
                imageUri: image?.uri, // Pasar nueva imagen si existe
            });
        } else {
            // Crear recompensa
            createReward({
                dto: {
                    businessId,
                    name: data.name,
                    description: data.description || undefined,
                    pointsRequired: data.points_required,
                },
                imageUri: image?.uri, // Pasar imagen si existe
            });
        }
    };

    if (loadingBusiness) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center">
                <Spinner size="large" color="#2F4858" />
                <Text className="text-[#6A6A6A] mt-4">Cargando...</Text>
            </Box>
        );
    }

    const isSubmitting = isCreating || isUpdating;
    const submitError = createError || updateError;

    return (
        <Box className="flex-1 bg-[#FFFFFF]">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <VStack className="p-6" space="lg">
                    {/* Barra de Progreso */}
                    <Box className="w-full h-2 bg-[#F2F2F2] rounded-lg overflow-hidden">
                        <Box
                            className="h-2 bg-[#2F4858] rounded-lg"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </Box>

                    {/* Títulos Dinámicos */}
                    <VStack space="xs">
                        <Heading className="text-2xl font-extrabold text-[#2F4858] text-center">
                            {step === 1
                                ? isEditMode
                                    ? 'Editar recompensa'
                                    : 'Registrar recompensa'
                                : 'Subir una foto para tu recompensa'}
                        </Heading>
                        <Text className="text-lg text-[#6A6A6A] text-center">
                            {step === 1
                                ? isEditMode
                                    ? 'Edita la información de tu recompensa en base a tus criterios.'
                                    : 'Ingresa la información de la recompensa para poder darla de alta en tu negocio.'
                                : 'Sube una imagen o toma una foto para tu recompensa.'}
                        </Text>
                    </VStack>

                    {/* Mostrar errores globales */}
                    {submitError && (
                        <Box className="bg-red-50 p-3 rounded-lg">
                            <Text className="text-[#F44336] text-sm">{submitError.message}</Text>
                        </Box>
                    )}

                    {/* PASO 1: Formulario */}
                    {step === 1 && (
                        <VStack space="lg">
                            {/* Campo Nombre */}
                            <FormControl isInvalid={!!errors.name} isRequired={true}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-base font-medium text-[#2F4858]">
                                        Nombre de la recompensa
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="name"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            variant="outline"
                                            size="lg"
                                            className="bg-[#FFFFFF] border border-[#CCCCCC] rounded-lg"
                                        >
                                            <InputField
                                                placeholder="Nombre de la recompensa"
                                                placeholderTextColor="#888888"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                            />
                                        </Input>
                                    )}
                                />
                                {errors.name && (
                                    <FormControlError className="mt-1">
                                        <FormControlErrorText className="text-xs text-[#F44336]">
                                            {errors.name.message}
                                        </FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            {/* Campo Detalles */}
                            <FormControl isInvalid={!!errors.description} isRequired={true}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-base font-medium text-[#2F4858]">
                                        Detalles
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Textarea
                                            className="bg-[#FFFFFF] border border-[#CCCCCC] rounded-lg min-h-[150px]"
                                        >
                                            <TextareaInput
                                                placeholder="Descripción de la recompensa..."
                                                placeholderTextColor="#888888"
                                                value={value || ''}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                className="text-base text-[#333333] p-3"
                                            />
                                        </Textarea>
                                    )}
                                />
                                {errors.description && (
                                    <FormControlError className="mt-1">
                                        <FormControlErrorText className="text-xs text-[#F44336]">
                                            {errors.description.message}
                                        </FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            {/* Campo Puntos */}
                            <FormControl isInvalid={!!errors.points_required} isRequired={true}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-base font-medium text-[#2F4858]">
                                        Puntos necesarios
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="points_required"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            variant="outline"
                                            size="lg"
                                            className="bg-[#FFFFFF] border border-[#CCCCCC] rounded-lg"
                                        >
                                            <InputField
                                                placeholder="000"
                                                placeholderTextColor="#888888"
                                                value={value === 0 ? '' : String(value)}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                keyboardType="numeric"
                                            />
                                        </Input>
                                    )}
                                />
                                {errors.points_required && (
                                    <FormControlError className="mt-1">
                                        <FormControlErrorText className="text-xs text-[#F44336]">
                                            {errors.points_required.message}
                                        </FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            {/* Botón Continuar */}
                            <Button
                                onPress={handleNextStep}
                                size="lg"
                                className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg mt-6"
                            >
                                <ButtonText className="text-[#FFFFFF] font-medium text-base">
                                    Continuar
                                </ButtonText>
                            </Button>
                        </VStack>
                    )}

                    {/* PASO 2: Subir Foto */}
                    {step === 2 && (
                        <VStack space="lg">
                            {/* Zona de selección */}
                            <Pressable onPress={pickImage}>
                                <Box className="w-full aspect-square bg-[#F2F2F2] rounded-lg border-2 border-dashed border-[#CCCCCC] justify-center items-center">
                                    {image ? (
                                        <Image
                                            source={{ uri: image.uri }}
                                            alt="Imagen seleccionada"
                                            className="w-full h-full rounded-lg"
                                        />
                                    ) : initialData?.image_url && isEditMode ? (
                                        <Image
                                            source={{ uri: initialData.image_url }}
                                            alt="Imagen actual"
                                            className="w-full h-full rounded-lg"
                                        />
                                    ) : (
                                        <VStack space="sm" className="items-center">
                                            <Icon as={ImageIcon} size="xl" className="text-[#CCCCCC]" />
                                            <Text className="text-[#888888] font-medium">
                                                Selecciona un archivo
                                            </Text>
                                        </VStack>
                                    )}
                                </Box>
                            </Pressable>

                            <Text className="text-center text-[#CCCCCC] font-medium">O</Text>

                            {/* Solo mostrar boton de camara en telefonos */}
                            {/* Botón de Cámara */}
                            {Platform.OS !== 'web' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="bg-[#FFFFFF] active:bg-[#E0E7ED] border border-[#2F4858] rounded-lg"
                                        size='lg'
                                        onPress={takePhoto}
                                    >
                                        <Icon as={CameraIcon} className="text-[#2F4858] mr-2" />
                                        <ButtonText className="text-[#2F4858] font-medium text-lg">
                                            Abrir cámara y tomar foto
                                        </ButtonText>
                                    </Button>
                                </>
                            )}

                            {/* Botones de navegación */}
                            <VStack space="sm" className="mt-4">
                                <Button
                                    onPress={handleSubmit(handleFormSubmit)}
                                    isDisabled={isSubmitting}
                                    className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg"
                                    size='lg'
                                >
                                    {isSubmitting ? (
                                        <Spinner color="#FFFFFF" />
                                    ) : (
                                        <ButtonText className="text-[#FFFFFF] font-medium text-lg">
                                            {isEditMode ? 'Guardar cambios' : 'Registrar recompensa'}
                                        </ButtonText>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onPress={() => setStep(1)}
                                    isDisabled={isSubmitting}
                                    className="bg-[#FFFFFF] active:bg-[#F2F2F2] border border-[#CCCCCC] rounded-lg"
                                    size='lg'
                                >
                                    <ButtonText className="text-[#6A6A6A] font-medium text-lg">
                                        Atrás
                                    </ButtonText>
                                </Button>
                            </VStack>
                        </VStack>
                    )}
                </VStack>
            </ScrollView>
        </Box>
    );
}