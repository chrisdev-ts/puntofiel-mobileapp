import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@gluestack-ui/themed";
import type { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { CameraIcon, ImageIcon } from "lucide-react-native";
import { Platform, Pressable } from "react-native";

type RaffleFormStep2Props = {
    image: ImagePickerAsset | null;
    setImage: (image: ImagePickerAsset | null) => void;
    initialImageUrl?: string;
    isEditMode: boolean;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
};

export function RaffleFormStep2({
    image,
    setImage,
    initialImageUrl,
    isEditMode,
    onSubmit,
    onBack,
    isSubmitting,
}: RaffleFormStep2Props) {
    const toast = useToast();

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
                        <ToastTitle>Permisos requeridos</ToastTitle>
                        <ToastDescription>Necesitamos acceso a la galería para subir la imagen.</ToastDescription>
                    </Toast>
                ),
            });
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        if (!(await requestPermissions())) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3], // Formato un poco más rectangular para rifas
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
                        <ToastTitle>Permiso denegado</ToastTitle>
                        <ToastDescription>Necesitamos acceso a la cámara.</ToastDescription>
                    </Toast>
                ),
            });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    return (
        <VStack space="lg">
            {/* Área de selección */}
            <Pressable onPress={pickImage}>
                <Box className="w-full aspect-[4/3] bg-[#F2F2F2] rounded-lg border-2 border-dashed border-[#CCCCCC] justify-center items-center overflow-hidden">
                    {image ? (
                        <Image source={{ uri: image.uri }} alt="Nueva imagen seleccionada" className="w-full h-full" resizeMode="cover" />
                    ) : initialImageUrl && isEditMode ? (
                        <Image source={{ uri: initialImageUrl }} alt="Imagen actual de la rifa" className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <VStack space="sm" className="items-center">
                            <Icon as={ImageIcon} size="xl" className="text-[#CCCCCC]" />
                            <Text className="text-[#888888] font-medium">Selecciona un archivo</Text>
                        </VStack>
                    )}
                </Box>
            </Pressable>

            <Text className="text-center text-[#CCCCCC] font-medium">O</Text>

            {/* Botón Cámara (Móvil) */}
            {Platform.OS !== "web" && (
                <Button variant="outline" className="bg-white border-[#2F4858] rounded-lg" size="lg" onPress={takePhoto}>
                    <Icon as={CameraIcon} className="text-[#2F4858] mr-2" />
                    <ButtonText className="text-[#2F4858] font-medium">Abrir cámara y tomar foto</ButtonText>
                </Button>
            )}

            {/* Acciones */}
            <VStack space="sm" className="mt-8">
                <Button onPress={onSubmit} isDisabled={isSubmitting} className="bg-[#2F4858] rounded-lg" size="lg">
                    {isSubmitting ? (
                        <Spinner color="white" />
                    ) : (
                        <ButtonText className="text-white font-medium">
                            {isEditMode ? "Guardar cambios" : "Crear rifa anual"}
                        </ButtonText>
                    )}
                </Button>

                <Button variant="outline" onPress={onBack} isDisabled={isSubmitting} className="border-[#CCCCCC] rounded-lg" size="lg">
                    <ButtonText className="text-[#6A6A6A] font-medium">Atrás</ButtonText>
                </Button>
            </VStack>
        </VStack>
    );
}