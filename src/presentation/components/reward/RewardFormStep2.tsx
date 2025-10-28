import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Spinner } from '@gluestack-ui/themed';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { CameraIcon, ImageIcon } from 'lucide-react-native';
import { Alert, Platform, Pressable } from 'react-native';

type RewardFormStep2Props = {
    image: ImagePickerAsset | null;
    setImage: (image: ImagePickerAsset | null) => void;
    initialImageUrl?: string;
    isEditMode: boolean;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
};

export function RewardFormStep2({
    image,
    setImage,
    initialImageUrl,
    isEditMode,
    onSubmit,
    onBack,
    isSubmitting,
}: RewardFormStep2Props) {
    // Solicitar permisos de cámara y galería
    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryPermission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
            cameraPermission.status !== 'granted' ||
            mediaLibraryPermission.status !== 'granted'
        ) {
            Alert.alert(
                'Permisos requeridos',
                'Necesitas otorgar permisos a la cámara y galería para continuar.'
            );
            return false;
        }
        return true;
    };

    // Abrir galería de imágenes
    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // Abrir cámara
    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    return (
        <VStack space="lg">
            {/* Zona de selección de imagen */}
            <Pressable onPress={pickImage}>
                <Box className="w-full aspect-square bg-[#F2F2F2] rounded-lg border-2 border-dashed border-[#CCCCCC] justify-center items-center">
                    {image ? (
                        <Image
                            source={{ uri: image.uri }}
                            alt="Imagen seleccionada"
                            className="w-full h-full rounded-lg"
                        />
                    ) : initialImageUrl && isEditMode ? (
                        <Image
                            source={{ uri: initialImageUrl }}
                            alt="Imagen actual"
                            className="w-full h-full rounded-lg"
                        />
                    ) : (
                        <VStack space="sm" className="items-center">
                            <Icon as={ImageIcon} size="xl" className="text-[#CCCCCC]" />
                            <Text className="text-[#888888] font-medium">
                                Selecciona un archivo
                            </Text>
                        </VStack>
                    )}
                </Box>
            </Pressable>

            <Text className="text-center text-[#CCCCCC] font-medium">O</Text>

            {/* Botón de cámara (solo en móviles) */}
            {Platform.OS !== 'web' && (
                <Button
                    variant="outline"
                    className="bg-[#FFFFFF] active:bg-[#E0E7ED] border border-[#2F4858] rounded-lg"
                    size="lg"
                    onPress={takePhoto}
                >
                    <Icon as={CameraIcon} className="text-[#2F4858] mr-2" />
                    <ButtonText className="text-[#2F4858] font-medium text-lg">
                        Abrir cámara y tomar foto
                    </ButtonText>
                </Button>
            )}

            {/* Botones de navegación */}
            <VStack space="sm" className="mt-4">
                {/* Botón Guardar/Registrar */}
                <Button
                    onPress={onSubmit}
                    isDisabled={isSubmitting}
                    className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg"
                    size="lg"
                >
                    {isSubmitting ? (
                        <Spinner color="#FFFFFF" />
                    ) : (
                        <ButtonText className="text-[#FFFFFF] font-medium text-lg">
                            {isEditMode ? 'Guardar cambios' : 'Registrar recompensa'}
                        </ButtonText>
                    )}
                </Button>

                {/* Botón Atrás */}
                <Button
                    variant="outline"
                    onPress={onBack}
                    isDisabled={isSubmitting}
                    className="bg-[#FFFFFF] active:bg-[#F2F2F2] border border-[#CCCCCC] rounded-lg"
                    size="lg"
                >
                    <ButtonText className="text-[#6A6A6A] font-medium text-lg">
                        Atrás
                    </ButtonText>
                </Button>
            </VStack>
        </VStack>
    );
}