import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { ProgressBar } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout";
import {
	RewardFormStep1,
	RewardFormStep2,
} from "@/src/presentation/components/rewards";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useReward } from "@/src/presentation/hooks/useReward";
import type { CreateRewardFormValues } from "./RewardFormSchema";
import { createRewardSchema } from "./RewardFormSchema";

interface CreateRewardFlowProps {
	isEditMode?: boolean;
	rewardId?: string;
	initialData?: {
		name: string;
		description?: string;
		points_required: number;
		image_url?: string;
	};
}

export default function CreateRewardFlow({
	isEditMode = false,
	rewardId,
	initialData,
}: CreateRewardFlowProps) {
	const router = useRouter();
	const toast = useToast();

	const [step, setStep] = useState(1);
	// Inicializar con la URL de la imagen existente en modo edición
	const [image, setImage] = useState<ImagePickerAsset | null>(
		initialData?.image_url
			? ({ uri: initialData.image_url } as ImagePickerAsset)
			: null,
	);

	// Hooks de TanStack Query
	const { data: businessId, isLoading: loadingBusiness } = useBusinessId();
	const { createReward, isCreating, updateReward, isUpdating } =
		useReward(businessId);

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

	// Validar paso 1 antes de avanzar
	const handleNextStep = async () => {
		const isValid = await trigger(["name", "description", "points_required"]);
		if (isValid) {
			setStep(2);
		}
	};

	// Submit final del formulario
	const handleFormSubmit = async (data: CreateRewardFormValues) => {
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

		try {
			if (isEditMode && rewardId) {
				// Actualizar recompensa existente
				await updateReward({
					rewardId,
					dto: {
						name: data.name,
						description: data.description || undefined,
						pointsRequired: data.points_required,
					},
					imageUri: image?.uri,
				});

				toast.show({
					placement: "top",
					duration: 3000,
					render: ({ id }) => {
						const uniqueToastId = `toast-${id}`;
						return (
							<Toast nativeID={uniqueToastId} action="success" variant="solid">
								<ToastTitle>Actualizado</ToastTitle>
								<ToastDescription>
									Recompensa actualizada correctamente
								</ToastDescription>
							</Toast>
						);
					},
				});
			} else {
				// Crear nueva recompensa
				await createReward({
					dto: {
						businessId,
						name: data.name,
						description: data.description || undefined,
						pointsRequired: data.points_required,
					},
					imageUri: image?.uri,
				});

				toast.show({
					placement: "top",
					duration: 3000,
					render: ({ id }) => {
						const uniqueToastId = `toast-${id}`;
						return (
							<Toast nativeID={uniqueToastId} action="success" variant="solid">
								<ToastTitle>Éxito</ToastTitle>
								<ToastDescription>
									Recompensa creada correctamente
								</ToastDescription>
							</Toast>
						);
					},
				});
			}

			// Redirigir al listado después del éxito
			router.back();
		} catch (error) {
			console.error("Error guardando recompensa:", error);
			toast.show({
				placement: "top",
				duration: 3000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="error" variant="solid">
							<ToastTitle>Error</ToastTitle>
							<ToastDescription>
								{error instanceof Error
									? error.message
									: "Ocurrió un error al guardar la recompensa"}
							</ToastDescription>
						</Toast>
					);
				},
			});
		}
	};

	const isSubmitting = isCreating || isUpdating;

	// Handler para el botón back del header
	const handleHeaderBack = () => {
		if (step > 1) {
			setStep(1);
		} else {
			router.back();
		}
	};

	// Si está cargando el businessId, no renderizar nada aún
	if (loadingBusiness) {
		return null;
	}

	return (
		<AppLayout
			showNavBar={false}
			headerVariant="back"
			headerTitle={isEditMode ? "Editar recompensa" : "Crear recompensa"}
			onBackPress={handleHeaderBack}
		>
			<ProgressBar
				currentStep={step}
				totalSteps={2}
				showLabels={true}
				showHelperText={true}
				helperText="Completa todos los campos requeridos"
			/>

			<Heading size="xl" className="text-gray-900">
				{step === 1
					? isEditMode
						? "Editar recompensa"
						: "Registrar recompensa"
					: "Foto de la recompensa"}
			</Heading>

			{step === 1 && (
				<Text className="text-gray-600">
					{isEditMode
						? "Edita la información de tu recompensa."
						: "Ingresa la información de la recompensa."}
				</Text>
			)}

			{step === 1 && (
				<RewardFormStep1
					control={control}
					errors={errors}
					onNext={handleNextStep}
					isEditMode={isEditMode}
				/>
			)}

			{step === 2 && (
				<RewardFormStep2
					rewardImage={image}
					onImageSelected={setImage}
					isEditMode={isEditMode}
					onSubmit={handleSubmit(handleFormSubmit)}
					onBack={() => setStep(1)}
					isSubmitting={isSubmitting}
				/>
			)}
		</AppLayout>
	);
}
