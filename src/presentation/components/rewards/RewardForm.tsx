import { Spinner } from "@gluestack-ui/themed";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useReward } from "@/src/presentation/hooks/useReward";
import { RewardFormStep1 } from "./RewardFormStep1";
import { RewardFormStep2 } from "./RewardFormStep2";
import type { CreateRewardFormValues } from "./RewardSchema";
import { createRewardSchema } from "./RewardSchema";

type RewardFormProps = {
	mode: "create" | "edit";
	initialData?: {
		name: string;
		description?: string;
		points_required: number;
		image_url?: string;
	};
	rewardId?: string;
};

export default function RewardForm({
	mode = "create",
	initialData,
	rewardId,
}: RewardFormProps) {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [image, setImage] = useState<ImagePickerAsset | null>(null);
	const toast = useToast();

	const isEditMode = mode === "edit";

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
			name: "",
			description: "",
			points_required: 0,
		},
	});

	// Navegación automática al completar la acción
	useEffect(() => {
		if (createSuccess || updateSuccess) {
			toast.show({
				placement: "top",
				duration: 3000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="success" variant="solid">
							<ToastTitle>Éxito</ToastTitle>
							<ToastDescription>
								{isEditMode
									? "Recompensa actualizada correctamente"
									: "Recompensa creada correctamente"}
							</ToastDescription>
						</Toast>
					);
				},
			});
			resetCreate();
			resetUpdate();
			setTimeout(() => router.back(), 500);
		}
	}, [
		createSuccess,
		updateSuccess,
		isEditMode,
		router,
		resetCreate,
		resetUpdate,
		toast,
	]);

	// Validar paso 1 antes de avanzar
	const handleNextStep = async () => {
		const isValid = await trigger(["name", "description", "points_required"]);
		if (isValid) {
			setStep(2);
		}
	};

	// Submit final del formulario
	const handleFormSubmit = (data: CreateRewardFormValues) => {
		if (!businessId) {
			toast.show({
				placement: "top",
				duration: 3000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="error" variant="solid">
							<ToastTitle>Error</ToastTitle>
							<ToastDescription>
								No se encontró el ID del negocio
							</ToastDescription>
						</Toast>
					);
				},
			});
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
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
			headerTitle={isEditMode ? "Editar recompensa" : "Crear recompensa"}
		>
			{/* Barra de progreso */}
			<Box className="w-full h-2 bg-background-200 rounded-lg overflow-hidden mb-6">
				<Box
					className="h-2 bg-primary-500 rounded-lg"
					style={{ width: step === 1 ? "50%" : "100%" }}
				/>
			</Box>

			{/* Títulos dinámicos según el paso */}
			<VStack space="xs" className="mb-6">
				<Heading className="text-2xl font-extrabold text-primary-500 text-center">
					{step === 1
						? isEditMode
							? "Editar recompensa"
							: "Registrar recompensa"
						: "Subir una foto para tu recompensa"}
				</Heading>
				<Text className="text-lg text-[#6A6A6A] text-center">
					{step === 1
						? isEditMode
							? "Edita la información de tu recompensa en base a tus criterios."
							: "Ingresa la información de la recompensa para poder darla de alta en tu negocio."
						: "Sube una imagen o toma una foto para tu recompensa."}
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
		</AppLayout>
	);
}
