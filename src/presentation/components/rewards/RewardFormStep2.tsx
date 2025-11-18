import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { ImagePicker } from "@/src/presentation/components/common";
import type { ImagePickerAsset } from "expo-image-picker";

type RewardFormStep2Props = {
	rewardImage: ImagePickerAsset | null;
	onImageSelected: (image: ImagePickerAsset | null) => void;
	onSubmit: () => void;
	onBack: () => void;
	isSubmitting: boolean;
	isEditMode: boolean;
};

/**
 * Step 2: Imagen del premio
 * - Subir imagen del premio
 */
export function RewardFormStep2({
	rewardImage,
	onImageSelected,
	onSubmit,
	onBack,
	isSubmitting,
	isEditMode,
}: RewardFormStep2Props) {
	return (
		<VStack className="gap-4">
			<ImagePicker
				selectedImage={rewardImage}
				onImageSelected={onImageSelected}
				title="Sube una imagen del premio"
				helperText="Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP"
			/>

			<VStack className="gap-3">
				<Button
					onPress={onSubmit}
					isDisabled={isSubmitting}
					variant="solid"
					action="primary"
				>
					<ButtonText>
						{isSubmitting
							? isEditMode
								? "Actualizando..."
								: "Creando..."
							: isEditMode
								? "Guardar cambios"
								: "Finalizar"}
					</ButtonText>
				</Button>
				<Button variant="outline" onPress={onBack} isDisabled={isSubmitting}>
					<ButtonText>Atrás</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}
