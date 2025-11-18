import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { ImagePicker } from "@/src/presentation/components/common";
import type { ImagePickerAsset } from "expo-image-picker";

type BusinessFormStep3Props = {
	logoImage: ImagePickerAsset | null;
	onImageSelected: (image: ImagePickerAsset | null) => void;
	onSubmit: () => void;
	onBack: () => void;
	isSubmitting: boolean;
	isEditMode: boolean;
};

/**
 * Step 3: Logo del negocio
 * - Subir logo usando ImagePicker
 */
export function BusinessFormStep3({
	logoImage,
	onImageSelected,
	onSubmit,
	onBack,
	isSubmitting,
	isEditMode,
}: BusinessFormStep3Props) {
	return (
		<VStack className="gap-4">
			<ImagePicker
				selectedImage={logoImage}
				onImageSelected={onImageSelected}
				title="Sube el logo de tu negocio"
				helperText="Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP"
			/>

			<VStack className="gap-3">
				<Button
					onPress={onSubmit}
					className="flex-1"
					isDisabled={isSubmitting}
					variant="solid"
					action="primary"
				>
					<ButtonText>
						{isSubmitting
							? isEditMode
								? "Actualizando..."
								: "Registrando..."
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
