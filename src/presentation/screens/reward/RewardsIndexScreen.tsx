import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { ArrowRightIcon, Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader
} from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useBusinessId } from '@/src/presentation/hooks/useBusinessId';
import { useReward } from '@/src/presentation/hooks/useReward';
import { Spinner } from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, } from 'react-native';


export default function RewardsIndexScreen() {
    const router = useRouter();

    //  Hook al inicio (antes de cualquier return condicional)
    const [showModal, setShowModal] = React.useState(false);

    // Obtener businessId del usuario autenticado
    const {
        data: businessId,
        isLoading: loadingBusiness,
        error: businessError,
    } = useBusinessId();

    // Obtener recompensas del negocio
    const { rewards, isLoadingRewards, rewardsError } = useReward(businessId);

    // Estado de carga inicial
    if (loadingBusiness || isLoadingRewards) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center">
                <Spinner size="large" color="#2F4858" />
                <Text className="text-[#6A6A6A] mt-4">Cargando recompensas...</Text>
            </Box>
        );
    }

    // Manejo de errores
    if (businessError) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center p-6">
                <Text className="text-[#F44336] text-center">
                    Error al cargar el negocio: {businessError.message}
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

    if (rewardsError) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center p-6">
                <Text className="text-[#F44336] text-center">
                    Error al cargar recompensas: {rewardsError.message}
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

    const hasRewards = rewards.length > 0;

    const handleCreatePress = () => {
        router.push('/reward/create');
    };

    const handleRewardPress = (rewardId: string) => {
        router.push(`/reward/${rewardId}`);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'PuntoFiel',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                    headerTintColor: '#2F4858',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />

            <Box className="flex-1 bg-[#FFFFFF]">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Contenedor con ancho máximo para pantallas grandes */}
                    <Box className="flex-1 w-full max-w-2xl mx-auto">
                        <VStack className="p-6" space="lg">
                            {/* Título Principal */}
                            <Heading className="text-2xl font-bold text-[#2F4858]">
                                Mis recompensas
                            </Heading>

                            {/* Botón para crear recompensa */}
                            <Button
                                onPress={handleCreatePress}
                                className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg"
                                size="md"
                            >
                                <ButtonText className="text-[#FFFFFF] font-medium text-lg">
                                    Crear recompensa
                                </ButtonText>
                            </Button>

                            {/* Botón para promociones - Próximamente */}
                            <Button
                                onPress={() => setShowModal(true)}
                                className="rounded-lg"
                                variant="outline"
                                size="md"
                            >
                                <ButtonText className="text-[#2F4858] font-medium text-lg">
                                    Promociones
                                </ButtonText>
                            </Button>

                            {/* Modal de próximamente */}
                            <Modal
                                isOpen={showModal}
                                onClose={() => setShowModal(false)}
                                size="lg"
                            >
                                <ModalBackdrop />
                                <ModalContent>
                                    <ModalHeader>
                                        <Heading size="lg">Próximamente</Heading>
                                    </ModalHeader>
                                    <ModalBody>
                                        <Text size='lg'>Esta funcionalidad estará disponible pronto.</Text>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button onPress={() => setShowModal(false)}>
                                            <ButtonText>Aceptar</ButtonText>
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>

                            {/* Estado Vacío */}
                            {!hasRewards && (
                                <VStack
                                    className="flex-1 justify-center items-center py-12"
                                    space="lg"
                                >
                                    <Heading className="text-xl font-bold text-[#2F4858] text-center px-4">
                                        ¡Es hora de recompensar a tus clientes!
                                    </Heading>

                                    <Text className="text-base text-center text-[#6A6A6A] px-6">
                                        Crea ofertas exclusivas para ellos y haz que sigan volviendo a
                                        tu negocio. Una recompensa es la forma perfecta de agradecer su
                                        lealtad.
                                    </Text>

                                    <Text className="text-base text-center text-[#6A6A6A] px-6">
                                        ¿Qué esperas? ¡Crea tu primera recompensa ahora!
                                    </Text>
                                </VStack>
                            )}

                            {/* Lista de Recompensas */}
                            {hasRewards && (
                                <Box className="p-3 border border-background-300 rounded-xl">
                                    <VStack space="md">
                                        {rewards.map((reward) => (
                                            <Pressable
                                                key={reward.id}
                                                onPress={() => handleRewardPress(reward.id)}
                                            >
                                                <HStack
                                                    className="bg-[#FFFFFF] border border-[#E0E0E0] rounded-lg p-3 items-center"
                                                    space="md"
                                                >
                                                    {/* Imagen de la recompensa */}
                                                    <Box className="w-20 h-20 bg-[#E0E0E0] rounded-lg overflow-hidden">
                                                        {reward.imageUrl ? (
                                                            <Image
                                                                source={{ uri: reward.imageUrl }}
                                                                alt={reward.name}
                                                                className="w-full h-full"
                                                            />
                                                        ) : (
                                                            <Box className="w-full h-full justify-center items-center">
                                                                <Text className="text-[#888888] text-xs">
                                                                    Sin imagen
                                                                </Text>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* Información */}
                                                    <VStack className="flex-1" space="xs">
                                                        <Text className="text-lg font-semibold text-[#2F4858]">
                                                            {reward.name}
                                                        </Text>
                                                        <Box className="bg-[#2F4858] self-start px-3 py-1 rounded-full">
                                                            <Text className="text-[#FFFFFF] text-sm font-medium">
                                                                {reward.pointsRequired} puntos
                                                            </Text>
                                                        </Box>
                                                    </VStack>

                                                    {/* Flecha */}
                                                    <Icon
                                                        as={ArrowRightIcon}
                                                        className="text-[#2F4858]"
                                                        size="xl"
                                                    />
                                                </HStack>
                                            </Pressable>
                                        ))}

                                        {/* Texto adicional al final */}
                                        <Box className="p-4">
                                            <Text className="text-center text-[#888888] text-md mt-4">
                                                ¿Tienes otra recompensa que agregar?{'\n'}
                                                Toca el botón de{' '}
                                                <Text className="font-bold text-md text-[#888888]">
                                                    Crear recompensa
                                                </Text>{' '}
                                                para crear una nueva.
                                            </Text>
                                        </Box>
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                    </Box>
                </ScrollView>
            </Box>
        </>
    );
}