import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useRaffle } from "@/src/presentation/hooks/useRaffle";
import { Spinner } from "@gluestack-ui/themed";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RaffleFormStep1 } from "./RaffleFormStep1";
import { RaffleFormStep2 } from "./RaffleFormStep2";
import type { CreateRaffleFormValues } from "./RaffleSchema";
import { createRaffleSchema } from "./RaffleSchema";

type RaffleFormProps = {
    mode: "create" | "edit";
    initialData?: {
        name: string;
        prize: string;
        description: string;
        points_required: number;
        max_tickets_per_user: number;
        start_date: Date;
        end_date: Date;
        image_url?: string;
    };
    raffleId?: string;
};

export default function RaffleForm({
    mode = "create",
    initialData,
    raffleId,
}: RaffleFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [image, setImage] = useState<ImagePickerAsset | null>(null);
    const toast = useToast();

    const isEditMode = mode === "edit";

    // Hooks
    const { data: businessId, isLoading: loadingBusiness } = useBusinessId();
    const {
        createRaffle,
        isCreating,
        createError,
        createSuccess,
        updateRaffle,
        isUpdating,
        updateError,
        updateSuccess,
        resetCreate,
        resetUpdate,
    } = useRaffle(businessId);

    // Configuración del Formulario
    const {
        control,
        handleSubmit,
        formState: { errors },
        trigger,
        setValue, // 👈 AQUÍ ESTÁ LO NUEVO
        watch     // 👈 AQUÍ ESTÁ LO NUEVO
    } = useForm<CreateRaffleFormValues>({
        resolver: zodResolver(createRaffleSchema),
        defaultValues: initialData ? {
            ...initialData,
            // Aseguramos objetos Date
            start_date: typeof initialData.start_date === 'string' ? new Date(initialData.start_date) : initialData.start_date,
            end_date: typeof initialData.end_date === 'string' ? new Date(initialData.end_date) : initialData.end_date,
            points_required: initialData.points_required,
            max_tickets_per_user: initialData.max_tickets_per_user,
        } : {
            name: "",
            prize: "",
            description: "",
            points_required: 0,
            max_tickets_per_user: 1, // Default 1 ticket
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
    });

    // Manejar Éxito
    useEffect(() => {
        if (createSuccess || updateSuccess) {
            toast.show({
                placement: "top",
                duration: 3000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                        <ToastTitle>¡Éxito!</ToastTitle>
                        <ToastDescription>
                            {isEditMode ? "Rifa actualizada correctamente" : "Rifa creada correctamente"}
                        </ToastDescription>
                    </Toast>
                ),
            });
            resetCreate();
            resetUpdate();
            setTimeout(() => router.back(), 500);
        }
    }, [createSuccess, updateSuccess, isEditMode, router, resetCreate, resetUpdate, toast]);

    // Manejar errores del Hook
    const submitError = createError || updateError;
    useEffect(() => {
        if (submitError) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>{submitError.message || "Ocurrió un error inesperado"}</ToastDescription>
                    </Toast>
                ),
            });
        }
    }, [submitError, toast]);

    // Validación antes de pasar al paso 2
    const handleNextStep = async () => {
        const isValid = await trigger([
            "name",
            "prize",
            "description",
            "points_required",
            "start_date",
            "end_date"
        ]);

        if (isValid) {
            setStep(2);
        }
    };

    // Envío final
    const handleFormSubmit = (data: CreateRaffleFormValues) => {
        if (!businessId) return;

        const commonData = {
            name: data.name,
            prize: data.prize,
            description: data.description,
            pointsRequired: data.points_required,
            maxTicketsPerUser: data.max_tickets_per_user || 1,
            startDate: data.start_date,
            endDate: data.end_date,
        };

        if (isEditMode && raffleId) {
            updateRaffle({
                raffleId,
                dto: commonData,
                imageUri: image?.uri,
            });
        } else {
            createRaffle({
                dto: { ...commonData, businessId },
                imageUri: image?.uri,
            });
        }
    };

    if (loadingBusiness) {
        return (
            <Box className="flex-1 bg-white justify-center items-center">
                <Spinner size="large" color="#2F4858" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </Box>
        );
    }

    const isSubmitting = isCreating || isUpdating;

    return (
        <AppLayout
            showHeader={true}
            showNavBar={false}
            scrollable={true}
            headerVariant="back"
            headerTitle={isEditMode ? (step === 1 ? "Editar rifa anual" : "Actualizar la foto") : (step === 1 ? "Crear rifa anual" : "Subir una foto")}
        >
            {/* Barra de Progreso */}
            <Box className="w-full h-2 bg-background-200 rounded-lg overflow-hidden mb-6">
                <Box className="h-2 bg-primary-500 rounded-lg" style={{ width: step === 1 ? "50%" : "100%" }} />
            </Box>

            {/* Títulos */}
            <VStack space="xs" className="mb-6">
                <Heading className="text-2xl font-extrabold text-primary-500 text-center">
                    {step === 1
                        ? (isEditMode ? "Editar rifa anual" : "Crear rifa anual")
                        : (isEditMode ? "Actualizar la foto" : "Subir una foto")}
                </Heading>
                <Text className="text-lg text-[#6A6A6A] text-center px-4">
                    {step === 1
                        ? (isEditMode ? "Edita la información de tu rifa anual." : "Ingresa la información para dar de alta la rifa.")
                        : "Sube una imagen atractiva para tu rifa anual."}
                </Text>
            </VStack>

            {/* Renderizado Condicional de Pasos */}
            {step === 1 ? (
                <RaffleFormStep1
                    control={control}
                    errors={errors}
                    onNext={handleNextStep}
                    isEditMode={isEditMode}
                    // 👇 Pasamos las props nuevas
                    setValue={setValue}
                    watch={watch}
                />
            ) : (
                <RaffleFormStep2
                    image={image}
                    setImage={setImage}
                    initialImageUrl={initialData?.image_url}
                    isEditMode={isEditMode}
                    onSubmit={handleSubmit(handleFormSubmit)}
                    onBack={() => setStep(1)}
                    isSubmitting={isSubmitting}
                />
            )}
        </AppLayout>
    );
}