import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
// import { VStack } from '@/components/ui/vstack';
import { PromotionFormStep1 } from "@/src/presentation/components/promotions/PromotionFormStep1";
import { PromotionFormStep2 } from "@/src/presentation/components/promotions/PromotionFormStep2";
import type { PromotionFormData } from "@/src/presentation/components/promotions/PromotionSchema";
import { usePromotion } from "@/src/presentation/hooks/usePromotion";
import { useUpdatePromotion } from "@/src/presentation/hooks/useUpdatePromotion";

type Step = "step1" | "step2";

export default function EditPromotionScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: promotion, isLoading, error } = usePromotion(id ?? null);
	const { mutate: updatePromotion, isPending } = useUpdatePromotion();

	const [currentStep, setCurrentStep] = useState<Step>("step1");
	const [formData, setFormData] = useState<Partial<PromotionFormData>>({});

	// ✅ Cargar datos iniciales cuando se obtiene la promoción
	useEffect(() => {
		if (promotion) {
			console.log("[EditPromotionScreen] 📦 Datos cargados:", {
				title: promotion.title,
				imageUrl: promotion.imageUrl,
			});

			setFormData({
				title: promotion.title,
				content: promotion.content,
				startDate: new Date(promotion.startDate),
				endDate: promotion.endDate ? new Date(promotion.endDate) : undefined,
			});
		}
	}, [promotion]);

	// ✅ Mostrar errores de carga
	if (error) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Editar promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Text className="text-red-600 text-center text-lg font-semibold">
						❟ Error al cargar
					</Text>
					<Text className="text-gray-600 text-center">{error.message}</Text>
					<Button
						onPress={() => router.push("/(owner)/promotions")}
						className="bg-gray-800 rounded-lg p-4 w-full"
					>
						<ButtonText className="text-white font-bold">Volver</ButtonText>
					</Button>
				</View>
			</AppLayout>
		);
	}

	if (isLoading) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Editar promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Text className="text-gray-600">Cargando promoción...</Text>
				</View>
			</AppLayout>
		);
	}

	if (!promotion) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Editar promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Text className="text-gray-600 text-center text-lg">
						📋 Promoción no encontrada
					</Text>
					<Button
						onPress={() => router.push("/(owner)/promotions")}
						className="bg-gray-800 rounded-lg p-4 w-full"
					>
						<ButtonText className="text-white font-bold">Volver</ButtonText>
					</Button>
				</View>
			</AppLayout>
		);
	}

	const handleStep1Next = (data: Partial<PromotionFormData>) => {
		console.log("[EditPromotionScreen] ✏️ Datos del paso 1:", data);
		setFormData((prev) => ({ ...prev, ...data }));
		setCurrentStep("step2");
	};

	const handleStep1Back = () => {
		router.push("/(owner)/promotions");
	};

	const handleStep2Back = () => {
		setCurrentStep("step1");
	};

	const handleImageUploadSuccess = (imageUrl: string) => {
		console.log("[EditPromotionScreen] 🖼️ Imagen cargada:", imageUrl);

		if (!formData.title || !formData.content || !formData.startDate) {
			Alert.alert("Error", "Faltan datos requeridos");
			return;
		}

		console.log("[EditPromotionScreen] 💾 Guardando promoción con imagen...");

		updatePromotion(
			{
				id: promotion.id,
				data: {
					title: formData.title,
					content: formData.content,
					startDate: formData.startDate,
					endDate: formData.endDate,
					imageUrl: imageUrl,
				},
			},
			{
				onSuccess: () => {
					Alert.alert("✅ Éxito", "Promoción actualizada correctamente");
					router.push({
						pathname: "/(owner)/promotions/[id]",
						params: { id: promotion.id },
					});
				},
				onError: (error: unknown) => {
					console.error("[EditPromotionScreen] ❟ Error:", error);
					const message =
						error instanceof Error ? error.message : "Error al actualizar";
					Alert.alert("Error", message);
				},
			},
		);
	};

	const handleSkipImage = () => {
		if (!formData.title || !formData.content || !formData.startDate) {
			Alert.alert("Error", "Faltan datos requeridos");
			return;
		}

		console.log(
			"[EditPromotionScreen] 💾 Guardando promoción sin cambiar imagen...",
		);

		updatePromotion(
			{
				id: promotion.id,
				data: {
					title: formData.title,
					content: formData.content,
					startDate: formData.startDate,
					endDate: formData.endDate,
				},
			},
			{
				onSuccess: () => {
					Alert.alert("✅ Éxito", "Promoción actualizada correctamente");
					router.push({
						pathname: "/(owner)/promotions/[id]",
						params: { id: promotion.id },
					});
				},
				onError: (error: unknown) => {
					console.error("[EditPromotionScreen] ❟ Error:", error);
					const message =
						error instanceof Error ? error.message : "Error al actualizar";
					Alert.alert("Error", message);
				},
			},
		);
	};

	return (
		<AppLayout
			headerVariant="back"
			headerTitle="Editar promoción"
			showNavBar={false}
			scrollable={false}
		>
			{currentStep === "step1" && (
				<PromotionFormStep1
					onNext={handleStep1Next}
					onBack={handleStep1Back}
					initialData={formData}
				/>
			)}

			{currentStep === "step2" && (
				<PromotionFormStep2
					businessId={promotion.businessId}
					fileName={formData.title || promotion.title}
					promotionId={promotion.id}
					onImageUploadSuccess={handleImageUploadSuccess}
					onSkipImage={handleSkipImage}
					onBack={handleStep2Back}
					isLoading={isPending}
					initialImageUrl={promotion.imageUrl ?? undefined}
				/>
			)}
		</AppLayout>
	);
}
