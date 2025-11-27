import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image as RNImage, View } from "react-native";

import { imageUploadService } from "@/src/infrastructure/services/imageUploadService";
import { useImageUpload } from "@/src/presentation/hooks/useImageUpload";

import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface PromotionFormStep2Props {
	businessId: string;
	fileName: string;
	promotionId?: string;
	onImageUploadSuccess: (imageUrl: string) => void;
	onSkipImage?: () => void;
	onBack: () => void;
	isLoading?: boolean;
	initialImageUrl?: string; // ✅ Agregado
}

export const PromotionFormStep2: React.FC<PromotionFormStep2Props> = ({
	businessId,
	fileName,
	promotionId,
	onImageUploadSuccess,
	onSkipImage,
	onBack,
	isLoading = false,
	initialImageUrl, // ✅ Agregado
}) => {
	const {
		imageUri,
		isLoading: imageLoading,
		error,
		takePhoto,
		pickImage,
		clearImage,
	} = useImageUpload();
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [displayImage, setDisplayImage] = useState<string | null>(
		initialImageUrl || null,
	); // ✅ Agregado

	// ✅ Actualizar displayImage cuando se selecciona una nueva imagen
	useEffect(() => {
		if (imageUri) {
			setDisplayImage(imageUri);
		}
	}, [imageUri]);

	const handleUploadImage = async () => {
		if (!imageUri) {
			setUploadError("Por favor selecciona una imagen");
			return;
		}

		setUploading(true);
		setUploadError(null);

		try {
			console.log("[PromotionFormStep2] 📤 Subiendo imagen para promoción:", {
				fileName,
				businessId,
				promotionId,
			});

			const result = await imageUploadService.uploadImage(imageUri, {
				assetType: "promotions",
				businessId,
				fileName,
				entityId: promotionId,
			});

			if (result.success && result.url) {
				console.log(
					"[PromotionFormStep2] ✅ Imagen subida exitosamente:",
					result.url,
				);
				onImageUploadSuccess(result.url);
			} else {
				setUploadError(result.error || "Error al subir imagen");
				console.error("[PromotionFormStep2] ❌ Error:", result.error);
			}
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Error desconocido";
			setUploadError(errorMsg);
			console.error("[PromotionFormStep2] ⚠️ Error fatal:", err);
		} finally {
			setUploading(false);
		}
	};

	return (
		<VStack className="flex-1">
			<Heading className="text-2xl font-bold mb-2">
				Subir una foto para tu promoción
			</Heading>
			<Text className="text-gray-600 mb-6">
				Sube una imagen o toma una foto para tu promoción
			</Text>

			{/* Vista previa de imagen */}
			<Card className="bg-gray-100 rounded-lg overflow-hidden mb-6 w-full aspect-video justify-center items-center">
				{displayImage ? (
					<RNImage
						source={{ uri: displayImage }}
						className="w-full h-full"
						resizeMode="cover"
						onError={(error) => {
							console.error(
								"[PromotionFormStep2] Error cargando imagen:",
								error,
							);
						}}
					/>
				) : (
					<VStack className="w-full h-full justify-center items-center">
						<Text className="text-gray-400">Selecciona un archivo</Text>
					</VStack>
				)}
			</Card>

			{/* Errores */}
			{(error || uploadError) && (
				<View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
					<Text className="text-red-600 text-sm">{error || uploadError}</Text>
				</View>
			)}

			{/* Botones de carga */}
			<HStack className="gap-3 mb-6">
				<Button
					onPress={pickImage}
					isDisabled={imageLoading || isLoading}
					className="flex-1"
					variant="outline"
				>
					{imageLoading ? (
						<ActivityIndicator size="small" color="#374151" />
					) : (
						<ButtonText>Seleccionar</ButtonText>
					)}
				</Button>
				<Button
					onPress={takePhoto}
					isDisabled={imageLoading || isLoading}
					className="flex-1"
					variant="outline"
				>
					{imageLoading ? (
						<ActivityIndicator size="small" color="#374151" />
					) : (
						<ButtonText>Tomar foto</ButtonText>
					)}
				</Button>
			</HStack>

			{onSkipImage && (
				<Button
					onPress={onSkipImage}
					isDisabled={isLoading}
					className="w-full mb-6"
					variant="outline"
				>
					<ButtonText>Saltar cambio de imagen</ButtonText>
				</Button>
			)}

			{/* Botones de acción */}
			<HStack className="gap-3 mt-auto">
				<Button
					onPress={onBack}
					isDisabled={isLoading || uploading}
					className="flex-1"
					variant="outline"
				>
					<ButtonText>Atrás</ButtonText>
				</Button>
				<Button
					onPress={handleUploadImage}
					isDisabled={!imageUri || isLoading || uploading}
					className="flex-1"
					variant="solid"
					action="primary"
				>
					{uploading ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<ButtonText>{promotionId ? "Actualizar" : "Crear"}</ButtonText>
					)}
				</Button>
			</HStack>
		</VStack>
	);
};
