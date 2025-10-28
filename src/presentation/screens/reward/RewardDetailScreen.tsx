import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CloseCircleIcon, Icon, TrashIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useBusinessId } from '@/src/presentation/hooks/useBusinessId';
import { useReward } from '@/src/presentation/hooks/useReward';
import { useRewardDetail } from '@/src/presentation/hooks/useRewardDetail';
import { Spinner } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { EditIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, useWindowDimensions } from 'react-native';

type RewardDetailScreenProps = {
    rewardId: string;
};

export default function RewardDetailScreen({ rewardId }: RewardDetailScreenProps) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Hook para obtener dimensiones de la pantalla
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380; // Detectar pantallas pequeñas

    // Obtener businessId
    const { data: businessId } = useBusinessId();

    // Cargar datos de la recompensa
    const { data: reward, isLoading, error } = useRewardDetail(rewardId);

    // Hook de mutation para eliminar
    const { deleteReward, isDeleting, deleteSuccess, deleteError } = useReward(businessId);

    // Navegar cuando se elimine exitosamente
    useEffect(() => {
        if (deleteSuccess) {
            Alert.alert('Éxito', 'Recompensa desactivada correctamente', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        }
    }, [deleteSuccess, router]);

    const handleEditPress = () => {
        router.push(`/reward/edit/${rewardId}`);
    };

    const handleDeletePress = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setShowDeleteModal(false);
        deleteReward(rewardId);
    };

    if (isLoading) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center">
                <Spinner size="large" color="#2F4858" />
                <Text className="text-[#6A6A6A] mt-4">Cargando recompensa...</Text>
            </Box>
        );
    }

    if (error || !reward) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center p-6">
                <Text className="text-[#F44336] text-center">
                    {error?.message || 'No se encontró la recompensa'}
                </Text>
                <Button
                    onPress={() => router.back()}
                    variant="outline"
                    className="mt-4"
                >
                    <ButtonText>Volver</ButtonText>
                </Button>
            </Box>
        );
    }

    return (
        <>

            <Box className="flex-1 bg-[#FFFFFF]">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Contenedor con ancho máximo para pantallas grandes */}
                    <Box className="flex-1 w-full max-w-2xl mx-auto">
                        <VStack className="flex-1 p-5">
                            {/* Imagen de la recompensa */}
                            <Box className="w-full aspect-square bg-[#E0E0E0]  overflow-hidden">
                                {reward.imageUrl ? (
                                    <Image
                                        source={{ uri: reward.imageUrl }}
                                        alt={reward.name}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <Box className="w-full h-full justify-center items-center">
                                        <Text className="text-[#888888]">Sin imagen</Text>
                                    </Box>
                                )}
                            </Box>

                            {/* Información de la recompensa */}
                            <VStack className="p-1 pt-4" space="lg">
                                <Heading className="text-2xl font-bold text-[#2F4858]">
                                    {reward.name}
                                </Heading>

                                <Text className="text-xl text-[#4A4A4A] leading-5">
                                    {reward.description || 'Sin descripción disponible'}
                                </Text>

                                <Box className="bg-[#2F4858] self-start px-6 py-2 rounded-full">
                                    <Text className="text-[#FFFFFF] text-md font-semibold">
                                        {reward.pointsRequired} puntos
                                    </Text>
                                </Box>

                                {/* Mostrar error de eliminación */}
                                {deleteError && (
                                    <Box className="bg-red-50 p-3 rounded-lg">
                                        <Text className="text-[#F44336]">{deleteError.message}</Text>
                                    </Box>
                                )}

                                {/* Botones de acción */}
                                <VStack space="md" className="mt-5">
                                    {/* Botón Editar - Estado hover/press nativo */}
                                    <Button
                                        onPress={handleEditPress}
                                        variant="outline"
                                        size="lg"
                                        className="rounded-lg"
                                    >
                                        <Icon as={EditIcon} className="text-[#2F4858] mr-2" size="sm" />
                                        <ButtonText className="text-[#2F4858] font-md text-lg">
                                            Editar recompensa
                                        </ButtonText>
                                    </Button>

                                    {/* Botón Eliminar - Estado hover/press nativo */}
                                    <Button
                                        onPress={handleDeletePress}
                                        isDisabled={isDeleting}
                                        variant="outline"
                                        size="lg"
                                        className="rounded-lg border-error-500"
                                    >
                                        {isDeleting ? (
                                            <Spinner color="#F44336" />
                                        ) : (
                                            <>
                                                <Icon
                                                    as={CloseCircleIcon}
                                                    className="text-error-500 mr-2"
                                                    size="sm"
                                                />
                                                <ButtonText className="text-error-500 font-md text-lg">
                                                    Eliminar recompensa
                                                </ButtonText>
                                            </>
                                        )}
                                    </Button>
                                </VStack>
                            </VStack>
                        </VStack>
                    </Box>
                </ScrollView>

                {/* Modal de Confirmación */}
                <Modal
                    visible={showDeleteModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDeleteModal(false)}
                >
                    <Box className="flex-1 justify-center items-center bg-black/50 p-6">
                        <Box className="bg-[#FFFFFF] rounded-lg p-6 w-full max-w-sm">
                            <VStack space="xl">
                                <Heading className="text-xl font-bold text-[#2F4858]">
                                    ¿Estás seguro de querer eliminar esta recompensa?
                                </Heading>

                                <Text className="text-lg text-[#6A6A6A]">
                                    La recompensa será eliminada y no se mostrará a los clientes.
                                    Por favor confirme si desea continuar.
                                </Text>

                                {/* Botones en horizontal */}
                                <HStack space="sm" className="mt-3  justify-end">
                                    {/* Botón Cancelar */}
                                    <Button
                                        variant="outline"
                                        onPress={() => setShowDeleteModal(false)}
                                        size="md"
                                        className="flex-2"
                                    >
                                        {isSmallScreen ? (
                                            <Icon as={CloseCircleIcon} className="text-[#2F4858]" size="sm" />
                                        ) : (
                                            <HStack space="sm" className="items-center">
                                                <ButtonText className="text-[#2F4858] font-extrabold text-sm" >
                                                    Cancelar
                                                </ButtonText>
                                                <Icon as={CloseCircleIcon} className="text-[#2F4858]" size="sm" />
                                            </HStack>
                                        )}
                                    </Button>

                                    {/* Botón Eliminar */}
                                    <Button
                                        onPress={confirmDelete}
                                        action="negative"
                                        size="md"
                                        className="flex-2"
                                    >
                                        {isSmallScreen ? (
                                            <Icon as={TrashIcon} className="text-[#FFFFFF]" size="sm" />
                                        ) : (
                                            <HStack space="sm" className="items-center">
                                                <ButtonText className="text-[#FFFFFF] font-extrabold text-sm">
                                                    Eliminar
                                                </ButtonText>
                                                <Icon as={TrashIcon} className="text-[#FFFFFF]" size="sm" />
                                            </HStack>
                                        )}
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </>
    );
}