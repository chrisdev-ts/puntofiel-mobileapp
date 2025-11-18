import type { ImagePickerAsset } from "expo-image-picker";
import * as ExpoImagePicker from "expo-image-picker";
import { CameraIcon, ImageIcon } from "lucide-react-native";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

interface ImagePickerProps {
	/** Imagen actualmente seleccionada */
	selectedImage: ImagePickerAsset | null;
	/** Callback cuando se selecciona una imagen */
	onImageSelected: (image: ImagePickerAsset) => void;
	/** Título descriptivo (ej: "Sube el logo de tu negocio") */
	title?: string;
	/** Texto de ayuda (ej: "Tamaño máximo: 5MB") */
	helperText?: string;
	/** Tamaño máximo en bytes (default: 5MB) */
	maxSize?: number;
	/** Aspect ratio para recorte [width, height] (default: [1, 1]) */
	aspectRatio?: [number, number];
	/** Calidad de compresión 0-1 (default: 0.5) */
	quality?: number;
	/** Altura de la imagen preview (default: h-64) */
	imageHeight?: string;
}

/**
 * Componente reutilizable para selección de imágenes desde galería o cámara
 *
 * Características:
 * - Solicita permisos automáticamente
 * - Validación de tamaño de archivo
 * - Recorte con aspect ratio configurable
 * - Preview de imagen seleccionada
 * - Botones para cambiar imagen cuando ya hay una seleccionada
 *
 * @example
 * ```tsx
 * const [image, setImage] = useState<ImagePickerAsset | null>(null);
 *
 * <ImagePicker
 *   selectedImage={image}
 *   onImageSelected={setImage}
 *   title="Sube tu foto de perfil"
 *   helperText="Tamaño máximo: 5MB"
 *   aspectRatio={[1, 1]}
 * />
 * ```
 */
export function ImagePicker({
	selectedImage,
	onImageSelected,
	title,
	helperText = "Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP",
	maxSize = 5242880, // 5MB en bytes
	aspectRatio = [1, 1],
	quality = 0.5,
	imageHeight = "h-64",
}: ImagePickerProps) {
	const toast = useToast();

	const requestPermissions = async (): Promise<boolean> => {
		const cameraPermission =
			await ExpoImagePicker.requestCameraPermissionsAsync();
		const mediaLibraryPermission =
			await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

		if (
			cameraPermission.status !== "granted" ||
			mediaLibraryPermission.status !== "granted"
		) {
			toast.show({
				placement: "top",
				duration: 4000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="warning" variant="solid">
							<ToastTitle>Permisos requeridos</ToastTitle>
							<ToastDescription>
								Necesitas otorgar permisos a la cámara y galería.
							</ToastDescription>
						</Toast>
					);
				},
			});
			return false;
		}
		return true;
	};

	const handleImagePicked = (asset: ImagePickerAsset) => {
		if (asset.fileSize && asset.fileSize > maxSize) {
			const maxSizeMB = (maxSize / 1048576).toFixed(0);
			toast.show({
				placement: "top",
				duration: 4000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="error" variant="solid">
							<ToastTitle>Imagen muy grande</ToastTitle>
							<ToastDescription>
								La imagen debe ser menor a {maxSizeMB}MB. Por favor selecciona
								otra.
							</ToastDescription>
						</Toast>
					);
				},
			});
			return;
		}

		onImageSelected(asset);
	};

	const pickImageFromGallery = async () => {
		const hasPermission = await requestPermissions();
		if (!hasPermission) return;

		const result = await ExpoImagePicker.launchImageLibraryAsync({
			mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: aspectRatio,
			quality,
		});

		if (!result.canceled && result.assets[0]) {
			handleImagePicked(result.assets[0]);
		}
	};

	const takePhoto = async () => {
		const hasPermission = await requestPermissions();
		if (!hasPermission) return;

		const result = await ExpoImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: aspectRatio,
			quality,
		});

		if (!result.canceled && result.assets[0]) {
			handleImagePicked(result.assets[0]);
		}
	};

	return (
		<VStack className="gap-4">
			{title && <Text className="text-base text-gray-700">{title}</Text>}

			{selectedImage ? (
				<VStack className="gap-3">
					<Image
						source={{ uri: selectedImage.uri }}
						alt="Imagen seleccionada"
						className={`w-full ${imageHeight} rounded-lg`}
						resizeMode="cover"
						style={{ aspectRatio: 1 }}
					/>
					<HStack className="gap-3">
						<Button
							variant="outline"
							onPress={pickImageFromGallery}
							className="flex-1 border-primary-500"
						>
							<Icon
								as={ImageIcon}
								size="sm"
								className="text-primary-500 mr-2"
							/>
							<ButtonText className="text-primary-500">Galería</ButtonText>
						</Button>

						<Button
							variant="outline"
							onPress={takePhoto}
							className="flex-1 border-primary-500"
						>
							<Icon
								as={CameraIcon}
								size="sm"
								className="text-primary-500 mr-2"
							/>
							<ButtonText className="text-primary-500">Cámara</ButtonText>
						</Button>
					</HStack>
				</VStack>
			) : (
				<VStack className="gap-3">
					<Box className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center bg-gray-50">
						<Icon as={ImageIcon} size="xl" className="text-gray-400 mb-2" />
						<Text className="text-gray-600 text-center">
							No se ha seleccionado ninguna imagen
						</Text>
					</Box>

					<HStack className="gap-3">
						<Pressable
							onPress={pickImageFromGallery}
							className="flex-1 bg-primary-500 p-4 rounded-lg items-center justify-center"
						>
							<Icon as={ImageIcon} size="lg" className="text-white mb-1" />
							<Text className="text-white font-semibold">Galería</Text>
						</Pressable>

						<Pressable
							onPress={takePhoto}
							className="flex-1 bg-primary-500 p-4 rounded-lg items-center justify-center"
						>
							<Icon as={CameraIcon} size="lg" className="text-white mb-1" />
							<Text className="text-white font-semibold">Cámara</Text>
						</Pressable>
					</HStack>
				</VStack>
			)}

			<Text className="text-sm text-gray-500">{helperText}</Text>
		</VStack>
	);
}
