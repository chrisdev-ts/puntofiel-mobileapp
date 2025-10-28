import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useBusinessId } from '@/src/presentation/hooks/useBusinessId';
import { useReward } from '@/src/presentation/hooks/useReward';
import { Spinner } from '@gluestack-ui/themed';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView } from 'react-native';
import { RewardFormStep1 } from './RewardFormStep1';
import { RewardFormStep2 } from './RewardFormStep2';
import type { CreateRewardFormValues } from './RewardSchema';
import { createRewardSchema } from './RewardSchema';

type RewardFormProps = {
    mode: 'create' | 'edit';
    initialData?: {
        name: string;
        description?: string;
        points_required: number;
        image_url?: string;
    };
    rewardId?: string;
};

export default function RewardForm({ mode = 'create', initialData, rewardId }: RewardFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [image, setImage] = useState<ImagePickerAsset | null>(null);

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

    // React Hook Form con validación Zod
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

    // Navegación automática al completar la acción
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

    // Validar paso 1 antes de avanzar
    const handleNextStep = async () => {
        const isValid = await trigger(['name', 'description', 'points_required']);
        if (isValid) {
            setStep(2);
        }
    };

    // Submit final del formulario
    const handleFormSubmit = (data: CreateRewardFormValues) => {
        if (!businessId) {
            Alert.alert('Error', 'No se encontró el ID del negocio');
            return;
        }

        if (isEditMode && rewardId) {
            // Actualizar recompensa existente
            updateReward({
                rewardId,
                dto: {
                    name: data.name,
                    description: data.description || undefined,
                    pointsRequired: data.points_required,
                },
                imageUri: image?.uri,
            });
        } else {
            // Crear nueva recompensa
            createReward({
                dto: {
                    businessId,
                    name: data.name,
                    description: data.description || undefined,
                    pointsRequired: data.points_required,
                },
                imageUri: image?.uri,
            });
        }
    };

    // Mostrar spinner mientras carga el businessId
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
                    {/* Barra de progreso */}
                    <Box className="w-full h-2 bg-[#F2F2F2] rounded-lg overflow-hidden">
                        <Box
                            className="h-2 bg-[#2F4858] rounded-lg"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </Box>

                    {/* Títulos dinámicos según el paso */}
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

                    {/* Renderizar paso correspondiente */}
                    {step === 1 ? (
                        <RewardFormStep1
                            control={control}
                            errors={errors}
                            onNext={handleNextStep}
                            isEditMode={isEditMode}
                        />
                    ) : (
                        <RewardFormStep2
                            image={image}
                            setImage={setImage}
                            initialImageUrl={initialData?.image_url}
                            isEditMode={isEditMode}
                            onSubmit={handleSubmit(handleFormSubmit)}
                            onBack={() => setStep(1)}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </VStack>
            </ScrollView>
        </Box>
    );
}