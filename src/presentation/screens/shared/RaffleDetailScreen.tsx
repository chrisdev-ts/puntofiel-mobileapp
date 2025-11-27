import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	AlertCircleIcon,
	CheckSquare,
	ClockIcon,
	EditIcon,
	TrashIcon,
	Trophy,
	UserIcon,
	XSquare,
} from "lucide-react-native";
import { useEffect, useState } from "react";

// Shared Components
import {
	FeedbackScreen,
	RewardDetailSkeleton,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

// Hooks
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useRaffle } from "@/src/presentation/hooks/useRaffle";
import {
	useRaffleActions,
	useUserTickets,
} from "@/src/presentation/hooks/useRaffleActions";
import { useRaffleDetail } from "@/src/presentation/hooks/useRaffleDetail";

export default function RaffleDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const toast = useToast();

	// Estados de Modales
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showBuyModal, setShowBuyModal] = useState(false);
	const [showLeaveModal, setShowLeaveModal] = useState(false);
	const [showWinnerModal, setShowWinnerModal] = useState(false);

	// Auth & Roles
	const { user } = useAuth();
	const isOwner = user?.role === "owner";
	const isCustomer = user?.role === "customer";

	// Data Fetching
	const { data: raffle, isLoading: loadingRaffle, error } = useRaffleDetail(id);
	const { data: ownBusinessId } = useBusinessId(); // Solo Owner

	const businessId = raffle?.businessId || "";
	const shouldLoadBusiness = isCustomer && !!businessId;
	const { data: businessDetail, isLoading: loadingBusiness } =
		useBusinessDetail(shouldLoadBusiness ? businessId : "");

	// Actions Hooks
	const { deleteRaffle, isDeleting, deleteSuccess } = useRaffle(ownBusinessId);
	const handleDelete = () => {
		if (businessId) {
			// Aseguramos que existe el ID
			deleteRaffle(id);
			setShowDeleteModal(false);
		}
	};
	const { buyTicket, returnTickets, isBuying, isReturning } =
		useRaffleActions();
	// Obtenemos cuántos tickets tiene el usuario actual
	const { data: ticketCount = 0, isLoading: loadingTickets } = useUserTickets(
		isCustomer ? id : undefined,
	);

	// --- Efectos ---
	useEffect(() => {
		if (deleteSuccess) {
			toast.show({
				placement: "top",
				render: ({ id }) => (
					<Toast nativeID={`toast-${id}`} action="success">
						<ToastTitle>Eliminada</ToastTitle>
						<ToastDescription>Rifa eliminada correctamente.</ToastDescription>
					</Toast>
				),
			});
			router.replace("/(owner)/(tabs)/raffles/" as never);
		}
	}, [deleteSuccess, router.replace, toast.show]);

	// Lógica de Navegación Back
	const handleCustomBack = () => {
		if (isOwner) {
			router.replace("/(owner)/(tabs)/raffles/" as never);
		} else if (raffle?.businessId) {
			router.replace({
				pathname: "/(customer)/business/[id]",
				params: { id: raffle.businessId },
			} as never);
		} else {
			router.replace("/(customer)/home" as never);
		}
	};

	// Loading & Error States
	const isLoading =
		loadingRaffle || (isCustomer && (loadingBusiness || loadingTickets));

	if (isLoading)
		return (
			<AppLayout
				showHeader={true}
				showNavBar={false}
				headerVariant="back"
				onBackPress={handleCustomBack}
			>
				<Box className="flex-1 center bg-white">
					<RewardDetailSkeleton />
				</Box>
			</AppLayout>
		);
	if (error || !raffle)
		return (
			<AppLayout
				showHeader={true}
				showNavBar={false}
				headerVariant="back"
				onBackPress={handleCustomBack}
			>
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Error"
					description="No se encontró la rifa."
				/>
			</AppLayout>
		);

	// --- VARIABLES CALCULADAS ---
	const now = new Date();
	const endDate = new Date(raffle.endDate);
	const isFinished = now > endDate || raffle.isCompleted;
	const hasWinner = !!raffle.winnerCustomerId;
	const isWinner = raffle.winnerCustomerId === user?.id;

	// Cliente
	const isParticipating = ticketCount > 0;
	const currentPoints = businessDetail?.loyaltyCard?.points || 0;
	const canAfford = currentPoints >= raffle.pointsRequired;
	const isMaxedOut = ticketCount >= raffle.maxTicketsPerUser;
	const daysRemaining = Math.ceil(
		(endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	// --- HANDLERS ---
	const handleBuy = async () => {
		try {
			await buyTicket({ raffleId: id, cost: raffle.pointsRequired });
			setShowBuyModal(false);
			toast.show({
				placement: "top",
				render: ({ id }) => (
					<Toast nativeID={`toast-${id}`} action="success">
						<ToastTitle>¡Éxito!</ToastTitle>
						<ToastDescription>Has comprado un boleto.</ToastDescription>
					</Toast>
				),
			});
		} catch (e) {
			setShowBuyModal(false);
			const errorMsg = e instanceof Error ? e.message : "Ocurrió un error";
			toast.show({
				placement: "top",
				render: ({ id }) => (
					<Toast nativeID={`toast-${id}`} action="error">
						<ToastTitle>Error</ToastTitle>
						<ToastDescription>{errorMsg}</ToastDescription>
					</Toast>
				),
			});
		}
	};

	const handleLeave = async () => {
		try {
			await returnTickets(id);
			setShowLeaveModal(false);
			toast.show({
				placement: "top",
				render: ({ id }) => (
					<Toast nativeID={`toast-${id}`} action="info">
						<ToastTitle>Reembolso</ToastTitle>
						<ToastDescription>Se han devuelto tus puntos.</ToastDescription>
					</Toast>
				),
			});
		} catch (e) {
			setShowLeaveModal(false);
			const errorMsg = e instanceof Error ? e.message : "Ocurrió un error";
			toast.show({
				placement: "top",
				render: ({ id }) => (
					<Toast nativeID={`toast-${id}`} action="error">
						<ToastTitle>Error</ToastTitle>
						<ToastDescription>{errorMsg}</ToastDescription>
					</Toast>
				),
			});
		}
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
			headerTitle="Detalle de rifa"
			onBackPress={handleCustomBack}
		>
			<VStack space="lg" className="pb-8 px-1">
				{/* --- IMAGEN CON BADGE DE ESTADO --- */}
				<Box className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
					{raffle.imageUrl ? (
						<Image
							source={{ uri: raffle.imageUrl }}
							alt={raffle.name}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<Box className="w-full h-full justify-center items-center">
							<Icon as={AlertCircleIcon} size="xl" className="text-gray-300" />
						</Box>
					)}

					{/* Badge Flotante (Solo Cliente) */}
					{isCustomer && (
						<Box
							className={`absolute bottom-4 right-4 p-2 rounded-lg ${isWinner ? "bg-yellow-500" : isParticipating ? "bg-green-500" : "bg-red-500"}`}
						>
							<Icon
								as={isWinner ? Trophy : isParticipating ? CheckSquare : XSquare}
								size="md"
								className="text-white"
							/>
						</Box>
					)}
				</Box>

				{/* --- INFO PRINCIPAL --- */}
				<VStack space="xs">
					<Heading size="xl" className="text-[#2F4858]">
						{raffle.name}
					</Heading>
					<Text className="text-gray-600 leading-6">{raffle.description}</Text>
				</VStack>

				<HStack className="justify-between items-center">
					<Badge
						variant="solid"
						className={`rounded-full px-3 py-1 ${isFinished ? "bg-gray-600" : "bg-[#2F4858]"}`}
					>
						<HStack space="xs" className="items-center">
							<Icon as={ClockIcon} size="xs" className="text-white" />
							<BadgeText className="text-white ml-1">
								{isFinished ? "Finalizada" : `Termina en ${daysRemaining} días`}
							</BadgeText>
						</HStack>
					</Badge>
					<Text className="text-gray-500 text-sm">
						{new Date(raffle.endDate).toLocaleDateString()}
					</Text>
				</HStack>

				{/* --- DATOS TÉCNICOS --- */}
				<VStack space="md" className="mt-2">
					<VStack space="xs">
						<Text className="font-bold text-[#2F4858]">Puntos para entrar</Text>
						<Text className="text-gray-600">
							{raffle.pointsRequired} Puntos
						</Text>
					</VStack>
					<VStack space="xs">
						<Text className="font-bold text-[#2F4858]">
							Máximo de boletos por cliente
						</Text>
						<Text className="text-gray-600">
							{raffle.maxTicketsPerUser} Boletos
						</Text>
					</VStack>
				</VStack>

				{/* --- ACCIONES CLIENTE --- */}
				{isCustomer && (
					<Box className="mt-6">
						{/* CASO 1: GANADOR (Botón Mostrar Victoria) */}
						{isWinner && (
							<Button
								className="w-full bg-[#2F4858] rounded-lg h-12"
								onPress={() => setShowWinnerModal(true)}
							>
								<ButtonText>Mostrar victoria</ButtonText>
							</Button>
						)}

						{/* CASO 2: ACTIVA (Botones Participar / Dejar) */}
						{!isFinished && !isWinner && (
							<VStack space="md">
								{/* Botón Principal: Participar */}
								<Button
									onPress={() => setShowBuyModal(true)}
									// Deshabilitado si: No le alcanza, Ya llegó al tope, o está cargando
									isDisabled={
										(!canAfford && !isMaxedOut) || isMaxedOut || isBuying
									}
									className={`w-full rounded-lg h-12 ${isMaxedOut || !canAfford ? "bg-gray-400" : "bg-[#2F4858]"}`}
								>
									<ButtonText>
										{isMaxedOut
											? `Participar (${ticketCount} / ${raffle.maxTicketsPerUser})` // Límite alcanzado
											: !canAfford
												? "Puntos insuficientes"
												: isParticipating
													? `Participar (${ticketCount} / ${raffle.maxTicketsPerUser})`
													: "Participar"}
									</ButtonText>
								</Button>

								{/* Botón Secundario: Dejar de participar */}
								{isParticipating && (
									<Button
										onPress={() => setShowLeaveModal(true)}
										variant="outline"
										className="w-full rounded-lg h-12 border-red-500"
										isDisabled={isReturning}
									>
										<Icon as={XSquare} className="text-red-500 mr-2" />
										<ButtonText className="text-red-500">
											Dejar de participar
										</ButtonText>
									</Button>
								)}
							</VStack>
						)}

						{/* CASO 3: FINALIZADA SIN GANAR */}
						{isFinished && !isWinner && (
							<Box className="bg-gray-200 p-4 rounded-lg items-center">
								<Text className="text-gray-600 font-bold">Rifa Finalizada</Text>
							</Box>
						)}
					</Box>
				)}

				{/* --- ACCIONES DUEÑO (Gestión) --- */}
				{isOwner && (
					<>
						{isFinished && (
							<Box className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
								{hasWinner ? (
									<VStack space="sm">
										<Heading size="md" className="text-[#2F4858]">
											Ganador
										</Heading>
										<HStack space="md" className="items-center">
											<Box className="p-2 bg-gray-200 rounded-full">
												<Icon
													as={UserIcon}
													size="md"
													className="text-gray-600"
												/>
											</Box>
											<VStack>
												<Text className="font-bold text-lg">
													{raffle.winnerName
														? raffle.winnerName
														: "Cliente Ganador"}
												</Text>
												{raffle.winnerCustomerId && (
													<Text className="text-gray-500 text-sm">
														ID: {raffle.winnerCustomerId.slice(0, 8)}...
													</Text>
												)}
											</VStack>
										</HStack>
									</VStack>
								) : (
									<Button
										className="bg-[#2F4858] rounded-lg"
										onPress={() =>
											router.push(
												`/(owner)/raffles/select-winner/${id}` as never,
											)
										}
									>
										<ButtonText>Seleccionar ganador</ButtonText>
									</Button>
								)}
							</Box>
						)}

						{!isFinished && (
							<VStack space="md" className="mt-4">
								<Button
									variant="outline"
									className="rounded-lg border-[#2F4858]"
									onPress={() =>
										router.push(`/(owner)/raffles/edit/${id}` as never)
									}
								>
									<ButtonIcon as={EditIcon} className="text-[#2F4858] mr-2" />
									<ButtonText className="text-[#2F4858]">
										Editar rifa anual
									</ButtonText>
								</Button>
								<Button
									variant="outline"
									className="rounded-lg border-red-500"
									onPress={() => setShowDeleteModal(true)}
								>
									<ButtonIcon as={TrashIcon} className="text-red-500 mr-2" />
									<ButtonText className="text-red-500">
										Eliminar rifa anual
									</ButtonText>
								</Button>
							</VStack>
						)}
					</>
				)}
			</VStack>

			{/* --- MODALES DE CONFIRMACIÓN --- */}

			{/* 1. Modal Comprar Boleto */}
			<Modal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)}>
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>
						<Heading size="lg">¿Estás seguro de querer participar?</Heading>
					</ModalHeader>
					<ModalBody>
						<Text className="text-gray-600">
							Al participar los puntos gastados ({raffle.pointsRequired}) en los
							boletos de la rifa no se reembolsarán si no sales ganador.
						</Text>
						<Text className="text-gray-600">
							Solo se reembolsarán si decides dejar de participar manualmente
							antes del sorteo.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button variant="outline" onPress={() => setShowBuyModal(false)}>
							<ButtonText>Cancelar</ButtonText>
						</Button>
						<Button
							className="bg-[#2F4858]"
							onPress={handleBuy}
							isDisabled={isBuying}
						>
							<ButtonText>Confirmar</ButtonText>
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* 2. Modal Dejar Participar */}
			<Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>
						<Heading size="lg">
							¿Estás seguro de querer dejar de participar?
						</Heading>
					</ModalHeader>
					<ModalBody>
						<Text className="text-gray-600 mb-2">
							Al dejar participar ya no estarás en la lista de participantes y
							se eliminarán todos los boletos registrados.
						</Text>
						<Text className="text-gray-600">
							Se reembolsarán los puntos si decides dejar participar en la rifa.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="outline"
							onPress={() => setShowLeaveModal(false)}
							className="mr-2"
						>
							<ButtonText>Cancelar</ButtonText>
						</Button>
						<Button
							className="bg-[#2F4858]"
							onPress={handleLeave}
							isDisabled={isReturning}
						>
							<ButtonText>Confirmar</ButtonText>
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* 3. Modal Victoria (Pantalla Dorada) */}
			<Modal
				isOpen={showWinnerModal}
				onClose={() => setShowWinnerModal(false)}
				size="lg"
			>
				<ModalBackdrop />
				<ModalContent className="items-center p-6 bg-white rounded-2xl">
					<Icon
						as={Trophy}
						size="xl"
						className="text-yellow-500 mb-4 w-32 5-32"
					/>
					<Heading
						size="2xl"
						className="text-[#2F4858] text-center mb-4 font-extrabold"
					>
						¡ERES EL GANADOR!
					</Heading>

					<Text className="text-center font-bold text-lg text-[#2F4858] mb-2">
						¡Felicidades, {raffle.winnerName || user?.firstName || "Usuario"}!
					</Text>
					<Text className="text-center text-gray-600 mb-6 px-2">
						Has ganado la rifa <Text className="font-bold">{raffle.name}</Text>{" "}
						de {businessDetail?.business.name}. ¡Te lo has ganado con tu
						fidelidad!
					</Text>

					<VStack className="w-full bg-gray-50 p-4 rounded-lg">
						<Text className="font-bold text-[#2F4858] mb-2 uppercase text-xs">
							Pasos para reclamar tu premio:
						</Text>
						<Text className="text-gray-600 mb-1 text-sm">
							1. Dirígete a {businessDetail?.business.name}.
						</Text>
						<Text className="text-gray-600 mb-1 text-sm">
							2. Muestra esta pantalla al personal para que validen tu premio.
						</Text>
						<Text className="text-gray-600 text-sm">
							3. El personal te indicará los pasos para la entrega.
						</Text>
					</VStack>

					<Button
						className="w-full bg-[#2F4858] mt-6"
						onPress={() => setShowWinnerModal(false)}
					>
						<ButtonText>Cerrar</ButtonText>
					</Button>
				</ModalContent>
			</Modal>

			{/* 4. Modal Eliminar (Owner) */}
			{isOwner && (
				<Modal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
				>
					<ModalBackdrop />
					<ModalContent>
						<ModalHeader>
							<Heading size="lg">¿Eliminar rifa?</Heading>
						</ModalHeader>
						<ModalBody>
							<Text>Esta acción no se puede deshacer.</Text>
						</ModalBody>
						<ModalFooter>
							<Button
								variant="outline"
								onPress={() => setShowDeleteModal(false)}
								className="mr-2"
							>
								<ButtonText>Cancelar</ButtonText>
							</Button>
							<Button
								className="bg-red-600"
								onPress={handleDelete}
								isDisabled={isDeleting}
							>
								<ButtonText>Eliminar</ButtonText>
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</AppLayout>
	);
}
