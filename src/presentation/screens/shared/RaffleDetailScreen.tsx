import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen, RewardDetailSkeleton } from "@/src/presentation/components/common"; // Podemos reusar el skeleton de reward o crear uno
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail"; // Vital para ver los puntos del cliente
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useRaffle } from "@/src/presentation/hooks/useRaffle";
import { useRaffleDetail } from "@/src/presentation/hooks/useRaffleDetail";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon, BellIcon, ClockIcon, EditIcon, InfoIcon, TicketIcon, TrashIcon, UserIcon } from "lucide-react-native";
import { useEffect, useState } from "react";

export default function RaffleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const toast = useToast();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 1. Autenticación y Roles
    const { user } = useAuth();
    const isOwner = user?.role === "owner";
    const isCustomer = user?.role === "customer";

    // 2. Cargar datos de la Rifa
    const { data: raffle, isLoading: loadingRaffle, error } = useRaffleDetail(id);

    // 3. Datos del Negocio (Owner: ID para eliminar)
    const { data: ownBusinessId } = useBusinessId();

    // 4. Datos del Cliente (Customer: Puntos actuales)
    // Cargamos el detalle del negocio usando el businessId de la rifa
    const businessId = raffle?.businessId || "";
    const shouldLoadBusiness = isCustomer && !!businessId;
    const { data: businessDetail, isLoading: loadingBusiness } = useBusinessDetail(shouldLoadBusiness ? businessId : "");

    // 5. Hook de acciones (Eliminar - Owner)
    const { deleteRaffle, isDeleting, deleteSuccess } = useRaffle(ownBusinessId);

    // --- Efectos y Lógica ---

    useEffect(() => {
        if (deleteSuccess) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                        <ToastTitle>Eliminada</ToastTitle>
                        <ToastDescription>La rifa se eliminó correctamente.</ToastDescription>
                    </Toast>
                ),
            });
            setTimeout(() => router.back(), 500);
        }
    }, [deleteSuccess]);

    const isLoading = loadingRaffle || (isCustomer && loadingBusiness);

    if (isLoading) {
        return (
            <AppLayout showHeader={true} showNavBar={false} headerVariant="back">
                {/* Reusamos el skeleton de detalle o un spinner simple */}
                <Box className="flex-1 justify-center items-center bg-white">
                    <RewardDetailSkeleton />
                </Box>
            </AppLayout>
        );
    }

    if (error || !raffle) {
        return (
            <AppLayout showHeader={true} showNavBar={false} headerVariant="back">
                <FeedbackScreen
                    variant="error"
                    icon={AlertCircleIcon}
                    title="Rifa no encontrada"
                    description={error?.message || "No se pudo cargar la información de la rifa."}
                />
            </AppLayout>
        );
    }

    // Variables Calculadas
    const now = new Date();
    const endDate = new Date(raffle.endDate);
    const isFinished = now > endDate || raffle.isCompleted;
    const hasWinner = !!raffle.winnerCustomerId;
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formattedEndDate = endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    // Datos del Cliente (Puntos y Validación)
    const currentPoints = businessDetail?.loyaltyCard?.points || 0;
    const canBuyTicket = currentPoints >= raffle.pointsRequired;

    // --- Handlers ---

    const handleDelete = () => {
        deleteRaffle(id);
        setShowDeleteModal(false);
    };

    const handleBuyTicket = () => {
        // TODO: Implementar la mutación real de comprar boleto
        console.log("Comprar boleto para rifa:", id);
        toast.show({
            placement: "top",
            render: ({ id }) => (
                <Toast nativeID={`toast-${id}`} action="info" variant="solid">
                    <ToastTitle>Próximamente</ToastTitle>
                    <ToastDescription>La compra de boletos estará disponible pronto.</ToastDescription>
                </Toast>
            )
        });
    };

    const handleNotifyWinner = () => {
        toast.show({
            placement: "top",
            render: ({ id }) => (
                <Toast nativeID={`toast-${id}`} action="info" variant="solid">
                    <ToastTitle>Enviado</ToastTitle>
                    <ToastDescription>Se ha notificado al ganador.</ToastDescription>
                </Toast>
            ),
        });
    };

    // --- MANEJADOR DE RETROCESO PERSONALIZADO ---
    const handleCustomBack = () => {
        if (isOwner) {
            // Si es dueño, volver a SU lista de gestión
            // Usamos replace para asegurar que la lista se recargue si es necesario y no guardar el detalle en el stack
            router.replace("/(owner)/raffles/" as never);
        } else {
            // Si es cliente, volver al feed de rifas
            router.replace("/(customer)/business/raffles/" as never);
        }
    };

    return (
        <AppLayout showHeader={true} showNavBar={false} scrollable={true} headerVariant="back" headerTitle="Detalle de rifa" onBackPress={handleCustomBack}>
            <VStack space="lg" className="pb-8 px-1">

                {/* Header Cliente: Nombre del Negocio y Puntos */}
                {isCustomer && businessDetail?.business && (
                    <HStack space="md" className="items-center justify-between px-2 mb-2">
                        <Heading size="lg" className="text-primary-500 flex-1">
                            {businessDetail.business.name}
                        </Heading>
                        <VStack space="xs" className="items-end">
                            <Text className="text-typography-500 text-xs">
                                Tus puntos actuales
                            </Text>
                            <Badge action="info" variant="solid" size="lg">
                                <BadgeText>{currentPoints} puntos</BadgeText>
                            </Badge>
                        </VStack>
                    </HStack>
                )}

                {/* Imagen Principal */}
                <Box className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {raffle.imageUrl ? (
                        <Image source={{ uri: raffle.imageUrl }} alt={raffle.name} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Box className="w-full h-full justify-center items-center">
                            <Text className="text-gray-400">Sin imagen</Text>
                        </Box>
                    )}
                </Box>

                {/* Info Básica */}
                <VStack space="xs">
                    <Heading size="xl" className="text-[#2F4858]">{raffle.name}</Heading>
                    <Text className="text-gray-600 leading-6">{raffle.description}</Text>
                </VStack>

                <HStack className="justify-between items-center">
                    <Badge variant="solid" className={`rounded-full px-3 py-1 ${isFinished ? 'bg-gray-600' : 'bg-[#2F4858]'}`}>
                        <HStack space="xs" className="items-center">
                            <Icon as={ClockIcon} size="xs" className="text-white" />
                            <BadgeText className="text-white ml-1">
                                {isFinished ? "Finalizada" : `Termina en ${daysRemaining} días`}
                            </BadgeText>
                        </HStack>
                    </Badge>
                    <Text className="text-gray-500 text-sm">{formattedEndDate}</Text>
                </HStack>

                {/* Datos Técnicos */}
                <VStack space="md" className="mt-2">
                    <VStack space="xs">
                        <Text className="font-bold text-[#2F4858]">Puntos para entrar</Text>
                        <Badge action="success" variant="solid" size="lg" className="self-start">
                            <BadgeText>{raffle.pointsRequired} puntos</BadgeText>
                        </Badge>
                    </VStack>
                    <VStack space="xs">
                        <Text className="font-bold text-[#2F4858]">Máximo de boletos por cliente</Text>
                        <Text className="text-gray-600">{raffle.maxTicketsPerUser} Boletos</Text>
                    </VStack>
                </VStack>

                {/* --- VISTA DE CLIENTE (CUSTOMER) --- */}
                {isCustomer && (
                    <Box className="mt-4">
                        <Box className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-6">
                            <HStack space="sm" className="items-start">
                                <Icon as={InfoIcon} size="md" className="text-info-800 mt-0.5" />
                                <Text className="text-info-800 text-sm flex-1">
                                    Los puntos gastados en boletos no son reembolsables. Al comprar, aceptas las condiciones de la rifa.
                                </Text>
                            </HStack>
                        </Box>

                        {!isFinished ? (
                            <>
                                <Button
                                    onPress={handleBuyTicket}
                                    isDisabled={!canBuyTicket}
                                    className="w-full rounded-lg"
                                    action={canBuyTicket ? "primary" : "secondary"}
                                    size="lg"
                                >
                                    <ButtonIcon as={TicketIcon} className="mr-2 text-white" />
                                    <ButtonText>
                                        {canBuyTicket ? "Comprar boleto" : "Puntos insuficientes"}
                                    </ButtonText>
                                </Button>

                                {!canBuyTicket && (
                                    <Text className="text-gray-500 text-sm text-center mt-2">
                                        Te faltan {raffle.pointsRequired - currentPoints} puntos.
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Box className="bg-gray-200 p-4 rounded-lg items-center">
                                <Text className="text-gray-600 font-bold">Esta rifa ha finalizado</Text>
                            </Box>
                        )}
                    </Box>
                )}

                {/* --- VISTA DE DUEÑO (OWNER) --- */}
                {isOwner && (
                    <>
                        {/* Ganador (Si finalizó) */}
                        {isFinished && (
                            <Box className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                {hasWinner ? (
                                    <VStack space="sm">
                                        <Heading size="md" className="text-[#2F4858]">Ganador</Heading>
                                        <HStack space="md" className="items-center">
                                            <Box className="p-2 bg-gray-200 rounded-full">
                                                <Icon as={UserIcon} size="md" className="text-gray-600" />
                                            </Box>
                                            <VStack>
                                                <Text className="font-bold text-lg">Cliente Ganador</Text>
                                                <Text className="text-gray-500 text-sm">ID: {raffle.winnerCustomerId?.slice(0, 8)}...</Text>
                                            </VStack>
                                        </HStack>
                                        <Button className="bg-[#2F4858] mt-2 rounded-lg" onPress={handleNotifyWinner}>
                                            <ButtonText>Notificar al cliente ganador</ButtonText>
                                            <ButtonIcon as={BellIcon} className="ml-2 text-white" />
                                        </Button>
                                    </VStack>
                                ) : (
                                    <Button
                                        className="bg-[#2F4858] rounded-lg"
                                        onPress={() => router.push(`/(owner)/raffles/select-winner/${id}` as never)}
                                    >
                                        <ButtonText>Seleccionar ganador aleatoriamente</ButtonText>
                                    </Button>
                                )}
                            </Box>
                        )}

                        {/* Gestión (Si no ha finalizado) */}
                        {!isFinished && (
                            <VStack space="md" className="mt-4">
                                <Button variant="outline" className="rounded-lg" size="lg" onPress={() => router.push(`/(owner)/raffles/edit/${id}` as never)}>
                                    <ButtonIcon as={EditIcon} className="text-primary-500 mr-2" />
                                    <ButtonText className="text-primary-500">Editar rifa anual</ButtonText>
                                </Button>
                                <Button variant="outline" className="rounded-lg border-error-500" size="lg" onPress={() => setShowDeleteModal(true)}>
                                    <ButtonIcon as={TrashIcon} className="text-error-500 mr-2" />
                                    <ButtonText className="text-error-500">Eliminar rifa anual</ButtonText>
                                </Button>
                            </VStack>
                        )}
                    </>
                )}

            </VStack>

            {/* Modal Confirmación Borrar (Solo Owner) */}
            {isOwner && (
                <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <ModalBackdrop />
                    <ModalContent>
                        <ModalHeader><Heading size="lg">¿Estás seguro?</Heading></ModalHeader>
                        <ModalBody>
                            <Text className="text-gray-600 mb-2">
                                Eliminar la rifa es permanente y se devolverán los puntos a los participantes (simulado).
                            </Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="outline" onPress={() => setShowDeleteModal(false)} className="mr-2"><ButtonText>Cancelar</ButtonText></Button>
                            <Button className="bg-red-600" onPress={handleDelete} isDisabled={isDeleting}>
                                <ButtonText className="text-white">{isDeleting ? "Eliminando..." : "Eliminar"}</ButtonText>
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </AppLayout>
    );
}