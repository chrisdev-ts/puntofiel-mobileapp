import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { PromotionFormStep1 } from "@/src/presentation/components/promotions/PromotionFormStep1";
import { PromotionFormStep2 } from "@/src/presentation/components/promotions/PromotionFormStep2";
import type { PromotionFormData } from "@/src/presentation/components/promotions/PromotionSchema";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useCreatePromotion } from "@/src/presentation/hooks/useCreatePromotion";

type Step = "step1" | "step2";

export default function CreatePromotionScreen() {
	const router = useRouter();
	const businessIdQuery = useBusinessId();
	const { mutate: createPromotion, isPending } = useCreatePromotion();

	const [currentStep, setCurrentStep] = useState<Step>("step1");
	const [formData, setFormData] = useState<Partial<PromotionFormData>>({});

	// Debug
	console.log("CreatePromotionScreen:", {
		currentStep,
		businessIdLoading: businessIdQuery.isLoading,
		businessIdError: businessIdQuery.isError,
		businessIdData: businessIdQuery.data,
	});

	const handleStep1Next = (data: Partial<PromotionFormData>) => {
		setFormData((prev: Partial<PromotionFormData>) => ({ ...prev, ...data }));
		setCurrentStep("step2");
	};

	// ✅ Agregar handler para volver atrás desde step1
	const handleStep1Back = () => {
		router.push("/(owner)/promotions");
	};

	const handleStep2Back = () => {
		setCurrentStep("step1");
	};

	const handleImageUploadSuccess = (imageUrl: string) => {
		const businessId = businessIdQuery.data;
		if (
			!businessId ||
			!formData.title ||
			!formData.content ||
			!formData.startDate
		) {
			Alert.alert("Error", "Faltan datos requeridos");
			return;
		}

		createPromotion(
			{
				businessId: businessId,
				title: formData.title,
				content: formData.content,
				startDate: formData.startDate,
				endDate: formData.endDate,
				imageUrl: imageUrl,
			},
			{
				onSuccess: () => {
					Alert.alert("Éxito", "Promoción creada correctamente");
					router.push("/(owner)/promotions");
				},
				onError: (error) => {
					Alert.alert("Error", error.message || "Error al crear la promoción");
				},
			},
		);
	};

	// Mostrar loader mientras se carga el businessId
	if (businessIdQuery.isLoading) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Crear promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#1f2937" />
				</View>
			</AppLayout>
		);
	}

	if (businessIdQuery.isError) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Crear promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center px-6">
					<Text className="text-red-600 text-center">
						Error: No se pudo cargar tu negocio
					</Text>
				</View>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			headerVariant="back"
			headerTitle="Crear promoción"
			showNavBar={false}
			scrollable={false}
		>
			{currentStep === "step1" && (
				<PromotionFormStep1 onNext={handleStep1Next} onBack={handleStep1Back} />
			)}

			{currentStep === "step2" && businessIdQuery.data && (
				<PromotionFormStep2
					businessId={businessIdQuery.data}
					fileName={formData.title || "promotion"}
					onImageUploadSuccess={handleImageUploadSuccess}
					onBack={handleStep2Back}
					isLoading={isPending}
				/>
			)}
		</AppLayout>
	);
}
