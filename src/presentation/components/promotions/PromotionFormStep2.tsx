import type React from "react";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { imageUploadService } from "@/src/infrastructure/services/imageUploadService";
import { ImagePicker } from "@/src/presentation/components/common/ImagePicker";

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
	initialImageUrl,
}) => {
	const [selectedImage, setSelectedImage] = useState<
		import("expo-image-picker").ImagePickerAsset | null
	>(
		initialImageUrl
			? ({
					uri: initialImageUrl,
					width: 0,
					height: 0,
				} as import("expo-image-picker").ImagePickerAsset)
			: null,
	);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleUploadImage = async () => {
		if (!selectedImage) {
			setUploadError("Por favor selecciona una imagen");
			return;
		}
		setUploading(true);
		setUploadError(null);
		try {
			const result = await imageUploadService.uploadImage(selectedImage.uri, {
				assetType: "promotions",
				businessId,
				fileName,
				entityId: promotionId,
			});
			if (result.success && result.url) {
				onImageUploadSuccess(result.url);
			} else {
				setUploadError(result.error || "Error al subir imagen");
			}
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Error desconocido";
			setUploadError(errorMsg);
		} finally {
			setUploading(false);
		}
	};

	return (
		<VStack className="flex-1">
			<ImagePicker
				selectedImage={selectedImage}
				onImageSelected={setSelectedImage}
				title="Selecciona una imagen para tu promoción"
				helperText="Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP"
			/>

			{/* Errores */}
			{uploadError && (
				<View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
					<Text className="text-red-600 text-sm">{uploadError}</Text>
				</View>
			)}

			{onSkipImage && (
				<Button
					onPress={onSkipImage}
					isDisabled={isLoading}
					className="w-full my-2"
					variant="outline"
				>
					<ButtonText>Saltar cambio de imagen</ButtonText>
				</Button>
			)}

			{/* Botones de acción */}
			<HStack className="gap-3">
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
					isDisabled={!selectedImage || isLoading || uploading}
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
