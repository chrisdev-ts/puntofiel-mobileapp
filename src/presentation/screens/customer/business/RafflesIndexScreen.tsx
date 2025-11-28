import { useLocalSearchParams, useRouter } from "expo-router";
import { Gift, HelpCircle } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable } from "react-native";

// UI Components
import { Box } from "@/components/ui/box";
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
import { VStack } from "@/components/ui/vstack";

// Shared Components
import { FeedbackScreen } from "@/src/presentation/components/common";
import { RaffleCard } from "@/src/presentation/components/common/RaffleCard";
import { RafflesListSkeleton } from "@/src/presentation/components/common/skeletons/RafflesListSkeleton";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

// Hooks Reales
import { useBusinessRaffles } from "@/src/presentation/hooks/useBusinessRaffles";

export default function RafflesIndexScreen() {
	const router = useRouter();
	// Obtenemos el ID del negocio desde la navegación
	const { id: businessId } = useLocalSearchParams<{ id: string }>();
	const [showInfoModal, setShowInfoModal] = useState(false);

	// Hook para obtener rifas del negocio
	const { raffles, isLoading: isLoadingRaffles } =
		useBusinessRaffles(businessId);

	// Procesar datos para la vista
	const processedRaffles = useMemo(() => {
		if (!raffles) return [];
		const now = new Date();
		return raffles
			.map((raffle) => {
				const start = new Date(raffle.startDate);
				const end = new Date(raffle.endDate);
				let statusType: "active" | "finished" | "upcoming";
				let badgeText = "";
				let badgeVariant: "active" | "inactive" = "inactive";
				// --- Lógica de Tiempo ---
				if (raffle.isCompleted || now > end) {
					statusType = "finished";
					badgeText = "Finalizada";
					badgeVariant = "inactive";
				} else if (now < start) {
					statusType = "upcoming";
					const diffDays = Math.ceil(
						(start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
					);
					badgeText = `Empieza en ${diffDays} días`;
					badgeVariant = "inactive";
				} else {
					statusType = "active";
					const diffDays = Math.ceil(
						(end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
					);
					badgeText = `Termina en ${diffDays} días`;
					badgeVariant = "active";
				}

				// Mapear a status para el RaffleCard
				let status: "won" | "participating" | "not_participating" =
					"not_participating";
				if (raffle.winnerCustomerId) {
					// Si el usuario es el ganador
					status =
						raffle.isParticipating && raffle.winnerCustomerId
							? "won"
							: "not_participating";
				} else if (raffle.isParticipating) {
					status = "participating";
				}

				return {
					...raffle,
					statusType,
					badgeText,
					badgeVariant,
					status,
				};
			})
			.sort((a, b) => {
				const priority = { active: 1, finished: 2, upcoming: 3 };
				return priority[a.statusType] - priority[b.statusType];
			});
	}, [raffles]);

	// Skeleton de carga real
	if (isLoadingRaffles) {
		return (
			<AppLayout showHeader={true} headerVariant="default" showNavBar={true}>
				<RafflesListSkeleton />
			</AppLayout>
		);
	}

	const hasRaffles = processedRaffles.length > 0;

	return (
		<AppLayout
			showHeader={true}
			headerVariant="default"
			showNavBar={true}
			scrollable={true}
		>
			{/* Header */}
			<HStack className="justify-between items-center">
				<Heading size="xl" className="text-[#2F4858]">
					Rifas anuales
				</Heading>
				<Pressable onPress={() => setShowInfoModal(true)} className="p-2">
					<HelpCircle size={24} color="#2F4858" />
				</Pressable>
			</HStack>

			{/* Estado Vacío */}
			{!hasRaffles && (
				<FeedbackScreen
					variant="empty"
					icon={Gift}
					title="¡No hay rifas activas!"
					description="Este negocio aún no cuenta con rifas activas. Vuelve a revisar pronto."
				/>
			)}

			{/* Lista de Rifas Reales */}
			{hasRaffles && (
				<Box>
					<Box className="border border-gray-300 rounded-2xl p-4 bg-white">
						{processedRaffles.map((raffle) => (
							<RaffleCard
								key={raffle.id}
								id={raffle.id}
								imageUrl={raffle.imageUrl}
								imageAlt={raffle.name}
								title={raffle.name}
								badgeText={raffle.badgeText}
								badgeVariant={raffle.badgeVariant}
								status={raffle.status}
								onPress={(id) =>
									router.push(`/(customer)/business/raffles/${id}` as never)
								}
							/>
						))}

						{/* Pie de página de la lista */}
						<VStack className="items-center">
							<Text className="text-center font-bold text-gray-600 mb-2 text-base">
								¡Has visto todas las rifas por ahora!
							</Text>
							<Text className="text-center text-gray-500 text-sm leading-6">
								Están son las rifas activas de tus negocios vinculados. Vuelve a
								revisar pronto; tu próxima gran oportunidad podría aparecer en
								cualquier momento.
							</Text>
						</VStack>
					</Box>
				</Box>
			)}

			{/* Modal Popup */}
			<Modal
				isOpen={showInfoModal}
				onClose={() => setShowInfoModal(false)}
				size="md"
			>
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>
						<Heading size="lg" className="text-[#2F4858]">
							Información
						</Heading>
					</ModalHeader>
					<ModalBody>
						<Text className="mb-4 text-gray-600">
							Las rifas anuales son grandes sorteos organizados por tus negocios
							favoritos para premiar a sus clientes más leales.
						</Text>
						<Text className="mb-2 font-bold text-[#2F4858]">
							¿Cómo participo?
						</Text>
						<Text className="mb-4 text-gray-600">
							Puedes comprar uno o más boletos usando tus puntos acumulados.
							¡Mientras más boletos, más oportunidades!
						</Text>
						<Text className="mb-2 font-bold text-[#2F4858]">
							Cláusula Importante:
						</Text>
						<Text className="text-gray-600">
							Los puntos gastados en la compra de boletos son permanentes. Si no
							resultas ganador, los puntos no serán devueltos a tu monedero.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button
							onPress={() => setShowInfoModal(false)}
							className="bg-[#2F4858] w-full rounded-lg"
						>
							<ButtonText>Entendido</ButtonText>
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AppLayout>
	);
}
