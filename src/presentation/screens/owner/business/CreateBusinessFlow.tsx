import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Heading } from "@/components/ui/heading";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import {
	BusinessFormStep1,
	BusinessFormStep2,
	BusinessFormStep3,
} from "@/src/presentation/components/business";
import { ProgressBar } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout";
import { useBusinessById } from "@/src/presentation/hooks/useBusinessById";
import { useCreateBusiness } from "@/src/presentation/hooks/useCreateBusiness";
import { useUpdateBusiness } from "@/src/presentation/hooks/useUpdateBusiness";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import {
	type BusinessFormData,
	businessFormSchema,
} from "./BusinessFormSchema";

interface CreateBusinessFlowProps {
	isEditMode?: boolean;
	businessId?: string;
}

export default function CreateBusinessFlow({
	isEditMode = false,
	businessId,
}: CreateBusinessFlowProps) {
	const router = useRouter();
	const toast = useToast();
	const user = useAuthStore((state) => state.user);
	const { createBusinessAsync, isCreating } = useCreateBusiness();
	const { updateBusinessAsync, isUpdating } = useUpdateBusiness();

	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 3;

	const [logoImage, setLogoImage] = useState<ImagePickerAsset | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
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

	const { data: businessData } = useBusinessById(businessId || "", {
		enabled: isEditMode && !!businessId,
	});

	useEffect(() => {
		if (isEditMode && businessData) {
			setValue("name", businessData.name);
			setValue("category", businessData.category);
			setValue("locationAddress", businessData.locationAddress || "");
			setValue("directions", "");
			setValue("openingHours", businessData.openingHours || "");

			if (businessData.logoUrl) {
				setLogoImage({
					uri: businessData.logoUrl,
					width: 400,
					height: 400,
				} as ImagePickerAsset);
			}
		}
	}, [isEditMode, businessData, setValue]);

	const validateCurrentStep = (): boolean => {
		const formData = watch();

		if (currentStep === 1) {
			return (
				!!formData.name && formData.name.length >= 3 && !!formData.category
			);
		}
		return true;
	};

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

	const onSubmit = async (data: BusinessFormData) => {
		if (!user?.id) {
			toast.show({
				placement: "top",
				duration: 3000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="error" variant="solid">
							<ToastTitle>Error</ToastTitle>
							<ToastDescription>
								No se encontró el usuario autenticado
							</ToastDescription>
						</Toast>
					);
				},
			});
			return;
		}

		try {
			if (isEditMode && businessId) {
				// Modo edición: actualizar negocio existente
				await updateBusinessAsync({
					businessId,
					businessData: {
						name: data.name,
						category: data.category,
						locationAddress: data.locationAddress || undefined,
						openingHours: data.openingHours || undefined,
					},
					logoUri:
						logoImage?.uri && !logoImage.uri.startsWith("http")
							? logoImage.uri
							: undefined,
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
									Los datos del negocio se actualizaron correctamente
								</ToastDescription>
							</Toast>
						);
					},
				});
			} else {
				// Modo creación: crear nuevo negocio
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

				toast.show({
					placement: "top",
					duration: 3000,
					render: ({ id }) => {
						const uniqueToastId = `toast-${id}`;
						return (
							<Toast nativeID={uniqueToastId} action="success" variant="solid">
								<ToastTitle>Éxito</ToastTitle>
								<ToastDescription>
									Tu negocio ha sido registrado correctamente
								</ToastDescription>
							</Toast>
						);
					},
				});
			}

			// Redirigir al home después del éxito
			router.replace("/(owner)/(tabs)/home");
		} catch (error) {
			console.error("Error guardando negocio:", error);
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
									: "Ocurrió un error al guardar el negocio"}
							</ToastDescription>
						</Toast>
					);
				},
			});
		}
	};

	const isLoading = isCreating || isUpdating;

	// Handler para el botón back del header
	const handleHeaderBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		} else {
			router.back();
		}
	};

	return (
		<AppLayout
			showNavBar={false}
			headerVariant={isEditMode ? "back" : "default"}
			headerTitle={isEditMode ? "Editar negocio" : undefined}
			onBackPress={handleHeaderBack}
		>
			<ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

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
					isSubmitting={isLoading}
					isEditMode={isEditMode}
				/>
			)}
		</AppLayout>
	);
}
