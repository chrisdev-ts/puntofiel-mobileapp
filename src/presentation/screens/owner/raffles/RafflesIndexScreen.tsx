import { useRouter } from "expo-router";
import { AlertCircleIcon, HelpCircle, MedalIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
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
	FeedbackScreen,
	ListContainer,
	ListItem,
	RewardsListSkeleton, // Reutilizamos el Skeleton de rewards, visualmente es idéntico
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useRaffle } from "@/src/presentation/hooks/useRaffle";

export default function RafflesIndexScreen() {
	const router = useRouter();
	const [showInfoModal, setShowInfoModal] = useState(false);

	// 1. Obtener Business ID
	const {
		data: businessId,
		isLoading: loadingBusiness,
		error: businessError,
	} = useBusinessId();

	// 2. Obtener Rifas (Hook useRaffle)
	const { raffles, isLoadingRaffles, rafflesError } = useRaffle(businessId);

	// Cálculo de días restantes para el Badge
	const getDaysRemaining = (endDate: Date) => {
		const now = new Date();
		const end = new Date(endDate);
		const diffTime = end.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	// Loading State
	if (loadingBusiness || isLoadingRaffles) {
		return (
			<AppLayout showHeader={true} headerVariant="default" showNavBar={true}>
				<RewardsListSkeleton />
			</AppLayout>
		);
	}

	// Error Handling
	if (businessError || rafflesError) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Error al cargar"
				description={
					businessError?.message ||
					rafflesError?.message ||
					"Ocurrió un error inesperado."
				}
			/>
		);
	}

	const hasRaffles = raffles.length > 0;

	return (
		<AppLayout
			showHeader={true}
			showNavBar={true}
			scrollable={true}
			headerVariant="default"
		>
			{/* Header Personalizado con Icono de Ayuda */}
			<HStack className="justify-between items-center ">
				<Heading size="xl" className="text-primary-500">
					Mis rifas anuales
				</Heading>
				<Pressable onPress={() => setShowInfoModal(true)} className="p-2">
					<HelpCircle size={24} color="#2F4858" />
				</Pressable>
			</HStack>

			{/* Botón Crear (Solo si hay rifas, si no el Empty State tiene el suyo) */}
			{hasRaffles && (
				<Button
					onPress={() => router.push("/(owner)/raffles/create" as never)}
					size="md"
					action="primary"
				>
					<ButtonText>Crear rifa anual</ButtonText>
				</Button>
			)}

			{/* Estado Vacío */}
			{!hasRaffles && (
				<FeedbackScreen
					variant="empty"
					icon={MedalIcon}
					title="¿Buscas una forma de premiar la lealtad?"
					description="Crea una Rifa Anual opcional para motivar a tus clientes a seguir acumulando puntos. ¡Una gran recompensa genera fidelidad!"
					// 👇 AQUÍ ESTÁ EL CAMBIO: Usamos la prop 'action' en lugar de children
					action={
						<Button
							className="bg-[#2F4858] mt-6"
							onPress={() => router.push("/(owner)/raffles/create" as never)}
						>
							<ButtonText>Crear rifa anual</ButtonText>
						</Button>
					}
				/>
			)}

			{/* Lista de Rifas */}
			{hasRaffles && (
				<ListContainer>
					{raffles.map((raffle) => {
						const daysLeft = getDaysRemaining(raffle.endDate);
						const isActive = raffle.isActive && daysLeft > 0;

						return (
							<ListItem
								key={raffle.id}
								id={raffle.id}
								imageUrl={raffle.imageUrl}
								imageAlt={raffle.name}
								title={raffle.name}
								// Usamos description o prize como subtítulo
								//description={`Premio: ${raffle.prize}`}
								badge={
									<Badge
										action={isActive ? "info" : "muted"}
										variant="solid"
										className={`rounded-full ${isActive ? "bg-[#2F4858]" : "bg-gray-500"}`}
									>
										<BadgeText className="text-white">
											{isActive ? `${daysLeft} días` : "Finalizada"}
										</BadgeText>
									</Badge>
								}
								onPress={(id) => router.push(`/(owner)/raffles/${id}` as never)}
							/>
						);
					})}
				</ListContainer>
			)}

			{/* Modal de Información (Popup) */}
			<Modal
				isOpen={showInfoModal}
				onClose={() => setShowInfoModal(false)}
				size="md"
			>
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>
						<Heading size="lg" className="text-primary-500">
							Información
						</Heading>
					</ModalHeader>
					<ModalBody>
						<Text className="mb-4 text-typography-600">
							Las Rifas Anuales son una estrategia opcional para incentivar la
							acumulación de puntos durante un periodo largo (365 días).
						</Text>
						<Text className="mb-4 text-typography-600">
							<Text bold className="text-primary-500">
								Mecánica:{" "}
							</Text>
							Los clientes compran boletos con sus puntos, lo que impulsa el
							canje y la retención.
						</Text>
						<Text className="text-typography-600">
							<Text bold className="text-primary-500">
								Cláusula Importante:{" "}
							</Text>
							Todos los puntos utilizados para comprar boletos serán consumidos
							inmediatamente y no son reembolsables.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button
							onPress={() => setShowInfoModal(false)}
							className="bg-[#2F4858] w-full"
						>
							<ButtonText>Entendido</ButtonText>
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AppLayout>
	);
}
