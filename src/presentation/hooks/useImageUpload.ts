import { useState } from "react";
import { imageUploadService } from "@/src/infrastructure/services/imageUploadService";

interface UseImageUploadResult {
	imageUri: string | null;
	isLoading: boolean;
	error: string | null;
	takePhoto: () => Promise<void>;
	pickImage: () => Promise<void>;
	clearImage: () => void;
}

export const useImageUpload = (): UseImageUploadResult => {
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const takePhoto = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const uri = await imageUploadService.takePhoto();
			if (uri) {
				setImageUri(uri);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al tomar foto");
		} finally {
			setIsLoading(false);
		}
	};

	const pickImage = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const uri = await imageUploadService.pickImage();
			if (uri) {
				setImageUri(uri);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Error al seleccionar imagen",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const clearImage = () => {
		setImageUri(null);
		setError(null);
	};

	return { imageUri, isLoading, error, takePhoto, pickImage, clearImage };
};
